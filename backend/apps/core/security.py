"""
Security utilities for SkillBloom
- HTML sanitization
- URL validation
- File validation
- Input sanitization
"""

import logging
import uuid
from urllib.parse import urlparse

import bleach
from django.conf import settings
from PIL import Image

logger = logging.getLogger("django.security")


def sanitize_html(html_content, allowed_tags=None, allowed_attributes=None):
    """
    Sanitize HTML content to prevent XSS attacks.
    
    Args:
        html_content (str): Raw HTML content
        allowed_tags (list): Whitelist of allowed HTML tags
        allowed_attributes (dict): Whitelist of allowed HTML attributes
    
    Returns:
        str: Sanitized HTML content
    
    Security:
        - Removes all scripts, event handlers, and dangerous content
        - Only allows whitelisted tags and attributes
        - Escapes dangerous URL protocols (javascript:, data:, etc.)
    """
    if not html_content:
        return ""
    
    if allowed_tags is None:
        allowed_tags = getattr(settings, "ALLOWED_HTML_TAGS", [
            "p", "br", "strong", "em", "u", "a", "ul", "ol", "li",
            "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "code", "pre",
            "img", "table", "thead", "tbody", "tr", "th", "td", "hr",
        ])
    
    if allowed_attributes is None:
        allowed_attributes = getattr(settings, "ALLOWED_HTML_ATTRIBUTES", {
            "a": ["href", "title"],
            "img": ["src", "alt", "title", "width", "height"],
        })
    
    # Sanitize using bleach library
    cleaned = bleach.clean(
        html_content,
        tags=allowed_tags,
        attributes=allowed_attributes,
        protocols=getattr(settings, "ALLOWED_URL_PROTOCOLS", ["http", "https"]),
        strip=True,  # Strip disallowed tags
    )
    
    logger.info("HTML content sanitized")
    return cleaned


def validate_url(url):
    """
    Validate URL to ensure it's safe.
    
    Args:
        url (str): URL to validate
    
    Returns:
        bool: True if URL is valid and safe
    
    Security:
        - Only allows http and https protocols
        - Rejects javascript:, data:, and other dangerous protocols
    """
    if not url:
        return False
    
    try:
        parsed = urlparse(url)
        allowed_protocols = getattr(settings, "ALLOWED_URL_PROTOCOLS", ["http", "https"])
        
        if parsed.scheme not in allowed_protocols:
            logger.warning(f"URL validation failed: Unsafe protocol '{parsed.scheme}' in URL")
            return False
        
        return True
    except Exception as e:
        logger.warning(f"URL validation error: {str(e)}")
        return False


def validate_file_upload(file_obj, allowed_extensions=None, max_size=None):
    """
    Validate file upload for security.
    
    Args:
        file_obj: Uploaded file object
        allowed_extensions (list): Allowed file extensions
        max_size (int): Maximum file size in bytes
    
    Returns:
        tuple: (is_valid, error_message)
    
    Security:
        - Validates file extension
        - Validates file size
        - Validates MIME type
        - Prevents path traversal via filename
    """
    if not file_obj:
        return False, "No file provided"
    
    if allowed_extensions is None:
        allowed_extensions = getattr(settings, "ALLOWED_FILE_EXTENSIONS", 
                                    ["jpg", "jpeg", "png", "gif", "webp", "pdf"])
    
    if max_size is None:
        max_size = getattr(settings, "MAX_FILE_SIZE", 10 * 1024 * 1024)  # 10MB default
    
    # Check file size
    if file_obj.size > max_size:
        logger.warning(f"File upload rejected: Size {file_obj.size} exceeds limit {max_size}")
        return False, f"File size exceeds limit of {max_size / (1024*1024):.1f}MB"
    
    # Check file extension and reject path components before storage.
    filename = str(file_obj.name or "").lower()
    file_ext = filename.rsplit(".", 1)[-1] if "." in filename else ""
    
    if file_ext not in allowed_extensions:
        logger.warning(f"File upload rejected: Extension '.{file_ext}' not allowed")
        return False, f"File type '.{file_ext}' not allowed"
    
    # Check for path traversal attempts in filename.
    if "/" in filename or "\\" in filename or ".." in filename:
        logger.warning(f"File upload rejected: Path traversal attempt detected in filename")
        return False, "Invalid filename: path traversal attempt detected"

    allowed_mime_types = {
        "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
        "gif": "image/gif", "webp": "image/webp", "pdf": "application/pdf",
        "doc": "application/msword", "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "xls": "application/vnd.ms-excel", "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
    content_type = getattr(file_obj, "content_type", None)
    expected_type = allowed_mime_types.get(file_ext)
    if content_type and expected_type and content_type != expected_type:
        logger.warning(f"File upload rejected: MIME type '{content_type}' does not match '.{file_ext}'")
        return False, "File content type does not match its extension"

    # Verify image signatures instead of trusting the filename or MIME header.
    if file_ext in {"jpg", "jpeg", "png", "gif", "webp"}:
        try:
            file_obj.seek(0)
            with Image.open(file_obj) as image:
                image.verify()
            file_obj.seek(0)
        except (OSError, ValueError):
            logger.warning(f"File upload rejected: Invalid image content for '{filename}'")
            return False, "Uploaded file is not a valid image"
    elif file_ext == "pdf":
        file_obj.seek(0)
        signature = file_obj.read(5)
        file_obj.seek(0)
        if signature != b"%PDF-":
            logger.warning(f"File upload rejected: Invalid PDF content for '{filename}'")
            return False, "Uploaded file is not a valid PDF"
    
    logger.info(f"File upload validated: {filename}")
    return True, ""


def sanitize_filename(filename):
    """
    Sanitize filename to be safe for storage.
    
    Args:
        filename (str): Original filename
    
    Returns:
        str: Sanitized filename
    """
    import re
    # Remove any non-alphanumeric characters except dots and dashes
    sanitized = re.sub(r"[^a-zA-Z0-9.-]", "_", filename)
    # Remove path separators
    sanitized = sanitized.replace("/", "").replace("\\", "")
    # Limit length
    if len(sanitized) > 255:
        name, ext = sanitized.rsplit(".", 1) if "." in sanitized else (sanitized, "")
        sanitized = name[:250] + ("." + ext if ext else "")
    return sanitized


def safe_upload_filename(filename):
    """Return a collision-resistant filename without user-controlled path data."""
    sanitized = sanitize_filename(filename)
    extension = sanitized.rsplit(".", 1)[-1].lower() if "." in sanitized else "bin"
    return f"{uuid.uuid4().hex}.{extension}"


def sanitize_input(user_input, max_length=None):
    """
    Basic input sanitization.
    
    Args:
        user_input (str): User input to sanitize
        max_length (int): Maximum allowed length
    
    Returns:
        str: Sanitized input
    """
    if not user_input:
        return ""
    
    # Convert to string and strip whitespace
    sanitized = str(user_input).strip()
    
    # Enforce max length
    if max_length and len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
    
    return sanitized
