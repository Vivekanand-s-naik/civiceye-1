# create_tables_and_seed.py
from datetime import datetime
import logging
import os

from ..database import engine, Base, SessionLocal
from ..models import User, UserRole, RewardWallet
from ..utils import hash_password, mask_aadhaar

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_tables():
    logger.info("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Tables created successfully!")

def seed_users():
    db = SessionLocal()
    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if existing_admin:
            logger.info("Seed data already exists. Skipping...")
            return

        # Admin user
        admin = User(
            aadhar_number=mask_aadhaar("111111111111"),
            email="admin@civiceye.com",
            password_hash=hash_password("admin123"[:72]),
            full_name="System Administrator",
            phone_number="+91-9999999999",
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin)

        # Authority user
        authority = User(
            aadhar_number=mask_aadhaar("222222222222"),
            email="authority@civiceye.com",
            password_hash=hash_password("auth123"[:72]),
            full_name="Authority Officer",
            phone_number="+91-9999999998",
            role=UserRole.AUTHORITY,
            zone="Zone-A",
            is_active=True
        )
        db.add(authority)

        # Citizen user
        citizen = User(
            aadhar_number=mask_aadhaar("333333333333"),
            email="citizen@civiceye.com",
            password_hash=hash_password("citizen123"[:72]),
            full_name="Test Citizen",
            phone_number="+91-9999999997",
            role=UserRole.CITIZEN,
            is_active=True
        )
        db.add(citizen)
        db.commit()

        # Reward wallet for citizen
        db.refresh(citizen)
        wallet = RewardWallet(user_id=citizen.id, balance=0.0)
        db.add(wallet)
        db.commit()

        logger.info("✅ Seed users created successfully!")

    except Exception as e:
        logger.error(f"Error seeding data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    import sys
    # sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    create_tables()
    seed_users()
