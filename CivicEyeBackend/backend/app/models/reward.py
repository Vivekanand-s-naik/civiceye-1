"""
Reward Wallet Model

Manages user reward points earned from verified reports and penalty collections.
"""

from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class TransactionType(str, enum.Enum):
    """Reward transaction types"""
    CREDIT = "credit"
    DEBIT = "debit"


class RewardWallet(Base):
    """
    Reward wallet for users to earn points from civic participation.
    
    Points are credited when:
    - Their report leads to verified penalty
    - Authority verifies their report
    
    Points can be redeemed for benefits (implementation-specific).
    """
    __tablename__ = "reward_wallets"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # User
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    
    # Balance
    balance = Column(Float, default=0.0, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="reward_wallet")
    transactions = relationship("RewardTransaction", back_populates="wallet", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<RewardWallet(user_id={self.user_id}, balance={self.balance})>"


class RewardTransaction(Base):
    """
    Individual reward transactions for audit trail.
    """
    __tablename__ = "reward_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Wallet
    wallet_id = Column(Integer, ForeignKey("reward_wallets.id"), nullable=False, index=True)
    
    # Transaction Details
    type = Column(SQLEnum(TransactionType), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String(500), nullable=False)
    
    # Reference
    reference_type = Column(String(50), nullable=True)  # e.g., 'penalty', 'manual_credit'
    reference_id = Column(Integer, nullable=True)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    wallet = relationship("RewardWallet", back_populates="transactions")
    
    def __repr__(self):
        return f"<RewardTransaction(id={self.id}, type={self.type}, amount={self.amount})>"
