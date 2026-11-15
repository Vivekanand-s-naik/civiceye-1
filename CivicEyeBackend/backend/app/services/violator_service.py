"""
Violator Service

Handles face detection, matching, and violator record management.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status, UploadFile
from typing import List, Optional
from app.models import Violator, Issue, User
from app.schemas import ViolatorCreate, FaceMatchResult
from app.utils import face_service
from app.config import settings
from datetime import datetime
import logging
import os

logger = logging.getLogger(__name__)


class ViolatorService:
    """
    Service for violator detection and face matching.
    """
    
    async def detect_and_create_violators(
        self,
        db: Session,
        issue_id: int,
        image_bytes: bytes
    ) -> List[Violator]:
        """
        Detect faces in image and create violator records.
        
        Args:
            db: Database session
            issue_id: Issue ID
            image_bytes: Image file bytes
            
        Returns:
            List of created Violator objects
        """
        # Detect faces and generate encodings
        encodings = face_service.encode_faces(image_bytes)
        face_locations = face_service.detect_faces(image_bytes)
        
        if not encodings:
            logger.info(f"No faces detected in issue {issue_id}")
            return []
        
        violators = []
        
        for i, (encoding, location) in enumerate(zip(encodings, face_locations)):
            # Try to match face against known database
            match_result = await self.match_face(db, encoding)
            
            if match_result:
                # Create violator record
                violator = Violator(
                    issue_id=issue_id,
                    aadhar_number=match_result["aadhar_number"],
                    full_name=match_result.get("full_name"),
                    match_confidence=match_result["confidence"],
                    face_embedding=face_service.serialize_encoding(encoding),
                    is_verified=False
                )
                
                db.add(violator)
                violators.append(violator)
                logger.info(f"Violator detected with confidence {match_result['confidence']:.2f}")
            else:
                # Create unidentified violator record
                violator = Violator(
                    issue_id=issue_id,
                    match_confidence=0.0,
                    face_embedding=face_service.serialize_encoding(encoding),
                    is_verified=False
                )
                db.add(violator)
                violators.append(violator)
                logger.info("Unidentified person detected in image")
        
        db.commit()
        return violators
    
    async def match_face(
        self,
        db: Session,
        test_encoding
    ) -> Optional[dict]:
        """
        Match a face encoding against database of known faces.
        
        Args:
            db: Database session
            test_encoding: Face encoding to match
            
        Returns:
            Match result dict or None
        """
        # Get all known face encodings from violators table
        # In production, use a dedicated face database or vector database
        known_violators = db.query(Violator).filter(
            Violator.face_embedding.isnot(None),
            Violator.is_verified == True
        ).all()
        
        if not known_violators:
            return None
        
        # Prepare known encodings
        known_encodings = []
        for v in known_violators:
            try:
                encoding = face_service.deserialize_encoding(v.face_embedding)
                known_encodings.append((v.id, encoding))
            except Exception as e:
                logger.error(f"Failed to deserialize encoding for violator {v.id}: {e}")
        
        # Find best match
        match = face_service.find_best_match(test_encoding, known_encodings)
        
        if match:
            violator_id, confidence = match
            matched_violator = db.query(Violator).filter(Violator.id == violator_id).first()
            
            if confidence >= settings.FACE_MATCH_THRESHOLD and matched_violator:
                return {
                    "violator_id": violator_id,
                    "aadhar_number": matched_violator.aadhar_number,
                    "full_name": matched_violator.full_name,
                    "confidence": confidence
                }
        
        return None
    
    async def analyze_image(
        self,
        db: Session,
        image_bytes: bytes
    ) -> dict:
        """
        Analyze image for violations and provide suggestions.
        
        Args:
            db: Database session
            image_bytes: Image file bytes
            
        Returns:
            Analysis result dictionary
        """
        # Detect faces
        face_locations = face_service.detect_faces(image_bytes)
        encodings = face_service.encode_faces(image_bytes)
        
        # Build face location data
        face_data = []
        for loc in face_locations:
            top, right, bottom, left = loc
            face_data.append({
                "box": [int(left), int(top), int(right - left), int(bottom - top)],
                "confidence": 0.95  # face_recognition doesn't provide confidence
            })
        
        # Determine if violator detected
        violator_detected = len(face_locations) > 0
        
        # Generate penalty suggestion (simple heuristic)
        suggestion = {
            "penalty": settings.DEFAULT_PENALTY_AMOUNT,
            "severity": "medium",
            "category": "traffic_violation"
        }
        
        if len(face_locations) > 1:
            suggestion["severity"] = "high"
            suggestion["penalty"] = settings.DEFAULT_PENALTY_AMOUNT * 1.5
        
        return {
            "violator_detected": violator_detected,
            "faces_detected": len(face_locations),
            "face_locations": face_data,
            "suggestion": suggestion
        }
    
    def verify_violator(
        self,
        db: Session,
        violator_id: int,
        is_verified: bool,
        verification_notes: Optional[str],
        verifier: User
    ) -> Violator:
        """
        Verify a violator (authority action).
        
        Args:
            db: Database session
            violator_id: Violator ID
            is_verified: Verification status
            verification_notes: Verification notes
            verifier: Authority user
            
        Returns:
            Updated Violator object
        """
        violator = db.query(Violator).filter(Violator.id == violator_id).first()
        
        if not violator:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Violator not found"
            )
        
        violator.is_verified = is_verified
        violator.verified_by = verifier.id
        violator.verification_notes = verification_notes
        violator.verified_at = datetime.utcnow()
        
        db.commit()
        db.refresh(violator)
        
        logger.info(f"Violator {violator_id} verified by authority {verifier.id}")
        return violator
    
    def get_violators_by_issue(
        self,
        db: Session,
        issue_id: int
    ) -> List[Violator]:
        """
        Get all violators for an issue.
        
        Args:
            db: Database session
            issue_id: Issue ID
            
        Returns:
            List of Violator objects
        """
        return db.query(Violator).filter(Violator.issue_id == issue_id).all()


# Global instance
violator_service = ViolatorService()
