import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from dotenv import load_dotenv

from app.api.quotation_routes import router as quotation_router
from app.api.history_routes import router as history_router
from app.api.settings_routes import settings_router
from app.database.db import engine, Base

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Standard Pumps Quotation System API",
    description="Backend service for generating and managing pump quotations",
    version="1.0.0",
)


# Logging setup
logging.basicConfig(
    level=logging.INFO if os.getenv("ENVIRONMENT") == "production" else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
def startup_event():
    """
    On startup, pro-actively generate SQLite table structures
    guaranteeing immediate local business persistence.
    """
    logger.info("Initializing Standard Pumps Quotation System...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database connection and schema generation successful.")

# Security Hardening: Trusted Host Middleware
# Prevents HTTP Host header attacks
allowed_hosts_raw = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1")
allowed_hosts = [h.strip() for h in allowed_hosts_raw.split(",")]
app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)

# Security Hardening: Strict CORS Configuration
frontend_url_raw = os.getenv("FRONTEND_URL", "http://localhost:5173")
origins = [url.strip() for url in frontend_url_raw.split(",") if url.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Register routers
app.include_router(quotation_router, prefix="/api/v1")
app.include_router(history_router, prefix="/api/v1")
app.include_router(settings_router, prefix="/api/v1")


@app.get("/api/v1/health", status_code=200)
async def health_check():
    """
    Health check endpoint to verify system status and ensure
    db and API capabilities are functioning.
    """
    return {
        "status": "healthy",
        "service": "standard-pumps-quotation-backend",
        "database": os.getenv("DATABASE_URL", "sqlite:///./standard_pumps.db").split(
            "/"
        )[-1],
    }
