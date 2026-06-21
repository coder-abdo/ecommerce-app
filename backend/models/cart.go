package models

import "time"

type CartItem struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"userId" gorm:"not null;index;uniqueIndex:idx_user_product"`
	ProductID uint      `json:"productId" gorm:"not null;index;uniqueIndex:idx_user_product"`
	Product   Product   `json:"product,omitempty" gorm:"foreignKey:ProductID;constraint:OnDelete:CASCADE;"`
	Quantity  int       `json:"quantity" gorm:"not null;default:1"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
