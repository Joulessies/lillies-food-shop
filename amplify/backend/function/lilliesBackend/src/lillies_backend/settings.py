import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from rest_framework.permissions import AllowAny
import logging.config
import dj_database_url

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# Secret key and debug settings
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-your-secret-key-here')

DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'  # Set to True for debugging CORS issues

# Check if running in AWS Lambda (presence of AWS_LAMBDA_FUNCTION_NAME environment variable)
IS_LAMBDA = 'AWS_LAMBDA_FUNCTION_NAME' in os.environ

# Configure logging directory
if DEBUG:
    # In development, use a logs directory in the project
    LOG_DIR = os.path.join(BASE_DIR, 'logs')
    if not os.path.exists(LOG_DIR):
        os.makedirs(LOG_DIR)
else:
    # In production, use the configured log directory or fall back to a default
    LOG_DIR = os.getenv('DJANGO_LOG_DIR', '/tmp/logs' if IS_LAMBDA else '/var/log/app-logs')
    if not os.path.exists(LOG_DIR):
        os.makedirs(LOG_DIR, exist_ok=True)

# Platform-specific log file path
LOG_FILE = os.path.join(LOG_DIR, 'django.log')

ALLOWED_HOSTS = [
    '*',  # Allow all hosts for testing with ngrok
    'main.d1tks6esoyf2em.amplifyapp.com',
    'localhost',
    '127.0.0.1',
    'lillies-prod-env.eba-mmphcea.ap-northeast-1.elasticbeanstalk.com',
    'lillies-prod-env.eba-wwpy3qup.ap-northeast-1.elasticbeanstalk.com',
    '.elasticbeanstalk.com',
    '.ngrok-free.app',  # Allow all ngrok domains
    '.ngrok.io',
    '88fc-158-62-34-241.ngrok-free.app',
    '.amazonaws.com',  # Allow Lambda and API Gateway domains
    '.execute-api.ap-northeast-1.amazonaws.com',  # API Gateway endpoints
]

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'django_filters',
    'api',
    'lillies_backend',  # Add the main app
    'users',  # Add the users app
]

MIDDLEWARE = [
    'lillies_backend.middleware.CORSMiddleware',  # Custom CORS middleware
    # 'corsheaders.middleware.CorsMiddleware',  # Comment out built-in CORS middleware
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'lillies_backend.middleware.APIGatewayMiddleware',]

ROOT_URLCONF = 'lillies_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'api/templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'lillies_backend.wsgi.application'

# Database configuration
# For Lambda, use /tmp directory for SQLite
if IS_LAMBDA:
    # Lambda only has write access to /tmp
    DB_PATH = '/tmp/db.sqlite3'
    
    # Copy the DB file from the deployment package to /tmp if it doesn't exist
    if not os.path.exists(DB_PATH):
        import shutil
        source_db = os.path.join(BASE_DIR, 'db.sqlite3')
        if os.path.exists(source_db):
            shutil.copy(source_db, DB_PATH)
            print(f"Copied database from {source_db} to {DB_PATH}")
    
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': DB_PATH,
        }
    }
# Use DATABASE_URL environment variable if set (for production)
elif os.getenv('DATABASE_URL'):
    DATABASES = {
        'default': dj_database_url.config(
            conn_max_age=600,
            ssl_require=not DEBUG
        )
    }
# Default SQLite for development
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
        }
    }

# Email settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_APP_PASSWORD')

# Security settings for production
if not DEBUG:
    # Skip SSL redirects in Lambda
    SECURE_SSL_REDIRECT = not IS_LAMBDA
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# CORS settings - Allow all origins for Lambda 
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# Set explicit allowed origins as a fallback
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',  # Vite dev server
    'http://localhost:4173',  # Vite preview
    'https://main.d1tks6esoyf2em.amplifyapp.com',
    'https://88fc-158-62-34-241.ngrok-free.app',  # Current ngrok URL
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_EXPOSE_HEADERS = [
    'access-control-allow-origin',
    'access-control-allow-credentials',
]

CORS_PREFLIGHT_MAX_AGE = 86400  # 24 hours

# Security settings
CSRF_TRUSTED_ORIGINS = [
    "https://main.d1tks6esoyf2em.amplifyapp.com",
    "https://master.d1tks6esoyf2em.amplifyapp.com",
    "https://d1tks6esoyf2em.amplifyapp.com",
    "http://localhost:5173",
    "https://lillies-prod-env.eba-mmphcea.ap-northeast-1.elasticbeanstalk.com",
    "https://lillies-prod-env.eba-wwpy3qup.ap-northeast-1.elasticbeanstalk.com",
    "https://88fc-158-62-34-241.ngrok-free.app",  # Current ngrok URL
    "https://*.execute-api.ap-northeast-1.amazonaws.com",  # API Gateway endpoints
]

# Allow all ngrok subdomains for CORS
CORS_ORIGIN_REGEX_WHITELIST = [
    r'^https:\/\/.*\.ngrok-free\.app$',
    r'^https:\/\/.*\.ngrok\.io$',
    r'^https:\/\/.*\.execute-api\..*\.amazonaws\.com$', # API Gateway endpoints
]

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
    ),
}

# Simple JWT settings for custom user model with email
SIMPLE_JWT = {
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
}

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_ROOT = os.path.join('/tmp/staticfiles' if IS_LAMBDA else BASE_DIR, 'staticfiles')
STATIC_URL = '/static/'

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# Media files (Uploaded files)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join('/tmp/media' if IS_LAMBDA else BASE_DIR, 'media')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'users.CustomUser'

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': LOG_FILE,
            'formatter': 'verbose',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
            'stream': sys.stdout,
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'INFO'),
            'propagate': True,
        },
        'django.request': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}


