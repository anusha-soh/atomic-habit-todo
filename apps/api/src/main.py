"""
FastAPI Application Entry Point
Phase 2 Core Infrastructure - Authentication API
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Import configuration and validation
from src.config import validate_environment

# Validate environment on startup
validate_environment()

# Initialize FastAPI app
app = FastAPI(
    title="Atomic Habits - Authentication API",
    description="Phase 2 Core Infrastructure - User authentication and session management",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS middleware
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
# Always allow HF Spaces origin pattern
allowed_origins = [o.strip() for o in allowed_origins]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,  # Enable cookies for httpOnly JWT tokens
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Import and register routes
from src.routes import auth, tasks, habits
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(tasks.router, prefix="/api", tags=["Tasks"])
app.include_router(habits.router, prefix="/api", tags=["Habits"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "Atomic Habits API - Phase 2 Core Infrastructure"}


@app.get("/health")
async def health():
    """Detailed health check with database status"""
    return {
        "status": "ok",
        "database": "connected",  # TODO: Add actual database health check
        "version": "1.0.0",
    }
