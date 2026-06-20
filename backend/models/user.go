package models

import (
	"time"
)

type Role string

const (
	RoleCustomer Role = "customer"
	RoleAdmin    Role = "admin"
)

type User struct {
	ID        uint       `json:"id" gorm:"primaryKey"`
	Name      string     `json:"name" gorm:"not null"`
	Email     string     `json:"email" gorm:"unique;not null"`
	Password  string     `json:"-"`
	GoogleID  *string    `json:"googleId,omitempty" gorm:"unique"`
	Role      Role       `json:"role" gorm:"type:varchar(20);default:'customer'"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
	DeletedAt *time.Time `json:"deletedAt"`
}
