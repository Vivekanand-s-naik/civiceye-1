"""
Configuration Module

Loads environment variables and provides application settings using Pydantic.
All sensitive configuration should be stored in .env file.
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    Uses Pydantic for validation and type checking.
    """
     
    # Application
    APP_NAME: str = "CivicEye"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    SESSION_EXPIRE_SECONDS: int = 86400  # 24 hours
    COOKIE_SECURE: bool = False  # Set True in production with HTTPS
    COOKIE_SAMESITE: str = "Lax"
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5000"
    
    # File Upload
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 10
    
    # Email/SMTP
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@civiceye.com"
    SMTP_FROM_NAME: str = "CivicEye Platform"
    
    # Mock Aadhaar OTP (replace with real UIDAI API in production)
    MOCK_OTP_ENABLED: bool = True
    MOCK_OTP_VALUE: str = "123456"
    
    # AI/ML Configuration
    FACE_MATCH_THRESHOLD: float = 0.6
    AI_MODEL_PATH: str = "models/"
    
    # Penalties and Rewards
    DEFAULT_PENALTY_AMOUNT: int = 500
    REWARD_PERCENTAGE: int = 10
    CIVICEYE_EMAIL: str
    CIVICEYE_APP_PASSWORD: str
      
    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse ALLOWED_ORIGINS into a list"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
