"""
Unit Tests for Task Model
Tests model-level validation via Pydantic model_validate (no database required)
"""
import pytest
from uuid import uuid4
from datetime import datetime, timezone

from src.models.task import Task


@pytest.mark.unit
class TestTaskModelValidation:
    """Unit tests for Task model Pydantic validators (no DB)"""

    def test_task_title_not_empty(self, user_id):
        """Task title cannot be empty (via model_validate)"""
        with pytest.raises(Exception, match="Title cannot be empty"):
            Task.model_validate({
                "id": uuid4(),
                "user_id": user_id,
                "title": "",
                "status": "pending",
                "tags": [],
                "completed": False,
            })

    def test_task_title_whitespace_only_rejected(self, user_id):
        """Task title cannot be only whitespace"""
        with pytest.raises(Exception, match="Title cannot be empty"):
            Task.model_validate({
                "id": uuid4(),
                "user_id": user_id,
                "title": "   ",
                "status": "pending",
                "tags": [],
                "completed": False,
            })

    def test_task_title_trimmed(self, user_id):
        """Task title is trimmed of whitespace"""
        task = Task.model_validate({
            "id": uuid4(),
            "user_id": user_id,
            "title": "  Hello World  ",
            "status": "pending",
            "tags": [],
            "completed": False,
        })
        assert task.title == "Hello World"

    def test_task_title_max_length(self, user_id):
        """Task title must be 500 characters or less"""
        with pytest.raises(Exception, match="500 characters or less"):
            Task.model_validate({
                "id": uuid4(),
                "user_id": user_id,
                "title": "a" * 501,
                "status": "pending",
                "tags": [],
                "completed": False,
            })

    def test_task_description_max_length(self, user_id):
        """Task description must be 5000 characters or less"""
        with pytest.raises(Exception, match="5000 characters or less"):
            Task.model_validate({
                "id": uuid4(),
                "user_id": user_id,
                "title": "Test",
                "description": "a" * 5001,
                "status": "pending",
                "tags": [],
                "completed": False,
            })

    def test_task_tags_trimmed(self, user_id):
        """Tags are trimmed of whitespace via validator"""
        task = Task.model_validate({
            "id": uuid4(),
            "user_id": user_id,
            "title": "Test",
            "status": "pending",
            "tags": ["  work  ", "  urgent  ", "  client  "],
            "completed": False,
        })
        assert task.tags == ["work", "urgent", "client"]

    def test_task_tags_empty_strings_removed(self, user_id):
        """Empty tag strings are removed"""
        task = Task.model_validate({
            "id": uuid4(),
            "user_id": user_id,
            "title": "Test",
            "status": "pending",
            "tags": ["work", "", "  ", "client"],
            "completed": False,
        })
        assert task.tags == ["work", "client"]

    def test_task_defaults(self, user_id):
        """Task has correct defaults"""
        task = Task(user_id=user_id, title="Test")
        assert task.status == "pending"
        assert task.completed is False
        assert task.description is None
        assert task.priority is None
        assert task.due_date is None

    def test_task_accepts_valid_priority(self, user_id):
        """Task model accepts valid priority values at construction"""
        for priority in ["high", "medium", "low", None]:
            task = Task(
                id=uuid4(),
                user_id=user_id,
                title="Test",
                priority=priority,
                status="pending",
                tags=[],
                completed=False,
            )
            assert task.priority == priority
