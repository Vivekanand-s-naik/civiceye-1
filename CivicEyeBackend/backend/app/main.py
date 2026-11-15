from fastapi import FastAPI, Form, HTTPException, Query, Request, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import Optional
from fastapi.routing import APIRoute
import base64
import os
import psycopg2
from psycopg2.extras import RealDictCursor, Json
from datetime import datetime
import json
import logging
import shutil
import uuid
try:
    import google.generativeai as genai
except Exception:
    genai = None
from PIL import Image
import io
import traceback

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=86400,
)

# ============================================
# GEMINI AI CONFIGURATION
# ============================================
GEMINI_API_KEY = "AIzaSyDt6SWjpRWWWcladvcXQt8oqBIUEc6-Fsg"

# Initialize Gemini AI
gemini_model = None
if GEMINI_API_KEY and GEMINI_API_KEY != "YOUR_GEMINI_API_KEY_HERE" and genai:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        
        # List available models to find the right one
        print("\n🔍 Checking available Gemini models...")
        available_models = []
        try:
            for model in genai.list_models():
                if 'generateContent' in model.supported_generation_methods:
                    available_models.append(model.name)
                    print(f"   ✓ {model.name}")
        except Exception as e:
            print(f"   ⚠ Could not list models: {e}")
        
        # ✅ FIX: Use Gemini 2.0/2.5 models (1.5 is deprecated)
        model_names_to_try = [
            'models/gemini-2.5-flash',           # ✅ Latest stable flash model
            'models/gemini-2.0-flash',           # Backup option
            'models/gemini-flash-latest',        # Always points to latest
            'models/gemini-2.5-pro',             # Pro version for better accuracy
            'models/gemini-2.0-flash-001',       # Specific version
        ]
        
        model_initialized = False
        for model_name in model_names_to_try:
            try:
                print(f"\n🔧 Trying model: {model_name}...")
                gemini_model = genai.GenerativeModel(model_name)
                
                # ✅ Test the model with a simple request to verify it works
                test_response = gemini_model.generate_content("Hello")
                
                print(f"✅ Gemini AI initialized successfully with model: {model_name}")
                model_initialized = True
                break
            except Exception as e:
                print(f"   ❌ Failed with {model_name}: {str(e)[:150]}")
                gemini_model = None
                continue
        
        if not model_initialized:
            print("\n⚠ Warning: Could not initialize any Gemini model")
            print(f"💡 Available models: {available_models[:5]}...")  # Show first 5
            gemini_model = None
            
    except Exception as e:
        print(f"⚠ Warning: Gemini AI configuration failed: {e}")
        traceback.print_exc()
        gemini_model = None
else:
    print("⚠ Warning: GEMINI_API_KEY not set. AI predictions will use fallback.")

# ============================================
# DATABASE & DIRECTORY CONFIG
# ============================================
DB_URL = "postgresql://postgres:2005@localhost:5432/CivicEyeDB"

def get_db_connection():
    """Get database connection with RealDictCursor"""
    return psycopg2.connect(DB_URL, cursor_factory=RealDictCursor)

# Upload Directory Configuration
UPLOAD_DIR = "uploads"
ISSUE_DIR = os.path.join(UPLOAD_DIR, "issues")
VIOLATION_DIR = os.path.join(UPLOAD_DIR, "violations")

os.makedirs(ISSUE_DIR, exist_ok=True)
os.makedirs(VIOLATION_DIR, exist_ok=True)

# ✅ FIX: Mount both /uploads and individual directories for backward compatibility
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
app.mount("/issues", StaticFiles(directory=ISSUE_DIR), name="issue_direct")
app.mount("/violations", StaticFiles(directory=VIOLATION_DIR), name="violation_direct")

print(f"📁 Serving uploads from: {os.path.abspath(UPLOAD_DIR)}")
print("   - /uploads/issues/ (recommended)")
print("   - /issues/ (backward compatible)")
print("   - /uploads/violations/ (recommended)")
print("   - /violations/ (backward compatible)")

# ============================================
# HEALTH CHECK & TEST ENDPOINTS
# ============================================
@app.get("/")
async def root():
    return {
        "status": "online", 
        "service": "CivicEye ML API", 
        "version": "2.0.1",
        "gemini_enabled": gemini_model is not None
    }

@app.get("/health")
async def health_check():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.close()
        conn.close()
        return {
            "status": "healthy", 
            "database": "connected",
            "gemini_ai": "enabled" if gemini_model else "disabled",
            "uploads_dir": os.path.exists(UPLOAD_DIR)
        }
    except Exception as e:
        return {
            "status": "unhealthy", 
            "database": "disconnected", 
            "error": str(e)
        }

# ============================================
# USER LOGIN ENDPOINT
# ============================================
@app.post("/api/ml/user-login")
async def user_login(
    email: str = Form(...),
    password: str = Form(...)
):
    """User login endpoint."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Query user by email
        cursor.execute("""
            SELECT id, email, full_name, role, aadhar_number, phone_number
            FROM users 
            WHERE email = %s AND password = %s
        """, (email, password))
        
        user = cursor.fetchone()
        
        if user:
            # Convert to dictionary and remove sensitive data if needed
            user_dict = dict(user)
            user_dict['id'] = str(user_dict['id'])  # Convert ID to string for JSON
            
            return {
                "status": "success",
                "message": "Login successful",
                "user": user_dict
            }
        else:
            return {
                "status": "error",
                "message": "Invalid email or password"
            }
            
    except Exception as e:
        print(f"❌ Login error: {e}")
        traceback.print_exc()
        return {
            "status": "error",
            "message": "Login failed due to server error"
        }
    finally:
        if conn:
            conn.close()

# ============================================
# CREATE SAMPLE IMAGES ENDPOINT
# ============================================
@app.post("/api/create-sample-images")
async def create_sample_images():
    """Create sample images for testing."""
    try:
        from PIL import Image, ImageDraw, ImageFont
        import random
        
        # Create directories if they don't exist
        os.makedirs(ISSUE_DIR, exist_ok=True)
        os.makedirs(VIOLATION_DIR, exist_ok=True)
        
        # Sample images to create
        sample_images = {
            ISSUE_DIR: [
                "pothole_sample.jpg",
                "garbage.jpg", 
                "water_logging.jpg",
                "street_light.jpg",
                "illegal_dumping.jpg",
                "graffiti.jpg",
                "default.jpg"
            ],
            VIOLATION_DIR: [
                "parking_sample.jpg",
                "default.jpg"
            ]
        }
        
        created = []
        
        for directory, filenames in sample_images.items():
            for filename in filenames:
                filepath = os.path.join(directory, filename)
                
                if not os.path.exists(filepath):
                    # Create a sample image
                    img = Image.new('RGB', (600, 400), color=(
                        random.randint(100, 200),
                        random.randint(100, 200), 
                        random.randint(100, 200)
                    ))
                    d = ImageDraw.Draw(img)
                    
                    # Add text
                    text = filename.replace('.jpg', '').replace('_', ' ').title()
                    try:
                        font = ImageFont.truetype("arial.ttf", 36)
                    except:
                        font = ImageFont.load_default()
                    
                    d.text((50, 150), text, fill='white', font=font)
                    d.text((50, 200), "Sample Image", fill='white', font=font)
                    
                    img.save(filepath)
                    created.append(filepath)
                    print(f"✅ Created: {filepath}")
        
        return {
            "status": "success",
            "message": f"Created {len(created)} sample images",
            "created": created,
            "access_urls": [
                f"http://localhost:5000/issues/{os.path.basename(f)}" 
                if "issues" in f else 
                f"http://localhost:5000/violations/{os.path.basename(f)}" 
                for f in created
            ]
        }
        
    except Exception as e:
        print(f"❌ Error creating sample images: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# TEST IMAGES ENDPOINT
# ============================================
@app.get("/api/test-images")
async def test_images():
    """Test if images are being served correctly."""
    test_images = [
        "/issues/pothole_sample.jpg",
        "/violations/parking_sample.jpg",
        "/uploads/issues/pothole_sample.jpg",
        "/uploads/violations/parking_sample.jpg",
    ]
    
    results = []
    for img_path in test_images:
        # Clean the path
        clean_path = img_path.lstrip('/')
        
        # Check if file exists
        if clean_path.startswith('uploads/'):
            file_path = os.path.join(UPLOAD_DIR, clean_path[8:])
        else:
            file_path = os.path.join(UPLOAD_DIR, clean_path)
        
        exists = os.path.exists(file_path)
        
        # Construct URL
        if img_path.startswith('/uploads/'):
            url = f"http://localhost:5000{img_path}"
        elif img_path.startswith('/issues/') or img_path.startswith('/violations/'):
            url = f"http://localhost:5000{img_path}"
        else:
            url = f"http://localhost:5000/uploads{img_path}"
        
        results.append({
            "path": img_path,
            "filesystem_path": file_path,
            "exists": exists,
            "url": url,
            "accessible": exists  # We'll assume if file exists, it's accessible
        })
    
    return {
        "upload_dir": UPLOAD_DIR,
        "issue_dir": ISSUE_DIR,
        "violation_dir": VIOLATION_DIR,
        "test_results": results,
        "note": "Try accessing: http://localhost:5000/issues/pothole_sample.jpg"
    }

# ============================================
# GET UNVERIFIED REPORTS
# ============================================
@app.get("/api/reports/unverified")
async def get_unverified_reports():
    """Fetch all pending reports using the view."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT 
                id, issue, location, status, citizen, citizen_id,
                image_path, created_at, priority, category, report_type
            FROM pending_reports_view 
            ORDER BY created_at DESC
        """)
        
        reports = cursor.fetchall()
        
        # Convert to string for JSON serialization
        for report in reports:
            report['id'] = str(report['id'])
            report['citizen_id'] = str(report['citizen_id'])
            if report['created_at']:
                report['created_at'] = report['created_at'].isoformat()
        
        return {"reports": reports, "count": len(reports), "status": "success"}
        
    except Exception as e:
        print(f"❌ [ERROR] Error fetching reports: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

# ============================================
# GET ALL REPORTS - FIXED VERSION
# ============================================
@app.get("/api/reports")
async def get_all_reports():
    """Fetch all reports (both issues and violations) for the dashboard."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        query = """
        SELECT 
            'ISSUE' as report_type,
            i.id, 
            i.title as category,
            i.description,
            i.address as location,
            i.created_at as date,
            i.status,
            u.full_name as citizen,
            u.id as citizen_id,  -- ✅ Add this line
            COALESCE(
                (SELECT image_path FROM issue_images WHERE issue_id = i.id AND is_primary = true LIMIT 1),
                (SELECT image_path FROM issue_images WHERE issue_id = i.id LIMIT 1)
            ) as image_path
        FROM issues i
        JOIN users u ON i.user_id = u.id

        UNION ALL

        SELECT 
            'VIOLATION' as report_type,
            v.id, 
            v.title as category,
            v.description,
            v.address as location,
            v.created_at as date,
            v.status,
            u.full_name as citizen,
            u.id as citizen_id,  -- ✅ Add this line
            COALESCE(
                (SELECT image_path FROM violation_images WHERE violation_id = v.id AND is_primary = true LIMIT 1),
                (SELECT image_path FROM violation_images WHERE violation_id = v.id LIMIT 1)
            ) as image_path
        FROM violations v
        JOIN users u ON v.user_id = u.id

        ORDER BY date DESC
        """

        cursor.execute(query)
        reports = cursor.fetchall()

        # ✅ Process reports to add full image URLs
        for report in reports:
            report['id'] = str(report['id'])
            report['citizen_id'] = str(report['citizen_id'])  # ✅ Convert to string
            if report['date']:
                report['date'] = report['date'].isoformat()
            
            # ✅ Convert image_path to full URL
            if report['image_path']:
                # Ensure we have a clean path without any leading slashes
                clean_path = report['image_path'].lstrip('/')
                report['image_url'] = f"/uploads/{clean_path}"
            else:
                report['image_url'] = None
        
        return reports

    except Exception as e:
        print(f"❌ Error fetching all reports: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

# ============================================
# GET USER-SPECIFIC REPORTS
# ============================================
@app.get("/api/my-reports")
async def get_my_reports(
    user_id: Optional[int] = Query(None, description="User ID to fetch reports for")
):
    """Fetch reports for a specific user or all if no user_id provided."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        base_query = """
        SELECT 
            'ISSUE' as report_type,
            i.id, 
            i.title as category,
            i.description,
            i.address as location,
            i.created_at as date,
            i.status,
            u.full_name as citizen,
            u.id as citizen_id,
            COALESCE(
                (SELECT image_path FROM issue_images WHERE issue_id = i.id AND is_primary = true LIMIT 1),
                (SELECT image_path FROM issue_images WHERE issue_id = i.id LIMIT 1)
            ) as image_path
        FROM issues i
        JOIN users u ON i.user_id = u.id
        
        UNION ALL
        
        SELECT 
            'VIOLATION' as report_type,
            v.id, 
            v.title as category,
            v.description,
            v.address as location,
            v.created_at as date,
            v.status,
            u.full_name as citizen,
            u.id as citizen_id,
            COALESCE(
                (SELECT image_path FROM violation_images WHERE violation_id = v.id AND is_primary = true LIMIT 1),
                (SELECT image_path FROM violation_images WHERE violation_id = v.id LIMIT 1)
            ) as image_path
        FROM violations v
        JOIN users u ON v.user_id = u.id
        """
        
        # Add WHERE clause if user_id is provided
        if user_id:
            query = f"""
            SELECT * FROM (
                {base_query}
            ) AS all_reports
            WHERE citizen_id = %s
            ORDER BY date DESC
            """
            cursor.execute(query, (user_id,))
        else:
            query = f"""
            SELECT * FROM (
                {base_query}
            ) AS all_reports
            ORDER BY date DESC
            """
            cursor.execute(query)

        reports = cursor.fetchall()

        # Process reports
        for report in reports:
            report['id'] = str(report['id'])
            report['citizen_id'] = str(report['citizen_id'])
            if report['date']:
                report['date'] = report['date'].isoformat()
            
            # Convert image_path to full URL
            if report['image_path']:
                clean_path = report['image_path'].lstrip('/')
                if clean_path.startswith('uploads/'):
                    report['image_url'] = f"/{clean_path}"
                else:
                    report['image_url'] = f"/uploads/{clean_path}"
            else:
                report['image_url'] = None
        
        return reports

    except Exception as e:
        print(f"❌ Error fetching reports: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

# ============================================
# DEBUG IMAGES ENDPOINT
# ============================================
@app.get("/api/debug/images")
async def debug_images():
    """Debug endpoint to check image paths"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT 'issue' as type, id, image_path, filename 
            FROM issue_images 
            LIMIT 5
            UNION ALL
            SELECT 'violation' as type, id, image_path, filename 
            FROM violation_images 
            LIMIT 5
        """)
        
        images = cursor.fetchall()
        
        # Check if files exist
        for img in images:
            if img['image_path']:
                full_path = os.path.join(UPLOAD_DIR, img['image_path'])
                img['file_exists'] = os.path.exists(full_path)
                img['full_path'] = full_path
                img['url'] = f"/uploads/{img['image_path']}"
        
        return {
            "upload_dir": UPLOAD_DIR,
            "issue_dir": ISSUE_DIR,
            "violation_dir": VIOLATION_DIR,
            "images": images,
            "static_mounts": [
                "/uploads",
                "/issues",
                "/violations"
            ]
        }
        
    except Exception as e:
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()

# ============================================
# SUBMIT REPORT - FIXED VERSION
# ============================================
# @app.post("/api/ml/submit-report")
# async def submit_report(
#     report_type: str = Query(..., description="Type: issue or violation"),
#     user_id: str = Form(...),  # Change to string to handle both
#     title: str = Form(...),
#     description: str = Form(...),
#     location: str = Form(...),
#     category: str = Form(...),
#     latitude: Optional[str] = Form(None),
#     longitude: Optional[str] = Form(None),
#     predicted_category: Optional[str] = Form(None),
#     ai_confidence: Optional[float] = Form(None),
#     image: Optional[str] = Form(None),  # Base64 image
#     metadata: Optional[str] = Form(None)
# ):
#     """Submit a new issue or violation report with base64 image."""
#     conn = None
#     try:
#         print(f"\n📝 Submitting {report_type} report for User ID: {user_id}")
#         print(f"   Category: {category}")
#         print(f"   Image data present: {bool(image)}")
        
#         # Convert user_id to integer
#         try:
#             user_id_int = int(user_id)
#         except ValueError:
#             raise HTTPException(status_code=400, detail="Invalid user_id format")
        
#         conn = get_db_connection()
#         cursor = conn.cursor()

#         # Handle image if provided (base64)
#         image_path = None
#         unique_filename = None
#         if image:
#             try:
#                 # Decode base64 image
#                 if ',' in image:
#                     image_data = image.split(',')[1]
#                 else:
#                     image_data = image
                
#                 img_bytes = base64.b64decode(image_data)
                
#                 # Determine upload directory
#                 upload_dir = ISSUE_DIR if report_type.lower() == "issue" else VIOLATION_DIR
#                 os.makedirs(upload_dir, exist_ok=True)
                
#                 # Generate unique filename
#                 unique_filename = f"{uuid.uuid4()}.jpg"
#                 full_path = os.path.join(upload_dir, unique_filename)
                
#                 # Save image
#                 with open(full_path, 'wb') as f:
#                     f.write(img_bytes)
                
#                 # Store relative path
#                 relative_dir = "issues" if report_type.lower() == "issue" else "violations"
#                 image_path = f"{relative_dir}/{unique_filename}"
#                 print(f"   📁 Image saved to: {full_path}")
#                 print(f"   📋 Database path: {image_path}")
                
#             except Exception as img_error:
#                 print(f"   ⚠ Failed to save image: {img_error}")
#                 traceback.print_exc()
#                 # Continue without image if there's an error
#                 image_path = None

#         # Insert into database
#         if report_type.lower() == "issue":
#             # Insert into issues table
#             cursor.execute("""
#                 INSERT INTO issues (
#                     user_id, title, description, address, 
#                     category, status, priority, created_at
#                 ) VALUES (%s, %s, %s, %s, %s, 'PENDING', 'MEDIUM', NOW())
#                 RETURNING id;
#             """, (user_id_int, title, description, location, category))
            
#             issue_id = cursor.fetchone()[0]
#             report_id = issue_id
            
#             # Insert image if uploaded
#             if image_path:
#                 cursor.execute("""
#                     INSERT INTO issue_images (issue_id, image_path, filename, is_primary)
#                     VALUES (%s, %s, %s, true);
#                 """, (issue_id, image_path, unique_filename or "uploaded_image.jpg"))
                
#         else:  # violation
#             cursor.execute("""
#                 INSERT INTO violations (
#                     user_id, title, description, address, 
#                     category, status, created_at
#                 ) VALUES (%s, %s, %s, %s, %s, 'PENDING', NOW())
#                 RETURNING id;
#             """, (user_id_int, title, description, location, category))
            
#             violation_id = cursor.fetchone()[0]
#             report_id = violation_id
            
#             # Insert image if uploaded
#             if image_path:
#                 cursor.execute("""
#                     INSERT INTO violation_images (violation_id, image_path, filename, is_primary)
#                     VALUES (%s, %s, %s, true);
#                 """, (violation_id, image_path, unique_filename or "uploaded_image.jpg"))

#         conn.commit()
        
#         return {
#             "status": "success",
#             "message": f"{report_type.capitalize()} report submitted successfully",
#             "report_id": report_id,
#             "report_type": report_type,
#             "image_filename": unique_filename if image_path else None
#         }

#     except Exception as e:
#         if conn:
#             conn.rollback()
#         print(f"❌ Error submitting report: {e}")
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=str(e))
#     finally:
#         if conn:
#             conn.close()

# ============================================
# SUBMIT REPORT - FIXED VERSION
# ============================================
# @app.post("/api/ml/submit-report")
# async def submit_report(
#     report_type: str = Query(..., description="Type: issue or violation"),
#     user_id: str = Form(...),  # Change to string to handle both
#     title: str = Form(...),
#     description: str = Form(...),
#     location: str = Form(...),
#     category: str = Form(...),
#     latitude: Optional[str] = Form(None),
#     longitude: Optional[str] = Form(None),
#     predicted_category: Optional[str] = Form(None),
#     ai_confidence: Optional[float] = Form(None),
#     image: Optional[str] = Form(None),  # Base64 image
#     metadata: Optional[str] = Form(None)
# ):
#     """Submit a new issue or violation report with base64 image."""
#     conn = None
#     try:
#         print(f"\n📝 Submitting {report_type} report for User ID: {user_id}")
#         print(f"   Category: {category}")
#         print(f"   Image data present: {bool(image)}")
        
#         # Convert user_id to integer
#         try:
#             user_id_int = int(user_id)
#         except ValueError:
#             raise HTTPException(status_code=400, detail="Invalid user_id format")
        
#         conn = get_db_connection()
        
#         # For INSERT with RETURNING, we need a regular cursor or handle RealDictCursor differently
#         cursor = conn.cursor(cursor_factory=RealDictCursor)

#         # Handle image if provided (base64)
#         image_path = None
#         unique_filename = None
#         if image:
#             try:
#                 # Decode base64 image
#                 if ',' in image:
#                     image_data = image.split(',')[1]
#                 else:
#                     image_data = image
                
#                 img_bytes = base64.b64decode(image_data)
                
#                 # Determine upload directory
#                 upload_dir = ISSUE_DIR if report_type.lower() == "issue" else VIOLATION_DIR
#                 os.makedirs(upload_dir, exist_ok=True)
                
#                 # Generate unique filename
#                 unique_filename = f"{uuid.uuid4()}.jpg"
#                 full_path = os.path.join(upload_dir, unique_filename)
                
#                 # Save image
#                 with open(full_path, 'wb') as f:
#                     f.write(img_bytes)
                
#                 # Store relative path
#                 relative_dir = "issues" if report_type.lower() == "issue" else "violations"
#                 image_path = f"{relative_dir}/{unique_filename}"
#                 print(f"   📁 Image saved to: {full_path}")
#                 print(f"   📋 Database path: {image_path}")
                
#             except Exception as img_error:
#                 print(f"   ⚠ Failed to save image: {img_error}")
#                 traceback.print_exc()
#                 # Continue without image if there's an error
#                 image_path = None

#         # Insert into database
#         if report_type.lower() == "issue":
#             # Insert into issues table
#             cursor.execute("""
#                 INSERT INTO issues (
#                     user_id, title, description, address, 
#                     category, status, priority, created_at
#                 ) VALUES (%s, %s, %s, %s, %s, 'PENDING', 'MEDIUM', NOW())
#                 RETURNING id;
#             """, (user_id_int, title, description, location, category))
            
#             result = cursor.fetchone()
#             # FIX: Access by column name instead of index
#             issue_id = result['id'] if result else None
#             report_id = issue_id
            
#             if not issue_id:
#                 raise HTTPException(status_code=500, detail="Failed to create issue record")
            
#             # Insert image if uploaded
#         if image_path:
#             # Fix: Use just the unique filename, not the full path
#             # The path should be stored as just "issues/filename.jpg" not "issues/issues/filename.jpg"
#             clean_image_path = f"issues/{unique_filename}" if report_type.lower() == "issue" else f"violations/{unique_filename}"
            
#             cursor.execute("""
#                 INSERT INTO issue_images (issue_id, image_path, filename, is_primary)
#                 VALUES (%s, %s, %s, true);
#             """, (issue_id, clean_image_path, unique_filename or "uploaded_image.jpg"))
                
#         else:  # violation
#             cursor.execute("""
#                 INSERT INTO violations (
#                     user_id, title, description, address, 
#                     category, status, created_at
#                 ) VALUES (%s, %s, %s, %s, %s, 'PENDING', NOW())
#                 RETURNING id;
#             """, (user_id_int, title, description, location, category))
            
#             result = cursor.fetchone()
#             # FIX: Access by column name instead of index
#             violation_id = result['id'] if result else None
#             report_id = violation_id
            
#             if not violation_id:
#                 raise HTTPException(status_code=500, detail="Failed to create violation record")
            
#             # Insert image if uploaded
#             if image_path:
#                 cursor.execute("""
#                     INSERT INTO violation_images (violation_id, image_path, filename, is_primary)
#                     VALUES (%s, %s, %s, true);
#                 """, (violation_id, image_path, unique_filename or "uploaded_image.jpg"))

#         conn.commit()
        
#         return {
#             "status": "success",
#             "message": f"{report_type.capitalize()} report submitted successfully",
#             "report_id": report_id,
#             "report_type": report_type,
#             "image_filename": unique_filename if image_path else None
#         }

#     except Exception as e:
#         if conn:
#             conn.rollback()
#         print(f"❌ Error submitting report: {e}")
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=str(e))
#     finally:
#         if conn:
#             conn.close()


# ============================================
# SUBMIT REPORT - FIXED VERSION
# ============================================
@app.post("/api/ml/submit-report")
async def submit_report(
    report_type: str = Query(..., description="Type: issue or violation"),
    user_id: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    category: str = Form(...),
    latitude: Optional[str] = Form(None),
    longitude: Optional[str] = Form(None),
    predicted_category: Optional[str] = Form(None),
    ai_confidence: Optional[float] = Form(None),
    image: Optional[str] = Form(None),
    metadata: Optional[str] = Form(None)
):
    """Submit a new issue or violation report with base64 image."""
    conn = None
    try:
        print(f"\n📝 Submitting {report_type} report for User ID: {user_id}")
        print(f"   Category: {category}")
        print(f"   Image data present: {bool(image)}")
        
        # Convert user_id to integer
        try:
            user_id_int = int(user_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid user_id format")
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Handle image if provided (base64)
        image_path = None
        unique_filename = None
        if image:
            try:
                # Decode base64 image
                if ',' in image:
                    image_data = image.split(',')[1]
                else:
                    image_data = image
                
                img_bytes = base64.b64decode(image_data)
                
                # Determine upload directory
                upload_dir = ISSUE_DIR if report_type.lower() == "issue" else VIOLATION_DIR
                os.makedirs(upload_dir, exist_ok=True)
                
                # Generate unique filename
                unique_filename = f"{uuid.uuid4()}.jpg"
                full_path = os.path.join(upload_dir, unique_filename)
                
                # Save image
                with open(full_path, 'wb') as f:
                    f.write(img_bytes)
                
                # Store relative path
                relative_dir = "issues" if report_type.lower() == "issue" else "violations"
                image_path = f"{relative_dir}/{unique_filename}"
                print(f"   📁 Image saved to: {full_path}")
                print(f"   📋 Database path: {image_path}")
                
            except Exception as img_error:
                print(f"   ⚠ Failed to save image: {img_error}")
                traceback.print_exc()
                # Continue without image if there's an error
                image_path = None

        # Initialize variables to avoid reference before assignment
        issue_id = None
        violation_id = None
        report_id = None
        
        # Insert into database based on report type
        if report_type.lower() == "issue":
            # Insert into issues table
            cursor.execute("""
                INSERT INTO issues (
                    user_id, title, description, address, 
                    category, status, priority, created_at
                ) VALUES (%s, %s, %s, %s, %s, 'PENDING', 'MEDIUM', NOW())
                RETURNING id;
            """, (user_id_int, title, description, location, category))
            
            result = cursor.fetchone()
            if result:
                issue_id = result['id']
                report_id = issue_id
            else:
                raise HTTPException(status_code=500, detail="Failed to create issue record")
            
            # Insert image if uploaded
            if image_path and issue_id:
                # Clean the image path to avoid duplication
                clean_image_path = f"issues/{unique_filename}"
                cursor.execute("""
                    INSERT INTO issue_images (issue_id, image_path, filename, is_primary)
                    VALUES (%s, %s, %s, true);
                """, (issue_id, clean_image_path, unique_filename or "uploaded_image.jpg"))
                
        elif report_type.lower() == "violation":
            # Insert into violations table
            cursor.execute("""
                INSERT INTO violations (
                    user_id, title, description, address, 
                    category, status, created_at
                ) VALUES (%s, %s, %s, %s, %s, 'PENDING', NOW())
                RETURNING id;
            """, (user_id_int, title, description, location, category))
            
            result = cursor.fetchone()
            if result:
                violation_id = result['id']
                report_id = violation_id
            else:
                raise HTTPException(status_code=500, detail="Failed to create violation record")
            
            # Insert image if uploaded
            if image_path and violation_id:
                # Clean the image path to avoid duplication
                clean_image_path = f"violations/{unique_filename}"
                cursor.execute("""
                    INSERT INTO violation_images (violation_id, image_path, filename, is_primary)
                    VALUES (%s, %s, %s, true);
                """, (violation_id, clean_image_path, unique_filename or "uploaded_image.jpg"))
        else:
            raise HTTPException(status_code=400, detail="Invalid report type. Must be 'issue' or 'violation'")

        conn.commit()
        
        return {
            "status": "success",
            "message": f"{report_type.capitalize()} report submitted successfully",
            "report_id": report_id,
            "report_type": report_type,
            "image_filename": unique_filename if image_path else None
        }

    except Exception as e:
        if conn:
            conn.rollback()
        print(f"❌ Error submitting report: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

# ============================================
# VERIFY REPORT
# ============================================
@app.put("/api/reports/{report_id}/verify")
async def verify_report(report_id: str, report_type: str = Query(..., description="Type: ISSUE or VIOLATION")):
    """Verify a report and update its status."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if report_type.upper() == "ISSUE":
            cursor.execute("""
                UPDATE issues 
                SET status = 'IN_PROGRESS', updated_at = NOW()
                WHERE id = %s AND status = 'PENDING'
            """, (report_id,))
        elif report_type.upper() == "VIOLATION":
            cursor.execute("""
                UPDATE violations 
                SET status = 'VERIFIED', updated_at = NOW(), verified_at = NOW()
                WHERE id = %s AND status = 'PENDING'
            """, (report_id,))
        else:
            raise HTTPException(status_code=400, detail="Invalid report type")
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Report not found or already processed")
        
        conn.commit()
        return {"message": f"Report {report_id} verified successfully", "status": "success"}
        
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

# ============================================
# PREDICT CATEGORY (Base64)
# ============================================
@app.post("/api/ml/predict-category-base64")
async def predict_category_base64(
    image_base64: str = Form(...),
    report_type: str = Form("issue")
):
    """Predict category from base64 image."""
    try:
        if not gemini_model:
            # Fallback if Gemini is not available
            return {
                "predicted_category": "other",
                "confidence": 0.5,
                "all_scores": {"other": 0.5},
                "message": "AI service not available"
            }
        
        # Decode base64 image
        import base64
        image_data = base64.b64decode(image_base64.split(",")[-1] if "," in image_base64 else image_base64)
        
        # Create PIL Image
        image = Image.open(io.BytesIO(image_data))
        
        # Prepare prompt based on report type
        if report_type.lower() == "issue":
            prompt = """Analyze this image of a civic issue and categorize it as one of:
            1. garbage - Overflowing garbage, trash accumulation
            2. pothole - Road potholes, road damage
            3. streetlight - Broken street lights, lighting issues
            4. water - Water leakage, flooding, water logging
            5. road - Road damage, cracks, broken pavement
            6. dumping - Illegal dumping, construction waste
            7. graffiti - Vandalism, graffiti on public property
            8. other - Anything else
            
            Return ONLY the category name from the list above."""
        else:
            prompt = """Analyze this image of a civic violation and categorize it as one of:
            1. parking - Illegal parking, wrong parking
            2. noise - Noise pollution, loud activities
            3. construction - Illegal construction
            4. encroachment - Public space encroachment
            5. littering - Public littering, throwing trash
            6. traffic - Traffic rule violations
            7. other - Anything else
            
            Return ONLY the category name from the list above."""
        
        # Generate prediction
        response = gemini_model.generate_content([prompt, image])
        prediction = response.text.strip().lower()
        
        # Map to your category values
        category_mapping = {
            "issue": {
                "garbage": "garbage",
                "pothole": "pothole", 
                "streetlight": "streetlight",
                "water": "water",
                "road": "road",
                "dumping": "dumping",
                "graffiti": "graffiti",
                "other": "other"
            },
            "violation": {
                "parking": "parking",
                "noise": "noise",
                "construction": "construction", 
                "encroachment": "encroachment",
                "littering": "littering",
                "traffic": "traffic",
                "other": "other"
            }
        }
        
        predicted_category = category_mapping[report_type].get(prediction, "other")
        
        return {
            "predicted_category": predicted_category,
            "confidence": 0.85,  # Mock confidence
            "all_scores": {predicted_category: 0.85},
            "message": "AI prediction successful"
        }
        
    except Exception as e:
        print(f"❌ Error in AI prediction: {e}")
        traceback.print_exc()
        return {
            "predicted_category": "other",
            "confidence": 0.0,
            "all_scores": {"other": 1.0},
            "message": f"Prediction failed: {str(e)}"
        }

# ============================================
# OTHER ENDPOINTS
# ============================================
@app.get("/api/value")
def get_backend_value():
    return {"value": "password"}

@app.get("/api/test/gemini")
async def test_gemini():
    """Test endpoint to verify Gemini is working"""
    if not gemini_model:
        return {
            "status": "error", 
            "message": "Gemini not initialized. Check server logs for details."
        }
    
    try:
        response = gemini_model.generate_content("Say hello in one word")
        return {
            "status": "success",
            "message": "Gemini is working!",
            "response": response.text
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ============================================
# CORS MIDDLEWARE
# ============================================
@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Add CORS headers
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    
    return response

# Add this to your FastAPI backend (main.py)
@app.get("/api/rewards")
async def get_rewards(user_id: int):
    """Get user's reward wallet balance"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT balance, total_earned 
            FROM reward_wallets 
            WHERE user_id = %s
        """, (user_id,))
        
        wallet = cursor.fetchone()
        
        if wallet:
            return {
                "balance": wallet['balance'],
                "total_earned": wallet['total_earned'],
                "status": "success"
            }
        else:
            # Create wallet if doesn't exist
            cursor.execute("""
                INSERT INTO reward_wallets (user_id, balance, total_earned)
                VALUES (%s, 0, 0)
                RETURNING balance, total_earned
            """, (user_id,))
            new_wallet = cursor.fetchone()
            conn.commit()
            return {
                "balance": new_wallet['balance'],
                "total_earned": new_wallet['total_earned'],
                "status": "created"
            }
            
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"❌ Error fetching rewards: {e}")
        return {
            "balance": 0,
            "total_earned": 0,
            "status": "error",
            "message": str(e)
        }
    finally:
        if conn:
            conn.close()

# ============================================
# PRINT REGISTERED ROUTES
# ============================================
print("\n📋 Registered routes:")
for route in app.routes:
    if isinstance(route, APIRoute):
        print(f"  {route.path} - {route.methods}")

# ============================================
# RUN SERVER
# ============================================
if __name__ == "__main__":
    import uvicorn
    print("\n🚀 Starting CivicEye ML API Server with Gemini AI...")
    print("📍 Server URL: http://localhost:5000")
    print("📚 API Docs: http://localhost:5000/docs")
    print(f"🤖 Gemini AI: {'✅ Enabled' if gemini_model else '❌ Disabled'}")
    print(f"📁 Uploads directory: {os.path.abspath(UPLOAD_DIR)}")
    print(f"📁 Issues directory: {os.path.abspath(ISSUE_DIR)}")
    print(f"📁 Violations directory: {os.path.abspath(VIOLATION_DIR)}")
    
    # Create sample images if they don't exist
    try:
        from PIL import Image, ImageDraw
        print("\n🖼️ Checking for sample images...")
        sample_images = {
            ISSUE_DIR: ["pothole_sample.jpg", "garbage.jpg", "water_logging.jpg", "street_light.jpg", "default.jpg"],
            VIOLATION_DIR: ["parking_sample.jpg", "default.jpg"]
        }
        
        for directory, images in sample_images.items():
            os.makedirs(directory, exist_ok=True)
            for image_name in images:
                image_path = os.path.join(directory, image_name)
                if not os.path.exists(image_path):
                    img = Image.new('RGB', (600, 400), color=(70, 130, 180))
                    d = ImageDraw.Draw(img)
                    text = image_name.replace('.jpg', '').replace('_', ' ').title()
                    d.text((50, 150), text, fill='white')
                    d.text((50, 200), "Sample Image", fill='white')
                    img.save(image_path)
                    print(f"✅ Created: {image_path}")
        
        print("✅ Sample images ready!")
    except Exception as e:
        print(f"⚠ Could not create sample images: {e}")
    
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)