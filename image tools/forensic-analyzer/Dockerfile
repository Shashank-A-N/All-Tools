FROM python:3.9-slim

# Prevent Python from writing pyc files and buffering stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies for Tesseract OCR and OpenCV
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create uploads folder and set permissions (Crucial for HF Spaces)
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

# Expose the Hugging Face default port
EXPOSE 7860

# Run the application on port 7860
CMD ["python", "app.py"]