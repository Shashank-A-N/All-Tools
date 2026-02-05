# Use a lightweight Python base
FROM python:3.9-slim

# Install system dependencies
# git is required for whisper to install directly from repo if needed
# ffmpeg is STRICTLY required for audio processing
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose the Flask port
EXPOSE 5000

# Run with Gunicorn for production-like performance
CMD ["python", "app.py"]