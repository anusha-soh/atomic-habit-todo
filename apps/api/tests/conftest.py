"""
Pytest Fixtures and Configuration
Phase 2 Chunk 2 - Tasks Full Feature Set
"""
import os
import pytest
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from uuid import uuid4, UUID
from datetime import datetime, timezone
from unittest.mock import Mock

from src.models.user import User
from src.models.task import Task
from src.services.event_emitter import EventEmitter


# ============================================================================
# Database Fixtures
# ============================================================================

@pytest.fixture(name="engine")
def engine_fixture():
    """
    Create database engine for testing.

    Uses PostgreSQL from DATABASE_URL if available (required for ARRAY types),
    otherwise falls back to SQLite for basic tests (will skip ARRAY-related tests).
    """
    database_url = os.getenv("DATABASE_URL")

    if database_url:
        # Use PostgreSQL for full feature testing
        engine = create_engine(database_url)
    else:
        # SQLite fallback - will fail for ARRAY columns but useful for basic tests
        # To run full tests, set DATABASE_URL environment variable
        pytest.skip("PostgreSQL required for tests with ARRAY columns. Set DATABASE_URL environment variable.")
        engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )

    SQLModel.metadata.create_all(engine)
    yield engine
    # Clean up after tests (drop all tables in test mode)
    if database_url and "test" in database_url.lower():
        SQLModel.metadata.drop_all(engine)


@pytest.fixture(name="session")
def session_fixture(engine):
    """Create database session for tests"""
    with Session(engine) as session:
        yield session
        # Rollback after each test to ensure isolation
        session.rollback()


# ============================================================================
# User Fixtures
# ============================================================================

@pytest.fixture(name="user_id")
def user_id_fixture():
    """Generate a test user ID"""
    return uuid4()


@pytest.fixture(name="test_user")
def test_user_fixture(session: Session, user_id: UUID):
    """Create a test user in the database"""
    user = User(
        id=user_id,
        email="test@example.com",
        password_hash="$2b$12$hashed_password",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture(name="another_user")
def another_user_fixture(session: Session):
    """Create another test user for authorization tests"""
    user = User(
        id=uuid4(),
        email="another@example.com",
        password_hash="$2b$12$hashed_password",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


# ============================================================================
# Event Emitter Fixtures
# ============================================================================

@pytest.fixture(name="mock_event_emitter")
def mock_event_emitter_fixture():
    """Create a mock EventEmitter for testing"""
    mock_emitter = Mock(spec=EventEmitter)
    return mock_emitter


@pytest.fixture(name="event_emitter")
def event_emitter_fixture(tmp_path):
    """Create a real EventEmitter with temporary log directory"""
    return EventEmitter(log_dir=tmp_path / "logs")


# ============================================================================
# Task Fixtures
# ============================================================================

@pytest.fixture(name="sample_task")
def sample_task_fixture(session: Session, user_id: UUID):
    """Create a sample task for testing"""
    task = Task(
        id=uuid4(),
        user_id=user_id,
        title="Test Task",
        description="This is a test task",
        status="pending",
        priority="medium",
        tags=["test", "sample"],
        due_date=None,
        completed=False,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@pytest.fixture(name="completed_task")
def completed_task_fixture(session: Session, user_id: UUID):
    """Create a completed task for testing"""
    task = Task(
        id=uuid4(),
        user_id=user_id,
        title="Completed Task",
        description="This task is already completed",
        status="completed",
        priority="high",
        tags=["done"],
        due_date=None,
        completed=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@pytest.fixture(name="multiple_tasks")
def multiple_tasks_fixture(session: Session, user_id: UUID):
    """Create multiple tasks for pagination/filtering tests"""
    tasks = []
    for i in range(10):
        task = Task(
            id=uuid4(),
            user_id=user_id,
            title=f"Task {i+1}",
            description=f"Description for task {i+1}",
            status="pending" if i % 3 == 0 else "in_progress" if i % 3 == 1 else "completed",
            priority="high" if i % 3 == 0 else "medium" if i % 3 == 1 else "low",
            tags=[f"tag{i}", "common"],
            due_date=None,
            completed=i % 3 == 2,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        session.add(task)
        tasks.append(task)

    session.commit()
    for task in tasks:
        session.refresh(task)

    return tasks


# ============================================================================
# API Client Fixtures (for integration tests)
# ============================================================================

@pytest.fixture(name="client")
def client_fixture():
    """Create FastAPI test client (to be implemented in integration tests)"""
    # This will be implemented when we write integration tests
    # from fastapi.testclient import TestClient
    # from src.main import app
    # return TestClient(app)
    pass


# ============================================================================
# Test Data Factories
# ============================================================================

def create_task_data(**kwargs):
    """Factory function for creating task test data"""
    defaults = {
        "title": "Test Task",
        "description": "Test description",
        "status": "pending",
        "priority": "medium",
        "tags": ["test"],
        "due_date": None,
    }
    defaults.update(kwargs)
    return defaults


def create_user_data(**kwargs):
    """Factory function for creating user test data"""
    defaults = {
        "email": "test@example.com",
        "password": "SecurePassword123!",
    }
    defaults.update(kwargs)
    return defaults
