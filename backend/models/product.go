package models

import "time"

type StockStatus string

const (
	InStock    StockStatus = "instock"
	OutOfStock StockStatus = "outstock"
)

type Category struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" gorm:"unique;not null"`
	Products  []Product `json:"products,omitempty" gorm:"foreignKey:CategoryID"`
	CreatedAt time.Time `json:"createdAt"`
}

type Product struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"not null"`
	Description string         `json:"description"`
	Price       float64        `json:"price" gorm:"type:numeric(10,2);not null"`
	StockStatus StockStatus    `json:"stockStatus" gorm:"type:varchar(20);default:'instock'"`
	CategoryID  uint           `json:"categoryId"`
	Category    Category       `json:"category" gorm:"foreignKey:CategoryID"`
	Images      []ProductImage `json:"images" gorm:"foreignKey:ProductID;constraint:OnDelete:CASCADE;"`
	AdminID     uint           `json:"adminId"` // The admin who listed the item
	CreatedAt   time.Time      `json:"createdAt"`
}

type ProductImage struct {
	ID        uint   `json:"id" gorm:"primaryKey"`
	ProductID uint   `json:"productId"`
	URL       string `json:"url" gorm:"not null"`
}
