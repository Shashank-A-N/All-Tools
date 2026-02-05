import cv2
import numpy as np
from PIL import Image, ExifTags
import io

class ForensicAnalyzer:
    def __init__(self):
        pass

    def _convert_to_cv2(self, pil_image: Image.Image) -> np.ndarray:
        """Converts a PIL image to OpenCV format (BGR)."""
        return cv2.cvtColor(np.array(pil_image.convert("RGB")), cv2.COLOR_RGB2BGR)

    def _convert_to_pil(self, cv2_image: np.ndarray) -> Image.Image:
        """Converts an OpenCV image (BGR) back to PIL."""
        return Image.fromarray(cv2.cvtColor(cv2_image, cv2.COLOR_BGR2RGB))

    def error_level_analysis(self, image_bytes: bytes, quality: int = 90, scale: int = 15) -> Image.Image:
        """
        Performs Error Level Analysis (ELA).
        1. Resaves the original image at a specific JPEG quality.
        2. Computes the absolute difference between the original and the resaved image.
        3. Scales the difference to make it visible.
        
        High contrast areas in the result indicate different compression levels (potential manipulation).
        """
        original = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Buffer for the re-compressed image
        buffer = io.BytesIO()
        original.save(buffer, "JPEG", quality=quality)
        buffer.seek(0)
        resaved = Image.open(buffer)

        # Calculate difference
        # Fast pixel access via numpy (constraint: <2s latency)
        orig_arr = np.array(original).astype(np.float32)
        resaved_arr = np.array(resaved).astype(np.float32)
        
        diff = np.abs(orig_arr - resaved_arr)
        
        # Scale the difference to enhance visibility of artifacts
        diff = diff * scale
        diff = np.clip(diff, 0, 255).astype(np.uint8)
        
        return Image.fromarray(diff)

    def noise_variance_analysis(self, pil_image: Image.Image) -> Image.Image:
        """
        Detects local noise variance inconsistencies.
        Spliced regions often have different noise fingerprints than the background.
        
        Method:
        1. Convert to Grayscale.
        2. Apply Laplacian to suppress structure and isolate high-frequency noise.
        3. Compute local variance using box filters.
        """
        img_cv = self._convert_to_cv2(pil_image)
        gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)

        # 1. Estimate Noise (High pass filter)
        # Laplacian highlights edges and noise
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        
        # 2. Compute Local Variance
        # Var(X) = E[X^2] - (E[X])^2
        # We use a localized window (e.g., 5x5) to compute expected values
        win_size = (5, 5)
        
        sigma = laplacian
        sigma2 = sigma ** 2
        
        # E[X]
        mu = cv2.blur(sigma, win_size)
        # E[X^2]
        mu2 = cv2.blur(sigma2, win_size)
        
        # Variance = E[X^2] - (E[X])^2
        variance = mu2 - mu**2
        
        # Normalize for visualization
        # Apply absolute value to handle float inaccuracies and sqrt for standard deviation look
        variance = np.abs(variance)
        variance = np.sqrt(variance)
        
        # Contrast stretching
        v_min, v_max = variance.min(), variance.max()
        if v_max - v_min > 0:
            variance_norm = (variance - v_min) / (v_max - v_min) * 255
        else:
            variance_norm = variance
            
        variance_map = variance_norm.astype(np.uint8)
        
        # Apply a colormap (JET is standard for heatmaps)
        heatmap = cv2.applyColorMap(variance_map, cv2.COLORMAP_JET)
        
        return self._convert_to_pil(heatmap)

    def luminance_gradient_analysis(self, pil_image: Image.Image) -> Image.Image:
        """
        Analyzes lighting direction consistency.
        Uses Sobel operators on the L channel (LAB color space) to map gradients.
        """
        img_cv = self._convert_to_cv2(pil_image)
        
        # Convert to LAB to isolate Luminance
        lab = cv2.cvtColor(img_cv, cv2.COLOR_BGR2LAB)
        l_channel, _, _ = cv2.split(lab)
        
        # Sobel Gradients
        sobelx = cv2.Sobel(l_channel, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(l_channel, cv2.CV_64F, 0, 1, ksize=3)
        
        # Calculate gradient magnitude
        magnitude = np.sqrt(sobelx**2 + sobely**2)
        
        # Normalize
        m_min, m_max = magnitude.min(), magnitude.max()
        if m_max - m_min > 0:
            magnitude = (magnitude - m_min) / (m_max - m_min) * 255
        
        magnitude = magnitude.astype(np.uint8)
        
        # Invert (Make edges dark, flat areas light? Or vice versa. Standard is white edges)
        # Let's keep white edges, but maybe color map it for 'science' feel
        heatmap = cv2.applyColorMap(magnitude, cv2.COLORMAP_INFERNO)
        
        return self._convert_to_pil(heatmap)

    def extract_metadata(self, pil_image: Image.Image) -> dict:
        """
        Extracts EXIF data, specifically looking for editing software signatures.
        """
        data = {
            "format": pil_image.format,
            "size": pil_image.size,
            "mode": pil_image.mode,
            "software_signature": None,
            "gps_found": False,
            "raw_exif": {}
        }
        
        try:
            exif = pil_image._getexif()
            if exif:
                for tag, value in exif.items():
                    tag_name = ExifTags.TAGS.get(tag, tag)
                    
                    # Convert bytes to string if needed for JSON serialization
                    if isinstance(value, bytes):
                        try:
                            value = value.decode()
                        except:
                            value = str(value)
                            
                    data["raw_exif"][str(tag_name)] = str(value)
                    
                    if tag_name == "Software":
                        data["software_signature"] = value
                    if tag_name == "GPSInfo":
                        data["gps_found"] = True

        except Exception as e:
            data["error"] = str(e)
            
        return data