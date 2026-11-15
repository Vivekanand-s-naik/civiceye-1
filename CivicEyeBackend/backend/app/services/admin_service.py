"""
Admin Service

Handles admin-only operations like user management and system logs.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from typing import List, Tuple, Dict, Any
from datetime import datetime, timedelta, timezone
from app.models import User, UserRole, Notification, Issue, Penalty, RewardWallet
from app.schemas import UserCreate, UserUpdate
from app.utils import hash_password, mask_aadhaar
import logging

logger = logging.getLogger(__name__)


class AdminService:
    """
    Service for administrative operations.
    """
    
    def create_user(
        self,
        db: Session,
        user_data: UserCreate
    ) -> User:
        """
        Create a new user (admin only).
        
        Args:
            db: Database session
            user_data: User creation data
            
        Returns:
            Created User object
        """
        # Check if user with same Aadhaar already exists
        masked_aadhaar = mask_aadhaar(user_data.aadhar_number)
        existing = db.query(User).filter(User.aadhar_number == masked_aadhaar).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this Aadhaar number already exists"
            )
        
        # Hash password if provided
        password_hash = None
        if user_data.password:
            password_hash = hash_password(user_data.password)
        
        # Create user
        user = User(
            aadhar_number=masked_aadhaar,
            email=user_data.email,
            password_hash=password_hash,
            full_name=user_data.full_name,
            phone_number=user_data.phone_number,
            role=user_data.role,
            zone=user_data.zone,
            is_active=True
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        logger.info(f"User {user.id} created with role {user.role}")
        return user
    
    def update_user(
        self,
        db: Session,
        user_id: int,
        update_data: UserUpdate
    ) -> User:
        """
        Update user information.
        
        Args:
            db: Database session
            user_id: User ID
            update_data: Update data
            
        Returns:
            Updated User object
        """
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update fields
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(user, key, value)
        
        db.commit()
        db.refresh(user)
        
        logger.info(f"User {user_id} updated")
        return user
    
    def list_users(
        self,
        db: Session,
        page: int = 1,
        page_size: int = 20,
        role_filter: UserRole = None
    ) -> Tuple[List[User], int]:
        """
        List all users with pagination.
        
        Args:
            db: Database session
            page: Page number
            page_size: Items per page
            role_filter: Filter by role
            
        Returns:
            Tuple of (users list, total count)
        """
        query = db.query(User)
        
        if role_filter:
            query = query.filter(User.role == role_filter)
        
        total = query.count()
        
        offset = (page - 1) * page_size
        users = query.order_by(User.created_at.desc()).offset(offset).limit(page_size).all()
        
        return users, total
    
    def toggle_user_status(
        self,
        db: Session,
        user_id: int,
        is_active: bool
    ) -> User:
        """
        Enable or disable a user account.
        
        Args:
            db: Database session
            user_id: User ID
            is_active: Active status
            
        Returns:
            Updated User object
        """
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user.is_active = is_active
        db.commit()
        db.refresh(user)
        
        logger.info(f"User {user_id} {'activated' if is_active else 'deactivated'}")
        return user
    
    def get_system_logs(
        self,
        db: Session,
        page: int = 1,
        page_size: int = 50
    ) -> Tuple[List[Notification], int]:
        """
        Get system logs (using notifications table).
        
        In production, consider a dedicated audit log table.
        
        Args:
            db: Database session
            page: Page number
            page_size: Items per page
            
        Returns:
            Tuple of (notifications list, total count)
        """
        query = db.query(Notification).filter(
            Notification.type == "system_alert"
        )
        
        total = query.count()
        
        offset = (page - 1) * page_size
        logs = query.order_by(Notification.created_at.desc()).offset(offset).limit(page_size).all()
        
        return logs, total
    
    def get_user_by_id(self, db: Session, user_id: int) -> User:
        """
        Get user by ID.
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            User object
        """
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return user
    
    def delete_user(self, db: Session, user_id: int) -> bool:
        """
        Delete a user (soft delete by deactivating).
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            Success status
        """
        return self.toggle_user_status(db, user_id, is_active=False)
    
    def get_dashboard_stats(self, db: Session) -> Dict[str, Any]:
        """
        Get dashboard statistics for admin overview.
        
        Args:
            db: Database session
            
        Returns:
            Dictionary with statistics
        """
        # User stats by role
        total_users = db.query(User).count()
        admin_count = db.query(User).filter(User.role == UserRole.ADMIN).count()
        authority_count = db.query(User).filter(User.role == UserRole.AUTHORITY).count()
        citizen_count = db.query(User).filter(User.role == UserRole.CITIZEN).count()
        active_users = db.query(User).filter(User.is_active == True).count()
        
        # Issue stats by status
        total_issues = db.query(Issue).count()
        pending_issues = db.query(Issue).filter(Issue.status == "pending").count()
        in_progress_issues = db.query(Issue).filter(Issue.status == "in_progress").count()
        resolved_issues = db.query(Issue).filter(Issue.status == "resolved").count()
        rejected_issues = db.query(Issue).filter(Issue.status == "rejected").count()
        
        # Penalty stats
        total_penalties = db.query(Penalty).count()
        pending_penalties = db.query(Penalty).filter(Penalty.status == "pending").count()
        paid_penalties = db.query(Penalty).filter(Penalty.status == "paid").count()
        
        # Recent activity (last 7 days)
        seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
        recent_issues = db.query(Issue).filter(Issue.created_at >= seven_days_ago).count()
        recent_penalties = db.query(Penalty).filter(Penalty.issued_at >= seven_days_ago).count()
        
        # Total reward points distributed
        total_rewards = db.query(func.sum(RewardWallet.balance)).scalar() or 0.0
        
        return {
            "users": {
                "total": total_users,
                "active": active_users,
                "by_role": {
                    "admin": admin_count,
                    "authority": authority_count,
                    "citizen": citizen_count
                }
            },
            "issues": {
                "total": total_issues,
                "by_status": {
                    "pending": pending_issues,
                    "in_progress": in_progress_issues,
                    "resolved": resolved_issues,
                    "rejected": rejected_issues
                },
                "recent_7_days": recent_issues
            },
            "penalties": {
                "total": total_penalties,
                "pending": pending_penalties,
                "paid": paid_penalties,
                "recent_7_days": recent_penalties
            },
            "rewards": {
                "total_distributed": float(total_rewards)
            }
        }


# Global instance
admin_service = AdminService()
