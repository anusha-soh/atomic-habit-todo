"""
FastAPI Application Entry Point
Phase 2 Core Infrastructure - Authentication API
"""
from contextlib import asynccontextmanager
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


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start APScheduler background job on startup; stop on shutdown."""
    try:
        if os.getenv("ENABLE_SCHEDULER", "true").lower() != "true":
            yield
            return

        from apscheduler.schedulers.background import BackgroundScheduler
        from src.services.miss_detector import detect_missed_habits

        scheduler = BackgroundScheduler()
        # Run miss detection daily at 00:01 UTC
        scheduler.add_job(detect_missed_habits, "cron", hour=0, minute=1, id="miss_detection")

        # Chunk 5: Run habit task generation daily at 00:01 UTC (after miss detection)
        if os.getenv("DISABLE_BACKGROUND_JOBS", "false").lower() != "true":
            def run_habit_task_generation():
                """Generate tasks for all active habits with recurring schedules."""
                import logging
                from datetime import datetime
                logger = logging.getLogger("habit_task_generation")
                start = datetime.now()
                try:
                    from src.database import get_db_session
                    from src.services.event_emitter import event_emitter
                    from src.services.habit_task_service import HabitTaskGenerationService
                    lookahead = int(os.getenv("HABIT_TASK_LOOKAHEAD_DAYS", "7"))
                    with get_db_session() as session:
                        gen_service = HabitTaskGenerationService(session, event_emitter)
                        results = gen_service.generate_tasks_for_all_habits(lookahead)
                        total_gen = sum(r.generated for r in results)
                        total_skip = sum(r.skipped for r in results)
                        elapsed = (datetime.now() - start).total_seconds()
                        logger.info(
                            f"Habit task generation complete: {len(results)} habits, "
                            f"{total_gen} generated, {total_skip} skipped, {elapsed:.1f}s"
                        )
                except Exception as e:
                    logger.error(f"Habit task generation failed: {e}")

            scheduler.add_job(run_habit_task_generation, "cron", hour=0, minute=1, id="habit_task_gen")

        scheduler.start()
        yield
        scheduler.shutdown()
    except ImportError:
        # APScheduler not installed — skip scheduling (dev environments)
        yield


# Initialize FastAPI app
app = FastAPI(
    lifespan=lifespan,
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
