"""
Penalty Tests

Tests for penalty creation and payment processing.
"""

import pytest
from app.models import Penalty, PenaltyStatus


def test_penalty_creation():
    """Test penalty model creation"""
    penalty = Penalty(
        violator_id=1,
        amount=500.0,
        reason="Traffic violation",
        status=PenaltyStatus.PENDING
    )
    
    assert penalty.amount == 500.0
    assert penalty.status == PenaltyStatus.PENDING


def test_penalty_payment():
    """Test penalty payment status change"""
    penalty = Penalty(
        violator_id=1,
        amount=500.0,
        reason="Traffic violation",
        status=PenaltyStatus.PENDING
    )
    
    # Mark as paid
    penalty.status = PenaltyStatus.PAID
    penalty.payment_method = "credit_card"
    penalty.transaction_id = "TXN123456"
    
    assert penalty.status == PenaltyStatus.PAID
    assert penalty.transaction_id == "TXN123456"
