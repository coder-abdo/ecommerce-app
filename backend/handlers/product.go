package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"ecommerce-backend/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ProductHandler struct {
	DB *gorm.DB
}

func NewProductHandler(db *gorm.DB) *ProductHandler {
	return &ProductHandler{DB: db}
}

// GET /api/categories
func (h *ProductHandler) GetCategories(c *gin.Context) {
	var categories []models.Category
	if err := h.DB.Order("name asc").Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, categories)
}

// POST /api/categories (Admin Only)
func (h *ProductHandler) CreateCategory(c *gin.Context) {
	var input struct {
		Name string `json:"name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	category := models.Category{Name: input.Name}
	if err := h.DB.Create(&category).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Category already exists"})
		return
	}

	c.JSON(http.StatusCreated, category)
}

// GET /api/products
func (h *ProductHandler) GetProducts(c *gin.Context) {
	var products []models.Product
	query := h.DB.Preload("Category").Preload("Images")

	// Filter by Category
	categoryIDStr := c.Query("categoryId")
	if categoryIDStr != "" {
		categoryID, err := strconv.Atoi(categoryIDStr)
		if err == nil {
			query = query.Where("category_id = ?", categoryID)
		}
	}

	// Search by name/description
	search := c.Query("search")
	if search != "" {
		query = query.Where("name LIKE ? OR description LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	// Fetch products
	if err := query.Order("created_at desc").Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, products)
}

// GET /api/products/:id
func (h *ProductHandler) GetProduct(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	var product models.Product
	if err := h.DB.Preload("Category").Preload("Images").First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	c.JSON(http.StatusOK, product)
}

// POST /api/products (Admin Only)
func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var input struct {
		Name        string             `json:"name" binding:"required"`
		Description string             `json:"description"`
		Price       float64            `json:"price" binding:"required,gt=0"`
		StockStatus models.StockStatus `json:"stockStatus" binding:"required"`
		CategoryID  uint               `json:"categoryId" binding:"required"`
		ImageURLs   []string           `json:"imageUrls"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify category exists
	var category models.Category
	if err := h.DB.First(&category, input.CategoryID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
		return
	}

	userID, _ := c.Get("userId")
	product := models.Product{
		Name:        input.Name,
		Description: input.Description,
		Price:       input.Price,
		StockStatus: input.StockStatus,
		CategoryID:  input.CategoryID,
		AdminID:     userID.(uint),
	}

	// Use database transaction to guarantee product and image creation succeed together
	err := h.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&product).Error; err != nil {
			return err
		}

		for _, url := range input.ImageURLs {
			img := models.ProductImage{
				ProductID: product.ID,
				URL:       url,
			}
			if err := tx.Create(&img).Error; err != nil {
				return err
			}
		}
		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create product: " + err.Error()})
		return
	}

	// Fetch fully preloaded created product
	h.DB.Preload("Category").Preload("Images").First(&product, product.ID)
	c.JSON(http.StatusCreated, product)
}

// PUT /api/products/:id (Admin Only)
func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	var product models.Product
	if err := h.DB.First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	var input struct {
		Name        string             `json:"name" binding:"required"`
		Description string             `json:"description"`
		Price       float64            `json:"price" binding:"required,gt=0"`
		StockStatus models.StockStatus `json:"stockStatus" binding:"required"`
		CategoryID  uint               `json:"categoryId" binding:"required"`
		ImageURLs   []string           `json:"imageUrls"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify category exists
	var category models.Category
	if err := h.DB.First(&category, input.CategoryID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
		return
	}

	err = h.DB.Transaction(func(tx *gorm.DB) error {
		// Update core product attributes
		product.Name = input.Name
		product.Description = input.Description
		product.Price = input.Price
		product.StockStatus = input.StockStatus
		product.CategoryID = input.CategoryID
		if err := tx.Save(&product).Error; err != nil {
			return err
		}

		// Delete old images
		if err := tx.Where("product_id = ?", product.ID).Delete(&models.ProductImage{}).Error; err != nil {
			return err
		}

		// Insert new images
		for _, url := range input.ImageURLs {
			img := models.ProductImage{
				ProductID: product.ID,
				URL:       url,
			}
			if err := tx.Create(&img).Error; err != nil {
				return err
			}
		}
		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product: " + err.Error()})
		return
	}

	h.DB.Preload("Category").Preload("Images").First(&product, product.ID)
	c.JSON(http.StatusOK, product)
}

// DELETE /api/products/:id (Admin Only)
func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	var product models.Product
	if err := h.DB.First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	// Associated images will be deleted automatically due to the CASCADE constraint
	if err := h.DB.Delete(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
}

// POST /api/products/upload (Admin Only)
func (h *ProductHandler) UploadImage(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing image file in request: " + err.Error()})
		return
	}

	// Make sure upload directory exists
	uploadDir := "./uploads"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create uploads directory: " + err.Error()})
		return
	}

	// Create unique file name
	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), filepath.Base(file.Filename))
	filePath := filepath.Join(uploadDir, filename)

	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file: " + err.Error()})
		return
	}

	publicURL := fmt.Sprintf("/uploads/%s", filename)
	c.JSON(http.StatusOK, gin.H{"url": publicURL})
}
