"""
CivicEye Email & OTP Utility

Roles:
- send_email(): Send general emails with optional image attachments.
- send_otp(): Send OTP emails specifically for CivicEye login/authentication.

Usage:
    export CIVICEYE_EMAIL="your_email@gmail.com"
    export CIVICEYE_APP_PASSWORD="your_app_password"
    python civic_email.py
"""

import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from datetime import datetime
import smtplib
import cv2
import logging
import traceback

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load Gmail credentials from environment variables
SENDER_EMAIL = os.getenv("CIVICEYE_EMAIL")
SENDER_PASSWORD = os.getenv("CIVICEYE_APP_PASSWORD")

if not SENDER_EMAIL or not SENDER_PASSWORD:
    raise ValueError("Please set CIVICEYE_EMAIL and CIVICEYE_APP_PASSWORD environment variables.")


def send_email(subject: str, message: str, image_source=None, recipient_email: str = None):
    """
    Sends an email with optional image attachment.
    
    :param subject: Email subject
    :param message: Email body text
    :param image_source: Optional file path or OpenCV frame (numpy array)
    :param recipient_email: Recipient email address
    """
    if recipient_email is None:
        raise ValueError("Recipient email must be provided.")

    msg = MIMEMultipart()
    msg['From'] = SENDER_EMAIL
    msg['To'] = recipient_email
    msg['Subject'] = subject

    # Attach plain text
    msg.attach(MIMEText(message, 'plain'))

    # Attach image if provided
    if image_source is not None:
        try:
            filename = f"detection_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"

            if isinstance(image_source, str):
                # Path to image file
                if not os.path.exists(image_source):
                    logger.error(f"Image file not found: {image_source}")
                    return
                with open(image_source, 'rb') as f:
                    img_data = f.read()
                    img = MIMEImage(img_data, name=os.path.basename(image_source))
            else:
                # OpenCV frame
                _, buffer = cv2.imencode('.jpg', image_source)
                img = MIMEImage(buffer.tobytes(), name=filename)

            msg.attach(img)
        except Exception as e:
            logger.error(f"Error attaching image: {e}")
            traceback.print_exc()

    # Send email
    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, recipient_email, msg.as_string())
        logger.info(f"Email sent successfully to {recipient_email}")
    except Exception as e:
        logger.error(f"Error sending email to {recipient_email}: {e}")
        traceback.print_exc()


def send_otp(recipient_email: str, otp: str):
    """
    Sends a CivicEye OTP to the recipient.
    
    :param recipient_email: Recipient's email
    :param otp: OTP string
    """
    subject = "CivicEye OTP Verification"
    message = f"Dear User,\n\nYour CivicEye OTP is: {otp}\nThis OTP is valid for 5 minutes.\n\nRegards,\nCivicEye Team"
    send_email(subject, message, None, recipient_email)


# Example usage
if __name__ == "__main__":
    # Send test email with image
    send_email(
        subject="CivicEye Detection Test",
        message="This is a test email with detection snapshot.",
        image_source=r"images/3.png",
        recipient_email="shreeveeraganapati15@gmail.com"
    )

    # Send OTP email
    send_otp("shreeveeraganapati15@gmail.com", "123456")
