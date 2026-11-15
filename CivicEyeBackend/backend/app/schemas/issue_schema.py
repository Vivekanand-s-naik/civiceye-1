"""
Issue/Report Schemas

Pydantic models for issue reporting and management.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.issue import IssueStatus, IssueCategory


class IssueBase(BaseModel):
    """Base issue schema"""
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=10)
    category: IssueCategory
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    address: Optional[str] = None


class IssueCreate(IssueBase):
    """Schema for creating a new issue"""
    pass


class IssueUpdate(BaseModel):
    """Schema for updating an issue"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=10)
    status: Optional[IssueStatus] = None
    assigned_to: Optional[int] = None
    resolution_notes: Optional[str] = None


class IssueResponse(IssueBase):
    """Schema for issue response"""
    id: int
    user_id: int
    image_path: Optional[str] = None
    status: IssueStatus
    assigned_to: Optional[int] = None
    resolution_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class IssueListResponse(BaseModel):
    """Schema for paginated issue list"""
    total: int
    page: int
    page_size: int
    issues: list[IssueResponse]
