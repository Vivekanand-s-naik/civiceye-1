"""
Reward Service

Handles reward wallet management and transactions.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Tuple
from app.models import RewardWallet, RewardTransaction, TransactionType, User
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class RewardService:
    """
    Service for managing user reward wallets and transactions.
    """
    
    def get_or_create_wallet(
        self,
        db: Session,
        user_id: int
    ) -> RewardWallet:
        """
        Get user's reward wallet, create if doesn't exist.
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            RewardWallet object
        """
        wallet = db.query(RewardWallet).filter(
            RewardWallet.user_id == user_id
        ).first()
        
        if not wallet:
            wallet = RewardWallet(user_id=user_id, balance=0.0)
            db.add(wallet)
            db.commit()
            db.refresh(wallet)
            logger.info(f"Created reward wallet for user {user_id}")
        
        return wallet
    
    def credit_reward(
        self,
        db: Session,
        user_id: int,
        amount: float,
        description: str,
        reference_type: str = None,
        reference_id: int = None
    ) -> RewardWallet:
        """
        Credit reward points to user's wallet.
        
        Args:
            db: Database session
            user_id: User ID
            amount: Amount to credit
            description: Transaction description
            reference_type: Reference type (e.g., 'penalty')
            reference_id: Reference ID
            
        Returns:
            Updated RewardWallet object
        """
        wallet = self.get_or_create_wallet(db, user_id)
        
        # Update balance
        wallet.balance += amount
        
        # Create transaction record
        transaction = RewardTransaction(
            wallet_id=wallet.id,
            type=TransactionType.CREDIT,
            amount=amount,
            description=description,
            reference_type=reference_type,
            reference_id=reference_id
        )
        
        db.add(transaction)
        db.commit()
        db.refresh(wallet)
        
        logger.info(f"Credited {amount} to user {user_id}'s wallet. New balance: {wallet.balance}")
        return wallet
    
    def debit_reward(
        self,
        db: Session,
        user_id: int,
        amount: float,
        description: str
    ) -> RewardWallet:
        """
        Debit reward points from user's wallet.
        
        Args:
            db: Database session
            user_id: User ID
            amount: Amount to debit
            description: Transaction description
            
        Returns:
            Updated RewardWallet object
        """
        wallet = self.get_or_create_wallet(db, user_id)
        
        # Check sufficient balance
        if wallet.balance < amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient reward balance"
            )
        
        # Update balance
        wallet.balance -= amount
        
        # Create transaction record
        transaction = RewardTransaction(
            wallet_id=wallet.id,
            type=TransactionType.DEBIT,
            amount=amount,
            description=description
        )
        
        db.add(transaction)
        db.commit()
        db.refresh(wallet)
        
        logger.info(f"Debited {amount} from user {user_id}'s wallet. New balance: {wallet.balance}")
        return wallet
    
    def get_wallet(
        self,
        db: Session,
        user_id: int
    ) -> RewardWallet:
        """
        Get user's reward wallet.
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            RewardWallet object
        """
        return self.get_or_create_wallet(db, user_id)
    
    def get_transactions(
        self,
        db: Session,
        user_id: int,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[RewardTransaction], int]:
        """
        Get user's reward transactions with pagination.
        
        Args:
            db: Database session
            user_id: User ID
            page: Page number
            page_size: Items per page
            
        Returns:
            Tuple of (transactions list, total count)
        """
        wallet = self.get_or_create_wallet(db, user_id)
        
        query = db.query(RewardTransaction).filter(
            RewardTransaction.wallet_id == wallet.id
        )
        
        total = query.count()
        
        offset = (page - 1) * page_size
        transactions = query.order_by(
            RewardTransaction.created_at.desc()
        ).offset(offset).limit(page_size).all()
        
        return transactions, total
    
    def redeem_rewards(
        self,
        db: Session,
        user_id: int,
        amount: float,
        redemption_type: str
    ) -> RewardWallet:
        """
        Redeem reward points (simulation).
        
        Args:
            db: Database session
            user_id: User ID
            amount: Amount to redeem
            redemption_type: Type of redemption
            
        Returns:
            Updated RewardWallet object
        """
        description = f"Redeemed for: {redemption_type}"
        return self.debit_reward(db, user_id, amount, description)


# Global instance
reward_service = RewardService()
