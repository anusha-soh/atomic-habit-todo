"""
Unit Tests for TaskService
Phase 2 Chunk 2 - User Story 1
Tests business logic in isolation with mocked dependencies
"""
import pytest
from uuid import uuid4, UUID
from datetime import datetime, timezone
from sqlmodel import Session

from src.services.task_service import TaskService
from src.models.task import Task


@pytest.mark.unit
@pytest.mark.US1
class TestTaskServiceCreate:
    """Unit tests for TaskService.create_task() - T018"""

    def test_create_task_with_valid_title(self, session: Session, mock_event_emitter, user_id: UUID):
        """
        T018: Test creating task with valid title

        Expected to FAIL initially - create_task() not implemented
        """
        service = TaskService(session, mock_event_emitter)

        # This will FAIL until T025 is implemented
        task = service.create_task(
            user_id=user_id,
            title="Write project proposal",
            description="Complete the Q1 project proposal document",
        )

        # Assertions (will fail because create_task returns None currently)
        assert task is not None, "create_task should return a Task object"
        assert task.title == "Write project proposal"
        assert task.user_id == user_id
        assert task.status == "pending"  # Default status
        assert task.completed is False  # Default completed flag

    def test_create_task_emits_event(self, session: Session, mock_event_emitter, user_id: UUID):
        """
        T018: Test that create_task emits TASK_CREATED event

        Expected to FAIL initially
        """
        service = TaskService(session, mock_event_emitter)

        # This will FAIL until T025 is implemented
        task = service.create_task(user_id=user_id, title="Test task")

        # Verify event was emitted
        mock_event_emitter.emit.assert_called_once()
        call_args = mock_event_emitter.emit.call_args
        assert call_args[0][0] == "TASK_CREATED", "Should emit TASK_CREATED event"
        assert "task_id" in call_args[0][1]["payload"]

    def test_create_task_trims_whitespace_from_title(self, session: Session, mock_event_emitter, user_id: UUID):
        """
        T018: Test that create_task trims leading/trailing whitespace from title

        Expected to FAIL initially
        """
        service = TaskService(session, mock_event_emitter)

        # This will FAIL until T025 is implemented
        task = service.create_task(user_id=user_id, title="  Test task  ")

        assert task.title == "Test task", "Title should be trimmed"

    def test_create_task_with_empty_title_raises_error(self, session: Session, mock_event_emitter, user_id: UUID):
        """
        T018: Test that create_task raises ValueError for empty title

        Expected to FAIL initially
        """
        service = TaskService(session, mock_event_emitter)

        # This will FAIL until T025 implements validation
        with pytest.raises(ValueError, match="Title cannot be empty"):
            service.create_task(user_id=user_id, title="")

    def test_create_task_with_whitespace_only_title_raises_error(self, session: Session, mock_event_emitter, user_id: UUID):
        """
        T018: Test that create_task raises ValueError for whitespace-only title

        Expected to FAIL initially
        """
        service = TaskService(session, mock_event_emitter)

        # This will FAIL until T025 implements validation
        with pytest.raises(ValueError, match="Title cannot be empty"):
            service.create_task(user_id=user_id, title="   ")


@pytest.mark.unit
@pytest.mark.US1
class TestTaskServiceGetTasks:
    """Unit tests for TaskService.get_tasks() - T019"""

    def test_get_tasks_returns_paginated_results(self, session: Session, mock_event_emitter, user_id: UUID, multiple_tasks):
        """
        T019: Test get_tasks returns paginated list with total count

        Expected to FAIL initially - get_tasks() not implemented
        """
        service = TaskService(session, mock_event_emitter)

        # This will FAIL until T026 is implemented
        tasks, total = service.get_tasks(user_id=user_id, page=1, limit=5)

        assert isinstance(tasks, list), "Should return list of tasks"
        assert isinstance(total, int), "Should return total count"
        assert len(tasks) <= 5, "Should respect limit parameter"
        assert total == 10, "Total should be 10 (from multiple_tasks fixture)"

    def test_get_tasks_second_page(self, session: Session, mock_event_emitter, user_id: UUID, multiple_tasks):
        """
        T019: Test get_tasks pagination with page=2

        Expected to FAIL initially
        """
        service = TaskService(session, mock_event_emitter)

        # This will FAIL until T026 is implemented
        tasks, total = service.get_tasks(user_id=user_id, page=2, limit=5)

        assert len(tasks) == 5, "Second page should have remaining 5 tasks"
        assert total == 10

    def test_get_tasks_filters_by_user_id(self, session: Session, mock_event_emitter, user_id: UUID, another_user, multiple_tasks):
        """
        T019: Test get_tasks only returns tasks for specified user

        Expected to FAIL initially
        """
        service = TaskService(session, mock_event_emitter)

        # Create a task for another user
        other_task = Task(
            id=uuid4(),
            user_id=another_user.id,
            title="Other user's task",
            status="pending",
            tags=[],
            completed=False,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        session.add(other_task)
        session.commit()

        # This will FAIL until T026 is implemented
        tasks, total = service.get_tasks(user_id=user_id, page=1, limit=50)

        # Should only return tasks for user_id, not another_user
        assert all(task.user_id == user_id for task in tasks)
        assert total == 10  # Not 11 (other user's task excluded)

    def test_get_tasks_default_sort_newest_first(self, session: Session, mock_event_emitter, user_id: UUID, multiple_tasks):
        """
        T019: Test get_tasks default sorting is created_at DESC (newest first)

        Expected to FAIL initially
        """
        service = TaskService(session, mock_event_emitter)

        # This will FAIL until T026 is implemented
        tasks, _ = service.get_tasks(user_id=user_id, page=1, limit=50)

        # Verify tasks are sorted newest first
        if len(tasks) > 1:
            for i in range(len(tasks) - 1):
                assert tasks[i].created_at >= tasks[i + 1].created_at


@pytest.mark.unit
@pytest.mark.US1
class TestTaskModel:
    """Unit tests for Task model validation - T020"""

    def test_task_title_not_empty(self, session: Session, user_id: UUID):
        """
        T020: Test Task model enforces title not empty constraint

        Expected to FAIL initially - database constraint not enforced at model level
        """
        # This will FAIL until database migration is run (T003)
        # or model-level validation is added
        with pytest.raises(Exception):  # Should raise validation error
            task = Task(
                id=uuid4(),
                user_id=user_id,
                title="",  # Empty title should fail
                status="pending",
                tags=[],
                completed=False,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            session.add(task)
            session.commit()

    def test_task_title_max_length_500(self, session: Session, user_id: UUID):
        """
        T020: Test Task model enforces title max length constraint

        Expected to FAIL initially
        """
        # This will FAIL until constraint is enforced
        long_title = "x" * 501  # 501 characters exceeds limit

        with pytest.raises(Exception):  # Should raise validation error
            task = Task(
                id=uuid4(),
                user_id=user_id,
                title=long_title,
                status="pending",
                tags=[],
                completed=False,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            session.add(task)
            session.commit()

    def test_task_description_max_length_5000(self, session: Session, user_id: UUID):
        """
        T020: Test Task model enforces description max length constraint

        Expected to FAIL initially
        """
        long_description = "x" * 5001  # 5001 characters exceeds limit

        # This will FAIL until constraint is enforced
        with pytest.raises(Exception):  # Should raise validation error
            task = Task(
                id=uuid4(),
                user_id=user_id,
                title="Test task",
                description=long_description,
                status="pending",
                tags=[],
                completed=False,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            session.add(task)
            session.commit()
