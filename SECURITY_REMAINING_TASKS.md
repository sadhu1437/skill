# SkillBloom Security Hardening - Remaining Tasks

**Status:** Phase 3 Complete → Phase 4-9 Remaining  
**Priority Level:** CRITICAL - Complete before production deployment  
**Estimated Total Time:** 10-15 hours

---

## Phase 4: Secure API Endpoints (2-3 Hours)

### Task 4.1: Add Rate Limiting to Article Endpoints
**Priority:** HIGH  
**Files:** `backend/apps/articles/views.py`  
**Complexity:** Low

**Steps:**
1. Import `from rest_framework.throttling import UserRateThrottle, AnonRateThrottle`
2. Create custom throttle classes:
   ```python
   class ArticleUserThrottle(UserRateThrottle):
       scope = 'article_user'
   
   class ArticleAnonThrottle(AnonRateThrottle):
       scope = 'article_anon'
   ```
3. Add to all API views:
   ```python
   throttle_classes = [ArticleUserThrottle, ArticleAnonThrottle]
   ```
4. Configure rates in settings.py:
   ```python
   "DEFAULT_THROTTLE_RATES": {
       "article_user": "1000/hour",
       "article_anon": "100/hour",
   }
   ```

**Testing:**
```bash
# Make 101 requests as anonymous - should return 429 on 101st
for i in {1..101}; do curl http://localhost:8000/api/articles/; done
```

---

### Task 4.2: Add Input Validation to Article Views
**Priority:** HIGH  
**Files:** `backend/apps/articles/views.py`  
**Complexity:** Low

**Steps:**
1. Add validation in `ArticleListView.get_queryset()`:
   ```python
   search = self.request.query_params.get("search", "").strip()
   if search and len(search) > 1000:
       search = search[:1000]
   
   # Whitelist allowed ordering values
   ALLOWED_ORDERINGS = ["latest", "popular", "trending"]
   ordering = self.request.query_params.get("ordering", "latest")
   if ordering not in ALLOWED_ORDERINGS:
       ordering = "latest"
   ```
2. Apply similar validation to category, tag, and status filters
3. Add input type validation

**Testing:**
```python
# Test with very long search query
response = client.get('/api/articles/?search=' + 'a'*5000)
assert len(response.query_params['search']) == 1000
```

---

### Task 4.3: Add CSRF Token Endpoint
**Priority:** MEDIUM  
**Files:** `backend/apps/users/views.py`, `backend/config/urls.py`  
**Complexity:** Low

**Steps:**
1. Create new view in users/views.py:
   ```python
   from rest_framework.response import Response
   from django.middleware.csrf import get_token
   
   class CSRFTokenView(generics.GenericAPIView):
       permission_classes = (permissions.AllowAny,)
       
       def get(self, request):
           token = get_token(request)
           return Response({"csrfToken": token})
   ```
2. Add to urls.py:
   ```python
   path("csrf-token/", CSRFTokenView.as_view(), name="csrf-token"),
   ```

**Testing:**
```bash
curl http://localhost:8000/api/csrf-token/
# Should return: {"csrfToken": "..."}
```

---

### Task 4.4: Add Permission Classes to Article Views
**Priority:** CRITICAL  
**Files:** `backend/apps/articles/views.py`  
**Complexity:** Medium

**Steps:**
1. Import permission classes:
   ```python
   from apps.core.permissions import IsAuthorOrAdmin, IsAdminUserOrReadOnly, IsStaffUser
   ```
2. Update ArticleManageListView:
   ```python
   permission_classes = [IsStaffUser]
   ```
3. Update ArticleManageDetailView:
   ```python
   permission_classes = [IsAuthorOrAdmin]
   ```
4. Update ArticleListView:
   ```python
   # No change - public read
   ```
5. Update ArticleDetailView:
   ```python
   # No change - public read
   ```

**Testing:**
```python
# Test author can edit own article
author = User.objects.create_user(username='author1')
article = Article.objects.create(author=author, title="Test")
response = client.patch(f'/api/articles/{article.id}/', {'title': 'Updated'}, user=author)
assert response.status_code == 200

# Test other user cannot edit
other_user = User.objects.create_user(username='other')
response = client.patch(f'/api/articles/{article.id}/', {'title': 'Hacked'}, user=other_user)
assert response.status_code == 403
```

---

### Task 4.5: Add Logging to Auth Endpoints
**Priority:** MEDIUM  
**Files:** `backend/apps/users/views.py`  
**Complexity:** Low

**Steps:**
1. Add logging to login attempts:
   ```python
   import logging
   logger = logging.getLogger("django.security")
   
   class LoginView(...):
       def post(self, request):
           username = request.data.get('username')
           try:
               user = User.objects.get(username=username)
               # Successful login
               logger.info(f"Successful login: {username}")
           except User.DoesNotExist:
               logger.warning(f"Failed login attempt: unknown user {username}")
   ```
2. Log failed login attempts with timestamp
3. Log admin actions (create, edit, delete)

**Testing:**
```bash
tail -f backend/logs/security.log | grep "login"
# Should show login attempts and outcomes
```

---

## Phase 5: File Upload Protection (1-2 Hours)

### Task 5.1: Add File Upload Validation to Article Serializer
**Priority:** CRITICAL  
**Files:** `backend/apps/articles/serializers.py`  
**Complexity:** Low

**Status:** PARTIALLY DONE (function created)

**Steps:**
1. Update ArticleSerializer with validation:
   ```python
   from apps.core.security import validate_file_upload
   
   def validate_cover_image(self, value):
       if not value:
           return value
       
       is_valid, error_msg = validate_file_upload(
           value,
           allowed_extensions=["jpg", "jpeg", "png", "gif", "webp"],
           max_size=5 * 1024 * 1024  # 5MB for images
       )
       
       if not is_valid:
           raise serializers.ValidationError(error_msg)
       return value
   ```
2. Test with oversized files
3. Test with disallowed file types

**Testing:**
```python
# Test file too large
large_file = create_file(size=11*1024*1024)
response = client.post('/api/articles/', {'cover_image': large_file})
assert "exceeds limit" in response.json()['cover_image'][0]

# Test disallowed type
exe_file = create_file('test.exe', content=b'MZ\x90')
response = client.post('/api/articles/', {'cover_image': exe_file})
assert "not allowed" in response.json()['cover_image'][0]
```

---

### Task 5.2: Add Filename Sanitization
**Priority:** HIGH  
**Files:** `backend/apps/articles/models.py`  
**Complexity:** Low

**Steps:**
1. Override Article.save() method:
   ```python
   from apps.core.security import sanitize_filename
   
   def save(self, *args, **kwargs):
       if self.cover_image:
           self.cover_image.name = sanitize_filename(self.cover_image.name)
       super().save(*args, **kwargs)
   ```

**Testing:**
```python
# Upload file with path traversal attempt
article.cover_image.name = "../../../etc/passwd"
article.save()
# Should sanitize to: "etc_passwd" or similar
```

---

## Phase 6: Frontend XSS Prevention (2-3 Hours)

### Task 6.1: Install DOMPurify
**Priority:** CRITICAL  
**Files:** `frontend/package.json`, `frontend/src`  
**Complexity:** Low

**Steps:**
1. Add to package.json:
   ```json
   "dependencies": {
       "dompurify": "^3.0.6"
   }
   ```
2. Run: `npm install`
3. Verify installation: `npm ls dompurify`

**Testing:**
```bash
npm ls dompurify  # Should show version 3.0.6+
```

---

### Task 6.2: Update ArticleDetailPage Component
**Priority:** CRITICAL  
**Files:** `frontend/src/pages/ArticleDetailPage.jsx`  
**Complexity:** Low

**Status:** CRITICAL XSS vulnerability

**Steps:**
1. Add DOMPurify import:
   ```jsx
   import DOMPurify from 'dompurify'
   ```
2. Replace dangerouslySetInnerHTML with sanitized version:
   ```jsx
   <div className="article-content">
     {article.content && (
       <div
         dangerouslySetInnerHTML={{
           __html: DOMPurify.sanitize(article.content, {
             ALLOWED_TAGS: [
               'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li',
               'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
               'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr'
             ],
             ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'width', 'height'],
             ALLOW_DATA_ATTR: false,
           })
         }}
       />
     )}
   </div>
   ```

**Testing:**
```jsx
// Test with XSS payload
article.content = '<p>Safe</p><img src=x onerror="alert(\'XSS\')">'
// Should render paragraph but not execute onerror
// Browser console should have no errors
```

---

### Task 6.3: Update Comment Display Components
**Priority:** HIGH  
**Files:** `frontend/src/components/CommentList.jsx` (or similar)  
**Complexity:** Low

**Steps:**
1. Find all locations rendering comment.body
2. Add DOMPurify sanitization (if HTML is expected)
3. Or use React's automatic escaping (if plain text only)

**Testing:**
```jsx
// Test comment with HTML
comment = {body: '<strong>Bold</strong><script>alert("XSS")</script>'}
// Should display bold text but not execute script
```

---

### Task 6.4: Update Editor Components
**Priority:** HIGH  
**Files:** `frontend/src/components/CopyPasteEditor.jsx` (or similar)  
**Complexity:** Medium

**Steps:**
1. Review TipTap editor configuration
2. Ensure it uses whitelisted tags only
3. Add XSS prevention in editor options
4. Test rich content editing

**Testing:**
```jsx
// Test pasting HTML with scripts
editor.pasteHTML('<p>Text</p><script>alert()</script>')
// Should strip script tags
```

---

## Phase 7: Security Headers (1 Hour)

### Task 7.1: Verify Security Headers in Settings
**Priority:** MEDIUM  
**Files:** `backend/config/settings.py` (Already done)  
**Status:** ✅ COMPLETE

**Verification:**
```bash
curl -I https://yourdomain.com/
# Should show:
# Strict-Transport-Security: max-age=31536000
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Referrer-Policy: strict-origin-when-cross-origin
```

---

### Task 7.2: Configure Reverse Proxy Headers (Nginx)
**Priority:** HIGH  
**Files:** `nginx.conf` (production server)  
**Complexity:** Low

**Steps:**
1. Add to Nginx configuration:
   ```nginx
   # Security headers
   add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
   add_header X-Content-Type-Options "nosniff" always;
   add_header X-Frame-Options "DENY" always;
   add_header Referrer-Policy "strict-origin-when-cross-origin" always;
   add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
   add_header X-XSS-Protection "1; mode=block" always;
   
   # CSP Header (optional but recommended)
   add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com; style-src 'self' 'unsafe-inline'" always;
   ```

---

## Phase 8: Dependency Audit (1-2 Hours)

### Task 8.1: Audit Python Packages
**Priority:** HIGH  
**Files:** `backend/requirements.txt`  
**Complexity:** Low

**Steps:**
1. Install pip-audit: `pip install pip-audit`
2. Run audit: `pip audit`
3. Review findings:
   ```bash
   cd backend
   pip audit
   # Shows vulnerable packages and remediation
   ```
4. Update vulnerable packages
5. Run test suite to ensure no breakage

**Testing:**
```bash
pip audit  # Should show 0 vulnerabilities
```

---

### Task 8.2: Audit JavaScript Packages
**Priority:** HIGH  
**Files:** `frontend/package.json`  
**Complexity:** Low

**Steps:**
1. Run npm audit:
   ```bash
   cd frontend
   npm audit
   ```
2. Review findings
3. Run `npm audit fix` for auto-fixable issues
4. Manually update remaining packages
5. Run test suite to ensure no breakage

**Testing:**
```bash
npm audit  # Should show 0 vulnerabilities (or note vulnerabilities requiring manual review)
```

---

## Phase 9: Final Security Report (2-3 Hours)

### Task 9.1: Create Security Testing Checklist
**Priority:** HIGH  
**Files:** Create new file `SECURITY_TESTING_CHECKLIST.md`  
**Complexity:** Low

**Content:**
- [ ] XSS injection tests
- [ ] SQL injection tests  
- [ ] CSRF protection tests
- [ ] Rate limiting tests
- [ ] Authentication tests
- [ ] Authorization tests
- [ ] File upload tests
- [ ] Input validation tests
- [ ] Session security tests
- [ ] HTTPS enforcement tests

---

### Task 9.2: Create Production Deployment Guide
**Priority:** HIGH  
**Files:** Update `.env.example` and create `DEPLOYMENT.md`  
**Complexity:** Low

**Content:**
- Pre-deployment checklist
- Environment variable setup
- Database setup (MySQL with SSL)
- SSL certificate setup
- Nginx/Reverse proxy configuration
- Backup and recovery procedures
- Monitoring setup
- Emergency procedures

---

### Task 9.3: Create Security Operations Guide
**Priority:** MEDIUM  
**Files:** Create new file `SECURITY_OPERATIONS.md`  
**Complexity:** Low

**Content:**
- Regular security checks
- Monitoring and alerting
- Log review procedures
- Incident response procedures
- Account management procedures
- Access control procedures

---

## Priority Order for Completion

**Week 1 (Critical Path):**
1. Phase 4.1-4.5: API endpoint security
2. Phase 5.1-5.2: File upload protection
3. Phase 6.1-6.3: Frontend XSS prevention

**Week 2:**
4. Phase 8.1-8.2: Dependency audit
5. Phase 6.4: Editor component review
6. Phase 7.2: Nginx configuration

**Week 3:**
7. Phase 9.1-9.3: Final documentation
8. Comprehensive security testing
9. Production deployment preparation

---

## Success Criteria

✅ All 33 identified vulnerabilities addressed  
✅ No functional regressions (all features work as before)  
✅ Rate limiting working (verified with tests)  
✅ XSS prevention verified (with injection tests)  
✅ File upload restrictions working  
✅ All security headers present  
✅ Logging showing security events  
✅ Zero high/critical dependency vulnerabilities  
✅ Production deployment guide complete  
✅ Security testing checklist passed  

---

## Risk Assessment

**Low Risk:**
- Input validation
- Rate limiting
- Security headers
- Logging

**Medium Risk:**
- File upload validation
- Frontend DOM Purify
- Dependency updates

**High Risk:**
- Permission system changes (requires thorough testing)
- Database schema changes (if added)

---

## Rollback Plan

All changes are additive and non-breaking:
1. No database schema changes required
2. Frontend changes are rendering only (can be reverted)
3. Django settings are backward compatible
4. Can disable rate limiting by removing throttle_classes
5. Can disable sanitization by removing validation methods

**Estimated rollback time:** < 1 hour

---

**Last Updated:** September 14, 2026  
**Prepared by:** Copilot AI Security Audit  
**Status:** Ready for implementation
