package utils

import (
	"log"

	"ecommerce-backend/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func InitDB(dbPath string) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	// Migrate the schema
	err = db.AutoMigrate(&models.User{}, &models.Category{}, &models.Product{}, &models.ProductImage{}, &models.Order{}, &models.OrderItem{}, &models.CartItem{})
	if err != nil {
		log.Fatalf("failed to auto migrate database schemas: %v", err)
	}

	// Seed default categories if empty
	var count int64
	db.Model(&models.Category{}).Count(&count)
	if count == 0 {
		categories := []models.Category{
			{Name: "Smartphones"},
			{Name: "Audio"},
			{Name: "Laptops"},
			{Name: "Accessories"},
		}
		for _, cat := range categories {
			db.Create(&cat)
		}
		log.Println("Default categories seeded.")
	}

	return db
}
