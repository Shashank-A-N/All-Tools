import os
import uuid
import subprocess
import shutil
from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("temp_videos")
UPLOAD_DIR.mkdir(exist_ok=True)

def cleanup_files(*filepaths):
    """Deletes temporary files after the response is sent."""
    for path in filepaths:
        try:
            if os.path.exists(path):
                os.remove(path)
        except Exception as e:
            print(f"Error cleaning up {path}: {e}")

@app.get("/", response_class=HTMLResponse)
async def read_index():
    """Serves the frontend HTML file."""
    return FileResponse('index.html')

# CRITICAL FIX: Changed 'async def' to standard 'def'.
# This runs the blocking FFmpeg process in a thread pool, preventing
# the server from freezing and causing 'BodyStreamBuffer' errors.
@app.post("/compress")
def compress_video(
    background_tasks: BackgroundTasks,
    video: UploadFile = File(...),
    crf: int = Form(28),
    preset: str = Form("superfast"), # Changed default to superfast to avoid timeouts
    width: str = Form("-2")
):
    job_id = str(uuid.uuid4())
    input_path = UPLOAD_DIR / f"{job_id}_in_{video.filename}"
    output_path = UPLOAD_DIR / f"{job_id}_out.mp4"

    try:
        with input_path.open("wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save upload: {e}")

    # Build FFmpeg command optimized for web/WhatsApp
    command = [
        "ffmpeg", "-i", str(input_path),
        "-vcodec", "libx264",
        "-crf", str(crf),
        "-preset", preset,
        "-vf", f"scale={width}:720",
        "-acodec", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
        "-y", str(output_path)
    ]

    try:
        # We redirect stderr to DEVNULL or capture it. 
        # Using capture_output=True allows us to debug if it fails.
        process = subprocess.run(command, capture_output=True, text=True)
        
        if process.returncode != 0:
            cleanup_files(input_path, output_path)
            # Log the specific error from FFmpeg for debugging
            print(f"FFmpeg Error: {process.stderr}")
            raise HTTPException(status_code=500, detail="Video processing failed. The file might be corrupt or incompatible.")

        background_tasks.add_task(cleanup_files, input_path, output_path)

        return FileResponse(
            path=output_path,
            filename=f"compressed_{video.filename.split('.')[0]}.mp4",
            media_type="video/mp4"
        )

    except Exception as e:
        cleanup_files(input_path)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Hugging Face Spaces use port 7860.
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)