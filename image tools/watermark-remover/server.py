import os
import base64
import numpy as np
import cv2
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS

# Initialize Flask App
app = Flask(__name__)
CORS(app)  # Allow all domains for ease of development

# Configuration
UPLOAD_FOLDER = 'uploads'
MAX_FILE_SIZE = 50 * 1024 * 1024  # Increased limit to 50MB for high-res images

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def base64_to_cv2(b64str):
    """Convert base64 string to OpenCV image."""
    try:
        if ',' in b64str:
            b64str = b64str.split(',')[1]
        nparr = np.frombuffer(base64.b64decode(b64str), np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except Exception as e:
        print(f"Error decoding image: {e}")
        return None

def cv2_to_base64(img):
    """Convert OpenCV image to base64 string."""
    _, buffer = cv2.imencode('.png', img)
    return "data:image/png;base64," + base64.b64encode(buffer).decode('utf-8')

@app.route('/')
def health_check():
    """Simple health check endpoint."""
    return jsonify({"status": "online", "message": "CleanSlate AI Backend is Running"})

@app.route('/process', methods=['POST'])
def process_image():
    try:
        data = request.json
        if not data or 'image' not in data or 'mask' not in data:
            return jsonify({'error': 'Missing image or mask data'}), 400

        print("Received request... Processing.")

        # 1. Decode Image and Mask
        image = base64_to_cv2(data['image'])
        mask_raw = base64_to_cv2(data['mask'])
        
        if image is None or mask_raw is None:
            return jsonify({'error': 'Failed to decode image data'}), 400

        # 2. Validation & Resize
        # Ensure mask matches image dimensions exactly
        if image.shape[:2] != mask_raw.shape[:2]:
            print(f"Resizing mask from {mask_raw.shape[:2]} to {image.shape[:2]}")
            mask_raw = cv2.resize(mask_raw, (image.shape[1], image.shape[0]))

        # 3. Process Mask
        # Convert mask to grayscale single channel
        mask_gray = cv2.cvtColor(mask_raw, cv2.COLOR_BGR2GRAY)
        
        # Threshold: Create strict binary mask (0 or 255)
        # Any non-black pixel in the mask layer becomes the inpaint area
        _, mask_binary = cv2.threshold(mask_gray, 10, 255, cv2.THRESH_BINARY)
        
        # Dilate mask slightly to cover edges of the brush strokes better
        kernel = np.ones((3,3), np.uint8)
        mask_dilated = cv2.dilate(mask_binary, kernel, iterations=1)

        # 4. Inpainting Logic
        # Radius 3 is tighter, preserving more detail around the removal area
        # cv2.INPAINT_TELEA is usually more consistent for watermark removal
        result = cv2.inpaint(image, mask_dilated, 3, cv2.INPAINT_TELEA)

        # 5. Return Result
        result_b64 = cv2_to_base64(result)
        print("Processing complete. Sending response.")
        return jsonify({'processed_image': result_b64})

    except Exception as e:
        print(f"Server Error: {e}")
        # Return error trace to frontend for easier debugging
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("="*50)
    print("CleanSlate AI Backend Started")
    print(f"  - Port: 5000")
    print(f"  - Max Upload Size: {MAX_FILE_SIZE / 1024 / 1024} MB")
    print("="*50)
    app.run(debug=True, port=5000)