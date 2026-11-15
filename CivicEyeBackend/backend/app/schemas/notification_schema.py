"""
Notification Schemas

Pydantic models for notifications.
"""

from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime
from app.models.notification import NotificationType


class NotificationResponse(BaseModel):
    """Schema for notification response"""
    id: int
    user_id: int
    type: NotificationType
    title: str
    message: str
    meta: Optional[dict[str, Any]] = None
    is_read: bool
    read_at: Optional[datetime] = None
    email_sent: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    """Schema for paginated notification list"""
    total: int
    unread_count: int
    notifications: list[NotificationResponse]


class MarkReadRequest(BaseModel):
    """Schema for marking notifications as read"""
    notification_ids: list[int]
