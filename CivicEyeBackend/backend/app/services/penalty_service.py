"""
Penalty Service

Handles penalty creation, payment processing, and reward distribution.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List
from datetime import datetime
from app.models import Penalty, Violator, PenaltyStatus, Issue
from app.schemas import PenaltyCreate, PenaltyUpdate
from app.services.reward_service import reward_service
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class PenaltyService:
    """
    Service for managing penalties and payments.
    """
    
    def create_penalty(
        self,
        db: Session,
        penalty_data: PenaltyCreate
    ) -> Penalty:
        """
        Create a new penalty for a violator.
        
        Args:
            db: Database session
            penalty_data: Penalty creation data
            
        Returns:
            Created Penalty object
        """
        # Verify violator exists and is verified
        violator = db.query(Violator).filter(
            Violator.id == penalty_data.violator_id
        ).first()
        
        if not violator:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Violator not found"
            )
        
        if not violator.is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Violator must be verified before issuing penalty"
            )
        
        # Create penalty
        penalty = Penalty(
            violator_id=penalty_data.violator_id,
            amount=penalty_data.amount,
            reason=penalty_data.reason,
            status=PenaltyStatus.PENDING
        )
        
        db.add(penalty)
        db.commit()
        db.refresh(penalty)
        
        logger.info(f"Penalty {penalty.id} created for violator {violator.id}, amount: {penalty.amount}")
        return penalty
    
    def update_penalty_status(
        self,
        db: Session,
        penalty_id: int,
        update_data: PenaltyUpdate
    ) -> Penalty:
        """
        Update penalty status (e.g., mark as paid).
        
        Args:
            db: Database session
            penalty_id: Penalty ID
            update_data: Update data
            
        Returns:
            Updated Penalty object
        """
        penalty = db.query(Penalty).filter(Penalty.id == penalty_id).first()
        
        if not penalty:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Penalty not found"
            )
        
        # Update fields
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(penalty, key, value)
        
        # Set paid_at timestamp if status changed to paid
        if update_data.status == PenaltyStatus.PAID and not penalty.paid_at:
            penalty.paid_at = datetime.utcnow()
            
            # Credit reward to reporter
            violator = db.query(Violator).filter(Violator.id == penalty.violator_id).first()
            if violator:
                issue = db.query(Issue).filter(Issue.id == violator.issue_id).first()
                if issue:
                    reward_amount = penalty.amount * (settings.REWARD_PERCENTAGE / 100)
                    reward_service.credit_reward(
                        db=db,
                        user_id=issue.user_id,
                        amount=reward_amount,
                        description=f"Reward for report #{issue.id} - Penalty #{penalty.id} paid",
                        reference_type="penalty",
                        reference_id=penalty.id
                    )
        
        db.commit()
        db.refresh(penalty)
        
        logger.info(f"Penalty {penalty_id} status updated to {update_data.status}")
        return penalty
    
    def simulate_payment(
        self,
        db: Session,
        penalty_id: int,
        payment_method: str,
        transaction_id: str
    ) -> Penalty:
        """
        Simulate penalty payment (for testing/demo).
        
        Args:
            db: Database session
            penalty_id: Penalty ID
            payment_method: Payment method
            transaction_id: Transaction ID
            
        Returns:
            Updated Penalty object
        """
        update_data = PenaltyUpdate(
            status=PenaltyStatus.PAID,
            payment_method=payment_method,
            transaction_id=transaction_id
        )
        
        return self.update_penalty_status(db, penalty_id, update_data)
    
    def get_penalties_by_violator(
        self,
        db: Session,
        violator_id: int
    ) -> List[Penalty]:
        """
        Get all penalties for a violator.
        
        Args:
            db: Database session
            violator_id: Violator ID
            
        Returns:
            List of Penalty objects
        """
        return db.query(Penalty).filter(Penalty.violator_id == violator_id).all()
    
    def get_penalties_by_issue(
        self,
        db: Session,
        issue_id: int
    ) -> List[Penalty]:
        """
        Get all penalties for an issue.
        
        Args:
            db: Database session
            issue_id: Issue ID
            
        Returns:
            List of Penalty objects
        """
        violators = db.query(Violator).filter(Violator.issue_id == issue_id).all()
        violator_ids = [v.id for v in violators]
        
        return db.query(Penalty).filter(Penalty.violator_id.in_(violator_ids)).all()


# Global instance
penalty_service = PenaltyService()
