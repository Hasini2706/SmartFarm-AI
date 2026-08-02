import os
import json
from typing import Any, List
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartFarm AI"
    API_V1_STR: str = "/api/v1"
    JWT_SECRET: str = "super_secret_farm_key_for_jwt_auth_1234567890"
    SECRET_KEY: str = "super_secret_farm_key_for_jwt_auth_1234567890"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30 # 30 days
    
    # Frontend URL for CORS, OAuth redirects, and notifications
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    # Google OAuth settings
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "your-google-client-id.apps.googleusercontent.com")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "your-google-client-secret")
    GOOGLE_CALLBACK_URL: str = os.getenv("GOOGLE_CALLBACK_URL", "http://localhost:8000/api/v1/auth/google/callback")
    
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
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    @model_validator(mode="before")
    @classmethod
    def process_env_defaults(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Extract JWT_SECRET or SECRET_KEY from env dict or os env
            jwt_sec = data.get("JWT_SECRET") or os.getenv("JWT_SECRET")
            sec_key = data.get("SECRET_KEY") or os.getenv("SECRET_KEY")
            val = jwt_sec or sec_key or "super_secret_farm_key_for_jwt_auth_1234567890"
            data["JWT_SECRET"] = val
            data["SECRET_KEY"] = val

            # Normalize DATABASE_URL for SQLAlchemy 1.4+ (Render uses postgres://)
            db_url = data.get("DATABASE_URL") or os.getenv("DATABASE_URL") or "sqlite:///./smartfarm.db"
            if db_url.startswith("postgres://"):
                db_url = db_url.replace("postgres://", "postgresql://", 1)
            data["DATABASE_URL"] = db_url

            # Normalize FRONTEND_URL and GOOGLE_CALLBACK_URL
            frontend_url = data.get("FRONTEND_URL") or os.getenv("FRONTEND_URL") or "http://localhost:5173"
            data["FRONTEND_URL"] = frontend_url.rstrip("/")
            
            cb_url = data.get("GOOGLE_CALLBACK_URL") or os.getenv("GOOGLE_CALLBACK_URL")
            if not cb_url:
                data["GOOGLE_CALLBACK_URL"] = "http://localhost:8000/api/v1/auth/google/callback"
            else:
                data["GOOGLE_CALLBACK_URL"] = cb_url

            # Flexible BACKEND_CORS_ORIGINS or ALLOWED_ORIGINS parsing
            cors_raw = data.get("BACKEND_CORS_ORIGINS") or os.getenv("BACKEND_CORS_ORIGINS") or os.getenv("ALLOWED_ORIGINS")
            if cors_raw:
                if isinstance(cors_raw, str):
                    cors_raw = cors_raw.strip()
                    if cors_raw.startswith("["):
                        try:
                            data["BACKEND_CORS_ORIGINS"] = json.loads(cors_raw)
                        except Exception:
                            data["BACKEND_CORS_ORIGINS"] = [origin.strip() for origin in cors_raw.strip("[]").split(",") if origin.strip()]
                    else:
                        data["BACKEND_CORS_ORIGINS"] = [origin.strip() for origin in cors_raw.split(",") if origin.strip()]
                elif isinstance(cors_raw, list):
                    data["BACKEND_CORS_ORIGINS"] = cors_raw
            else:
                data["BACKEND_CORS_ORIGINS"] = ["*"]

        return data
    
    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

settings = Settings()
