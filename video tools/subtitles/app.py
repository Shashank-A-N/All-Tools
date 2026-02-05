import os
import uuid
from flask import Flask, render_template, request, jsonify, send_file
import whisper
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = '/tmp/uploads'
ALLOWED_EXTENSIONS = {'mp4', 'mov', 'avi', 'mkv', 'mp3', 'wav'}
MODEL_TYPE = "base"  # Options: tiny, base, small, medium, large (larger = slower but more accurate)

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB limit

# Load Whisper model once at startup to save time on requests
print(f"Loading Whisper model '{MODEL_TYPE}'... this may take a moment.")
model = whisper.load_model(MODEL_TYPE)
print("Model loaded.")

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def format_timestamp(seconds):
    """Converts seconds to WebVTT timestamp format (HH:MM:SS.mmm)"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds - int(seconds)) * 1000)
    return f"{hours:02}:{minutes:02}:{secs:02}.{millis:03}"

def generate_vtt(result):
    """Generates WebVTT content from Whisper result segments"""
    vtt = ["WEBVTT\n"]
    for segment in result['segments']:
        start = format_timestamp(segment['start'])
        end = format_timestamp(segment['end'])
        text = segment['text'].strip()
        vtt.append(f"{start} --> {end}\n{text}\n")
    return "\n".join(vtt)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/transcribe', methods=['POST'])
def transcribe_video():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file and allowed_file(file.filename):
        # Secure unique filename
        filename = secure_filename(file.filename)
        unique_id = str(uuid.uuid4())
        extension = filename.rsplit('.', 1)[1].lower()
        save_name = f"{unique_id}.{extension}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], save_name)
        
        try:
            file.save(filepath)
            
            # Run Whisper Transcription
            # fp16=False is often needed for CPU execution to avoid warnings/errors
            result = model.transcribe(filepath, fp16=False)
            
            # Generate VTT content
            vtt_content = generate_vtt(result)
            
            # Clean up the file after processing
            os.remove(filepath)
            
            return jsonify({
                'success': True,
                'vtt': vtt_content,
                'raw_text': result['text']
            })
            
        except Exception as e:
            # Clean up if error occurs
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({'error': str(e)}), 500
            
    return jsonify({'error': 'File type not allowed'}), 400

if __name__ == '__main__':
    # Host 0.0.0.0 is important for Docker
    app.run(host='0.0.0.0', port=5000, debug=True)