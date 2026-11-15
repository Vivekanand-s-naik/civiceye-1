"""
Authentication Service

Handles Aadhaar OTP verification, session management, and user authentication.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Cookie, Response
from typing import Optional, Tuple
from datetime import datetime, timedelta, timezone
from app.models import User, Session as SessionModel
from app.utils import (
    aadhaar_service, generate_session_token,
    hash_password, verify_password, mask_aadhaar
)
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class AuthService:
    """
    Authentication service for handling user login, sessions, and authorization.
    """
    
    def request_otp(self, db: Session, aadhaar_number: str) -> Tuple[bool, str]:
        """
        Request OTP for Aadhaar authentication.
        
        Args:
            db: Database session
            aadhaar_number: 12-digit Aadhaar number
            
        Returns:
            Tuple of (success, message)
        """
        # Request OTP via Aadhaar service
        success, message = aadhaar_service.request_otp(aadhaar_number)
        return success, message
    
    def login_with_otp(
        self,
        db: Session,
        aadhaar_number: str,
        otp: str,
        response: Response,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> User:
        """
        Authenticate user with Aadhaar OTP and create session.
        
        Args:
            db: Database session
            aadhaar_number: 12-digit Aadhaar number
            otp: 6-digit OTP
            response: FastAPI Response object (for setting cookie)
            user_agent: User agent string
            ip_address: Client IP address
            
        Returns:
            Authenticated User object
            
        Raises:
            HTTPException: If authentication fails
        """
        # Verify OTP
        success, user_data = aadhaar_service.verify_otp(aadhaar_number, otp)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid OTP or OTP expired"
            )
        
        # Find or create user
        masked_aadhaar = mask_aadhaar(aadhaar_number)
        user = db.query(User).filter(User.aadhar_number == masked_aadhaar).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found. Please contact administrator for registration."
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        
        # Create session
        session = self.create_session(
            db=db,
            user=user,
            user_agent=user_agent,
            ip_address=ip_address
        )
        
        # Set session cookie
        self.set_session_cookie(response, session.token)
        
        logger.info(f"User {user.id} logged in successfully")
        return user
    
    def create_session(
        self,
        db: Session,
        user: User,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> SessionModel:
        """
        Create a new session for user.
        
        Args:
            db: Database session
            user: User object
            user_agent: User agent string
            ip_address: Client IP address
            
        Returns:
            Created Session object
        """
        # Generate session token
        token = generate_session_token()
        
        # Calculate expiration
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=settings.SESSION_EXPIRE_SECONDS)
        
        # Create session record
        session = SessionModel(
            token=token,
            user_id=user.id,
            expires_at=expires_at,
            user_agent=user_agent,
            ip_address=ip_address
        )
        
        db.add(session)
        db.commit()
        db.refresh(session)
        
        return session
    
    def get_current_user(
        self,
        db: Session,
        session_token: Optional[str] = Cookie(None)
    ) -> User:
        """
        Get current user from session cookie.
        Dependency function for protected routes.
        
        Args:
            db: Database session
            session_token: Session token from cookie
            
        Returns:
            Current User object
            
        Raises:
            HTTPException: If session is invalid or expired
        """
        if not session_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )
        
        # Find session
        session = db.query(SessionModel).filter(
            SessionModel.token == session_token
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid session"
            )
        
        # Check expiration
        if session.is_expired():
            db.delete(session)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session expired"
            )
        
        # Update last accessed time
        session.last_accessed = datetime.now(timezone.utc)
        db.commit()
        
        # Get user
        user = db.query(User).filter(User.id == session.user_id).first()
        
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        return user
    
    def logout(self, db: Session, session_token: Optional[str], response: Response):
        """
        Logout user by deleting session and clearing cookie.
        
        Args:
            db: Database session
            session_token: Session token from cookie
            response: FastAPI Response object
        """
        if session_token:
            # Delete session
            session = db.query(SessionModel).filter(
                SessionModel.token == session_token
            ).first()
            
            if session:
                db.delete(session)
                db.commit()
        
        # Clear cookie
        response.delete_cookie(key="session_token")
    
    def set_session_cookie(self, response: Response, token: str):
        """
        Set session cookie with secure flags.
        
        Args:
            response: FastAPI Response object
            token: Session token
        """
        response.set_cookie(
            key="session_token",
            value=token,
            httponly=True,  # Prevent JavaScript access (XSS protection)
            secure=settings.COOKIE_SECURE,  # HTTPS only in production
            samesite=settings.COOKIE_SAMESITE,  # CSRF protection
            max_age=settings.SESSION_EXPIRE_SECONDS
        )
    
    def cleanup_expired_sessions(self, db: Session) -> int:
        """
        Remove expired sessions from database.
        Should be run periodically as a background task.
        
        Args:
            db: Database session
            
        Returns:
            Number of sessions deleted
        """
        result = db.query(SessionModel).filter(
            SessionModel.expires_at < datetime.now(timezone.utc)
        ).delete()
        db.commit()
        
        logger.info(f"Cleaned up {result} expired sessions")
        return result


# Global instance
auth_service = AuthService()


# Dependency functions for FastAPI
def require_role(required_role: str):
    """
    Dependency factory for role-based access control.
    
    Usage:
        @app.get("/admin/users", dependencies=[Depends(require_role("admin"))])
        def get_users(...):
            ...
    """
    def role_checker(user: User = None):
        if not user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        if user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires {required_role} role"
            )
        return user
    
    return role_checker


def require_any_role(allowed_roles: list):
    """
    Dependency factory for multiple allowed roles.
    """
    def role_checker(user: User = None):
        if not user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires one of: {', '.join(allowed_roles)}"
            )
        return user
    
    return role_checker
