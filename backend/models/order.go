package models

import "time"

type OrderStatus string

const (
	StatusPending    OrderStatus = "pending"
	StatusProcessing OrderStatus = "processing"
	StatusShipped    OrderStatus = "shipped"
	StatusDelivered  OrderStatus = "delivered"
	StatusCancelled  OrderStatus = "cancelled"
)

type Order struct {
	ID                   uint        `json:"id" gorm:"primaryKey"`
	UserID               uint        `json:"userId" gorm:"not null"`
	User                 User        `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Items                []OrderItem `json:"items" gorm:"foreignKey:OrderID;constraint:OnDelete:CASCADE;"`
	TotalAmount          float64     `json:"totalAmount" gorm:"type:numeric(10,2);not null"`
	Status               OrderStatus `json:"status" gorm:"type:varchar(20);default:'pending'"`
	Address              string      `json:"address" gorm:"not null"`
	RecipientName        string      `json:"recipientName"`
	RecipientPhone       string      `json:"recipientPhone"`
	AddressLine1         string      `json:"addressLine1"`
	AddressLine2         string      `json:"addressLine2"`
	City                 string      `json:"city"`
	State                string      `json:"state"`
	PostalCode           string      `json:"postalCode"`
	Country              string      `json:"country"`
	ShippingMethod       string      `json:"shippingMethod"`
	ShippingCost         float64     `json:"shippingCost" gorm:"type:numeric(10,2);default:0"`
	TrackingNumber       string      `json:"trackingNumber"`
	PaymentMethod        string      `json:"paymentMethod"`
	PaymentStatus        string      `json:"paymentStatus" gorm:"default:'pending'"`
	PaymentTransactionID string      `json:"paymentTransactionId"`
	CreatedAt            time.Time   `json:"createdAt"`
	UpdatedAt            time.Time   `json:"updatedAt"`
}

type OrderItem struct {
	ID        uint    `json:"id" gorm:"primaryKey"`
	OrderID   uint    `json:"orderId" gorm:"not null"`
	ProductID uint    `json:"productId" gorm:"not null"`
	Product   Product `json:"product,omitempty" gorm:"foreignKey:ProductID"`
	Quantity  int     `json:"quantity" gorm:"not null"`
	Price     float64 `json:"price" gorm:"type:numeric(10,2);not null"` // Price at purchase time
}
