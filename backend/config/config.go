package config

import "os"

type Config struct {
	Port                string
	DBPath              string
	JWTSecret           string
	GoogleClientID      string
	GoogleClientSecret  string
	GoogleRedirectURL   string
	FrontendRedirectURL string
	AdminEmail          string
}

func LoadConfig() *Config {
	return &Config{
		Port:                getEnv("PORT", "8080"),
		DBPath:              getEnv("DB_PATH", "ecommerce.db"),
		JWTSecret:           getEnv("JWT_SECRET", "your_ultra_secure_secret_key"),
		GoogleClientID:      getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret:  getEnv("GOOGLE_CLIENT_SECRET", ""),
		GoogleRedirectURL:   getEnv("GOOGLE_REDIRECT_URL", "http://localhost:8080/api/auth/google/callback"),
		FrontendRedirectURL: getEnv("FRONTEND_REDIRECT_URL", "http://localhost:8080/oauth-callback.html"),
		AdminEmail:          getEnv("ADMIN_EMAIL", "admin@ecommerce.com"),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
