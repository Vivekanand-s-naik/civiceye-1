"""
User Schemas

Pydantic models for user-related API requests and responses.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole


class UserBase(BaseModel):
    """Base user schema with common fields"""
    email: Optional[EmailStr] = None
    full_name: str = Field(..., min_length=1, max_length=255)
    phone_number: Optional[str] = Field(None, max_length=20)
    zone: Optional[str] = Field(None, max_length=100)


class UserCreate(UserBase):
    """Schema for creating a new user (admin only)"""
    aadhar_number: str = Field(..., min_length=12, max_length=20)
    password: Optional[str] = Field(None, min_length=6)
    role: UserRole = UserRole.CITIZEN


class UserUpdate(BaseModel):
    """Schema for updating user information"""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    phone_number: Optional[str] = None
    zone: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    """Schema for user response (masks sensitive data)"""
    id: int
    aadhar_number: str  # Already masked in DB
    role: UserRole
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    """Schema for login request"""
    aadhar_number: str = Field(..., min_length=12, max_length=20)
    otp: str = Field(..., min_length=6, max_length=6)


class RequestOTP(BaseModel):
    """Schema for OTP request"""
    aadhar_number: str = Field(..., min_length=12, max_length=20)


class LoginResponse(BaseModel):
    """Schema for login response"""
    message: str
    user: UserResponse


class SessionCheckResponse(BaseModel):
    """Schema for session validation response"""
    authenticated: bool
    user: Optional[UserResponse] = None
