import os
import json
import tempfile
from io import BytesIO
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional, Union
from pdfminer.high_level import extract_text
import requests
import threading
import time

import cv2
import numpy as np
from flask import Flask, request, jsonify
from paddleocr import PaddleOCR
from PIL import Image

# -----------------------------------------------------------------------------
# Try to import parse_sds_pdf from the local module. Provide a fallback path if
# the service is started from project root.
# -----------------------------------------------------------------------------
try:
    from parse_sds import parse_sds_pdf  # when running inside ocr_service
except Exception:
    try:
        # Fallback if app is executed from project root and ocr_service is a pkg
        from ocr_service.parse_sds import parse_sds_pdf  # type: ignore
    except Exception as e:
        parse_sds_pdf = None  # will be checked before use
        _import_err = e

# Also import the new SDS extractor directly for the HTTP endpoint
try:
    from sds_parser_new.sds_extractor import parse_pdf as parse_pdf_direct
except Exception as e:
    parse_pdf_direct = None
    _direct_import_err = e

# -----------------------------------------------------------------------------
# Environment & global config
# -----------------------------------------------------------------------------
os.environ.setdefault("CUDA_VISIBLE_DEVICES", "0")
os.environ.setdefault("FLAGS_log_dir", tempfile.gettempdir())

app = Flask(__name__)
# Debug image dumping via env var or ?mode=debug
DEBUG_IMAGES_ENV = os.getenv("DEBUG_IMAGES", "0") == "1"
DEBUG_DIR = Path("debug_images")
DEBUG_DIR.mkdir(exist_ok=True)

# -----------------------------------------------------------------------------
# Cross-platform timeout utility
# -----------------------------------------------------------------------------
class TimeoutError(Exception):
    pass

def run_with_timeout(func, args=(), kwargs=None, timeout=120):
    """
    Run a function with a timeout. Cross-platform alternative to signal.alarm.
    """
    if kwargs is None:
        kwargs = {}
    
    result: List[Any] = [None]
    exception: List[Optional[Exception]] = [None]
    
    def target():
        try:
            result[0] = func(*args, **kwargs)
        except Exception as e:
            exception[0] = e
    
    thread = threading.Thread(target=target)
    thread.daemon = True
    thread.start()
    thread.join(timeout)
    
    if thread.is_alive():
        # Note: We can't forcibly kill the thread in Python, but we can ignore its result
        raise TimeoutError("Function execution timeout")
    
    if exception[0]:
        raise exception[0]
    
    return result[0]

# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
def box_area(box: List[List[float]] | np.ndarray) -> float:
    pts = np.asarray(box, dtype=np.float32).reshape(-1, 2)
    if pts.shape[0] < 3:
        _, _, w, h = cv2.boundingRect(pts.astype(np.int32))
        return float(w * h)
    return float(cv2.contourArea(pts))


def box_origin(box: List[List[float]] | np.ndarray) -> Tuple[float, float]:
    pts = np.asarray(box, dtype=np.float32).reshape(-1, 2)
    return float(pts[:, 0].min()), float(pts[:, 1].min())


def resize_to_max_side(img: Image.Image, max_side: int) -> Image.Image:
    w, h = img.size
    scale = min(max_side / w, max_side / h, 1.0)
    new_w, new_h = int(w * scale), int(h * scale)
    return img.resize((new_w, new_h))


def pil_to_cv(img: Image.Image) -> np.ndarray:
    arr = np.array(img.convert("RGB"))
    return cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)


def preprocess_array(img: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)
    return cv2.cvtColor(enhanced, cv2.COLOR_GRAY2BGR)

# -----------------------------------------------------------------------------
# Initialize OCR model
# -----------------------------------------------------------------------------
try:
    ocr_model = PaddleOCR(
        lang="en",
        det_model_dir=None,
        rec_model_dir=None,
        use_angle_cls=True,
    )
except Exception as e:
    raise RuntimeError(f"Failed to initialize PaddleOCR: {e}")

# -----------------------------------------------------------------------------
# Health check
# -----------------------------------------------------------------------------
@app.route("/gpu-check")
def gpu_check():
    import paddle

    compiled = getattr(paddle, "is_compiled_with_cuda", lambda: False)()
    try:
        count = paddle.device.cuda.device_count()
    except Exception:
        count = 0
    return jsonify({"cuda_compiled": compiled, "device_count": count})

# -----------------------------------------------------------------------------
# OCR endpoint
# -----------------------------------------------------------------------------
@app.route('/ocr', methods=['POST'])
def ocr():
    print("[OCR] Form keys:", list(request.form.keys()), "Files:", list(request.files.keys()))

    file = request.files.get('image')
    if not file:
        return jsonify({'error': 'No image uploaded'}), 400

    try:
        left = int(request.form.get('left', 0))
        top = int(request.form.get('top', 0))
        width = int(request.form.get('width', 0))
        height = int(request.form.get('height', 0))
    except ValueError:
        left = top = width = height = 0

    if width == 0 and height == 0 and 'crop' in request.form:
        try:
            c = json.loads(request.form['crop'])
            left = int(c.get('left', 0))
            top = int(c.get('top', 0))
            width = int(c.get('width', 0))
            height = int(c.get('height', 0))
        except Exception:
            left = top = width = height = 0

    debug_mode = request.args.get('mode') == 'debug'
    save_images = DEBUG_IMAGES_ENV or debug_mode
    tag = datetime.utcnow().strftime('%Y%m%dT%H%M%S_%f')

    try:
        img_stream = BytesIO(file.read())
        full = Image.open(img_stream)
        print(f"[OCR] Image loaded: {full.size}, mode: {full.mode}")
        
        # Validate image
        if full.size[0] * full.size[1] > 50_000_000:  # 50 megapixels
            return jsonify({'error': 'Image too large (over 50 megapixels)'}), 400
            
        if save_images:
            full_path = DEBUG_DIR / f"{tag}_full.jpg"
            full.save(full_path)
            print(f"[OCR] Saved full image to {full_path}")
    except Exception as e:
        print(f"[OCR] Image loading error: {type(e).__name__}: {str(e)}")
        return jsonify({'error': f'Failed to load image: {str(e)}'}), 400

    try:
        screen_w = float(request.form.get('screenWidth', 0))
        screen_h = float(request.form.get('screenHeight', 0))
    except ValueError as e:
        print(f"[OCR] Screen dimension error: {e}")
        screen_w = screen_h = 0.0
    sx = full.width / screen_w if screen_w > 0 else 1.0
    sy = full.height / screen_h if screen_h > 0 else 1.0
    print(f"[OCR] Scale factors: sx={sx:.2f}, sy={sy:.2f}")

    try:
        if width > 0 and height > 0:
            l = int(left * sx)
            t = int(top * sy)
            w = int(width * sx)
            h = int(height * sy)
            print(f"[OCR] Cropping: ({l}, {t}, {l + w}, {t + h})")
            
            # Validate crop bounds
            if l < 0 or t < 0 or l + w > full.width or t + h > full.height:
                print(f"[OCR] Crop bounds exceed image: crop=({l},{t},{l+w},{t+h}), image={full.size}")
                return jsonify({'error': 'Crop region exceeds image bounds'}), 400
                
            roi = full.crop((l, t, l + w, t + h))
        else:
            roi = full
            
        print(f"[OCR] ROI size: {roi.size}")
        
        if save_images:
            crop_path = DEBUG_DIR / f"{tag}_crop.jpg"
            roi.save(crop_path)
    except Exception as e:
        print(f"[OCR] Cropping error: {type(e).__name__}: {str(e)}")
        return jsonify({'error': f'Image cropping failed: {str(e)}'}), 400

    try:
        scaled = resize_to_max_side(roi, max_side=4000)
        print(f"[OCR] Scaled size: {scaled.size}")
        
        if save_images:
            scaled_path = DEBUG_DIR / f"{tag}_scaled.jpg"
            scaled.save(scaled_path)
    except Exception as e:
        print(f"[OCR] Scaling error: {type(e).__name__}: {str(e)}")
        return jsonify({'error': f'Image scaling failed: {str(e)}'}), 400

    try:
        proc = preprocess_array(pil_to_cv(scaled))
        print(f"[OCR] Preprocessed shape: {proc.shape}")
        
        # Validate processed image
        if proc is None or proc.size == 0:
            return jsonify({'error': 'Image preprocessing resulted in empty image'}), 400
            
        if save_images:
            proc_path = DEBUG_DIR / f"{tag}_proc.jpg"
            cv2.imwrite(str(proc_path), proc)
    except Exception as e:
        print(f"[OCR] Preprocessing error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Image preprocessing failed: {str(e)}'}), 400

    try:
        result = run_with_timeout(ocr_model.predict, args=(proc,), timeout=120)
    except TimeoutError:
        return jsonify({'error': 'OCR processing timeout'}), 500
    except Exception as e:
        print(f"[OCR] Detailed error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'OCR failed: {type(e).__name__}: {str(e)}'}), 500

    lines: List[Dict[str, Any]] = []
    text_parts: List[str] = []

    if isinstance(result, list) and len(result) > 0 and isinstance(result[0], dict):
        ocr_out = result[0]
        texts = ocr_out.get('rec_texts', [])
        scores = ocr_out.get('rec_scores', [])
        boxes = ocr_out.get('rec_boxes', [])
        for txt, score, box in zip(texts, scores, boxes):
            lines.append({
                "text": txt,
                "confidence": float(score),
                "box": box.tolist() if hasattr(box, 'tolist') else [list(map(float, pt)) for pt in box]
            })
            text_parts.append(txt)
    else:
        for block in result:
            if not block:
                continue
            for entry in block:
                try:
                    box = entry[0]
                    txt = entry[1][0]
                    score = entry[1][1]
                except Exception:
                    continue
                lines.append({
                    "text": txt,
                    "confidence": float(score),
                    "box": [list(map(float, pt)) for pt in box]
                })
                text_parts.append(txt)

    text = "\n".join(text_parts)
    resp = {'lines': lines, 'text': text}
    if save_images or debug_mode:
        resp['debug'] = {'tag': tag, 'saved_images': save_images}

    return jsonify(resp), 200

# -----------------------------------------------------------------------------
# PDF SDS Verification Endpoint
# -----------------------------------------------------------------------------

def verify_pdf_sds(url: str, product_name: str, keywords=None) -> bool:
    # Comprehensive SDS keyword list - removed product name requirement entirely
    keywords = keywords or [
        # Core SDS Terms
        "SDS", "MSDS", "Safety Data Sheet", "Material Safety Data Sheet",
        "Product Safety Data Sheet", "Chemical Safety Data Sheet",
        "Hazard Communication", "GHS",
        
        # Standard SDS Section Headers
        "Product Identification", "Hazard Identification", "Composition",
        "First Aid Measures", "Fire Fighting Measures", "Accidental Release",
        "Handling and Storage", "Exposure Controls", "Physical and Chemical Properties",
        "Stability and Reactivity", "Toxicological Information", "Ecological Information",
        "Disposal Considerations", "Transport Information", "Regulatory Information",
        
        # Format Indicators
        "UN Number", "CAS Number", "Dangerous Goods", "Hazard Class",
        "Packing Group", "Signal Word", "Hazard Statement", "Precautionary Statement",
        
        # Section numbering (SDS documents have numbered sections 1-16)
        "Section 1", "Section 2", "Section 3", "Section 4", "Section 5"
    ]
    
    try:
        # Use streaming and size limits to prevent massive downloads
        response = requests.get(url, timeout=30, stream=True)
        response.raise_for_status()
        
        # Check content-type header first
        content_type = response.headers.get('content-type', '').lower()
        if 'pdf' not in content_type:
            print(f"[verify_pdf_sds] Not a PDF: {content_type}")
            return False
        
        # Limit download size to 50MB max
        max_size = 50 * 1024 * 1024  # 50MB
        content = BytesIO()
        size = 0
        
        print(f"[verify_pdf_sds] Starting PDF download with {max_size // (1024*1024)}MB limit...")
        
        for chunk in response.iter_content(chunk_size=8192):
            size += len(chunk)
            if size > max_size:
                print(f"[verify_pdf_sds] PDF too large: {size} bytes")
                return False
            content.write(chunk)
            
            # Log progress every 5MB
            if size % (5 * 1024 * 1024) == 0:
                print(f"[verify_pdf_sds] Downloaded {size // (1024*1024)}MB...")
        
        print(f"[verify_pdf_sds] Download complete: {size} bytes")
        content.seek(0)
        
        # Extract text with timeout protection - check more pages for better coverage
        print(f"[verify_pdf_sds] Extracting text from PDF (max 10 pages)...")
        text = extract_text(content, maxpages=10).lower()  # Increased from 5 to 10 pages
        print(f"[verify_pdf_sds] Extracted {len(text)} characters of text")
        
        # Score-based keyword matching - no product name requirement
        print(f"[verify_pdf_sds] Checking for SDS keywords in extracted text...")
        keyword_matches = sum(1 for kw in keywords if kw.lower() in text)
        
        print(f"[verify_pdf_sds] Found keyword matches: {keyword_matches}/{len(keywords)}")
        
        # Log some of the matched keywords for debugging
        matched_keywords = [kw for kw in keywords if kw.lower() in text]
        print(f"[verify_pdf_sds] Matched keywords: {matched_keywords[:10]}...")  # Show first 10
        
        # Require at least 2 keyword matches to be considered a valid SDS
        # This is much more reliable than product name matching
        is_valid_sds = keyword_matches >= 2
        
        print(f"[verify_pdf_sds] URL: {url[:100]}... Keyword matches: {keyword_matches}//{len(keywords)} - Valid SDS: {is_valid_sds}")
        return is_valid_sds
        
    except Exception as e:
        print(f"[verify_pdf_sds] Failed to verify {url}: {type(e).__name__}: {e}")
        import traceback
        print(f"[verify_pdf_sds] Verification traceback: {traceback.format_exc()}")
        return False


@app.route('/verify-sds', methods=['POST'])
def verify_sds():
    data = request.json or {}
    url = data.get('url', '')
    name = data.get('name', '')
    
    print(f"[verify-sds] Endpoint called with URL: {url}")
    print(f"[verify-sds] Product name: {name}")
    
    if not url or not name:
        print(f"[verify-sds] Missing required parameters: url={bool(url)}, name={bool(name)}")
        return jsonify({'error': 'Missing url or name'}), 400

    try:
        print(f"[verify-sds] Starting verification with 120s timeout...")
        # Use cross-platform timeout protection
        verified = run_with_timeout(verify_pdf_sds, args=(url, name), timeout=120)
        print(f"[verify-sds] Verification complete: {verified}")
        return jsonify({'verified': verified}), 200
        
    except TimeoutError:
        print(f"[verify-sds] Verification timeout after 120s")
        return jsonify({'error': 'Verification timeout - PDF too large or slow to process'}), 408
    except Exception as e:
        print(f"[verify-sds] Verification exception: {type(e).__name__}: {e}")
        import traceback
        print(f"[verify-sds] Exception traceback: {traceback.format_exc()}")
        return jsonify({'error': f'Verification failed: {str(e)}'}), 500

# -----------------------------------------------------------------------------
# NEW: Parse SDS over HTTP (reuses parse_sds.parse_sds_pdf)
# -----------------------------------------------------------------------------
# -------------------------------------------------------------------------
# NEW: Parse SDS over HTTP (reuses parse_sds.parse_sds_pdf)
# -------------------------------------------------------------------------
@app.route('/parse-sds', methods=['POST'])
def parse_sds_http():
    """
    Body: { "product_id": 123, "pdf_url": "https://..." }
    Returns: Parsed fields suitable for upsert into sds_metadata.
    """
    print(f"[parse-sds] HTTP endpoint called")
    
    if parse_sds_pdf is None:
        # Avoid syntax errors by building string normally
        err_msg = f"parse_sds_pdf could not be imported: {_import_err}" if '_import_err' in globals() else "Unknown import error"
        print(f"[parse-sds] Import error: {err_msg}")
        return jsonify({"error": err_msg}), 500

    data = request.json or {}
    product_id = data.get("product_id")
    pdf_url = data.get("pdf_url")
    
    print(f"[parse-sds] Product ID: {product_id}")
    print(f"[parse-sds] PDF URL: {pdf_url}")

    if not product_id or not pdf_url:
        print(f"[parse-sds] Missing required parameters: product_id={bool(product_id)}, pdf_url={bool(pdf_url)}")
        return jsonify({"error": "Missing product_id or pdf_url"}), 400

    try:
        print(f"[parse-sds] Starting SDS parsing...")
        parsed = parse_sds_pdf(pdf_url, product_id=int(product_id))
        print(f"[parse-sds] Parsing complete")

        def _get(attr, default=None):
            if hasattr(parsed, attr):
                return getattr(parsed, attr)
            if isinstance(parsed, dict):
                return parsed.get(attr, default)
            return default

        return jsonify({
            "product_id": _get("product_id", int(product_id)),
            "vendor": _get("vendor"),
            "issue_date": _get("issue_date"),
            "hazardous_substance": _get("hazardous_substance"),
            "dangerous_good": _get("dangerous_good"),
            "dangerous_goods_class": _get("dangerous_goods_class"),
            "packing_group": _get("packing_group"),
            "subsidiary_risks": _get("subsidiary_risks"),
            "hazard_statements": _get("hazard_statements", []),
            "raw_json": _get("raw_json"),
        }), 200

    except Exception as e:
        print(f"[parse-sds] Parsing failed: {type(e).__name__}: {e}")
        import traceback
        print(f"[parse-sds] Exception traceback: {traceback.format_exc()}")
        return jsonify({"error": f"parse_sds failed: {e}"}), 500


# -----------------------------------------------------------------------------
# NEW: Direct PDF Parsing Endpoint (using improved parser)
# -----------------------------------------------------------------------------
@app.route('/parse-pdf-direct', methods=['POST'])
def parse_pdf_direct_http():
    """
    Parse PDF directly using the improved parser.
    Body: { "pdf_url": "https://...", "product_id": 123 }
    Returns: Raw parsed fields from the improved parser.
    """
    if parse_pdf_direct is None:
        err_msg = f"parse_pdf_direct could not be imported: {_direct_import_err}" if '_direct_import_err' in globals() else "Direct parser not available"
        return jsonify({"error": err_msg}), 500

    data = request.json or {}
    pdf_url = data.get("pdf_url")
    product_id = data.get("product_id")

    if not pdf_url:
        return jsonify({"error": "Missing pdf_url"}), 400

    try:
        # Download PDF to temporary file
        import tempfile
        import os
        from pathlib import Path
        
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp_file:
            response = requests.get(pdf_url, timeout=30, stream=True)
            response.raise_for_status()
            
            for chunk in response.iter_content(chunk_size=8192):
                tmp_file.write(chunk)
            
            tmp_path = Path(tmp_file.name)
        
        try:
            # Parse using the new parser
            parsed_result = parse_pdf_direct(tmp_path)
            
            # Clean up temporary file
            os.unlink(tmp_path)
            
            return jsonify({
                "success": True,
                "product_id": product_id,
                "parsed_data": parsed_result
            }), 200
            
        except Exception as parse_error:
            # Clean up temporary file on error
            if tmp_path.exists():
                os.unlink(tmp_path)
            raise parse_error
            
    except Exception as e:
        return jsonify({"error": f"PDF parsing failed: {e}"}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)