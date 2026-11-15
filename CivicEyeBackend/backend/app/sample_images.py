# create_images.py
import os
from PIL import Image, ImageDraw

UPLOAD_DIR = "uploads"
ISSUE_DIR = os.path.join(UPLOAD_DIR, "issues")
VIOLATION_DIR = os.path.join(UPLOAD_DIR, "violations")

# Create directories
os.makedirs(ISSUE_DIR, exist_ok=True)
os.makedirs(VIOLATION_DIR, exist_ok=True)

# Images to create
images_to_create = {
    ISSUE_DIR: [
        ("pothole_sample.jpg", "Pothole Sample"),
        ("garbage.jpg", "Garbage"),
        ("water_logging.jpg", "Water Logging"),
        ("street_light.jpg", "Street Light"),
        ("illegal_dumping.jpg", "Illegal Dumping"),
        ("graffiti.jpg", "Graffiti"),
        ("default.jpg", "Default Issue")
    ],
    VIOLATION_DIR: [
        ("parking_sample.jpg", "Parking Sample"),
        ("default.jpg", "Default Violation")
    ]
}

# Create images
for directory, images in images_to_create.items():
    for filename, text in images:
        filepath = os.path.join(directory, filename)
        if not os.path.exists(filepath):
            # Create image
            img = Image.new('RGB', (600, 400), color=(70, 130, 180))  # Steel blue
            d = ImageDraw.Draw(img)
            d.text((50, 150), text, fill='white')
            d.text((50, 200), "Sample Image", fill='white')
            img.save(filepath)
            print(f"Created: {filepath}")

print(f"\n✅ Images created!")
print(f"Access them at:")
print(f"  http://localhost:5000/issues/pothole_sample.jpg")
print(f"  http://localhost:5000/violations/parking_sample.jpg")