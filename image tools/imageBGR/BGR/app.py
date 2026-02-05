import os
from flask import Flask, request, send_file
from rembg import remove, new_session
from PIL import Image
import io

app = Flask(__name__, static_folder='.', static_url_path='')

# --- Configuration ---
# Set the model path to a local directory to ensure we have write permissions
# in the Docker container (Hugging Face Spaces runs as a non-root user).
os.environ['U2NET_HOME'] = os.path.join(os.getcwd(), '.u2net')

# Initialize the model session ONCE at startup.
# This significantly speeds up processing for subsequent requests because
# the model doesn't need to be re-loaded from disk every time.
# 'u2net' is the standard high-quality model.
MODEL_NAME = "u2net"
print(f"Loading {MODEL_NAME} model... this may take a moment.")
model_session = new_session(MODEL_NAME)
print("Model loaded successfully.")

@app.route('/')
def index():
    # Serve the index.html file from the current directory
    return app.send_static_file('index.html')

@app.route('/remove-bg', methods=['POST'])
def remove_background():
    if 'image' not in request.files:
        return {'error': 'No image file provided'}, 400
    
    file = request.files['image']
    
    if file.filename == '':
        return {'error': 'No selected file'}, 400

    try:
        # Read the image file
        input_image = Image.open(file.stream)
        
        # Remove the background using the pre-loaded session
        # alpha_matting=True can be added for finer hair details but is slower
        output_image = remove(input_image, session=model_session)
        
        # Save to buffer
        img_io = io.BytesIO()
        output_image.save(img_io, 'PNG')
        img_io.seek(0)
        
        return send_file(
            img_io,
            mimetype='image/png',
            as_attachment=True,
            download_name='no-bg.png'
        )
    except Exception as e:
        print(f"Error processing image: {e}")
        return {'error': 'Failed to process image. Please try a different file.'}, 500

if __name__ == '__main__':
    # Hugging Face Spaces listens on port 7860
    app.run(host='0.0.0.0', port=7860)