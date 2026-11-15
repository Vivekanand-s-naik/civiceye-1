# CivicEye Backend

## Overview

CivicEye is a production-ready civic issue reporting platform with AI-powered face recognition for violator detection. The system enables citizens to report civic violations (traffic violations, illegal parking, littering, etc.) with image evidence. Authorities can verify reports, identify violators using facial recognition, and issue penalties. The platform includes a reward wallet system to incentivize civic participation, where citizens earn credits when their reports lead to verified penalties.

**Core Value Proposition**: Democratize civic enforcement by empowering citizens to report violations and get rewarded, while providing authorities with AI-powered tools for efficient violator identification and penalty management.

**Current Status**: ✅ Backend fully implemented and tested. Server running on port 5000 with all core features operational. Using mock implementations for face recognition (requires dlib/cmake) and Aadhaar OTP verification (mock OTP: 123456).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Framework
- **FastAPI (Python 3.10+)**: Async-capable REST API framework chosen for its automatic OpenAPI documentation, Pydantic validation, and high performance
- **Uvicorn ASGI Server**: Production ASGI server with auto-reload in development mode
- **Synchronous SQLAlchemy**: Using sync engine for simplicity; can be switched to async with `create_async_engine` and asyncpg driver

### Authentication & Authorization
- **Server-side Session Management**: Sessions stored in PostgreSQL with secure HTTP-only cookies (prevents XSS attacks)
- **Aadhaar-based Authentication**: Mock OTP verification system (to be replaced with official UIDAI API in production)
- **Role-Based Access Control (RBAC)**: Three user roles with hierarchical permissions:
  - `citizen`: Report issues, view own reports, manage reward wallet
  - `authority`: Review all reports, verify violators, issue penalties
  - `admin`: Full user management, system configuration, platform oversight
- **Optional JWT Support**: Provided for service-to-service communication using python-jose

### Data Architecture

**Core Domain Models**:
1. **User Management**: Stores masked Aadhaar numbers (XXXX-XXXX-1234 format), role assignments, and profile data
2. **Issue Lifecycle**: Citizens create reports → Authorities investigate → Violators detected → Penalties issued → Rewards distributed
3. **Face Recognition Pipeline**: Image upload → Face detection → Encoding generation → Database matching → Confidence scoring
4. **Penalty & Reward System**: Two-way transaction flow where penalty payments trigger reward credits to reporters

**Database Design Rationale**:
- Chose PostgreSQL for ACID compliance, JSON support (for flexible notification metadata), and robust indexing
- Normalized schema to avoid data duplication while maintaining query performance
- Foreign key constraints ensure referential integrity across the violation lifecycle
- Timezone-aware timestamps (`DateTime(timezone=True)`) for accurate global operation

### AI/ML Integration

**Face Recognition System**:
- **Library**: `face_recognition` (dlib-based) for 128-dimensional face encodings
- **Pipeline**: 
  1. Face detection using HOG or CNN detector
  2. Face encoding generation (unique facial features)
  3. Cosine similarity matching against violator database
  4. Confidence threshold filtering (default 0.6)
- **Fallback**: Mock implementation when dlib unavailable (development environments)
- **Storage**: Face embeddings stored as binary (serialized numpy arrays) in PostgreSQL

**Design Decision**: Chose face_recognition over DeepFace for simpler deployment (no TensorFlow dependencies) and faster inference on CPU. Trade-off: slightly lower accuracy compared to deep learning models.

### File Upload & Storage
- **Local Filesystem Storage**: Images saved to `uploads/` directory with UUID filenames
- **Static File Serving**: FastAPI StaticFiles middleware serves uploaded images
- **Size Limits**: Configurable max upload size (default 10MB) to prevent abuse
- **Future Consideration**: Can migrate to S3/cloud storage by changing save path in `issue_service.py`

### Email & Notifications

**Multi-Channel Notification System**:
- **In-App Notifications**: Stored in database with read/unread tracking
- **Email Notifications**: Async SMTP with Jinja2 HTML templates
- **Background Processing**: FastAPI BackgroundTasks for non-blocking email sends
- **Notification Types**: Report updates, violator detection, penalty issuance, reward credits

**Why Dual System**: Database notifications provide persistent history and search; email ensures timely delivery even when users offline.

### Security Measures

1. **Password Security**: Bcrypt hashing via passlib (72-byte truncation handled)
2. **Session Security**: 
   - HTTP-only cookies (prevents JavaScript access)
   - Secure flag for HTTPS environments
   - SameSite policy to prevent CSRF
3. **Input Validation**: Pydantic schemas validate all API inputs with type checking and constraints
4. **CORS Configuration**: Restricted to specific frontend origins (configurable via env var)
5. **Data Privacy**: Aadhaar numbers masked before database storage, never exposed in full

### Testing Strategy
- **Unit Tests**: Pytest-based tests for critical flows (auth, issue creation, penalty processing)
- **Test Isolation**: Function-scoped database fixtures ensure clean state
- **Coverage**: Core business logic in services layer tested separately from API routes

## External Dependencies

### Database
- **PostgreSQL**: Primary data store requiring connection string in `DATABASE_URL` env var
- **SQLAlchemy 2.0**: ORM layer with declarative models and relationship mapping
- **Alembic**: Database migration management (initial migration included with all tables)

### AI/ML Libraries
- **face_recognition 1.3.0**: dlib-based face detection and encoding
- **dlib 19.24.2**: Face recognition engine (requires cmake for installation)
- **OpenCV (headless)**: Image processing operations
- **scikit-learn**: Cosine similarity calculations for face matching
- **NumPy**: Array operations for face embeddings

### Email Service
- **SMTP Integration**: Requires SMTP server credentials (Gmail-compatible settings provided)
- **aiosmtplib**: Async SMTP client for non-blocking email delivery
- **Jinja2**: HTML email template rendering

### Third-Party APIs (Mock in Development)
- **UIDAI Aadhaar API**: Currently mocked; production requires official eKYC/Authentication API integration with:
  - Government authorization and compliance
  - Encryption requirements (Aadhaar Act 2016)
  - User consent management

### Configuration Management
- **python-dotenv**: Loads `.env` file for environment-specific settings
- **pydantic-settings**: Type-safe configuration with validation

### Required Environment Variables
All environment variables are configured in `backend/.env` file. Key configurations:
- `DATABASE_URL`: PostgreSQL connection string (automatically set by Replit)
- `SECRET_KEY`: Cryptographically-secure session key
- `MOCK_OTP_ENABLED=True`: Uses mock OTP verification (123456)
- `ALLOWED_ORIGINS`: CORS allowed origins for API access

### Test Users (Created by Seed Data)
| Role      | Aadhaar         | Email                    | Password   | Mock OTP |
|-----------|-----------------|--------------------------|------------|----------|
| Admin     | 111111111111    | admin@civiceye.com       | admin123   | 123456   |
| Authority | 222222222222    | authority@civiceye.com   | auth123    | 123456   |
| Citizen   | 333333333333    | citizen@civiceye.com     | citizen    | 123456   |

### API Endpoints (Sample)
- `POST /api/auth/request-otp` - Request OTP for Aadhaar
- `POST /api/auth/login` - Login with Aadhaar + OTP
- `GET /api/admin/dashboard/stats` - Admin dashboard statistics
- `GET /api/admin/users` - List all users (admin only)
- Full API documentation: http://localhost:5000/docs

### Recent Changes (October 10, 2025)
1. Fixed timezone-aware datetime comparison in session management
2. Implemented admin dashboard stats endpoint with comprehensive analytics
3. Configured FastAPI server to run on port 5000
4. Database migrations applied successfully
5. All core features tested and verified working


.\run.bat to run