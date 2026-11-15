"""
Background Task Utilities

Wrappers for FastAPI BackgroundTasks.
"""

from fastapi import BackgroundTasks
from typing import Optional
import logging
from app.utils.email_sender import send_email

logger = logging.getLogger(__name__)


async def send_notification_background(
    to_email: str,
    title: str,
    message: str
):
    """
    Background task to send notification email.
    
    Args:
        to_email: Recipient email
        title: Notification title
        message: Notification message
    """
    try:
        send_email(title, message, None)
    except Exception as e:
        logger.error(f"Background email send failed: {str(e)}")


async def send_otp_background(to_email: str, otp: str):
    """
    Background task to send OTP email.
    
    Args:
        to_email: Recipient email
        otp: 6-digit OTP
    """
    try:
        send_email("CivicEye OTP", f"Your OTP is: {otp}", None)
    except Exception as e:
        logger.error(f"Background OTP send failed: {str(e)}")


def add_notification_task(
    background_tasks: BackgroundTasks,
    to_email: str,
    title: str,
    message: str
):
    """
    Add notification email to background tasks.
    
    Args:
        background_tasks: FastAPI BackgroundTasks instance
        to_email: Recipient email
        title: Notification title
        message: Notification message
    """
    background_tasks.add_task(
        send_notification_background,
        to_email=to_email,
        title=title,
        message=message
    )


def add_otp_task(
    background_tasks: BackgroundTasks,
    to_email: str,
    otp: str
):
    """
    Add OTP email to background tasks.
    
    Args:
        background_tasks: FastAPI BackgroundTasks instance
        to_email: Recipient email
        otp: 6-digit OTP
    """
    background_tasks.add_task(
        send_otp_background,
        to_email=to_email,
        otp=otp
    )
