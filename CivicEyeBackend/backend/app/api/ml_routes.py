"""
ML/AI API Routes

Endpoints for image analysis, face matching, and AI insights.
"""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Cookie
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User
from app.schemas import ImageAnalysisResponse, FaceMatchResponse, FaceMatchResult, FaceMatchRequest
from app.services import auth_service, violator_service

router = APIRouter(prefix="/api/ml", tags=["ML/AI"])


def get_current_authority_or_admin(
    session_token: str = Cookie(None),
    db: Session = Depends(get_db)
) -> User:
    """Dependency for authority/admin access."""
    user = auth_service.get_current_user(db, session_token)
    if user.role not in ["authority", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Authority or admin access required"
        )
    return user


@router.post("/analyze", response_model=ImageAnalysisResponse)
async def analyze_image(
    image: UploadFile = File(...),
    user: User = Depends(get_current_authority_or_admin),
    db: Session = Depends(get_db)
):
    """
    Analyze image for violations using AI.
    
    Detects faces, runs violation detection, and provides penalty suggestions.
    """
    # Read image
    image_bytes = await image.read()
    
    # Analyze image
    analysis = await violator_service.analyze_image(db, image_bytes)
    
    return ImageAnalysisResponse(**analysis)


@router.post("/match-face", response_model=FaceMatchResponse)
async def match_face(
    image: UploadFile = File(...),
    confidence_threshold: float = 0.6,
    user: User = Depends(get_current_authority_or_admin),
    db: Session = Depends(get_db)
):
    """
    Match face in image against database of known violators.
    
    Returns top matches with confidence scores.
    """
    from app.utils import face_service
    
    # Read image
    image_bytes = await image.read()
    
    # Generate face encodings
    encodings = face_service.encode_faces(image_bytes)
    
    if not encodings:
        return FaceMatchResponse(
            matches_found=0,
            top_matches=[]
        )
    
    # Match first face only
    test_encoding = encodings[0]
    
    # Find matches
    match = await violator_service.match_face(db, test_encoding)
    
    top_matches = []
    if match and match["confidence"] >= confidence_threshold:
        top_matches.append(
            FaceMatchResult(
                aadhar_number=match["aadhar_number"],
                full_name=match.get("full_name", "Unknown"),
                confidence=match["confidence"]
            )
        )
    
    return FaceMatchResponse(
        matches_found=len(top_matches),
        top_matches=top_matches
    )


@router.get("/insights")
def get_ai_insights(
    user: User = Depends(get_current_authority_or_admin),
    db: Session = Depends(get_db)
):
    """
    Get AI-powered insights and analytics.
    
    Returns:
    - Top violation categories
    - Hotspot areas
    - Detection accuracy metrics
    - Suggested patrol areas
    """
    from app.models import Issue, Violator, IssueCategory
    from sqlalchemy import func
    
    # Top violation categories
    category_counts = db.query(
        Issue.category,
        func.count(Issue.id).label('count')
    ).group_by(Issue.category).order_by(func.count(Issue.id).desc()).limit(5).all()
    
    top_violations = [
        {"category": cat.value, "count": count}
        for cat, count in category_counts
    ]
    
    # Detection statistics
    total_issues = db.query(Issue).count()
    issues_with_violators = db.query(Issue).join(Violator).distinct().count()
    verified_violators = db.query(Violator).filter(Violator.is_verified == True).count()
    
    # Simple hotspot calculation (most frequent lat/lon areas)
    # In production, use proper geospatial clustering
    hotspots = []
    if total_issues > 0:
        recent_issues = db.query(Issue).filter(
            Issue.latitude.isnot(None),
            Issue.longitude.isnot(None)
        ).limit(10).all()
        
        for issue in recent_issues:
            hotspots.append({
                "latitude": issue.latitude,
                "longitude": issue.longitude,
                "category": issue.category.value
            })
    
    return {
        "top_violations": top_violations,
        "hotspots": hotspots[:5],
        "statistics": {
            "total_reports": total_issues,
            "reports_with_violators": issues_with_violators,
            "verified_violators": verified_violators,
            "detection_rate": (issues_with_violators / total_issues * 100) if total_issues > 0 else 0
        },
        "suggested_patrols": hotspots[:3]
    }
