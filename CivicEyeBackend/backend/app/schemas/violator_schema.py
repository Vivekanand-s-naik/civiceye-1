"""
Violator Schemas

Pydantic models for violator detection and management.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ViolatorBase(BaseModel):
    """Base violator schema"""
    issue_id: int
    match_confidence: float = Field(..., ge=0.0, le=1.0)


class ViolatorCreate(ViolatorBase):
    """Schema for creating violator record"""
    aadhar_number: Optional[str] = None
    full_name: Optional[str] = None
    face_image_path: Optional[str] = None


class ViolatorVerify(BaseModel):
    """Schema for verifying a violator"""
    is_verified: bool
    verification_notes: Optional[str] = None


class ViolatorResponse(ViolatorBase):
    """Schema for violator response"""
    id: int
    aadhar_number: Optional[str] = None
    full_name: Optional[str] = None
    face_image_path: Optional[str] = None
    is_verified: bool
    verified_by: Optional[int] = None
    verification_notes: Optional[str] = None
    detected_at: datetime
    verified_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class FaceMatchRequest(BaseModel):
    """Schema for face matching request"""
    confidence_threshold: float = Field(0.6, ge=0.0, le=1.0)


class FaceMatchResult(BaseModel):
    """Schema for single face match result"""
    aadhar_number: str
    full_name: str
    confidence: float
    image_path: Optional[str] = None


class FaceMatchResponse(BaseModel):
    """Schema for face matching response"""
    matches_found: int
    top_matches: list[FaceMatchResult]


class ImageAnalysisResponse(BaseModel):
    """Schema for AI image analysis response"""
    violator_detected: bool
    faces_detected: int
    face_locations: list[dict]  # [{"box": [x, y, w, h], "confidence": 0.95}]
    suggestion: dict  # {"penalty": 500, "severity": "medium", "category": "traffic_violation"}
