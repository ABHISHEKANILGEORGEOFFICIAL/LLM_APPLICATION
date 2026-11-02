import os
import hashlib
from typing import Tuple

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".pptx", ".txt"}
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50MB

def validate_uploaded_file(filename: str, content: bytes) -> Tuple[bool, str, str]:
    """
    Validates file extension and size.
    Returns (is_valid, file_type, error_message)
    """
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False, "", f"Unsupported file type '{ext}'. Allowed types: PDF, DOCX, PPTX, TXT."
    
    if len(content) > MAX_FILE_SIZE_BYTES:
        return False, "", "File size exceeds the 50MB limit."
    
    if len(content) == 0:
        return False, "", "File is empty."

    file_type = ext.replace(".", "")
    return True, file_type, ""

def compute_sha256(content: bytes) -> str:
    """Computes SHA256 hash of file content to prevent duplicates."""
    return hashlib.sha256(content).hexdigest()
