"""
Session Model

Server-side session management for secure authentication.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from datetime import datetime, timedelta, timezone


class Session(Base):
    """
    Session model for server-side session management.
    
    WHY SERVER-SIDE SESSIONS:
    - More secure than client-side JWT for web applications
    - Easy revocation (just delete the session)
    - Can store additional session data
    - Prevents token theft issues
    
    Session tokens are stored in HTTP-only cookies to prevent XSS attacks.
    """
    __tablename__ = "sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Session Token (stored in HTTP-only cookie)
    token = Column(String(255), unique=True, nullable=False, index=True)
    
    # User
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Expiration
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    
    # User Agent and IP for security
    user_agent = Column(String(500), nullable=True)
    ip_address = Column(String(50), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_accessed = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="sessions")
    
    def is_expired(self) -> bool:
        """Check if session has expired"""
        return datetime.now(timezone.utc) > self.expires_at
    
    def __repr__(self):
        return f"<Session(id={self.id}, user_id={self.user_id}, expires_at={self.expires_at})>"
