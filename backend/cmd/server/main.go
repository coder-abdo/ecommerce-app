package main

import (
	"log"
	"net/http"
	"strings"

	"ecommerce-backend/config"
	"ecommerce-backend/handlers"
	"ecommerce-backend/middleware"
	"ecommerce-backend/utils"

	"github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func main() {
	// 1. Load configuration
	cfg := config.LoadConfig()

	// 2. Initialize database
	db := utils.InitDB(cfg.DBPath)
	log.Printf("Database initialized at %s", cfg.DBPath)

	// 3. Initialize Gin engine
	r := gin.Default()

	// 4. Register CORS middleware
	r.Use(CORSMiddleware())

	// 5. Initialize handlers
	authHandler := handlers.NewAuthHandler(db, cfg)
	productHandler := handlers.NewProductHandler(db)
	orderHandler := handlers.NewOrderHandler(db)

	// 6. Define API routes
	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.GET("/google", authHandler.GoogleLogin)
			auth.GET("/google/callback", authHandler.GoogleCallback)
			auth.POST("/logout", middleware.AuthMiddleware(), authHandler.Logout)
			auth.GET("/me", middleware.AuthMiddleware(), authHandler.Me)
			auth.PUT("/profile", middleware.AuthMiddleware(), authHandler.UpdateProfile)
		}

		// Product & Category routes
		products := api.Group("/products")
		{
			products.GET("", productHandler.GetProducts)
			products.GET("/:id", productHandler.GetProduct)
			products.POST("", middleware.AuthMiddleware(), middleware.RequireRole("admin"), productHandler.CreateProduct)
			products.PUT("/:id", middleware.AuthMiddleware(), middleware.RequireRole("admin"), productHandler.UpdateProduct)
			products.DELETE("/:id", middleware.AuthMiddleware(), middleware.RequireRole("admin"), productHandler.DeleteProduct)
			products.POST("/upload", middleware.AuthMiddleware(), middleware.RequireRole("admin"), productHandler.UploadImage)
		}

		categories := api.Group("/categories")
		{
			categories.GET("", productHandler.GetCategories)
			categories.POST("", middleware.AuthMiddleware(), middleware.RequireRole("admin"), productHandler.CreateCategory)
		}

		// Order routes
		orders := api.Group("/orders")
		{
			orders.POST("", middleware.AuthMiddleware(), orderHandler.CreateOrder)
			orders.GET("/my", middleware.AuthMiddleware(), orderHandler.GetMyOrders)
			orders.GET("/all", middleware.AuthMiddleware(), middleware.RequireRole("admin"), orderHandler.GetAllOrders)
			orders.PUT("/:id/status", middleware.AuthMiddleware(), middleware.RequireRole("admin"), orderHandler.UpdateOrderStatus)
		}
	}

	// 7. Serve uploads folder statically
	r.Static("/uploads", "./uploads")

	// 8. Serve frontend static assets (Single-page routing)
	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path
		if strings.HasPrefix(path, "/api") {
			c.JSON(http.StatusNotFound, gin.H{"error": "API endpoint not found"})
			return
		}

		// Try to serve frontend files
		filePath := "./frontend" + path
		if path == "/" {
			filePath = "./frontend/index.html"
		}
		
		// Fallback to serving index.html if the file doesn't exist for SPA client routing
		c.File(filePath)
	})

	// 8. Start server
	log.Printf("Server starting on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
