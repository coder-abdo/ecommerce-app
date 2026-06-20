package handlers

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"net/http"

	"ecommerce-backend/config"
	"ecommerce-backend/models"
	"ecommerce-backend/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"gorm.io/gorm"
)

type AuthHandler struct {
	DB     *gorm.DB
	Config *config.Config
}

func NewAuthHandler(db *gorm.DB, cfg *config.Config) *AuthHandler {
	return &AuthHandler{DB: db, Config: cfg}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var input struct {
		Name     string `json:"name" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Only assign the admin role if the registering email matches the configured AdminEmail
	role := models.RoleCustomer
	if input.Email == h.Config.AdminEmail {
		role = models.RoleAdmin
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	user := models.User{
		Name:     input.Name,
		Email:    input.Email,
		Password: string(hashedPassword),
		Role:     role,
	}

	if err := h.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User created successfully"})
}

func setTokenCookie(c *gin.Context, token string) {
	// HttpOnly, Secure: false (for development), SameSite: Lax
	c.SetCookie("token", token, 86400, "/", "", false, true)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	var user models.User

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Prevent logging in with password if it is not set (Google OAuth users)
	if user.Password == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "This account uses Google Login"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token, _ := utils.GenerateToken(user.ID, string(user.Role))
	setTokenCookie(c, token)
	
	c.JSON(http.StatusOK, gin.H{"role": user.Role, "name": user.Name})
}

func (h *AuthHandler) getOauthConfig() *oauth2.Config {
	return &oauth2.Config{
		ClientID:     h.Config.GoogleClientID,
		ClientSecret: h.Config.GoogleClientSecret,
		RedirectURL:  h.Config.GoogleRedirectURL,
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.profile",
			"https://www.googleapis.com/auth/userinfo.email",
		},
		Endpoint: google.Endpoint,
	}
}

func generateStateOauthCookie(c *gin.Context) string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	state := base64.URLEncoding.EncodeToString(b)
	// Secure cookie (set secure flag to false for localhost/HTTP development)
	c.SetCookie("oauthstate", state, 3600, "/", "", false, true)
	return state
}

func (h *AuthHandler) GoogleLogin(c *gin.Context) {
	if h.Config.GoogleClientID == "" || h.Config.GoogleClientSecret == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Google OAuth is not configured on the server. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"})
		return
	}
	state := generateStateOauthCookie(c)
	url := h.getOauthConfig().AuthCodeURL(state)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func (h *AuthHandler) GoogleCallback(c *gin.Context) {
	// 1. Validate state
	oauthState, err := c.Cookie("oauthstate")
	if err != nil || oauthState == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid state cookie"})
		return
	}

	state := c.Query("state")
	if state != oauthState {
		c.JSON(http.StatusBadRequest, gin.H{"error": "CSRF state token mismatch"})
		return
	}

	// Clear state cookie
	c.SetCookie("oauthstate", "", -1, "/", "", false, true)

	// 2. Exchange authorization code
	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Authorization code is missing"})
		return
	}

	conf := h.getOauthConfig()
	token, err := conf.Exchange(c.Request.Context(), code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to exchange authorization code: " + err.Error()})
		return
	}

	// 3. Retrieve user profile from Google UserInfo API
	client := conf.Client(c.Request.Context(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user info: " + err.Error()})
		return
	}
	defer resp.Body.Close()

	var googleUser struct {
		ID    string `json:"id"`
		Email string `json:"email"`
		Name  string `json:"name"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode user info"})
		return
	}

	if googleUser.Email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email address not returned by Google"})
		return
	}

	// 4. Find or Create User
	var user models.User
	// First check GoogleID
	err = h.DB.Where("google_id = ?", googleUser.ID).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Check if email already exists (traditional account exists)
			err = h.DB.Where("email = ?", googleUser.Email).First(&user).Error
			if err == nil {
				// Link Google ID to existing account
				user.GoogleID = &googleUser.ID
				if err := h.DB.Save(&user).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to link Google account"})
					return
				}
			} else if errors.Is(err, gorm.ErrRecordNotFound) {
				// Only assign the admin role if the Google email matches the configured AdminEmail
				role := models.RoleCustomer
				if googleUser.Email == h.Config.AdminEmail {
					role = models.RoleAdmin
				}

				// Create new account
				user = models.User{
					Name:     googleUser.Name,
					Email:    googleUser.Email,
					GoogleID: &googleUser.ID,
					Role:     role,
				}
				if err := h.DB.Create(&user).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
					return
				}
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
				return
			}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
	}

	// 5. Generate application JWT
	jwtToken, err := utils.GenerateToken(user.ID, string(user.Role))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate session token"})
		return
	}

	// Set cookie
	setTokenCookie(c, jwtToken)

	// 6. Redirect to frontend indicating success (no token in query params!)
	redirectURL := h.Config.FrontendRedirectURL + "?success=true"
	c.Redirect(http.StatusTemporaryRedirect, redirectURL)
}

func (h *AuthHandler) Logout(c *gin.Context) {
	// Clear token cookie
	c.SetCookie("token", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

func (h *AuthHandler) Me(c *gin.Context) {
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var user models.User
	if err := h.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User session not found"})
		return
	}

	authMethod := "Password"
	if user.GoogleID != nil {
		authMethod = "Google"
	}

	c.JSON(http.StatusOK, gin.H{
		"name":       user.Name,
		"role":       user.Role,
		"authMethod": authMethod,
	})
}

func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input struct {
		Name     string `json:"name"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := h.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if input.Name != "" {
		user.Name = input.Name
	}

	if input.Password != "" {
		if user.GoogleID != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Google accounts cannot update passwords here"})
			return
		}
		if len(input.Password) < 6 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Password must be at least 6 characters long"})
			return
		}
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		user.Password = string(hashedPassword)
	}

	if err := h.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile: " + err.Error()})
		return
	}

	authMethod := "Password"
	if user.GoogleID != nil {
		authMethod = "Google"
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Profile updated successfully",
		"name":       user.Name,
		"role":       user.Role,
		"authMethod": authMethod,
	})
}
