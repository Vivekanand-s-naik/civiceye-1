"""
Schemas Package

Exports all Pydantic schemas for API validation.
"""

from app.schemas.user_schema import (
    UserCreate, UserUpdate, UserResponse, UserLogin,
    RequestOTP, LoginResponse, SessionCheckResponse
)
from app.schemas.issue_schema import (
    IssueCreate, IssueUpdate, IssueResponse, IssueListResponse
)
from app.schemas.violator_schema import (
    ViolatorCreate, ViolatorVerify, ViolatorResponse,
    FaceMatchRequest, FaceMatchResult, FaceMatchResponse,
    ImageAnalysisResponse
)
from app.schemas.penalty_schema import (
    PenaltyCreate, PenaltyUpdate, PenaltyResponse, PenaltyPaymentSimulation
)
from app.schemas.reward_schema import (
    RewardWalletResponse, RewardTransactionResponse,
    RewardTransactionList, RewardCreditRequest, RewardRedeemRequest
)
from app.schemas.notification_schema import (
    NotificationResponse, NotificationListResponse, MarkReadRequest
)

__all__ = [
    # User schemas
    "UserCreate", "UserUpdate", "UserResponse", "UserLogin",
    "RequestOTP", "LoginResponse", "SessionCheckResponse",
    # Issue schemas
    "IssueCreate", "IssueUpdate", "IssueResponse", "IssueListResponse",
    # Violator schemas
    "ViolatorCreate", "ViolatorVerify", "ViolatorResponse",
    "FaceMatchRequest", "FaceMatchResult", "FaceMatchResponse",
    "ImageAnalysisResponse",
    # Penalty schemas
    "PenaltyCreate", "PenaltyUpdate", "PenaltyResponse", "PenaltyPaymentSimulation",
    # Reward schemas
    "RewardWalletResponse", "RewardTransactionResponse",
    "RewardTransactionList", "RewardCreditRequest", "RewardRedeemRequest",
    # Notification schemas
    "NotificationResponse", "NotificationListResponse", "MarkReadRequest",
]
