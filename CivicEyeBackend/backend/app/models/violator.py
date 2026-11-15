"""
Violator Model

Represents detected violators from AI analysis with face recognition match confidence.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, LargeBinary
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Violator(Base):
    """
    Violator model for tracking detected violators from AI analysis.
    
    Created when face recognition matches a person in the database.
    Stores match confidence and requires authority verification before penalty issuance.
    """
    __tablename__ = "violators"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Linked Report
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=False, index=True)
    
    # Detected Violator Identity
    aadhar_number = Column(String(20), nullable=True, index=True)  # Masked format
    full_name = Column(String(255), nullable=True)
    
    # Face Recognition Data
    match_confidence = Column(Float, nullable=False)  # 0.0 to 1.0
    face_image_path = Column(String(500), nullable=True)  # Cropped face image
    face_embedding = Column(LargeBinary, nullable=True)  # Serialized numpy array
    
    # Verification
    is_verified = Column(Boolean, default=False, nullable=False)
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # Authority who verified
    verification_notes = Column(String(500), nullable=True)
    
    # Timestamps
    detected_at = Column(DateTime(timezone=True), server_default=func.now())
    verified_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    issue = relationship("Issue", back_populates="violators")
    verifier = relationship("User", foreign_keys=[verified_by])
    penalties = relationship("Penalty", back_populates="violator", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Violator(id={self.id}, confidence={self.match_confidence}, verified={self.is_verified})>"
