"""
Pytest Fixtures and Configuration
Root conftest — provides ONLY non-DB fixtures.
DB-dependent fixtures live in tests/integration/conftest.py.
"""
import pytest
from uuid import uuid4
from unittest.mock import Mock

from src.services.event_emitter import EventEmitter


# ============================================================================
# User ID Fixture (no DB)
# ============================================================================

@pytest.fixture(name="user_id")
def user_id_fixture():
    """Generate a test user ID"""
    return uuid4()


# ============================================================================
# Event Emitter Fixtures (no DB)
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
# Test Data Factories (no DB)
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
