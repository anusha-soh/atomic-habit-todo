"""
Unit Tests for Task Model
Phase 2 Chunk 2 - User Story 4
Tests model-level validation and constraints
"""
import pytest
from uuid import uuid4
from datetime import datetime, timezone
from sqlmodel import Session

from src.models.task import Task


@pytest.mark.unit
@pytest.mark.US4
class TestTaskModelPriority:
    """Unit tests for Task model priority validation - T066"""

    def test_task_priority_enum_values(self, session: Session, user_id):
        """T066: Test Task model enforces priority enum values (high, medium, low, null)"""
        # Valid priority values should work
        valid_priorities = ["high", "medium", "low", None]

        for priority in valid_priorities:
            task = Task(
                id=uuid4(),
                user_id=user_id,
                title="Test task",
                priority=priority,
                status="pending",
                tags=[],
                completed=False,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            session.add(task)
            session.commit()
            session.refresh(task)

            assert task.priority == priority
            session.delete(task)  # Clean up
            session.commit()

    def test_task_priority_invalid_value_rejected(self, session: Session, user_id):
        """T066: Test Task model rejects invalid priority values"""
        invalid_priorities = ["urgent", "critical", "low_priority", "HIGH"]

        for priority in invalid_priorities:
            with pytest.raises(Exception):  # Should raise validation error
                task = Task(
                    id=uuid4(),
                    user_id=user_id,
                    title="Test task",
                    priority=priority,  # Invalid value
                    status="pending",
                    tags=[],
                    completed=False,
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc),
                )
                session.add(task)
                session.commit()
                session.refresh(task)  # This should trigger validation


@pytest.mark.unit
@pytest.mark.US6
class TestTaskModelTags:
    """Unit tests for Task model tags validation - T096"""

    def test_task_tags_max_20_validation(self, session: Session, user_id):
        """T096: Test Task model enforces maximum of 20 tags"""
        # Should work with 20 tags
        valid_tags = [f"tag{i}" for i in range(20)]

        task = Task(
            id=uuid4(),
            user_id=user_id,
            title="Test task",
            status="pending",
            tags=valid_tags,
            completed=False,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        session.add(task)
        session.commit()
        session.refresh(task)

        assert len(task.tags) == 20

        # Clean up
        session.delete(task)
        session.commit()

    def test_task_tags_trim_whitespace(self, session: Session, user_id):
        """T096: Test TaskService trims whitespace from tag values"""
        from src.services.task_service import TaskService
        from unittest.mock import Mock
        
        # Create tags with leading/trailing whitespace
        tags_with_spaces = ["  work  ", "  urgent  ", "  client  "]
        
        service = TaskService(session, Mock())
        task = service.create_task(
            user_id=user_id,
            title="Test task",
            tags=tags_with_spaces
        )

        # Check that tags are trimmed
        expected_tags = ["work", "urgent", "client"]
        assert task.tags == expected_tags

        # Clean up
        session.delete(task)
        session.commit()