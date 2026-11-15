"""
Authentication Tests

Tests for auth endpoints and session management.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.models import User, UserRole
from app.utils import hash_password, mask_aadhaar

client = TestClient(app)


@pytest.fixture(scope="function")
def test_db():
    """Create test database"""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def test_user(test_db):
    """Create a test user"""
    user = User(
        aadhar_number=mask_aadhaar("123456789012"),
        email="test@example.com",
        full_name="Test User",
        role=UserRole.CITIZEN,
        is_active=True
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user


def test_request_otp():
    """Test OTP request endpoint"""
    response = client.post(
        "/api/auth/request-otp",
        json={"aadhar_number": "123456789012"}
    )
    assert response.status_code == 200
    assert response.json()["success"] == True


def test_login_with_invalid_otp(test_user):
    """Test login with invalid OTP"""
    response = client.post(
        "/api/auth/login",
        json={
            "aadhar_number": "123456789012",
            "otp": "000000"
        }
    )
    assert response.status_code == 401


def test_session_check_without_cookie():
    """Test session check without authentication"""
    response = client.get("/api/auth/session-check")
    assert response.status_code == 200
    assert response.json()["authenticated"] == False


def test_logout():
    """Test logout endpoint"""
    response = client.post("/api/auth/logout")
    assert response.status_code == 200
