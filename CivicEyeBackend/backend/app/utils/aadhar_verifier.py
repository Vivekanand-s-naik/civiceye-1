"""
Aadhaar Verification Utilities

Mock Aadhaar OTP verification service.
In production, replace with official UIDAI API integration.

IMPORTANT SECURITY NOTES:
- This is a MOCK implementation for development only
- Never store raw Aadhaar biometric data
- In production, use official UIDAI eKYC/Authentication APIs
- Ensure compliance with Aadhaar Act 2016 and IT Act
- All Aadhaar data transmission must be encrypted
- Obtain user consent before Aadhaar verification
"""

from typing import Optional, Tuple
from app.utils.security import generate_otp, mask_aadhaar
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class AadhaarVerificationService:
    """
    Mock Aadhaar verification service.
    
    In production, replace with:
    - UIDAI Authentication API for OTP-based auth
    - eKYC API for identity verification
    - Proper encryption and security measures
    """
    
    def __init__(self):
        self.mock_enabled = settings.MOCK_OTP_ENABLED
        self.mock_otp = settings.MOCK_OTP_VALUE
        self._pending_otps = {}  # In production, use Redis or similar
    
    def request_otp(self, aadhaar_number: str) -> Tuple[bool, str]:
        """
        Request OTP for Aadhaar authentication.
        
        In production, this should:
        1. Validate Aadhaar number format
        2. Call UIDAI API to send OTP to registered mobile
        3. Return transaction ID
        
        Args:
            aadhaar_number: 12-digit Aadhaar number
            
        Returns:
            Tuple of (success, message)
        """
        # Validate Aadhaar format (basic check)
        clean_aadhaar = ''.join(filter(str.isdigit, aadhaar_number))
        
        if len(clean_aadhaar) != 12:
            return False, "Invalid Aadhaar number format"
        
        if self.mock_enabled:
            # Mock: Generate and store OTP
            otp = self.mock_otp if self.mock_otp else generate_otp()
            self._pending_otps[clean_aadhaar] = otp
            
            logger.info(f"Mock OTP generated for {mask_aadhaar(clean_aadhaar)}: {otp}")
            return True, f"OTP sent successfully (Mock: {otp})"
        else:
            # Production: Call real UIDAI API
            # response = uidai_api.send_otp(aadhaar_number)
            return False, "Real UIDAI integration not implemented"
    
    def verify_otp(self, aadhaar_number: str, otp: str) -> Tuple[bool, Optional[dict]]:
        """
        Verify OTP for Aadhaar authentication.
        
        In production, this should:
        1. Call UIDAI API to verify OTP
        2. Retrieve user details (name, DOB, etc.)
        3. Return authentication status and user info
        
        Args:
            aadhaar_number: 12-digit Aadhaar number
            otp: 6-digit OTP
            
        Returns:
            Tuple of (success, user_data_dict or None)
        """
        clean_aadhaar = ''.join(filter(str.isdigit, aadhaar_number))
        
        if self.mock_enabled:
            # Mock verification
            stored_otp = self._pending_otps.get(clean_aadhaar)
            
            if not stored_otp:
                return False, None
            
            if stored_otp == otp:
                # Clean up used OTP
                del self._pending_otps[clean_aadhaar]
                
                # Return mock user data
                user_data = {
                    "aadhaar_number": mask_aadhaar(clean_aadhaar),
                    "verified": True
                }
                return True, user_data
            else:
                return False, None
        else:
            # Production: Call real UIDAI API
            # response = uidai_api.verify_otp(aadhaar_number, otp)
            return False, None
    
    def get_user_details(self, aadhaar_number: str) -> Optional[dict]:
        """
        Get user details from Aadhaar (requires prior authentication).
        
        In production, use eKYC API to retrieve:
        - Name
        - Date of Birth
        - Gender
        - Address
        - Photo (with consent)
        
        Args:
            aadhaar_number: 12-digit Aadhaar number
            
        Returns:
            User details dictionary or None
        """
        if self.mock_enabled:
            # Mock user details
            return {
                "aadhaar_number": mask_aadhaar(aadhaar_number),
                "name": "Mock User",
                "dob": "1990-01-01",
                "gender": "M"
            }
        else:
            # Production: Call eKYC API
            return None


# Global instance
aadhaar_service = AadhaarVerificationService()
