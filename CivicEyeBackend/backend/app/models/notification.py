"""
Notification Model

Stores system notifications and alerts for users.
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class NotificationType(str, enum.Enum):
    """Types of notifications"""
    REPORT_STATUS_UPDATE = "report_status_update"
    VIOLATOR_DETECTED = "violator_detected"
    PENALTY_ISSUED = "penalty_issued"
    REWARD_CREDITED = "reward_credited"
    SYSTEM_ALERT = "system_alert"


class Notification(Base):
    """
    Notification model for user alerts and system messages.
    
    Notifications are created for important events like:
    - Report status changes
    - Violator detection
    - Penalty issuance
    - Reward credits
    """
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # User
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Notification Details
    type = Column(SQLEnum(NotificationType), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    
    # Metadata (JSON for flexible data storage)
    meta = Column(JSON, nullable=True)  # e.g., {"issue_id": 123, "penalty_amount": 500}
    
    # Status
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    
    # Email sent status
    email_sent = Column(Boolean, default=False, nullable=False)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    user = relationship("User", back_populates="notifications")
    
    def __repr__(self):
        return f"<Notification(id={self.id}, type={self.type}, user_id={self.user_id})>"
