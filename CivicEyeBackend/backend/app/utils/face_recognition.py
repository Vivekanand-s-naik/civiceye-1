"""
Face Recognition Utilities

Wrapper around face_recognition library for face detection and matching.
Uses face encodings and cosine similarity for matching.

NOTE: face_recognition requires dlib which requires cmake.
If not installed, falls back to mock implementation.
"""

try:
    import face_recognition
    FACE_RECOGNITION_AVAILABLE = True
except ImportError:
    FACE_RECOGNITION_AVAILABLE = False
    print("WARNING: face_recognition not available. Using mock implementation.")

import numpy as np
from typing import List, Tuple, Optional
from PIL import Image
import io
import pickle
try:
    from sklearn.metrics.pairwise import cosine_similarity
except ImportError:
    cosine_similarity = None
import logging

logger = logging.getLogger(__name__)


class FaceRecognitionService:
    """
    Face recognition service for detecting and matching faces.
    
    Uses face_recognition library (based on dlib) for:
    - Face detection in images
    - Face encoding generation (128-dimensional)
    - Face matching using distance comparison
    """
    
    def __init__(self, tolerance: float = 0.6):
        """
        Initialize face recognition service.
        
        Args:
            tolerance: Face matching tolerance (lower = stricter matching)
                      Default 0.6 is a good balance
        """
        self.tolerance = tolerance
    
    def detect_faces(self, image_bytes: bytes) -> List[Tuple[int, int, int, int]]:
        """
        Detect all faces in an image.
        
        Args:
            image_bytes: Image file bytes
            
        Returns:
            List of face locations as (top, right, bottom, left) tuples
        """
        if not FACE_RECOGNITION_AVAILABLE:
            # Mock implementation
            logger.warning("Using mock face detection")
            return [(100, 200, 300, 100)]  # Mock face location
        
        try:
            # Load image
            image = face_recognition.load_image_file(io.BytesIO(image_bytes))
            
            # Detect faces
            face_locations = face_recognition.face_locations(image)
            
            logger.info(f"Detected {len(face_locations)} faces in image")
            return face_locations
        except Exception as e:
            logger.error(f"Face detection error: {str(e)}")
            return []
    
    def encode_faces(self, image_bytes: bytes) -> List[np.ndarray]:
        """
        Generate face encodings for all faces in an image.
        
        Args:
            image_bytes: Image file bytes
            
        Returns:
            List of 128-dimensional face encodings
        """
        if not FACE_RECOGNITION_AVAILABLE:
            # Mock implementation
            logger.warning("Using mock face encoding")
            return [np.random.rand(128)]  # Mock 128-dimensional encoding
        
        try:
            # Load image
            image = face_recognition.load_image_file(io.BytesIO(image_bytes))
            
            # Get face encodings
            encodings = face_recognition.face_encodings(image)
            
            logger.info(f"Generated {len(encodings)} face encodings")
            return encodings
        except Exception as e:
            logger.error(f"Face encoding error: {str(e)}")
            return []
    
    def compare_faces(
        self, 
        known_encoding: np.ndarray, 
        test_encoding: np.ndarray
    ) -> Tuple[bool, float]:
        """
        Compare two face encodings.
        
        Args:
            known_encoding: Reference face encoding
            test_encoding: Face encoding to compare
            
        Returns:
            Tuple of (is_match, confidence_score)
        """
        if not FACE_RECOGNITION_AVAILABLE:
            # Mock implementation
            logger.warning("Using mock face comparison")
            confidence = 0.75  # Mock confidence
            return confidence >= self.tolerance, confidence
        
        try:
            # Calculate face distance (Euclidean distance)
            distance = face_recognition.face_distance([known_encoding], test_encoding)[0]
            
            # Convert distance to confidence (0-1 scale, higher = more confident)
            # Distance < tolerance means match
            confidence = 1 - distance
            is_match = distance <= self.tolerance
            
            return is_match, float(confidence)
        except Exception as e:
            logger.error(f"Face comparison error: {str(e)}")
            return False, 0.0
    
    def find_best_match(
        self, 
        test_encoding: np.ndarray, 
        known_encodings: List[Tuple[int, np.ndarray]]
    ) -> Optional[Tuple[int, float]]:
        """
        Find the best matching face from a list of known faces.
        
        Args:
            test_encoding: Face encoding to match
            known_encodings: List of (id, encoding) tuples
            
        Returns:
            Tuple of (best_match_id, confidence) or None if no match
        """
        if not known_encodings:
            return None
        
        best_match_id = None
        best_confidence = 0.0
        
        for face_id, known_encoding in known_encodings:
            is_match, confidence = self.compare_faces(known_encoding, test_encoding)
            
            if is_match and confidence > best_confidence:
                best_match_id = face_id
                best_confidence = confidence
        
        if best_match_id is not None:
            logger.info(f"Best match: ID {best_match_id} with confidence {best_confidence:.2f}")
            return best_match_id, best_confidence
        
        return None
    
    def serialize_encoding(self, encoding: np.ndarray) -> bytes:
        """
        Serialize face encoding for database storage.
        
        Args:
            encoding: Face encoding numpy array
            
        Returns:
            Serialized bytes
        """
        return pickle.dumps(encoding)
    
    def deserialize_encoding(self, encoding_bytes: bytes) -> np.ndarray:
        """
        Deserialize face encoding from database.
        
        Args:
            encoding_bytes: Serialized encoding bytes
            
        Returns:
            Face encoding numpy array
        """
        return pickle.loads(encoding_bytes)
    
    def extract_face_image(
        self, 
        image_bytes: bytes, 
        face_location: Tuple[int, int, int, int]
    ) -> bytes:
        """
        Extract a face region from an image.
        
        Args:
            image_bytes: Original image bytes
            face_location: Face location (top, right, bottom, left)
            
        Returns:
            Cropped face image bytes
        """
        try:
            # Load image
            image = Image.open(io.BytesIO(image_bytes))
            
            # Extract face region
            top, right, bottom, left = face_location
            face_image = image.crop((left, top, right, bottom))
            
            # Convert to bytes
            buffer = io.BytesIO()
            face_image.save(buffer, format="JPEG")
            return buffer.getvalue()
        except Exception as e:
            logger.error(f"Face extraction error: {str(e)}")
            return b""


# Global instance
face_service = FaceRecognitionService()
