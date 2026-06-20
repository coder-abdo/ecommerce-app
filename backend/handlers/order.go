package handlers

import (
	"net/http"
	"strconv"

	"ecommerce-backend/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type OrderHandler struct {
	DB *gorm.DB
}

func NewOrderHandler(db *gorm.DB) *OrderHandler {
	return &OrderHandler{DB: db}
}

// POST /api/orders (Authenticated)
func (h *OrderHandler) CreateOrder(c *gin.Context) {
	var input struct {
		Address string `json:"address" binding:"required"`
		Items   []struct {
			ProductID uint `json:"productId" binding:"required"`
			Quantity  int  `json:"quantity" binding:"required,gt=0"`
		} `json:"items" binding:"required,min=1"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("userId")
	var totalAmount float64
	var orderItems []models.OrderItem

	// We use transaction to place the order and query products safely
	err := h.DB.Transaction(func(tx *gorm.DB) error {
		for _, item := range input.Items {
			var product models.Product
			if err := tx.First(&product, item.ProductID).Error; err != nil {
				return gorm.ErrRecordNotFound // Trigger rollback if a product doesn't exist
			}

			if product.StockStatus == models.OutOfStock {
				return gorm.ErrInvalidData // Trigger rollback if product is out of stock
			}

			price := product.Price
			itemTotal := price * float64(item.Quantity)
			totalAmount += itemTotal

			orderItems = append(orderItems, models.OrderItem{
				ProductID: item.ProductID,
				Quantity:  item.Quantity,
				Price:     price,
			})
		}

		order := models.Order{
			UserID:      userID.(uint),
			TotalAmount: totalAmount,
			Address:     input.Address,
			Status:      models.StatusPending,
		}

		if err := tx.Create(&order).Error; err != nil {
			return err
		}

		// Save the line items with the generated OrderID
		for i := range orderItems {
			orderItems[i].OrderID = order.ID
			if err := tx.Create(&orderItems[i]).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusBadRequest, gin.H{"error": "One or more products in your cart could not be found"})
		} else if err == gorm.ErrInvalidData {
			c.JSON(http.StatusBadRequest, gin.H{"error": "One or more products in your cart are currently out of stock"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to place order: " + err.Error()})
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Order placed successfully"})
}

// GET /api/orders/my (Authenticated)
func (h *OrderHandler) GetMyOrders(c *gin.Context) {
	userID, _ := c.Get("userId")

	var orders []models.Order
	err := h.DB.Preload("Items.Product.Images").
		Where("user_id = ?", userID.(uint)).
		Order("created_at desc").
		Find(&orders).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve order history: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, orders)
}

// GET /api/orders/all (Admin Only)
func (h *OrderHandler) GetAllOrders(c *gin.Context) {
	var orders []models.Order
	err := h.DB.Preload("User").
		Preload("Items.Product.Images").
		Order("created_at desc").
		Find(&orders).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve orders: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, orders)
}

// PUT /api/orders/:id/status (Admin Only)
func (h *OrderHandler) UpdateOrderStatus(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	var order models.Order
	if err := h.DB.First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	var input struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate status
	validStatuses := map[models.OrderStatus]bool{
		models.StatusPending:    true,
		models.StatusProcessing: true,
		models.StatusShipped:    true,
		models.StatusDelivered:  true,
		models.StatusCancelled:  true,
	}

	newStatus := models.OrderStatus(input.Status)
	if !validStatuses[newStatus] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order status value"})
		return
	}

	if err := h.DB.Model(&order).Update("status", newStatus).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order status: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order status updated successfully", "status": newStatus})
}
