"""
Admin API Routes

Endpoints for admin-only operations: user management, system logs, settings.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Cookie
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import User, UserRole
from app.schemas import (
    UserCreate, UserUpdate, UserResponse,
    NotificationListResponse
)
from app.services import auth_service, admin_service

router = APIRouter(prefix="/api/admin", tags=["Admin"])


def get_current_admin(
    session_token: str = Cookie(None),
    db: Session = Depends(get_db)
) -> User:
    """Dependency to get current authenticated admin."""
    user = auth_service.get_current_user(db, session_token)
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user


@router.get("/users")
def list_users(
    page: int = 1,
    page_size: int = 20,
    role_filter: Optional[UserRole] = None,
    user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    List all users with pagination and role filtering.
    """
    users, total = admin_service.list_users(
        db=db,
        page=page,
        page_size=page_size,
        role_filter=role_filter
    )
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "users": users
    }


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get user details by ID.
    """
    target_user = admin_service.get_user_by_id(db, user_id)
    return target_user


@router.post("/users", response_model=UserResponse)
def create_user(
    user_data: UserCreate,
    user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Create a new user.
    """
    new_user = admin_service.create_user(db, user_data)
    return new_user


@router.patch("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    update_data: UserUpdate,
    user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Update user information.
    """
    updated_user = admin_service.update_user(db, user_id, update_data)
    return updated_user


@router.post("/users/{user_id}/toggle-status", response_model=UserResponse)
def toggle_user_status(
    user_id: int,
    is_active: bool,
    user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Enable or disable a user account.
    """
    updated_user = admin_service.toggle_user_status(db, user_id, is_active)
    return updated_user


@router.get("/logs", response_model=NotificationListResponse)
def get_system_logs(
    page: int = 1,
    page_size: int = 50,
    user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get system logs.
    """
    logs, total = admin_service.get_system_logs(db, page, page_size)
    
    return NotificationListResponse(
        total=total,
        unread_count=0,
        notifications=logs
    )


@router.get("/dashboard/stats")
def get_dashboard_stats(
    user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get dashboard statistics for admin overview.
    
    Returns comprehensive statistics about users, issues, penalties, and rewards.
    """
    stats = admin_service.get_dashboard_stats(db)
    return stats


@router.get("/settings")
def get_settings(
    user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get platform settings.
    """
    from app.config import settings
    
    return {
        "app_name": settings.APP_NAME,
        "default_penalty_amount": settings.DEFAULT_PENALTY_AMOUNT,
        "reward_percentage": settings.REWARD_PERCENTAGE,
        "face_match_threshold": settings.FACE_MATCH_THRESHOLD
    }


@router.patch("/settings")
def update_settings(
    settings_data: dict,
    user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Update platform settings (stored in database or config).
    
    Note: In this implementation, settings are in .env file.
    For dynamic settings, create a Settings model in database.
    """
    return {
        "message": "Settings update not implemented. Use .env file for configuration."
    }
