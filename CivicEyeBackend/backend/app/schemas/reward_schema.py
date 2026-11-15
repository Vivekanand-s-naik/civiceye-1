"""
Reward Wallet Schemas

Pydantic models for reward wallet and transactions.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.reward import TransactionType


class RewardWalletResponse(BaseModel):
    """Schema for reward wallet response"""
    id: int
    user_id: int
    balance: float
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class RewardTransactionResponse(BaseModel):
    """Schema for reward transaction response"""
    id: int
    wallet_id: int
    type: TransactionType
    amount: float
    description: str
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class RewardTransactionList(BaseModel):
    """Schema for transaction list response"""
    total: int
    transactions: list[RewardTransactionResponse]


class RewardCreditRequest(BaseModel):
    """Schema for manually crediting rewards (admin only)"""
    user_id: int
    amount: float = Field(..., gt=0)
    description: str = Field(..., min_length=5)


class RewardRedeemRequest(BaseModel):
    """Schema for redeeming rewards"""
    amount: float = Field(..., gt=0)
    redemption_type: str = Field(..., min_length=1)
