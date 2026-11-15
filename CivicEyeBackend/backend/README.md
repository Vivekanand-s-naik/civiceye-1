# CivicEye Backend API

A production-ready FastAPI backend for civic issue reporting with AI-powered face recognition, Aadhaar-based authentication, and comprehensive violation tracking system.

## Features

- **Aadhaar Authentication**: Secure OTP-based authentication with mock UIDAI integration
- **Role-Based Access Control**: Three user roles (Citizen, Authority, Admin) with granular permissions
- **Issue Management**: Complete civic issue reporting workflow with image uploads and geolocation
- **AI-Powered Face Recognition**: Automatic violator detection using face_recognition library
- **Face Matching**: Match detected faces against known violator database with confidence scoring
- **Penalty System**: Automated fine calculation and payment tracking
- **Reward Wallet**: Credit system for citizens who report verified violations
- **Server-Side Sessions**: Secure session management with HTTP-only cookies
- **Notification System**: Email notifications for important events
- **Admin Dashboard**: Complete user and system management APIs
- **Production-Ready**: Full input validation, error handling, and security features

## Technology Stack

- **Framework**: FastAPI 0.104.1
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Migrations**: Alembic
- **Authentication**: Server-side sessions with secure cookies
- **AI/ML**: face_recognition (dlib-based), OpenCV, scikit-learn
- **Security**: Passlib (bcrypt), python-jose
- **Testing**: pytest, pytest-asyncio
- **Email**: aiosmtplib with Jinja2 templates

## Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Configuration and settings
│   ├── database.py             # Database connection and session
│   ├── models/                 # SQLAlchemy ORM models
│   ├── schemas/                # Pydantic request/response schemas
│   ├── api/                    # API route handlers
│   ├── services/               # Business logic layer
│   ├── utils/                  # Utility functions
│   └── tests/                  # Test suite
├── migrations/                 # Alembic database migrations
├── uploads/                    # Uploaded images storage
├── seed_data.py               # Script to create test users
├── run.py                     # Application runner
├── requirements.txt           # Python dependencies
└── .env                       # Environment configuration
```

## Setup Instructions

### 1. Prerequisites

- Python 3.10 or higher
- PostgreSQL 12 or higher
- pip

### 2. Database Setup

**Option A: Using Docker** (Recommended)

```bash
cd docker
docker-compose up -d postgres
```

This creates a PostgreSQL database with:
- Database: `civiceye_db`
- User: `civiceye_user`
- Password: `civiceye_password`
- Port: `5432`

**Option B: Manual PostgreSQL Setup**

```sql
CREATE DATABASE civiceye_db;
CREATE USER civiceye_user WITH PASSWORD 'civiceye_password';
GRANT ALL PRIVILEGES ON DATABASE civiceye_db TO civiceye_user;
```

### 3. Environment Configuration

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` and update the following variables:

```env
# Database
DATABASE_URL=postgresql://civiceye_user:civiceye_password@localhost:5432/civiceye_db

# Security
SECRET_KEY=your-secret-key-here  # Generate with: openssl rand -hex 32
SESSION_EXPIRE_SECONDS=86400

# SMTP (optional, for email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Mock OTP (for development)
MOCK_OTP_ENABLED=True
MOCK_OTP_VALUE=123456
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

**Note**: Installing `dlib` (required for face_recognition) may require:
- CMake
- C++ compiler

On Ubuntu/Debian:
```bash
sudo apt-get install cmake build-essential
```

On macOS:
```bash
brew install cmake
```

### 5. Run Database Migrations

```bash
# Initialize Alembic (first time only)
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

### 6. Create Seed Data

```bash
python seed_data.py
```

This creates three test users:

| Role      | Aadhaar        | Email                 | Password     | Mock OTP |
|-----------|----------------|-----------------------|--------------|----------|
| Admin     | 111111111111   | admin@civiceye.com    | admin123     | 123456   |
| Authority | 222222222222   | authority@civiceye.com| authority123 | 123456   |
| Citizen   | 333333333333   | citizen@civiceye.com  | citizen123   | 123456   |

### 7. Run the Application

```bash
# Development mode with auto-reload
python run.py

# Or using uvicorn directly
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Documentation

### Authentication Endpoints

#### Request OTP
```bash
curl -X POST http://localhost:8000/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"aadhar_number": "333333333333"}'
```

#### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "aadhar_number": "333333333333",
    "otp": "123456"
  }' \
  -c cookies.txt
```

#### Session Check
```bash
curl -X GET http://localhost:8000/api/auth/session-check \
  -b cookies.txt
```

#### Logout
```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -b cookies.txt
```

### Citizen Endpoints

#### Create Report
```bash
curl -X POST http://localhost:8000/api/citizen/reports \
  -b cookies.txt \
  -F "title=Traffic Violation" \
  -F "description=Red light jump at intersection" \
  -F "category=traffic_violation" \
  -F "latitude=28.6139" \
  -F "longitude=77.2090" \
  -F "image=@violation.jpg"
```

#### Get My Reports
```bash
curl -X GET http://localhost:8000/api/citizen/reports?page=1&page_size=20 \
  -b cookies.txt
```

#### Get Reward Wallet
```bash
curl -X GET http://localhost:8000/api/citizen/wallet \
  -b cookies.txt
```

### Authority Endpoints

#### List All Reports
```bash
curl -X GET http://localhost:8000/api/authority/reports?page=1&status_filter=pending \
  -b cookies.txt
```

#### Detect Violators in Report
```bash
curl -X POST http://localhost:8000/api/authority/reports/1/detect-violators \
  -b cookies.txt
```

#### Verify Violator
```bash
curl -X POST http://localhost:8000/api/authority/violators/1/verify \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "is_verified": true,
    "verification_notes": "Face match confirmed"
  }'
```

#### Issue Penalty
```bash
curl -X POST http://localhost:8000/api/authority/penalties \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "violator_id": 1,
    "amount": 500,
    "reason": "Traffic signal violation"
  }'
```

### ML/AI Endpoints

#### Analyze Image
```bash
curl -X POST http://localhost:8000/api/ml/analyze \
  -b cookies.txt \
  -F "image=@test_image.jpg"
```

#### Match Face
```bash
curl -X POST http://localhost:8000/api/ml/match-face \
  -b cookies.txt \
  -F "image=@face.jpg" \
  -F "confidence_threshold=0.6"
```

#### Get AI Insights
```bash
curl -X GET http://localhost:8000/api/ml/insights \
  -b cookies.txt
```

### Admin Endpoints

#### List Users
```bash
curl -X GET http://localhost:8000/api/admin/users?page=1&role_filter=citizen \
  -b cookies.txt
```

#### Create User
```bash
curl -X POST http://localhost:8000/api/admin/users \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "aadhar_number": "444444444444",
    "email": "newuser@example.com",
    "full_name": "New User",
    "role": "citizen"
  }'
```

## Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest app/tests/test_auth.py
```

## Security Considerations

### Aadhaar Data Handling

**IMPORTANT**: This implementation uses a MOCK Aadhaar verification service for development.

In production:
- Replace with official UIDAI Authentication API
- Store only masked Aadhaar numbers (XXXX-XXXX-1234)
- Never store biometric data
- Use proper encryption for all Aadhaar data transmission
- Obtain explicit user consent before verification
- Comply with Aadhaar Act 2016 and IT Act regulations
- Implement proper audit logging

### Security Best Practices

1. **Session Management**
   - Sessions stored server-side in database
   - HTTP-only cookies prevent XSS attacks
   - Secure flag enabled in production (HTTPS only)
   - SameSite attribute prevents CSRF

2. **Password Security**
   - Bcrypt hashing with salt
   - Minimum 6 characters (configurable)
   - Optional fallback authentication

3. **Input Validation**
   - Pydantic schemas validate all inputs
   - SQL injection protected by SQLAlchemy ORM
   - File upload size limits enforced

4. **Production Deployment**
   - Set `COOKIE_SECURE=True` (requires HTTPS)
   - Use strong `SECRET_KEY` (32+ characters)
   - Disable `DEBUG` mode
   - Configure proper CORS origins
   - Use environment variables for secrets
   - Enable rate limiting (not included, recommended)

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Test connection
psql postgresql://civiceye_user:civiceye_password@localhost:5432/civiceye_db
```

### Face Recognition Installation Issues

If `face_recognition` fails to install:

```bash
# Install dlib first
pip install dlib

# Then install face_recognition
pip install face_recognition
```

On ARM-based Macs (M1/M2):
```bash
# Install dlib via conda
conda install -c conda-forge dlib
pip install face_recognition
```

### Import Errors

Ensure you're running from the `backend` directory:
```bash
cd backend
python run.py
```

## Development

### Adding New Migrations

```bash
# Auto-generate migration from model changes
alembic revision --autogenerate -m "Description of changes"

# Review the generated file in migrations/versions/
# Then apply:
alembic upgrade head
```

### Code Style

Follow PEP 8 guidelines. Format with:
```bash
black app/
isort app/
```

## Production Deployment

### Environment Variables

Set these in production:
```env
DEBUG=False
COOKIE_SECURE=True
COOKIE_SAMESITE=Strict
ALLOWED_ORIGINS=https://yourdomain.com
MOCK_OTP_ENABLED=False
```

### Running with Gunicorn

```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

### Database Backup

```bash
pg_dump civiceye_db > backup.sql
```

## License

Copyright © 2025 CivicEye. All rights reserved.

## Support

For issues and questions, please contact the development team.
