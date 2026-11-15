"""
Security Utilities

Password hashing, token generation, and security helpers.
"""

from passlib.context import CryptContext
import secrets
import hashlib
from typing import Optional

# Password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password string
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    
    Args:
        plain_password: Plain text password to verify
        hashed_password: Stored password hash
        
    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def generate_session_token() -> str:
    """
    Generate a secure random session token.
    
    Returns:
        64-character hex string
    """
    return secrets.token_hex(32)


def generate_otp() -> str:
    """
    Generate a 6-digit OTP.
    
    Returns:
        6-digit OTP string
    """
    return str(secrets.randbelow(1000000)).zfill(6)


def mask_aadhaar(aadhaar: str) -> str:
    """
    Mask Aadhaar number for privacy (XXXX-XXXX-1234 format).
    
    PRIVACY NOTE: Only last 4 digits should be visible to protect user identity.
    
    Args:
        aadhaar: Full 12-digit Aadhaar number
        
    Returns:
        Masked Aadhaar string
    """
    # Remove any existing formatting
    clean = ''.join(filter(str.isdigit, aadhaar))
    
    if len(clean) != 12:
        return aadhaar  # Return as-is if invalid format
    
    # Mask first 8 digits, show last 4
    return f"XXXX-XXXX-{clean[-4:]}"


def hash_face_encoding(encoding_bytes: bytes) -> str:
    """
    Create a hash of face encoding for quick lookups.
    
    Args:
        encoding_bytes: Serialized face encoding
        
    Returns:
        SHA256 hash string
    """
    return hashlib.sha256(encoding_bytes).hexdigest()
