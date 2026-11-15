"""
Utils Package

Exports utility functions and services.
"""

from app.utils.security import (
    hash_password, verify_password, generate_session_token,
    generate_otp, mask_aadhaar, hash_face_encoding
)
from app.utils.jwt_handler import create_access_token, verify_token, create_api_token
from app.utils.aadhar_verifier import aadhaar_service
from app.utils.face_recognition import face_service
from app.utils.background_tasks import (
    add_notification_task, add_otp_task
)

__all__ = [
    # Security
    "hash_password", "verify_password", "generate_session_token",
    "generate_otp", "mask_aadhaar", "hash_face_encoding",
    # JWT
    "create_access_token", "verify_token", "create_api_token",
    # Services
    "aadhaar_service", "face_service",
    # Background tasks
    "add_notification_task", "add_otp_task",
]
