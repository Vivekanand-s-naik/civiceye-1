<div align="center">

# CivicEye

### Turn civic observations into accountable action.

An AI-assisted civic reporting platform where citizens submit evidence, authorities verify issues, and administrators monitor the entire enforcement workflow.

<p>
  <a href="#-quick-start">Quick start</a> ·
  <a href="#-product-tour">Product tour</a> ·
  <a href="#-architecture">Architecture</a> ·
  <a href="#-api-explorer">API explorer</a> ·
  <a href="#-contributing">Contributing</a>
</p>

<img src="./360_F_110611016_5uNv2Tx5ir9rcIGCdnpeGqiQN5vC5Rb1.jpg" alt="CivicEye civic reporting" width="720" />

</div>

<details>
<summary><strong>Why CivicEye?</strong></summary>

Cities need a trusted feedback loop between residents and civic authorities. CivicEye combines evidence-based reporting, location-aware workflows, AI-assisted image analysis, violator detection, penalties, notifications, and citizen rewards in one platform.

</details>

## ✨ Product tour

| Role | What they can do |
| --- | --- |
| **Citizen** | Report potholes, littering, traffic violations, illegal dumping, and other civic issues with images and location data; track progress; earn rewards. |
| **Authority** | Review incoming reports, verify evidence, inspect locations, detect violators, issue penalties, and use AI insights. |
| **Admin** | Monitor platform metrics, manage users, inspect system activity, and configure platform settings. |

### Core workflow

```mermaid
flowchart LR
    A[Citizen submits report] --> B[Image and location captured]
    B --> C[Authority reviews evidence]
    C --> D{Verified?}
    D -- No --> E[Close or request follow-up]
    D -- Yes --> F[AI-assisted violator detection]
    F --> G[Penalty management]
    G --> H[Citizen reward wallet]
    C --> I[Notifications and audit trail]
```

<details>
<summary><strong>Explore the UI routes</strong></summary>

**Public**

- `/` — landing page
- `/getStarted` — authentication

**Citizen**

- `/citizen-dashboard`
- `/report`
- `/my-reports`
- `/rewards`
- `/notifications`
- `/support`

**Authority**

- `/authority-dashboard`
- `/verify-report`
- `/violator-detection`
- `/penalty-management`
- `/map-view`
- `/ai-insights`

**Admin**

- `/admin-dashboard`
- `/user-management`
- `/system-logs`
- `/platform-settings`

</details>

## 🧰 Technology stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Wouter, TanStack Query, Tailwind CSS, Radix UI |
| Frontend server | Express, `tsx`, Vite middleware |
| Backend API | FastAPI, Uvicorn, Pydantic, SQLAlchemy |
| Data | PostgreSQL, Drizzle ORM (frontend server), Alembic (FastAPI) |
| Maps and charts | Leaflet / React Leaflet, Recharts |
| AI and media | face_recognition, OpenCV, Pillow, NumPy, scikit-learn |
| Security | Session cookies, bcrypt, role-based access control, Pydantic validation |

## 🚀 Quick start

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL 12+
- Git
- CMake and a C++ build toolchain if installing `face_recognition` from source

### 1. Configure PostgreSQL

Create a database, then keep the connection string handy:

```sql
CREATE DATABASE CivicEyeDB;
```

Configure your database connection in the root `.env` file:

```dotenv
DATABASE_URL=postgresql://postgres:root@localhost:5432/CivicEyeDB
```

All services (Frontend Express server and Backend FastAPI API) automatically read and load configuration directly from the root `.env` file.

### 2. Start the FastAPI backend

```powershell
cd CivicEyeBackend\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Create `CivicEyeBackend/backend/.env`:

```dotenv
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/CivicEyeDB
SECRET_KEY=replace-with-a-long-random-development-secret
MOCK_OTP_ENABLED=True
MOCK_OTP_VALUE=123456
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
```

Apply migrations and start the API:

```powershell
alembic upgrade head
python seed_data.py
python run.py
```

The API is available at **http://localhost:5000**. Open **http://localhost:5000/docs** for interactive Swagger documentation or **http://localhost:5000/redoc** for ReDoc.

### 3. Start the frontend

Open a second terminal:

```powershell
cd CivicEyeFrontend
npm install
npm run dev
```

Open **http://localhost:3000**.

<details>
<summary><strong>One-click Windows backend helper</strong></summary>

From the repository root, the checked-in helper can be used after dependencies and environment variables are configured:

```powershell
.\CivicEyeBackend\backend\run.bat
```

The script assumes a local Python/Uvicorn installation and may need path updates on another machine. `python run.py` is the portable alternative.

</details>

## 🔐 Development & Evaluation Logins

You can log in either by using the **1-Click Quick Demo Evaluation buttons** on the `/getStarted` page (or from the new Landing Page), or with the following credentials:

| Role | Email | Password | Mock OTP (FastAPI) |
| --- | --- | --- | --- |
| **Citizen** | `citizen@civiceye.com` | `citizen123` | `123456` |
| **Authority** | `authority@civiceye.com` | `auth123` | `123456` |
| **Admin** | `admin@civiceye.com` | `admin123` | `123456` |

> **Tip:** You can switch roles at any time using the role selector pill located in the top navigation bar or the sidebar profile badge. All routes are strictly protected by Role-Based Access Control (RBAC).

## 🧭 Architecture

```text
CivicEye/
├── CivicEyeFrontend/
│   ├── client/src/          React pages, role-based routes, UI components
│   ├── server/              Express API, PostgreSQL connection, Vite host
│   ├── shared/              Shared Drizzle schema
│   └── migrations/          Frontend database migrations
├── CivicEyeBackend/
│   └── backend/
│       ├── app/api/         FastAPI route modules
│       ├── app/models/      SQLAlchemy models
│       ├── app/schemas/     Pydantic schemas
│       ├── app/services/    Domain services
│       ├── migrations/      Alembic migrations
│       └── uploads/         Uploaded issue and violation media
└── uploads/                 Local sample/upload media
```

### Request flow

```mermaid
sequenceDiagram
    participant C as Citizen
    participant UI as React UI :3000
    participant API as FastAPI :5000
    participant DB as PostgreSQL
    C->>UI: Submit issue with evidence
    UI->>API: Send authenticated report request
    API->>DB: Store issue and metadata
    API-->>UI: Return report status
    UI-->>C: Show tracking and notifications
```

## 🧪 Validation and development commands

### Frontend

```powershell
cd CivicEyeFrontend
npm run check
npm run build
```

### Backend

```powershell
cd CivicEyeBackend\backend
python -m pytest
```

### Database migrations

```powershell
cd CivicEyeBackend\backend
alembic upgrade head
```

## 🗺️ API explorer

Once the backend is running, the fastest way to explore the API is:

- **Swagger UI:** [localhost:5000/docs](http://localhost:5000/docs)
- **ReDoc:** [localhost:5000/redoc](http://localhost:5000/redoc)

Representative endpoint groups:

```text
POST /api/auth/request-otp
POST /api/auth/login
GET  /api/auth/session-check
POST /api/citizen/reports
GET  /api/citizen/reports
GET  /api/authority/reports
POST /api/authority/reports/{id}/detect-violators
POST /api/authority/penalties
POST /api/ml/analyze
GET  /api/admin/users
```

## ⚠️ Important development notes

- The frontend and FastAPI backend both contain API routes. Run them on separate ports as described above.
- The frontend currently contains development database configuration in its scripts; move credentials to environment variables before deployment.
- The mock OTP and local face-recognition fallback are for development only.
- Uploaded files are stored locally. Use object storage and a retention policy for production.
- Enable HTTPS, secure cookies, a strong secret key, restricted CORS, rate limiting, and official identity verification before production use.
- Review privacy, consent, biometric-data, and Aadhaar compliance requirements before collecting real user data.

## 🤝 Contributing

1. Create a focused branch.
2. Make the smallest change that solves the issue.
3. Add or update tests for behavior you change.
4. Run the relevant checks listed above.
5. Open a pull request with context, screenshots for UI changes, and migration notes when applicable.

## 📄 License

This project currently does not include a root license file. Confirm licensing terms with the project maintainers before distributing or deploying it.

<div align="center">

**Built to make civic action visible, verifiable, and rewarding.**

</div>
