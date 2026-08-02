import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartFarm AI"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super_secret_farm_key_for_jwt_auth_1234567890")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30 # 30 days
    
    # Database connection URL (defaults to SQLite, upgrades dynamically to Postgres in production)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./smartfarm.db")
    
    # Database pooling configuration (PostgreSQL specific)
    POSTGRES_POOL_SIZE: int = int(os.getenv("POSTGRES_POOL_SIZE", "10"))
    POSTGRES_MAX_OVERFLOW: int = int(os.getenv("POSTGRES_MAX_OVERFLOW", "20"))
    
    # Redis caching URL
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # Sentry DSN for live error logging
    SENTRY_DSN: str = os.getenv("SENTRY_DSN", "")
    
    # AI Services Keys (Optional API Integrations)
    OPENWEATHERMAP_API_KEY: str = os.getenv("OPENWEATHERMAP_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # CORS Configurations
    BACKEND_CORS_ORIGINS: list[str] = ["*"]
    
    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

settings = Settings()
