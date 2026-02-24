"""
Integration Tests for Task Completion with Habit Sync
Phase 2 - 008 Production Hardening (T008)
"""
import pytest
from uuid import uuid4, UUID
from datetime import datetime, timezone
from fastapi.testclient import TestClient

from src.main import app
from src.middleware.auth import get_current_user_id
from src.models.task import Task

client = TestClient(app)


@pytest.fixture
def mock_auth(user_id):
    """Mock authentication to return the test user_id"""
    app.dependency_overrides[get_current_user_id] = lambda: user_id
    yield
    app.dependency_overrides.pop(get_current_user_id, None)


@pytest.mark.integration
class TestTaskCompletionHabitSync:
    """Integration tests for habit sync on task completion"""

    def test_complete_task_habit_sync_failure(
        self, mock_auth, session, user_id: UUID, test_user
    ):
        """
        T008: Completing a habit-task whose linked habit does not exist
        should still return HTTP 200 (task completes), but habit_sync
        should indicate failure.

        The task has is_habit_task=True and generated_by_habit_id pointing
        to a non-existent habit UUID, so the sync step will fail gracefully.
        """
        non_existent_habit_id = uuid4()

        # Create a habit-linked task directly in the database
        task = Task(
            id=uuid4(),
            user_id=user_id,
            title="Habit Task - Read one page",
            description="Auto-generated from habit",
            status="pending",
            priority="medium",
            tags=["habit"],
            completed=False,
            is_habit_task=True,
            generated_by_habit_id=non_existent_habit_id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        session.add(task)
        session.commit()
        session.refresh(task)

        # Complete the task via the API
        response = client.patch(f"/api/{user_id}/tasks/{task.id}/complete")
        assert response.status_code == 200, (
            f"Expected 200 but got {response.status_code}: {response.text}"
        )

        data = response.json()

        # Task should be marked completed
        assert data["completed"] is True
        assert data["status"] == "completed"

        # habit_sync should be present and indicate failure
        assert data["habit_sync"] is not None, (
            "habit_sync should be present when habit sync fails"
        )
        habit_sync = data["habit_sync"]
        assert habit_sync["synced"] is False

        # Either 'error' is a non-empty string or 'message' contains error info
        has_error_info = (
            (habit_sync.get("error") and len(habit_sync["error"]) > 0)
            or (habit_sync.get("message") and len(habit_sync["message"]) > 0)
        )
        assert has_error_info, (
            f"habit_sync should contain error information, got: {habit_sync}"
        )
