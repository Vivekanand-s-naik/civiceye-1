# """
# Authentication API Routes

# Endpoints for login, logout, and session management.
# """

# from fastapi import APIRouter, Depends, Response, HTTPException, status, Cookie
# from sqlalchemy.orm import Session
# from app.database import get_db
# from app.schemas import UserLogin, RequestOTP, LoginResponse, SessionCheckResponse
# from app.services import auth_service
# from app.utils.email_sender import send_otp

# router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# @router.post("/request-otp")
# def request_otp(
#     request: RequestOTP,
#     db: Session = Depends(get_db)
# ):
#     """
#     Request OTP for Aadhaar authentication.
    
#     In mock mode, returns the OTP in the response for testing.
#     In production, OTP is sent to registered mobile number.
#     """
#     success, message = auth_service.request_otp(db, request.aadhar_number)
    
#     if not success:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail=message
#         )
    
#     return {
#         "success": True,
#         "message": message
#     }
#     # Get user email from aadhar_number
#     user = db.query(User).filter(User.aadhar_number == request.aadhar_number).first()
#     if user:
#         from app.config import settings
#         send_otp(user.email, settings.MOCK_OTP_VALUE)
#     return {
#         "success": True,
#         "message": message
#     }
# @router.post("/login", response_model=LoginResponse)
# def login(
#     user_login: UserLogin,
#     response: Response,
#     db: Session = Depends(get_db)
# ):
#     """
#     Login with Aadhaar number and OTP.
    
#     Creates a server-side session and sets a secure HTTP-only cookie.
#     """
#     user = auth_service.login_with_otp(
#         db=db,
#         aadhaar_number=user_login.aadhar_number,
#         otp=user_login.otp,
#         response=response
#     )
    
#     return LoginResponse(
#         message="Login successful",
#         user=user
#     )


# @router.post("/logout")
# def logout(
#     response: Response,
#     session_token: str = Cookie(None),
#     db: Session = Depends(get_db)
# ):
#     """
#     Logout user by deleting session and clearing cookie.
#     """
#     auth_service.logout(db, session_token, response)
    
#     return {"message": "Logged out successfully"}


# @router.get("/session-check", response_model=SessionCheckResponse)
# def check_session(
#     session_token: str = Cookie(None),
#     db: Session = Depends(get_db)
# ):
#     """
#     Check if current session is valid and return user info.
#     """
#     try:
#         user = auth_service.get_current_user(db, session_token)
#         return SessionCheckResponse(
#             authenticated=True,
#             user=user
#         )
#     except HTTPException:
#         return SessionCheckResponse(
#             authenticated=False,
#             user=None
#         )

from fastapi import APIRouter, Depends, Response, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import UserLogin, RequestOTP, LoginResponse
from app.services import auth_service
from app.utils.email_sender import send_otp
from datetime import datetime, timedelta
import random
from app.models import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# In-memory OTP store: { aadhar_number: (otp, expiry) }
otp_store = {}

@router.post("/request-otp")
def request_otp(request: RequestOTP, db: Session = Depends(get_db)):
    """
    Request OTP for Aadhaar authentication.
    Generates a 6-digit OTP, stores it temporarily, and sends it to the user's email.
    """
    # Get user email from database
    user = db.query(User).filter(User.aadhar_number == request.aadhar_number).first()

    # user = db.query(auth_service.User).filter(auth_service.User.aadhar_number == request.aadhar_number).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Generate OTP
    otp = f"{random.randint(100000, 999999)}"
    expiry = datetime.utcnow() + timedelta(minutes=5)
    otp_store[request.aadhar_number] = (otp, expiry)

    # Send OTP via email
    send_otp(user.email, otp)

    return {"success": True, "message": "OTP sent to registered email"}

@router.post("/login", response_model=LoginResponse)
def login(user_login: UserLogin, response: Response, db: Session = Depends(get_db)):
    """
    Login with Aadhaar number and OTP.
    """
    # Check OTP
    data = otp_store.get(user_login.aadhar_number)
    if not data:
        raise HTTPException(status_code=400, detail="No OTP requested for this Aadhaar")
    stored_otp, expiry = data
    if datetime.utcnow() > expiry or user_login.otp != stored_otp:
        raise HTTPException(status_code=400, detail="Invalid OTP or OTP expired")

    # OTP is valid → remove from store (single-use)
    del otp_store[user_login.aadhar_number]

    # Perform login and generate session/token
    user = auth_service.login_with_otp(db, user_login.aadhar_number, user_login.otp, response)

    return LoginResponse(message="Login successful", user=user)
