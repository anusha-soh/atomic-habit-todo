"""
Integration Tests for Tasks API
Phase 2 Chunk 2 - User Story 1 (T023-T024)
Tests end-to-end workflows with database and event emission
"""
import pytest
from uuid import uuid4, UUID
from datetime import datetime, timezone
from sqlmodel import Session, select

from src.models.task import Task
from src.models.user import User
from src.services.task_service import TaskService
from src.services.event_emitter import EventEmitter


@pytest.mark.integration
@pytest.mark.US1
class TestTaskCreationWorkflow:
    """Integration tests for task creation workflow - T023"""

    def test_create_task_stores_in_database(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T023: Test task creation workflow - POST creates task in DB

        Expected to FAIL initially - create_task() not implemented
        """
        service = TaskService(session, event_emitter)

        # This will FAIL until T025 is implemented
        task = service.create_task(
            user_id=user_id,
            title="Write project proposal",
            description="Complete the Q1 project proposal document",
            priority="high",
            tags=["work", "urgent"],
        )

        # Verify task was stored in database
        stored_task = session.get(Task, task.id)
        assert stored_task is not None, "Task should be persisted to database"
        assert stored_task.title == "Write project proposal"
        assert stored_task.user_id == user_id
        assert stored_task.priority == "high"
        assert "work" in stored_task.tags
        assert "urgent" in stored_task.tags

    def test_create_task_emits_event_to_log(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID, tmp_path
    ):
        """
        T023: Test task creation emits TASK_CREATED event

        Expected to FAIL initially
        """
        # Use event emitter with tmp directory for testing
        service = TaskService(session, event_emitter)

        # This will FAIL until T025 is implemented
        task = service.create_task(user_id=user_id, title="Test task")

        # Verify event was emitted to log file
        # Event emitter writes to daily log file
        log_files = list((tmp_path / "logs").glob("*.json"))
        assert len(log_files) > 0, "Event should be logged to file"

        # Could verify log content contains TASK_CREATED event
        # (Optional: parse JSON and verify event structure)

    def test_create_task_sets_defaults(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T023: Test create_task sets default values correctly

        Expected to FAIL initially
        """
        service = TaskService(session, event_emitter)

        # This will FAIL until T025 is implemented
        task = service.create_task(user_id=user_id, title="Test task")

        # Verify defaults
        assert task.status == "pending", "Default status should be 'pending'"
        assert task.completed is False, "Default completed should be False"
        assert task.priority is None, "Default priority should be None"
        assert task.tags == [], "Default tags should be empty list"
        assert task.due_date is None, "Default due_date should be None"

    def test_create_task_generates_timestamps(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T023: Test create_task generates created_at and updated_at timestamps

        Expected to FAIL initially
        """
        service = TaskService(session, event_emitter)

        before_creation = datetime.now(timezone.utc)

        # This will FAIL until T025 is implemented
        task = service.create_task(user_id=user_id, title="Test task")

        after_creation = datetime.now(timezone.utc)

        # Verify timestamps are set and reasonable
        assert task.created_at is not None
        assert task.updated_at is not None
        assert before_creation <= task.created_at <= after_creation
        assert task.created_at == task.updated_at  # Should be equal on creation


@pytest.mark.integration
@pytest.mark.US1
class TestUserIsolation:
    """Integration tests for user isolation - T024"""

    def test_user_cannot_access_another_users_tasks(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID, another_user
    ):
        """
        T024: Test User A cannot access User B's tasks

        Expected to FAIL initially - get_tasks() not implemented
        """
        service = TaskService(session, event_emitter)

        # Create task for User A
        task_a = Task(
            id=uuid4(),
            user_id=user_id,
            title="User A's task",
            status="pending",
            tags=[],
            completed=False,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        session.add(task_a)

        # Create task for User B (another_user)
        task_b = Task(
            id=uuid4(),
            user_id=another_user.id,
            title="User B's task",
            status="pending",
            tags=[],
            completed=False,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        session.add(task_b)
        session.commit()

        # This will FAIL until T026 is implemented
        # User A queries their tasks
        tasks_a, total_a = service.get_tasks(user_id=user_id, page=1, limit=50)

        # User A should only see their own task
        assert total_a == 1, "User A should see only 1 task (their own)"
        assert len(tasks_a) == 1
        assert tasks_a[0].user_id == user_id
        assert tasks_a[0].title == "User A's task"

        # Should NOT see User B's task
        task_ids = [task.id for task in tasks_a]
        assert task_b.id not in task_ids, "User A should not see User B's tasks"

    def test_different_users_can_have_same_task_title(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID, another_user
    ):
        """
        T024: Test multiple users can create tasks with identical titles (no uniqueness constraint)

        Expected to FAIL initially
        """
        service = TaskService(session, event_emitter)

        # This will FAIL until T025 is implemented
        # User A creates task
        task_a = service.create_task(user_id=user_id, title="Write report")

        # User B creates task with same title
        task_b = service.create_task(user_id=another_user.id, title="Write report")

        # Both should succeed (no uniqueness constraint on title)
        assert task_a.id != task_b.id
        assert task_a.title == task_b.title == "Write report"
        assert task_a.user_id == user_id
        assert task_b.user_id == another_user.id

    def test_user_isolation_in_database_queries(
        self, session: Session, user_id: UUID, another_user
    ):
        """
        T024: Test database-level user isolation with direct SQL queries

        Expected to FAIL initially (requires migration T003 to be run)
        """
        # Create tasks for both users
        task_a = Task(
            id=uuid4(),
            user_id=user_id,
            title="User A task",
            status="pending",
            tags=[],
            completed=False,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        task_b = Task(
            id=uuid4(),
            user_id=another_user.id,
            title="User B task",
            status="pending",
            tags=[],
            completed=False,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        session.add(task_a)
        session.add(task_b)
        session.commit()

        # Query tasks for user_id only
        statement = select(Task).where(Task.user_id == user_id)
        results = session.exec(statement).all()

        # Should only get User A's task
        assert len(results) == 1
        assert results[0].user_id == user_id
        assert results[0].title == "User A task"
