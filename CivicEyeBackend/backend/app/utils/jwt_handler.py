"""
JWT Handler

JWT token generation and verification utilities.
Optional - used for service-to-service communication or API tokens.
"""

from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from app.config import settings


ALGORITHM = "HS256"


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Payload data to encode in the token
        expires_delta: Token expiration time (default: 30 minutes)
        
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=30)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify and decode a JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded token payload or None if invalid
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def create_api_token(user_id: int, role: str, expires_days: int = 30) -> str:
    """
    Create a long-lived API token for service integration.
    
    Args:
        user_id: User ID
        role: User role
        expires_days: Token validity in days
        
    Returns:
        JWT token string
    """
    data = {
        "sub": str(user_id),
        "role": role,
        "type": "api_token"
    }
    return create_access_token(data, expires_delta=timedelta(days=expires_days))
