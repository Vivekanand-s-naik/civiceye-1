"""
Configuration Module

Loads environment variables and provides application settings using Pydantic.
All sensitive configuration is loaded from the root .env file.
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
from pathlib import Path
import os
from dotenv import load_dotenv

# Search and load root .env and local .env
CURRENT_DIR = Path(__file__).resolve().parent
ROOT_ENV = CURRENT_DIR.parent.parent.parent / ".env"
LOCAL_ENV = CURRENT_DIR.parent.parent / ".env"

if ROOT_ENV.exists():
    load_dotenv(dotenv_path=ROOT_ENV, override=False)
if LOCAL_ENV.exists():
    load_dotenv(dotenv_path=LOCAL_ENV, override=False)

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
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5000,http://127.0.0.1:5000"
    
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
    CIVICEYE_EMAIL: Optional[str] = None
    CIVICEYE_APP_PASSWORD: Optional[str] = None
      
    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse ALLOWED_ORIGINS into a list"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    class Config:
        env_file = (str(ROOT_ENV), str(LOCAL_ENV), ".env")
        case_sensitive = True
        extra = "allow"


# Global settings instance
settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
