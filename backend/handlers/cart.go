package handlers

import (
	"net/http"

	"ecommerce-backend/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CartHandler struct {
	DB *gorm.DB
}

func NewCartHandler(db *gorm.DB) *CartHandler {
	return &CartHandler{DB: db}
}

// GET /api/cart
func (h *CartHandler) GetCart(c *gin.Context) {
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var items []models.CartItem
	err := h.DB.Preload("Product.Images").
		Where("user_id = ?", userID.(uint)).
		Find(&items).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve cart items: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, items)
}

// PUT /api/cart
func (h *CartHandler) UpdateCart(c *gin.Context) {
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input struct {
		Items []struct {
			ProductID uint `json:"productId" binding:"required"`
			Quantity  int  `json:"quantity" binding:"required,gt=0"`
		} `json:"items"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.DB.Transaction(func(tx *gorm.DB) error {
		// Delete existing cart items for this user
		if err := tx.Where("user_id = ?", userID.(uint)).Delete(&models.CartItem{}).Error; err != nil {
			return err
		}

		// Insert new cart items
		for _, item := range input.Items {
			// Verify product exists
			var product models.Product
			if err := tx.First(&product, item.ProductID).Error; err != nil {
				return err // Product not found
			}

			cartItem := models.CartItem{
				UserID:    userID.(uint),
				ProductID: item.ProductID,
				Quantity:  item.Quantity,
			}
			if err := tx.Create(&cartItem).Error; err != nil {
				return err
			}
		}
		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cart: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cart updated successfully"})
}
