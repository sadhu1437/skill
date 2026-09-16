# SkillBloom Security Hardening - Implementation Guide

**Phase:** 2-7 Security Fixes  
**Status:** Partially Implemented (Critical fixes done, remaining fixes documented)  
**Timeline:** Complete before production deployment

---

## What Has Been Fixed (✅ Completed)

### 1. ✅ Django Security Settings Updated
- **File:** `backend/config/settings.py`
- **Changes:**
  - Added `SECURE_SSL_REDIRECT` - HTTPS enforcement
  - Added `SECURE_HSTS_SECONDS` - HSTS header
  - Added `SESSION_COOKIE_SECURE` - HTTPS-only sessions
  - Added `CSRF_COOKIE_SECURE` - HTTPS-only CSRF
  - Added `SESSION_COOKIE_SAMESITE = "Strict"`
  - Added `CSRF_COOKIE_SAMESITE = "Strict"`
  - Added `SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"`
  - Enhanced CORS configuration
  - Fixed CSRF_TRUSTED_ORIGINS logic
  - Added request size limits: `DATA_UPLOAD_MAX_MEMORY_SIZE`
  - Updated `AUTH_PASSWORD_VALIDATORS` - Min length 12 (increased from 10)
  - Added `SECURE_PROXY_SSL_HEADER` for reverse proxy
  - Added logging configuration with security logging
  - Added rate limiting: `DEFAULT_THROTTLE_RATES`

### 2. ✅ Security Utility Module Created
- **File:** `backend/apps/core/security.py`
- **Functions:**
  - `sanitize_html()` - Prevents XSS via HTML sanitization
  - `validate_url()` - Validates URLs (only http/https)
  - `validate_file_upload()` - File upload security
  - `sanitize_filename()` - Path traversal prevention
  - `sanitize_input()` - Input sanitization

### 3. ✅ Custom Permission Classes Created
- **File:** `backend/apps/core/permissions.py`
- **Classes:**
  - `IsAdminUserOrReadOnly` - Admin-only modifications
  - `IsAuthorOrAdmin` - Authors or admins can modify
  - `IsStaffUser` - Staff-only access
  - `IsAdminUser` - Admin with logging
  - `RateLimitAuthentication` - Rate limiting support

### 4. ✅ Article Serializer Enhanced
- **File:** `backend/apps/articles/serializers.py`
- **Changes:**
  - Added `validate_content()` - HTML sanitization on save
  - Added `validate_short_description()` - Input validation
  - Added `validate_video_url()` - URL validation
  - Added `CommentSerializer.validate_body()` - Comment sanitization

### 5. ✅ Dependencies Updated
- **File:** `backend/requirements.txt`
- **Added:**
  - `bleach>=5.0.0` - HTML sanitization
  - `djangorestframework-ratelimit>=0.1.0` - Rate limiting
  - `django-ratelimit>=4.0.0` - Rate limiting

---

## What Still Needs to Be Done (⏳ Remaining Work)

### Phase 4: Secure API Endpoints (CRITICAL)

#### 4.1 Update Article Views for Rate Limiting
**File:** `backend/apps/articles/views.py`

```python
# Add at the top
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle

class CustomUserThrottle(UserRateThrottle):
    scope = 'article_user'

class CustomAnonThrottle(AnonRateThrottle):
    scope = 'article_anon'

# Update REST_FRAMEWORK settings in settings.py (already done)
REST_FRAMEWORK = {
    ...
    "DEFAULT_THROTTLE_RATES": {
        "article_user": "1000/hour",
        "article_anon": "100/hour",
    },
}

# Add to CommentListCreateView
class ArticleCommentListCreateView(generics.ListCreateAPIView):
    ...
    throttle_classes = [CustomUserThrottle, CustomAnonThrottle]
```

#### 4.2 Update User Views for Authentication Rate Limiting
**File:** `backend/apps/users/views.py`

```python
# Add rate limiting to LoginView and RegisterView
from django_ratelimit.decorators import ratelimit
from rest_framework.throttling import AnonRateThrottle

class LoginRateThrottle(AnonRateThrottle):
    scope = 'login'

class RegisterRateThrottle(AnonRateThrottle):
    scope = 'register'

class RegisterView(generics.CreateAPIView):
    throttle_classes = [RegisterRateThrottle]
    ...

class LoginView(generics.GenericAPIView):
    throttle_classes = [LoginRateThrottle]
    ...
```

#### 4.3 Add Input Validation to All Views
**File:** `backend/apps/articles/views.py`

```python
# Add in ArticleListView.get_queryset()
search = self.request.query_params.get("search", "").strip()
if search and len(search) > 1000:  # Validate length
    search = search[:1000]  # Truncate

# Validate other parameters
category = self.request.query_params.get("category", "").strip()
tag = self.request.query_params.get("tag", "").strip()
ordering = self.request.query_params.get("ordering", "latest").strip()

# Whitelist allowed ordering values
ALLOWED_ORDERINGS = ["latest", "trending", "popular"]
if ordering not in ALLOWED_ORDERINGS:
    ordering = "latest"
```

#### 4.4 Add CSRF Token Endpoint
**File:** `backend/apps/users/views.py`

```python
from rest_framework.response import Response
from django.middleware.csrf import get_token

class CSRFTokenView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    
    def get(self, request):
        return Response({"csrfToken": get_token(request)})

# Add to urls.py
urlpatterns = [
    ...
    path("csrf-token/", CSRFTokenView.as_view(), name="csrf-token"),
]
```

---

### Phase 5: File Upload Protection (CRITICAL)

**File:** `backend/apps/articles/serializers.py`

```python
from apps.core.security import validate_file_upload, sanitize_filename

class ArticleSerializer(serializers.ModelSerializer):
    ...
    
    def validate_cover_image(self, value):
        """Validate cover image upload"""
        if not value:
            return value
        
        # Validate file
        is_valid, error_msg = validate_file_upload(
            value,
            allowed_extensions=["jpg", "jpeg", "png", "gif", "webp"],
            max_size=5 * 1024 * 1024  # 5MB for images
        )
        
        if not is_valid:
            raise serializers.ValidationError(error_msg)
        
        return value
```

---

### Phase 6: Frontend XSS Prevention

#### 6.1 Add DOMPurify to Package.json
**File:** `frontend/package.json`

```json
{
  "dependencies": {
    ...
    "dompurify": "^3.0.6"
  }
}
```

**Install:** `npm install dompurify`

#### 6.2 Update ArticleDetailPage Component
**File:** `frontend/src/pages/ArticleDetailPage.jsx`

```jsx
import DOMPurify from 'dompurify'

// Replace the dangerous rendering with:
<div className="article-content">
  {/* DOMPurify is extra defense; content should already be sanitized server-side */}
  {article.content && (
    <div
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(article.content, {
          ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
            'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr'
          ],
          ALLOWED_ATTR: ['href', 'src', 'alt', 'title'],
          ALLOW_DATA_ATTR: false,
        })
      }}
    />
  )}
</div>
```

---

### Phase 7: Security Headers (MEDIUM Priority)

These are already configured in `settings.py`, but verify they're sent:

**Verify headers with:**
```bash
curl -I https://yourdomain.com/api/
# Should see:
# Strict-Transport-Security: max-age=31536000
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Referrer-Policy: strict-origin-when-cross-origin
```

---

### Phase 8: Audit Dependencies

#### Check for vulnerabilities:
```bash
cd backend
pip install pip-audit
pip-audit

cd ../frontend
npm audit
```

#### Key packages to monitor:
- Django >= 5.0.14 (Security updates important)
- djangorestframework >= 3.15.0
- Pillow >= 10.4.0 (Image processing - critical for security)
- bleach >= 5.0.0 (Keep up to date)
- TipTap >= 2.11.5

---

## Configuration Variables Required

### Production `.env` File

```bash
# CRITICAL
SECRET_KEY=your-128-character-random-secret-key-here

# Django
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database (for production MySQL)
USE_SQLITE_FOR_LOCAL=False
DB_NAME=skillbloom_prod
DB_USER=skillbloom_user
DB_PASSWORD=very-strong-password-here
DB_HOST=db.yourdomain.com
DB_PORT=3306

# Frontend URLs
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Session
SESSION_COOKIE_AGE=3600

# File uploads
MAX_FILE_SIZE=10485760
```

---

## Database Migrations Required

After updating dependencies, run:

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Completed all 7 phases of security hardening
- [ ] Ran `pip audit` and resolved vulnerabilities
- [ ] Ran `npm audit` and resolved vulnerabilities
- [ ] Set `SECRET_KEY` to a secure 128-character random value
- [ ] Set `DEBUG=False`
- [ ] Configured `ALLOWED_HOSTS` with production domain
- [ ] Configured database with SSL connection
- [ ] Set up HTTPS/SSL certificate
- [ ] Configured CORS for production domain only
- [ ] Enabled all security headers
- [ ] Tested authentication flows
- [ ] Tested rate limiting
- [ ] Tested file upload restrictions
- [ ] Tested XSS prevention with payloads
- [ ] Enabled logging and monitoring
- [ ] Configured email for notifications
- [ ] Set up backup strategy
- [ ] Documented security procedures
- [ ] Performed penetration testing
- [ ] Deployed behind reverse proxy (Nginx recommended)
- [ ] Enabled WAF (Web Application Firewall) if available

---

## Testing Security Fixes

### Test XSS Prevention
```javascript
// Try injecting in article content
payload = '<script>alert("XSS")</script>'
// Should be sanitized and not execute
```

### Test CSRF Protection
```bash
# POST request without CSRF token should fail
curl -X POST http://localhost:8000/api/explore/manage/ \
  -H "Content-Type: application/json" \
  -d '{"title": "test"}'
# Expected: 403 Forbidden (CSRF token missing)
```

### Test Rate Limiting
```bash
# Make > 100 requests in 1 hour as anonymous user
for i in {1..101}; do
  curl http://localhost:8000/api/articles/
done
# Expected: 429 Too Many Requests after 100 requests
```

### Test File Upload Restrictions
```python
# Try uploading .exe file
# Expected: ValidationError - file type not allowed

# Try uploading 20MB file
# Expected: ValidationError - file size exceeds limit
```

### Test HTML Sanitization
```python
# Create article with malicious HTML
article_html = '''
<p>Safe content</p>
<img src=x onerror="alert('XSS')">
<script>alert('XSS')</script>
'''
# Expected: Script and onerror removed, safe HTML returned
```

---

## Monitoring & Logging

Monitor these security logs:

```bash
# View security events
tail -f backend/logs/security.log

# Check for failed login attempts
grep "Failed login" backend/logs/security.log

# Check for unauthorized access attempts
grep "401\|403" backend/logs/security.log

# Check for file upload failures
grep "File upload" backend/logs/security.log
```

---

## Deployment Architecture (Recommended)

```
Internet
   ↓
HTTPS (Let's Encrypt)
   ↓
Nginx Reverse Proxy (Security Headers, Rate Limiting)
   ↓
Gunicorn (Django Application)
   ↓
PostgreSQL (Database with SSL)
   ↓
File Storage (S3 or similar)
```

---

## Still-Remaining Risks (After All Fixes)

Even after implementing all security measures, these risks remain:

1. **Zero-Day Vulnerabilities** - Unknown vulnerabilities in dependencies
2. **Insider Threats** - Malicious admin users
3. **DDoS Attacks** - Rate limiting helps but requires infrastructure
4. **Supply Chain Attacks** - Compromised dependencies
5. **Deployment Misconfiguration** - Human error
6. **Physical Security** - Server room access
7. **Social Engineering** - Phishing attacks on users/admins

---

## Compliance Considerations

- **GDPR:** Implement data deletion endpoint
- **CCPA:** User data download/portability
- **HIPAA:** If handling health data, additional measures needed
- **PCI-DSS:** If handling payments, specialized requirements

---

## Next Steps

1. ✅ Complete Phase 4: Secure API endpoints
2. ✅ Complete Phase 5: File upload protection
3. ✅ Complete Phase 6: Frontend XSS prevention  
4. ✅ Complete Phase 7: Security headers (already done)
5. ✅ Complete Phase 8: Dependency audit
6. ✅ Test all security fixes
7. ✅ Generate final security report
8. ✅ Deploy to production with SSL
9. ✅ Set up monitoring and logging
10. ✅ Schedule regular security audits

---

**Status:** Security Audit & Partial Hardening Complete  
**Ready for:** Production Deployment (after completing remaining phases)  
**Last Updated:** September 14, 2026
