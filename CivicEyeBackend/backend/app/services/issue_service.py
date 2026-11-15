"""
Issue Service

Handles issue/report creation, updates, and querying.
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from fastapi import HTTPException, status, UploadFile
from typing import Optional, List, Tuple
from datetime import datetime
from app.models import Issue, User, IssueStatus, IssueCategory
from app.schemas import IssueCreate, IssueUpdate
from app.config import settings
import os
import uuid
import logging

logger = logging.getLogger(__name__)


class IssueService:
    """
    Service for managing civic issue reports.
    """
    
    async def create_issue(
        self,
        db: Session,
        issue_data: IssueCreate,
        user: User,
        image_file: Optional[UploadFile] = None
    ) -> Issue:
        """
        Create a new issue report.
        
        Args:
            db: Database session
            issue_data: Issue creation data
            user: Reporter user
            image_file: Optional uploaded image
            
        Returns:
            Created Issue object
        """
        # Save image if provided
        image_path = None
        if image_file:
            image_path = await self.save_upload_file(image_file, "issues")
        
        # Create issue
        issue = Issue(
            user_id=user.id,
            title=issue_data.title,
            description=issue_data.description,
            category=issue_data.category,
            latitude=issue_data.latitude,
            longitude=issue_data.longitude,
            address=issue_data.address,
            image_path=image_path,
            status=IssueStatus.PENDING
        )
        
        db.add(issue)
        db.commit()
        db.refresh(issue)
        
        logger.info(f"Issue {issue.id} created by user {user.id}")
        return issue
    
    def get_issue(self, db: Session, issue_id: int, user: User) -> Issue:
        """
        Get issue by ID with access control.
        
        Args:
            db: Database session
            issue_id: Issue ID
            user: Current user
            
        Returns:
            Issue object
            
        Raises:
            HTTPException: If issue not found or access denied
        """
        issue = db.query(Issue).filter(Issue.id == issue_id).first()
        
        if not issue:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Issue not found"
            )
        
        # Access control: citizens can only view their own issues
        if user.role == "citizen" and issue.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return issue
    
    def list_issues(
        self,
        db: Session,
        user: User,
        page: int = 1,
        page_size: int = 20,
        status_filter: Optional[IssueStatus] = None,
        category_filter: Optional[IssueCategory] = None,
        user_id: Optional[int] = None
    ) -> Tuple[List[Issue], int]:
        """
        List issues with pagination and filtering.
        
        Args:
            db: Database session
            user: Current user
            page: Page number (1-indexed)
            page_size: Items per page
            status_filter: Filter by status
            category_filter: Filter by category
            user_id: Filter by user (for authorities/admins)
            
        Returns:
            Tuple of (issues list, total count)
        """
        # Base query
        query = db.query(Issue)
        
        # Access control
        if user.role == "citizen":
            # Citizens can only see their own issues
            query = query.filter(Issue.user_id == user.id)
        elif user.role == "authority" and user.zone:
            # Authorities see issues in their zone (simplified - can be extended)
            pass  # Zone filtering would go here
        
        # Apply filters
        if status_filter:
            query = query.filter(Issue.status == status_filter)
        
        if category_filter:
            query = query.filter(Issue.category == category_filter)
        
        if user_id and user.role in ["authority", "admin"]:
            query = query.filter(Issue.user_id == user_id)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * page_size
        issues = query.order_by(Issue.created_at.desc()).offset(offset).limit(page_size).all()
        
        return issues, total
    
    def update_issue(
        self,
        db: Session,
        issue_id: int,
        update_data: IssueUpdate,
        user: User
    ) -> Issue:
        """
        Update issue details.
        
        Args:
            db: Database session
            issue_id: Issue ID
            update_data: Update data
            user: Current user
            
        Returns:
            Updated Issue object
        """
        issue = self.get_issue(db, issue_id, user)
        
        # Access control: only authorities and admins can update issues
        if user.role not in ["authority", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only authorities and admins can update issues"
            )
        
        # Update fields
        update_dict = update_data.model_dump(exclude_unset=True)
        
        for key, value in update_dict.items():
            setattr(issue, key, value)
        
        # Update resolved timestamp if status changed to resolved
        if update_data.status == IssueStatus.RESOLVED and not issue.resolved_at:
            issue.resolved_at = datetime.utcnow()
        
        db.commit()
        db.refresh(issue)
        
        logger.info(f"Issue {issue_id} updated by user {user.id}")
        return issue
    
    def assign_issue(
        self,
        db: Session,
        issue_id: int,
        authority_id: int,
        user: User
    ) -> Issue:
        """
        Assign issue to an authority.
        
        Args:
            db: Database session
            issue_id: Issue ID
            authority_id: Authority user ID
            user: Current user (must be admin or authority)
            
        Returns:
            Updated Issue object
        """
        issue = self.get_issue(db, issue_id, user)
        
        # Verify authority user exists and has authority role
        authority = db.query(User).filter(User.id == authority_id).first()
        if not authority or authority.role != "authority":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid authority user"
            )
        
        issue.assigned_to = authority_id
        issue.status = IssueStatus.IN_PROGRESS
        
        db.commit()
        db.refresh(issue)
        
        logger.info(f"Issue {issue_id} assigned to authority {authority_id}")
        return issue
    
    async def save_upload_file(
        self,
        file: UploadFile,
        subfolder: str
    ) -> str:
        """
        Save uploaded file to storage.
        
        Args:
            file: Uploaded file
            subfolder: Subfolder name (e.g., "issues", "faces")
            
        Returns:
            Relative file path
        """
        # Create directory if not exists
        upload_dir = os.path.join(settings.UPLOAD_DIR, subfolder)
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Return relative path
        return os.path.join(subfolder, unique_filename)


# Global instance
issue_service = IssueService()
