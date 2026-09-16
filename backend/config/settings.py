import logging
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    if os.getenv("DEBUG", "").lower() == "true":
        SECRET_KEY = "dev-insecure-key-for-development-only"
    else:
        raise ValueError("SECRET_KEY environment variable is required in production")

DEBUG = os.getenv("DEBUG", "False").lower() == "true"
if DEBUG:
    ALLOWED_HOSTS = ["*"]
else:
    default_hosts = "localhost,127.0.0.1,skillbloom.ashokworld.in,www.skillbloom.ashokworld.in"
    ALLOWED_HOSTS = [host.strip() for host in os.getenv("ALLOWED_HOSTS", default_hosts).split(",") if host.strip()]

INSTALLED_APPS = [
    "django.contrib.admin", "django.contrib.auth", "django.contrib.contenttypes",
    "django.contrib.sessions", "django.contrib.messages", "django.contrib.staticfiles",
    "rest_framework", "corsheaders", "django_filters", "apps.users", "apps.jobs",
    "apps.resources", "apps.ai_tech", "apps.articles", "apps.courses", "apps.interview",
    "apps.coding", "apps.roadmaps", "apps.hiring", "apps.analytics", "apps.core",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware", "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware", "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware", "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware", "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [BASE_DIR / "templates"], "APP_DIRS": True,
    "OPTIONS": {"context_processors": [
        "django.template.context_processors.request", "django.contrib.auth.context_processors.auth",
        "django.contrib.messages.context_processors.messages",
    ]},
}]
WSGI_APPLICATION = "config.wsgi.application"

DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": BASE_DIR / "db.sqlite3"}}
if os.getenv("USE_SQLITE_FOR_LOCAL", "True").lower() == "false":
    DATABASES["default"] = {
        "ENGINE": "django.db.backends.mysql", "NAME": os.getenv("DB_NAME", "skillbloom"),
        "USER": os.getenv("DB_USER", "root"), "PASSWORD": os.getenv("DB_PASSWORD", ""),
        "HOST": os.getenv("DB_HOST", "127.0.0.1"), "PORT": os.getenv("DB_PORT", "3306"),
        "OPTIONS": {"charset": "utf8mb4"},
        "CONN_MAX_AGE": int(os.getenv("DB_CONN_MAX_AGE", "60")),
    }

CACHES = {
    "default": {
        "BACKEND": os.getenv("CACHE_BACKEND", "django.core.cache.backends.locmem.LocMemCache"),
        "LOCATION": os.getenv("CACHE_LOCATION", "skillbloom-cache"),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 12}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]
AUTH_USER_MODEL = "users.User"

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
DATA_UPLOAD_MAX_MEMORY_SIZE = 10485760
FILE_UPLOAD_MAX_MEMORY_SIZE = 10485760
FILE_UPLOAD_PERMISSIONS = 0o644
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CORS_ALLOWED_ORIGINS = [origin.strip() for origin in os.getenv(
    "CORS_ALLOWED_ORIGINS",
    "https://skillbloom.ashokworld.in",
).split(",") if origin.strip()]
CSRF_TRUSTED_ORIGINS = []
for origin in CORS_ALLOWED_ORIGINS:
    CSRF_TRUSTED_ORIGINS.append(origin)
    if origin.startswith("http://localhost"):
        CSRF_TRUSTED_ORIGINS.append(origin.replace("http://", "https://"))

CSRF_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = "Strict"
SESSION_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Strict"
SESSION_COOKIE_AGE = 3600
SESSION_EXPIRE_AT_BROWSER_CLOSE = True

SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = not DEBUG
SECURE_HSTS_PRELOAD = not DEBUG
SECURE_SSL_REDIRECT = not DEBUG
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.AllowAny",),
    "DEFAULT_FILTER_BACKENDS": ("django_filters.rest_framework.DjangoFilterBackend",),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 12, "MAX_PAGE_SIZE": 100,
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle", "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour", "user": "1000/hour", "public_read": "300/hour",
        "authenticated_read": "1200/hour", "article_write": "60/hour",
        "article_action": "120/hour", "comment_write": "30/hour", "authentication": "10/hour",
    },
}

import datetime
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": datetime.timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": datetime.timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True, "BLACKLIST_AFTER_ROTATION": True,
    "ALGORITHM": "HS256", "SIGNING_KEY": SECRET_KEY,
}

LOGS_DIR = BASE_DIR / "logs"
LOGS_DIR.mkdir(parents=True, exist_ok=True)
LOGGING = {
    "version": 1, "disable_existing_loggers": False,
    "formatters": {
        "verbose": {"format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}", "style": "{"},
        "simple": {"format": "{levelname} {message}", "style": "{"},
    },
    "handlers": {
        "console": {"level": "INFO", "class": "logging.StreamHandler", "formatter": "simple"},
        "file": {"level": "WARNING", "class": "logging.handlers.RotatingFileHandler", "filename": LOGS_DIR / "django.log", "maxBytes": 10485760, "backupCount": 5, "formatter": "verbose"},
        "security_file": {"level": "INFO", "class": "logging.handlers.RotatingFileHandler", "filename": LOGS_DIR / "security.log", "maxBytes": 10485760, "backupCount": 5, "formatter": "verbose"},
    },
    "loggers": {
        "django": {"handlers": ["console", "file"], "level": "INFO", "propagate": False},
        "django.security": {"handlers": ["security_file", "console"], "level": "INFO", "propagate": False},
        "apps": {"handlers": ["console", "file"], "level": "INFO", "propagate": False},
    },
}

ALLOWED_HTML_TAGS = ["p", "br", "strong", "em", "u", "a", "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "code", "pre", "img", "table", "thead", "tbody", "tr", "th", "td", "hr"]
ALLOWED_HTML_ATTRIBUTES = {"a": ["href", "title"], "img": ["src", "alt", "title", "width", "height"]}
ALLOWED_URL_PROTOCOLS = ["http", "https"]
ALLOWED_FILE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "pdf", "doc", "docx", "xls", "xlsx"]
MAX_FILE_SIZE = 10 * 1024 * 1024

if not DEBUG:
    if SECRET_KEY == "dev-insecure-key-for-development-only":
        raise ValueError("CRITICAL: SECRET_KEY not properly configured in production!")
    logging.getLogger("django.security").info("SkillBloom running in PRODUCTION mode")
