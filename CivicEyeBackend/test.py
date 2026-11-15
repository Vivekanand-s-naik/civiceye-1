# create_sample_data.py
import os
import psycopg2
from PIL import Image

def setup_database_and_files():
    # 1. Create directories
    os.makedirs("uploads/issues", exist_ok=True)
    os.makedirs("uploads/violations", exist_ok=True)
    
    # 2. Create sample images
    img = Image.new('RGB', (400, 300), color=(73, 109, 137))  # Blue-gray
    img.save('uploads/issues/pothole_sample.jpg')
    
    img2 = Image.new('RGB', (400, 300), color=(137, 73, 73))  # Red-brown
    img2.save('uploads/violations/parking_sample.jpg')
    
    print("✅ Created sample images")
    
    # 3. Insert sample data into database
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="CivicEyeDB",
            user="postgres",
            password="2005",
            port="5432"
        )
        cursor = conn.cursor()
        
        # Insert issue
        cursor.execute("""
            INSERT INTO issues (user_id, title, description, address, status) 
            VALUES (
                (SELECT id FROM users WHERE email = 'citizen@civiceye.com'),
                'Pothole on Main Street',
                'Large pothole causing traffic issues',
                '123 Main Street, City',
                'PENDING'
            ) RETURNING id;
        """)
        
        issue_id = cursor.fetchone()[0]
        
        # Insert image for the issue
        cursor.execute("""
            INSERT INTO issue_images (issue_id, image_path) 
            VALUES (%s, %s);
        """, (issue_id, 'uploads/issues/pothole_sample.jpg'))
        
        conn.commit()
        print("✅ Inserted sample data into database")
        
    except Exception as e:
        print(f"❌ Database error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    setup_database_and_files()