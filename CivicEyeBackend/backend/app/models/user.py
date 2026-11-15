"""
User Model

Represents users in the system with three roles: citizen, authority, admin.
Stores masked Aadhaar numbers and password hashes for secure authentication.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    """User roles for role-based access control"""
    CITIZEN = "citizen"
    AUTHORITY = "authority"
    ADMIN = "admin"


class User(Base):
    """
    User model for authentication and authorization.
    
    SECURITY NOTES:
    - aadhar_number should be stored in masked format (XXXX-XXXX-1234)
    - Never store raw biometric data
    - password_hash uses bcrypt through passlib
    - Only authorized personnel can access full user details
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Aadhaar (stored masked: XXXX-XXXX-1234)
    aadhar_number = Column(String(20), unique=True, index=True, nullable=False)
    
    # Authentication
    email = Column(String(255), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=True)  # Optional fallback auth
    
    # Profile
    full_name = Column(String(255), nullable=False)
    phone_number = Column(String(20), nullable=True)
    
    # Role and Status
    role = Column(SQLEnum(UserRole), default=UserRole.CITIZEN, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Zone assignment for authorities (simple zone filtering)
    zone = Column(String(100), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    issues = relationship("Issue", back_populates="reporter", foreign_keys="Issue.user_id")
    assigned_issues = relationship("Issue", back_populates="assigned_authority", foreign_keys="Issue.assigned_to")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    reward_wallet = relationship("RewardWallet", back_populates="user", uselist=False, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, role={self.role}, aadhar={self.aadhar_number})>"
