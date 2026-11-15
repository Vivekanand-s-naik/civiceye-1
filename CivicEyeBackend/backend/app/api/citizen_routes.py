"""
Citizen API Routes

Endpoints for citizens to create and view their reports.
"""

from fastapi import APIRouter, Depends, UploadFile, File, Form, Cookie
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import User, IssueStatus, IssueCategory
from app.schemas import IssueResponse, IssueListResponse, RewardWalletResponse, RewardTransactionList, NotificationListResponse
from app.services import auth_service, issue_service, reward_service
from app.models import Notification

router = APIRouter(prefix="/api/citizen", tags=["Citizen"])


def get_current_citizen(
    session_token: str = Cookie(None),
    db: Session = Depends(get_db)
) -> User:
    """Dependency to get current authenticated citizen."""
    user = auth_service.get_current_user(db, session_token)
    if user.role != "citizen":
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Citizen access only"
        )
    return user


@router.post("/reports", response_model=IssueResponse)
async def create_report(
    title: str = Form(...),
    description: str = Form(...),
    category: IssueCategory = Form(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    address: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    user: User = Depends(get_current_citizen),
    db: Session = Depends(get_db)
):
    """
    Create a new civic issue report.
    
    Accepts multipart form data with optional image upload.
    """
    from app.schemas import IssueCreate
    
    issue_data = IssueCreate(
        title=title,
        description=description,
        category=category,
        latitude=latitude,
        longitude=longitude,
        address=address
    )
    
    issue = await issue_service.create_issue(
        db=db,
        issue_data=issue_data,
        user=user,
        image_file=image
    )
    
    return issue


@router.get("/reports", response_model=IssueListResponse)
def get_my_reports(
    page: int = 1,
    page_size: int = 20,
    status_filter: Optional[IssueStatus] = None,
    user: User = Depends(get_current_citizen),
    db: Session = Depends(get_db)
):
    """
    Get current user's reports with pagination and filtering.
    """
    issues, total = issue_service.list_issues(
        db=db,
        user=user,
        page=page,
        page_size=page_size,
        status_filter=status_filter
    )
    
    return IssueListResponse(
        total=total,
        page=page,
        page_size=page_size,
        issues=issues
    )


@router.get("/reports/{issue_id}", response_model=IssueResponse)
def get_report_detail(
    issue_id: int,
    user: User = Depends(get_current_citizen),
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific report.
    """
    issue = issue_service.get_issue(db, issue_id, user)
    return issue


@router.get("/wallet", response_model=RewardWalletResponse)
def get_wallet(
    user: User = Depends(get_current_citizen),
    db: Session = Depends(get_db)
):
    """
    Get reward wallet balance.
    """
    wallet = reward_service.get_wallet(db, user.id)
    return wallet


@router.get("/wallet/transactions", response_model=RewardTransactionList)
def get_wallet_transactions(
    page: int = 1,
    page_size: int = 20,
    user: User = Depends(get_current_citizen),
    db: Session = Depends(get_db)
):
    """
    Get reward transaction history.
    """
    transactions, total = reward_service.get_transactions(
        db=db,
        user_id=user.id,
        page=page,
        page_size=page_size
    )
    
    return RewardTransactionList(
        total=total,
        transactions=transactions
    )


@router.get("/notifications", response_model=NotificationListResponse)
def get_notifications(
    page: int = 1,
    page_size: int = 20,
    user: User = Depends(get_current_citizen),
    db: Session = Depends(get_db)
):
    """
    Get user notifications.
    """
    query = db.query(Notification).filter(Notification.user_id == user.id)
    
    total = query.count()
    unread_count = query.filter(Notification.is_read == False).count()
    
    offset = (page - 1) * page_size
    notifications = query.order_by(Notification.created_at.desc()).offset(offset).limit(page_size).all()
    
    return NotificationListResponse(
        total=total,
        unread_count=unread_count,
        notifications=notifications
    )
