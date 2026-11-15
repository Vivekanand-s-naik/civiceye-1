"""
Authority API Routes

Endpoints for authorities to manage reports, verify violators, and issue penalties.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Cookie, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.models import User, IssueStatus, IssueCategory
from app.schemas import (
    IssueResponse, IssueListResponse, IssueUpdate,
    ViolatorResponse, ViolatorVerify,
    PenaltyCreate, PenaltyResponse
)
from app.services import auth_service, issue_service, violator_service, penalty_service

router = APIRouter(prefix="/api/authority", tags=["Authority"])


def get_current_authority(
    session_token: str = Cookie(None),
    db: Session = Depends(get_db)
) -> User:
    """Dependency to get current authenticated authority."""
    user = auth_service.get_current_user(db, session_token)
    if user.role not in ["authority", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Authority or admin access required"
        )
    return user


@router.get("/reports", response_model=IssueListResponse)
def list_reports(
    page: int = 1,
    page_size: int = 20,
    status_filter: Optional[IssueStatus] = None,
    category_filter: Optional[IssueCategory] = None,
    user: User = Depends(get_current_authority),
    db: Session = Depends(get_db)
):
    """
    List all reports visible to authority with pagination and filtering.
    """
    issues, total = issue_service.list_issues(
        db=db,
        user=user,
        page=page,
        page_size=page_size,
        status_filter=status_filter,
        category_filter=category_filter
    )
    
    return IssueListResponse(
        total=total,
        page=page,
        page_size=page_size,
        issues=issues
    )


@router.get("/reports/{issue_id}", response_model=IssueResponse)
def get_report(
    issue_id: int,
    user: User = Depends(get_current_authority),
    db: Session = Depends(get_db)
):
    """
    Get report details.
    """
    issue = issue_service.get_issue(db, issue_id, user)
    return issue


@router.patch("/reports/{issue_id}", response_model=IssueResponse)
def update_report(
    issue_id: int,
    update_data: IssueUpdate,
    user: User = Depends(get_current_authority),
    db: Session = Depends(get_db)
):
    """
    Update report status and details.
    """
    issue = issue_service.update_issue(db, issue_id, update_data, user)
    return issue


@router.post("/reports/{issue_id}/assign/{authority_id}", response_model=IssueResponse)
def assign_report(
    issue_id: int,
    authority_id: int,
    user: User = Depends(get_current_authority),
    db: Session = Depends(get_db)
):
    """
    Assign report to an authority.
    """
    issue = issue_service.assign_issue(db, issue_id, authority_id, user)
    return issue


@router.post("/reports/{issue_id}/detect-violators")
async def detect_violators(
    issue_id: int,
    user: User = Depends(get_current_authority),
    db: Session = Depends(get_db)
):
    """
    Run AI detection on report image to identify violators.
    """
    # Get issue
    issue = issue_service.get_issue(db, issue_id, user)
    
    if not issue.image_path:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image attached to this report"
        )
    
    # Load image
    import os
    from app.config import settings
    full_path = os.path.join(settings.UPLOAD_DIR, issue.image_path)
    
    if not os.path.exists(full_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image file not found"
        )
    
    with open(full_path, "rb") as f:
        image_bytes = f.read()
    
    # Detect violators
    violators = await violator_service.detect_and_create_violators(
        db=db,
        issue_id=issue_id,
        image_bytes=image_bytes
    )
    
    return {
        "success": True,
        "violators_detected": len(violators),
        "violators": violators
    }


@router.get("/reports/{issue_id}/violators", response_model=List[ViolatorResponse])
def get_violators(
    issue_id: int,
    user: User = Depends(get_current_authority),
    db: Session = Depends(get_db)
):
    """
    Get all violators detected for a report.
    """
    violators = violator_service.get_violators_by_issue(db, issue_id)
    return violators


@router.post("/violators/{violator_id}/verify", response_model=ViolatorResponse)
def verify_violator(
    violator_id: int,
    verify_data: ViolatorVerify,
    user: User = Depends(get_current_authority),
    db: Session = Depends(get_db)
):
    """
    Verify a detected violator.
    """
    violator = violator_service.verify_violator(
        db=db,
        violator_id=violator_id,
        is_verified=verify_data.is_verified,
        verification_notes=verify_data.verification_notes,
        verifier=user
    )
    return violator


@router.post("/penalties", response_model=PenaltyResponse)
def issue_penalty(
    penalty_data: PenaltyCreate,
    user: User = Depends(get_current_authority),
    db: Session = Depends(get_db)
):
    """
    Issue a penalty to a verified violator.
    """
    penalty = penalty_service.create_penalty(db, penalty_data)
    return penalty


@router.get("/penalties/{penalty_id}", response_model=PenaltyResponse)
def get_penalty(
    penalty_id: int,
    user: User = Depends(get_current_authority),
    db: Session = Depends(get_db)
):
    """
    Get penalty details.
    """
    from app.models import Penalty
    penalty = db.query(Penalty).filter(Penalty.id == penalty_id).first()
    
    if not penalty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Penalty not found"
        )
    
    return penalty
