# Use Python 3.11 slim image
FROM python:3.11-slim

# 1. Install system dependencies (FFmpeg is required)
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 2. Set working directory
WORKDIR /app

# 3. Copy requirements first (better caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copy ALL files from root to /app
COPY . .

# 5. Create temp directory and set permissions
# Critical: chmod 777 ensures the app can write files even if HF changes the user ID
RUN mkdir -p temp_videos && chmod 777 temp_videos

# 6. Expose the port (Hugging Face expects 7860)
EXPOSE 7860

# 7. Start the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]