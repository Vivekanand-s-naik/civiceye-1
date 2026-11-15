from datetime import datetime, timedelta
import random

# In-memory store: { aadhar_number: (otp, expiry_datetime) }
otp_store = {}

def generate_otp(aadhar_number: str, expiry_minutes: int = 5) -> str:
    """Generate a 6-digit OTP and store with expiration"""
    otp = f"{random.randint(100000, 999999)}"
    expiry = datetime.utcnow() + timedelta(minutes=expiry_minutes)
    otp_store[aadhar_number] = (otp, expiry)
    return otp

def verify_otp(aadhar_number: str, otp: str) -> bool:
    """Verify OTP and check expiration"""
    data = otp_store.get(aadhar_number)
    if not data:
        return False
    stored_otp, expiry = data
    if stored_otp == otp and datetime.utcnow() <= expiry:
        del otp_store[aadhar_number]  # OTP can only be used once
        return True
    return False
