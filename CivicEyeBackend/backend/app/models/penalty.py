"""
Penalty Model

Represents financial penalties issued to violators.
"""

from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class PenaltyStatus(str, enum.Enum):
    """Penalty payment statuses"""
    PENDING = "pending"
    PAID = "paid"
    WAIVED = "waived"
    DISPUTED = "disputed"


class Penalty(Base):
    """
    Penalty model for fines issued to violators.
    
    When a violator is confirmed, a penalty is issued.
    Payment triggers reward credit to the reporter's wallet.
    """
    __tablename__ = "penalties"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Linked Violator
    violator_id = Column(Integer, ForeignKey("violators.id"), nullable=False, index=True)
    
    # Penalty Details
    amount = Column(Float, nullable=False)
    reason = Column(String(500), nullable=False)
    
    # Status
    status = Column(SQLEnum(PenaltyStatus), default=PenaltyStatus.PENDING, nullable=False, index=True)
    
    # Payment
    payment_method = Column(String(100), nullable=True)
    transaction_id = Column(String(255), nullable=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    issued_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    violator = relationship("Violator", back_populates="penalties")
    
    def __repr__(self):
        return f"<Penalty(id={self.id}, amount={self.amount}, status={self.status})>"
