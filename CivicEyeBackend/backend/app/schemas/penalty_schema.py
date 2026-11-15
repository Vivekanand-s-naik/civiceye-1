"""
Penalty Schemas

Pydantic models for penalty management.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.penalty import PenaltyStatus


class PenaltyBase(BaseModel):
    """Base penalty schema"""
    amount: float = Field(..., gt=0)
    reason: str = Field(..., min_length=10, max_length=500)


class PenaltyCreate(PenaltyBase):
    """Schema for creating a penalty"""
    violator_id: int


class PenaltyUpdate(BaseModel):
    """Schema for updating penalty status"""
    status: PenaltyStatus
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None


class PenaltyResponse(PenaltyBase):
    """Schema for penalty response"""
    id: int
    violator_id: int
    status: PenaltyStatus
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    issued_at: datetime
    paid_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class PenaltyPaymentSimulation(BaseModel):
    """Schema for simulating penalty payment"""
    payment_method: str = Field(..., min_length=1)
    transaction_id: str = Field(..., min_length=1)
