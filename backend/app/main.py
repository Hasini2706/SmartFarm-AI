import os
import sentry_sdk
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from prometheus_fastapi_instrumentator import Instrumentator
from sqlalchemy import text

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routers import auth, crop, predictions, weather, chat, analytics
from app.services.redis_service import RedisService
from app.migrations import run_migrations

# Initialize Sentry Error Logging (Active if DSN configured)
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        traces_sample_rate=1.0,
        profiles_sample_rate=1.0,
    )

# Run database migrations to alter existing tables
run_migrations()

# Bootstrap database schemas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Precision Agriculture Decision Support API with AI, Computer Vision, and Machine Learning.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom HTTP Middleware for Security Headers & Rate Limiting
@app.middleware("http")
async def process_request_middleware(request: Request, call_next):
    # API Rate limiting using RedisService client
    ip = request.client.host if request.client else "unknown"
    rate_key = f"rate_limit:{ip}:{request.url.path}"
    
    # Restrict to 60 requests per minute per IP for non-exempt endpoints
    is_exempt = any(request.url.path.startswith(p) for p in ["/metrics", "/docs", "/openapi.json", "/static"])
    if not is_exempt:
        if not RedisService.check_rate_limit(rate_key, limit=60, window=60):
            return Response(
                content='{"detail": "API Rate limit exceeded. Please try again later."}',
                status_code=429,
                media_type="application/json"
            )
            
    response = await call_next(request)
    
    # Security headers hardening (CSP, Clickjacking, MIME sniffing, HSTS)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: blob: https://images.unsplash.com; "
        "connect-src 'self' ws: wss: https://api.openweathermap.org https://generativelanguage.googleapis.com;"
    )
    
    return response

# Expose Prometheus endpoints (/metrics)
Instrumentator().instrument(app).expose(app)

# Ensure static directories exist
os.makedirs("static/uploads", exist_ok=True)
os.makedirs("static/reports", exist_ok=True)
os.makedirs("static/audio", exist_ok=True)

# Mount static files to serve uploaded images and PDF reports
app.mount("/static", StaticFiles(directory="static"), name="static")

# Register routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(auth.router, prefix="/api")
app.include_router(crop.router, prefix=settings.API_V1_STR)
app.include_router(predictions.router, prefix=settings.API_V1_STR)
app.include_router(weather.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix="/api")
app.include_router(chat.ai_router, prefix=settings.API_V1_STR)
app.include_router(chat.ai_router, prefix="/api")
app.include_router(analytics.router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    """Verify database and Redis cache status."""
    try:
        # Check DB connection
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    # Check Cache status
    try:
        RedisService.set("health_ping", "pong", ex=5)
        redis_status = "healthy"
    except Exception as e:
        redis_status = f"unhealthy: {str(e)}"

    status_code = 200
    if "unhealthy" in db_status:
        status_code = 500

    return Response(
        content=f'{{"status": "online", "database": "{db_status}", "cache": "{redis_status}"}}',
        status_code=status_code,
        media_type="application/json"
    )
