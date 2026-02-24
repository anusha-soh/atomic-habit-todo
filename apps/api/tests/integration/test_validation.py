"""
Integration Tests for Input Validation
Phase 2 - 008 Production Hardening (T042, T043, T044)
"""
import pytest
from uuid import uuid4, UUID
from datetime import datetime, timezone
from fastapi.testclient import TestClient

from src.main import app
from src.middleware.auth import get_current_user_id
from src.models.habit import Habit

client = TestClient(app)


@pytest.fixture
def mock_auth(user_id):
    """Mock authentication to return the test user_id"""
    app.dependency_overrides[get_current_user_id] = lambda: user_id
    yield
    app.dependency_overrides.pop(get_current_user_id, None)


@pytest.mark.integration
class TestTaskValidation:
    """Integration tests for task input validation"""

    def test_task_update_invalid_status(
        self, mock_auth, user_id: UUID, sample_task
    ):
        """
        T042: PATCH a task with an invalid status value.
        The Pydantic enum validation should reject it with HTTP 422.
        """
        response = client.patch(
            f"/api/{user_id}/tasks/{sample_task.id}",
            json={"status": "not_a_real_status"},
        )
        assert response.status_code == 422, (
            f"Expected 422 for invalid status, got {response.status_code}: "
            f"{response.text}"
        )

    def test_task_update_description_too_long(
        self, mock_auth, user_id: UUID, sample_task
    ):
        """
        T044: PATCH a task with a description exceeding max length (5000 chars).
        The Pydantic max_length validation should reject it with HTTP 422.
        """
        response = client.patch(
            f"/api/{user_id}/tasks/{sample_task.id}",
            json={"description": "x" * 5001},
        )
        assert response.status_code == 422, (
            f"Expected 422 for oversized description, got {response.status_code}: "
            f"{response.text}"
        )


@pytest.mark.integration
class TestHabitValidation:
    """Integration tests for habit input validation"""

    def test_habit_update_invalid_category(
        self, mock_auth, session, user_id: UUID, test_user
    ):
        """
        T043: PATCH a habit with an invalid category value.
        The Pydantic HabitCategory enum validation should reject it with HTTP 422.
        """
        # Create a habit directly via session
        habit = Habit(
            id=uuid4(),
            user_id=user_id,
            identity_statement="I am a person who reads daily",
            two_minute_version="Read one page",
            category="Learning",
            recurring_schedule={"type": "daily"},
            status="active",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        session.add(habit)
        session.commit()
        session.refresh(habit)

        response = client.patch(
            f"/api/{user_id}/habits/{habit.id}",
            json={"category": "not_a_category"},
        )
        assert response.status_code == 422, (
            f"Expected 422 for invalid category, got {response.status_code}: "
            f"{response.text}"
        )
