import os
import re
import io
import base64
import exifread
import pytesseract
import numpy as np
import cv2
from flask import Flask, render_template, request, redirect, url_for
from werkzeug.utils import secure_filename
from PIL import Image, ImageChops, ImageEnhance

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB limit
app.config['UPLOAD_FOLDER'] = 'uploads'

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# --- FORENSIC LOGIC ---

def perform_ela(image_path, quality=90):
    """
    Performs Error Level Analysis to visualize compression artifacts.
    """
    try:
        original = Image.open(image_path).convert('RGB')
        
        buffer = io.BytesIO()
        original.save(buffer, 'JPEG', quality=quality)
        buffer.seek(0)
        compressed = Image.open(buffer)
        
        ela_image = ImageChops.difference(original, compressed)
        
        extrema = ela_image.getextrema()
        max_diff = max([ex[1] for ex in extrema])
        if max_diff == 0:
            max_diff = 1
        scale = 255.0 / max_diff
        
        ela_image = ImageEnhance.Brightness(ela_image).enhance(scale)
        
        # Calculate statistics
        np_ela = np.array(ela_image)
        mean_diff = np.mean(np_ela)
        std_dev = np.std(np_ela) # Standard deviation helps find "patches" of edits
        
        return ela_image, mean_diff, std_dev
    except Exception as e:
        print(f"ELA Error: {e}")
        return Image.new('RGB', (100, 100), color='black'), 0, 0

def generate_histogram(image_path):
    """
    Generates a visual RGB histogram using OpenCV.
    """
    try:
        img = cv2.imread(image_path)
        if img is None:
            return None

        hist_h, hist_w = 300, 512
        hist_img = np.zeros((hist_h, hist_w, 3), dtype=np.uint8)
        colors = [(255, 0, 0), (0, 255, 0), (0, 0, 255)] 
        
        for i, color in enumerate(colors):
            hist = cv2.calcHist([img], [i], None, [256], [0, 256])
            cv2.normalize(hist, hist, 0, hist_h, cv2.NORM_MINMAX)
            hist = np.int32(np.around(hist))
            for x in range(1, 256):
                cv2.line(hist_img, ( (x-1)*2, hist_h - hist[x-1][0] ),( x*2, hist_h - hist[x][0] ), color, 2)
        
        return Image.fromarray(cv2.cvtColor(hist_img, cv2.COLOR_BGR2RGB))
    except Exception:
        return None

def check_integrity(image_path):
    """
    STRICTER checks for hidden data (Steganography).
    """
    warnings = []
    try:
        with open(image_path, 'rb') as f:
            data = f.read()

        # JPEG EOF Check
        if image_path.lower().endswith(('.jpg', '.jpeg')):
            eoi = b'\xff\xd9'
            idx = data.rfind(eoi)
            if idx != -1:
                extra_bytes = len(data) - (idx + 2)
                # Lowered threshold: > 5 bytes is suspicious for stego
                if extra_bytes > 5:
                    warnings.append(f"CRITICAL: {extra_bytes} hidden bytes detected after JPEG EOF. Potential Payload.")
        
        # PNG EOF Check
        elif image_path.lower().endswith('.png'):
            iend = b'IEND'
            idx = data.rfind(iend)
            if idx != -1:
                # IEND is 4 bytes + 4 CRC = 8 bytes
                extra_bytes = len(data) - (idx + 8)
                if extra_bytes > 5:
                    warnings.append(f"CRITICAL: {extra_bytes} hidden bytes detected after PNG terminator. Potential Payload.")

    except Exception:
        pass
    
    return warnings

def scan_sensitive_data(image_path):
    try:
        img = cv2.imread(image_path)
        if img is None: return [], "Image load error"

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
        text = pytesseract.image_to_string(gray)
        
        patterns = {
            "Email": r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
            "IP": r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b',
            "Phone": r'\b(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})\b',
            "Card/ID": r'\b(?:\d[ -]*?){13,16}\b',
            "Crypto Addr": r'\b(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}\b'
        }
        
        findings = []
        for p_name, p_regex in patterns.items():
            matches = re.findall(p_regex, text)
            if matches:
                clean_matches = [m[0] if isinstance(m, tuple) else m for m in matches]
                findings.append(f"Found {p_name}: {', '.join(clean_matches[:3])}...")
        return findings, text
    except:
        return [], ""

def analyze_metadata(image_path):
    try:
        with open(image_path, 'rb') as f:
            tags = exifread.process_file(f)
        
        suspicious_tags = []
        has_camera_data = False
        
        # Check for Software signatures
        software_sig = str(tags.get('Image Software', ''))
        keywords = ['Adobe', 'GIMP', 'Photoshop', 'Lavc', 'Paint', 'Editor', 'Canva']
        for k in keywords:
            if k.lower() in software_sig.lower():
                suspicious_tags.append(f"Software Signature: {software_sig}")

        # Check for Camera Hardware Data (Valid photos usually have this)
        if 'Image Make' in tags or 'Image Model' in tags:
            has_camera_data = True
        
        clean_tags = {}
        for k, v in tags.items():
            if k not in ['JPEGThumbnail', 'TIFFThumbnail', 'Filename', 'EXIF MakerNote']:
                clean_tags[k] = str(v)
                
        return clean_tags, suspicious_tags, has_camera_data
    except Exception:
        return {}, [], False

def get_verdict(mean_diff, std_dev, suspicious_tags, pii_findings, integrity_warnings, has_camera_data, is_jpeg):
    score = 0
    reasons = []

    # 1. Integrity (Highest Priority)
    if integrity_warnings:
        score += 5
        reasons.extend(integrity_warnings)

    # 2. Metadata / AI Detection
    if suspicious_tags:
        score += 3
        reasons.extend(suspicious_tags)
    
    # If it's a JPEG (common photo format) but lacks camera info -> Suspect AI/Synthetic
    if is_jpeg and not has_camera_data:
        score += 2
        reasons.append("Missing Camera Data (Make/Model). Possible AI Generation or Metadata Stripping.")

    # 3. ELA Analysis (Tuned Thresholds)
    # AI images often have unnaturally low variance (very smooth/uniform noise)
    if mean_diff < 2.5 and std_dev < 2.0:
        score += 2
        reasons.append(f"Unnatural ELA Uniformity (Mean:{mean_diff:.2f}, Std:{std_dev:.2f}). Possible Synthetic/AI.")
    
    # Edited images often have high noise in specific areas
    elif mean_diff > 20 or std_dev > 10:
        score += 2
        reasons.append(f"High Compression Artifacts (Mean:{mean_diff:.2f}). Possible Manipulation.")

    # 4. PII
    if pii_findings:
        score += 2
        reasons.append("Sensitive PII exposed.")

    if score >= 4:
        return "CRITICAL RISK", "#ff0000", reasons
    elif score >= 2:
        return "SUSPICIOUS / EDITED", "#ffaa33", reasons
    else:
        return "CLEAN / ORIGINAL", "#00ff41", ["No obvious signatures detected."]

def pil_to_base64(pil_img):
    if pil_img is None: return ""
    img_io = io.BytesIO()
    pil_img.save(img_io, 'PNG')
    img_io.seek(0)
    return base64.b64encode(img_io.getvalue()).decode('utf-8')

# --- ROUTES ---

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        if 'file' not in request.files:
            return redirect(request.url)
        
        file = request.files['file']
        if file.filename == '':
            return redirect(request.url)

        if file:
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            is_jpeg = filename.lower().endswith(('.jpg', '.jpeg'))

            # 1. ELA
            ela_img, mean_diff, std_dev = perform_ela(filepath)
            ela_b64 = pil_to_base64(ela_img)
            
            # 2. Histogram
            hist_img = generate_histogram(filepath)
            hist_b64 = pil_to_base64(hist_img)

            # 3. Metadata
            exif_tags, sus_tags, has_camera_data = analyze_metadata(filepath)

            # 4. Sensitive Data
            pii_findings, ocr_text = scan_sensitive_data(filepath)
            
            # 5. Integrity
            integrity_warnings = check_integrity(filepath)

            # 6. Verdict
            verdict_text, verdict_color, reasons = get_verdict(
                mean_diff, std_dev, sus_tags, pii_findings, 
                integrity_warnings, has_camera_data, is_jpeg
            )

            # Original Image
            with open(filepath, "rb") as image_file:
                original_b64 = base64.b64encode(image_file.read()).decode('utf-8')

            return render_template('index.html', 
                                   analyzed=True,
                                   original_b64=original_b64,
                                   ela_b64=ela_b64,
                                   hist_b64=hist_b64,
                                   verdict=verdict_text,
                                   verdict_color=verdict_color,
                                   reasons=reasons,
                                   exif=exif_tags,
                                   pii=pii_findings,
                                   ocr_snippet=ocr_text[:500])

    return render_template('index.html', analyzed=False)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7860, debug=False)