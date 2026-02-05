# Use a lightweight Python base image
FROM python:3.10-slim

# Set up a new user named "user" with user ID 1000
RUN useradd -m -u 1000 user

# Set working directory to the user's home directory
# Note: This creates the directory as root initially
WORKDIR /home/user/app

# Install system dependencies required for image processing tools
RUN apt-get update && apt-get install -y \
    libgomp1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Set Environment Variables
ENV U2NET_HOME=/home/user/app/.u2net \
    PYTHONUNBUFFERED=1 \
    PATH="/home/user/.local/bin:$PATH"

# Copy requirements first to leverage Docker cache
COPY --chown=user requirements.txt .

# --- CRITICAL FIX: Fix ownership before switching user ---
# Since WORKDIR created the folder as root, we must give ownership to 'user'
RUN chown -R user:user /home/user

# Switch to the "user" user
USER user

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Pre-download the AI Model
# This should now work because 'user' owns /home/user/app
RUN mkdir -p $U2NET_HOME && \
    python -c "from rembg import new_session; new_session('u2net')"

# Copy the rest of the application setting the owner to the user
COPY --chown=user . .

# Expose the port Hugging Face Spaces expects
EXPOSE 7860

# Run the application with Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "--timeout", "600", "app:app"]
