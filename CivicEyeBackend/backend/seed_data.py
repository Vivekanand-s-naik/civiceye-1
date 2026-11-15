"""
Seed Data Script

Creates initial admin, authority, and citizen users for development/testing.

Usage: python seed_data.py
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app.models import User, UserRole, RewardWallet
from app.utils import hash_password, mask_aadhaar
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_seed_users():
    """Create seed users for testing"""
    db = SessionLocal()
    
    try:
        # Check if users already exist
        existing_admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if existing_admin:
            logger.info("Seed data already exists. Skipping...")
            return
        
        # Create admin user
        admin = User(
            aadhar_number=mask_aadhaar("111111111111"),
            email="shreeveeraganapati15@gmail.com",
            password_hash="$2b$12$Ho1MStySECqATGfhAu.dxO0TUMdc.bns6XGgAMREwp/j1UfPEdYHK",
            full_name="System Administrator",
            phone_number="+91-9999999999",
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin)
        logger.info("Created admin user")
        
        # Create authority user
        authority = User(
            aadhar_number=mask_aadhaar("222222222222"),
            email="authority@civiceye.com",
            password_hash="$2b$12$RfmKG3YPgxKb3zkaRuNFROZH2LZNf8U0y6sIdOTk.uwfPTeGlcGKO",
            full_name="Authority Officer",
            phone_number="+91-9999999998",
            role=UserRole.AUTHORITY,
            zone="Zone-A",
            is_active=True
        )
        db.add(authority)
        logger.info("Created authority user")
        
        # Create citizen user
        citizen = User(
            aadhar_number=mask_aadhaar("333333333333"),
            email="citizen@civiceye.com",
            password_hash="$2b$12$7aemytjN.n0kPhSmJFjgC.UNN3ZqAp0AJb66owjlJKRwn/1p4eQkW",
            full_name="Test Citizen",
            phone_number="+91-9999999997",
            role=UserRole.CITIZEN,
            is_active=True
        )
        db.add(citizen)
        logger.info("Created citizen user")
        
        # Commit users
        db.commit()
        
        # Create reward wallets
        db.refresh(citizen)
        wallet = RewardWallet(user_id=citizen.id, balance=0.0)
        db.add(wallet)
        db.commit()
        logger.info("Created reward wallet for citizen")
        
        logger.info("\n" + "="*50)
        logger.info("SEED DATA CREATED SUCCESSFULLY")
        logger.info("="*50)
        logger.info("\nTest Users:")
        logger.info("-" * 50)
        logger.info(f"Admin:")
        logger.info(f"  Aadhaar: XXXX-XXXX-1111")
        logger.info(f"  Email: shreeveeraganapati15@gmail.com")
        logger.info(f"  Password: [Provided Hash]")
        logger.info(f"  Mock OTP: 123456")
        logger.info("")
        logger.info(f"Authority:")
        logger.info(f"  Aadhaar: XXXX-XXXX-2222")
        logger.info(f"  Email: authority@civiceye.com")
        logger.info(f"  Password: [Provided Hash]")
        logger.info(f"  Mock OTP: 123456")
        logger.info("")
        logger.info(f"Citizen:")
        logger.info(f"  Aadhaar: XXXX-XXXX-3333")
        logger.info(f"  Email: citizen@civiceye.com")
        logger.info(f"  Password: [Provided Hash]")
        logger.info(f"  Mock OTP: 123456")
        logger.info("="*50)
        
    except Exception as e:
        logger.error(f"Error creating seed data: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    logger.info("Creating seed data...")
    create_seed_users()
