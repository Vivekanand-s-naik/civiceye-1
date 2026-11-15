"""
Issue/Report Model

Represents civic issues reported by citizens with geolocation, images, and status tracking.
"""

from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class IssueStatus(str, enum.Enum):
    """Issue lifecycle statuses"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"
    REJECTED = "rejected"


class IssueCategory(str, enum.Enum):
    """Types of civic issues"""
    TRAFFIC_VIOLATION = "traffic_violation"
    ILLEGAL_PARKING = "illegal_parking"
    LITTERING = "littering"
    VANDALISM = "vandalism"
    NOISE_POLLUTION = "noise_pollution"
    OTHER = "other"


class Issue(Base):
    """
    Issue/Report model for citizen complaints.
    
    Citizens can report civic violations with images, location, and description.
    Authorities can assign, investigate, and resolve issues.
    """
    __tablename__ = "issues"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Reporter
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Issue Details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(SQLEnum(IssueCategory), nullable=False, index=True)
    
    # Geolocation
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    address = Column(Text, nullable=True)
    
    # Evidence
    image_path = Column(String(500), nullable=True)  # Path to uploaded image
    
    # Status and Assignment
    status = Column(SQLEnum(IssueStatus), default=IssueStatus.PENDING, nullable=False, index=True)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)  # Authority user
    
    # Resolution
    resolution_notes = Column(Text, nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    reporter = relationship("User", back_populates="issues", foreign_keys=[user_id])
    assigned_authority = relationship("User", back_populates="assigned_issues", foreign_keys=[assigned_to])
    violators = relationship("Violator", back_populates="issue", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Issue(id={self.id}, category={self.category}, status={self.status})>"
