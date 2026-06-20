package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"strconv"
	"strings"

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

// Helper to generate transaction IDs
func generateTxnID() string {
	bytes := make([]byte, 4)
	if _, err := rand.Read(bytes); err != nil {
		return "TXN-DEFAULT"
	}
	return "TXN-" + strings.ToUpper(hex.EncodeToString(bytes))
}

// POST /api/orders (Authenticated)
func (h *OrderHandler) CreateOrder(c *gin.Context) {
	var input struct {
		RecipientName  string  `json:"recipientName" binding:"required"`
		RecipientPhone string  `json:"recipientPhone" binding:"required"`
		AddressLine1   string  `json:"addressLine1" binding:"required"`
		AddressLine2   string  `json:"addressLine2"`
		City           string  `json:"city" binding:"required"`
		State          string  `json:"state" binding:"required"`
		PostalCode     string  `json:"postalCode" binding:"required"`
		Country        string  `json:"country" binding:"required"`
		ShippingMethod string  `json:"shippingMethod" binding:"required"`
		ShippingCost   float64 `json:"shippingCost"`
		PaymentMethod  string  `json:"paymentMethod" binding:"required"`
		Items          []struct {
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

		// Concatenate legacy single Address field for database consistency
		fullAddress := input.AddressLine1
		if input.AddressLine2 != "" {
			fullAddress += ", " + input.AddressLine2
		}
		fullAddress += fmt.Sprintf(", %s, %s %s, %s", input.City, input.State, input.PostalCode, input.Country)

		// Set initial payment details
		paymentStatus := "pending"
		txnID := ""
		if input.PaymentMethod == "credit_card" || input.PaymentMethod == "paypal" || input.PaymentMethod == "crypto" {
			paymentStatus = "paid"
			txnID = generateTxnID()
		}

		order := models.Order{
			UserID:               userID.(uint),
			TotalAmount:          totalAmount + input.ShippingCost,
			Address:              fullAddress,
			RecipientName:        input.RecipientName,
			RecipientPhone:       input.RecipientPhone,
			AddressLine1:         input.AddressLine1,
			AddressLine2:         input.AddressLine2,
			City:                 input.City,
			State:                input.State,
			PostalCode:           input.PostalCode,
			Country:              input.Country,
			ShippingMethod:       input.ShippingMethod,
			ShippingCost:         input.ShippingCost,
			PaymentMethod:        input.PaymentMethod,
			PaymentStatus:        paymentStatus,
			PaymentTransactionID: txnID,
			Status:               models.StatusPending,
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
		Status         string `json:"status" binding:"required"`
		TrackingNumber string `json:"trackingNumber"`
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

	updates := map[string]interface{}{
		"status": newStatus,
	}
	if input.TrackingNumber != "" {
		updates["tracking_number"] = input.TrackingNumber
	}
	if newStatus == models.StatusDelivered {
		updates["payment_status"] = "paid"
	}

	if err := h.DB.Model(&order).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order status: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order status updated successfully", "status": newStatus})
}
