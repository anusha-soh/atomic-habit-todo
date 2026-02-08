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
        log_files = list((tmp_path / "logs").glob("*.jsonl"))
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
        # Use small delta for equality check due to potential slight differences in generation
        assert (task.updated_at - task.created_at).total_seconds() < 1  # Should be very close on creation


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


@pytest.mark.integration
@pytest.mark.US2
class TestTaskUpdateWorkflow:
    """Integration tests for task update workflow - T043"""

    def test_update_task_persists_changes(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T043: Test update_task persists changes to database
        """
        service = TaskService(session, event_emitter)

        # Create a task first
        task = service.create_task(user_id=user_id, title="Original Title")
        original_id = task.id

        # Update the task
        updated = service.update_task(
            user_id=user_id,
            task_id=task.id,
            title="Updated Title",
            description="New description",
            status="in_progress",
        )

        # Verify changes persisted
        session.refresh(updated)
        stored = session.get(Task, original_id)
        assert stored.title == "Updated Title"
        assert stored.description == "New description"
        assert stored.status == "in_progress"

    def test_update_task_updates_timestamp(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T043: Test update_task updates the updated_at timestamp
        """
        import time
        service = TaskService(session, event_emitter)

        # Create a task
        task = service.create_task(user_id=user_id, title="Test Task")
        original_updated_at = task.updated_at

        # Small delay to ensure timestamp difference
        time.sleep(0.01)

        # Update the task
        updated = service.update_task(
            user_id=user_id,
            task_id=task.id,
            title="Modified Task"
        )

        # updated_at should be newer
        assert updated.updated_at >= original_updated_at

    def test_update_task_partial_update(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T043: Test partial updates preserve other fields
        """
        service = TaskService(session, event_emitter)

        # Create task with all fields
        task = service.create_task(
            user_id=user_id,
            title="Original",
            description="Original description",
            priority="high",
            tags=["tag1", "tag2"],
        )

        # Update only title
        updated = service.update_task(
            user_id=user_id,
            task_id=task.id,
            title="Updated Title"
        )

        # Other fields should be preserved
        assert updated.description == "Original description"
        assert updated.priority == "high"
        assert updated.tags == ["tag1", "tag2"]

    def test_update_cannot_change_user_id(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID, another_user
    ):
        """
        T043: Test update cannot change the task owner
        """
        service = TaskService(session, event_emitter)

        # Create task for user_id
        task = service.create_task(user_id=user_id, title="My Task")

        # another_user cannot update this task
        with pytest.raises(ValueError, match="Task not found"):
            service.update_task(
                user_id=another_user.id,
                task_id=task.id,
                title="Hijacked"
            )

        # Original task unchanged
        stored = session.get(Task, task.id)
        assert stored.title == "My Task"
        assert stored.user_id == user_id


@pytest.mark.integration
@pytest.mark.US2
class TestTaskCompleteWorkflow:
    """Integration tests for task completion workflow - T044"""

    def test_mark_complete_workflow(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T044: Test full completion workflow
        """
        service = TaskService(session, event_emitter)

        # Create a pending task
        task = service.create_task(
            user_id=user_id,
            title="Complete Me",
            status="pending"
        )
        assert task.completed is False
        assert task.status == "pending"

        # Mark as complete
        completed = service.mark_complete(user_id=user_id, task_id=task.id)

        # Verify completion
        assert completed.completed is True
        assert completed.status == "completed"

        # Verify persisted
        stored = session.get(Task, task.id)
        assert stored.completed is True
        assert stored.status == "completed"

    def test_mark_complete_from_in_progress(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T044: Test completion from in_progress status
        """
        service = TaskService(session, event_emitter)

        # Create an in-progress task
        task = service.create_task(user_id=user_id, title="Working on it")
        service.update_task(user_id=user_id, task_id=task.id, status="in_progress")

        # Mark as complete
        completed = service.mark_complete(user_id=user_id, task_id=task.id)

        assert completed.status == "completed"
        assert completed.completed is True

    def test_mark_complete_idempotent(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T044: Test marking complete multiple times is idempotent
        """
        service = TaskService(session, event_emitter)

        # Create and complete a task
        task = service.create_task(user_id=user_id, title="Done Task")
        completed1 = service.mark_complete(user_id=user_id, task_id=task.id)

        # Mark complete again - should not error
        completed2 = service.mark_complete(user_id=user_id, task_id=task.id)

        assert completed2.status == "completed"
        assert completed2.id == completed1.id

    def test_mark_complete_user_isolation(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID, another_user
    ):
        """
        T044: Test user cannot complete another user's task
        """
        service = TaskService(session, event_emitter)

        # Create task for user_id
        task = service.create_task(user_id=user_id, title="My Task")

        # another_user tries to complete it
        with pytest.raises(ValueError, match="Task not found"):
            service.mark_complete(user_id=another_user.id, task_id=task.id)

        # Task should still be pending
        stored = session.get(Task, task.id)
        assert stored.status == "pending"
        assert stored.completed is False


@pytest.mark.integration
@pytest.mark.US2
class TestGetTaskWorkflow:
    """Integration tests for single task retrieval - T044"""

    def test_get_task_returns_complete_data(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T044: Test get_task returns all task data
        """
        service = TaskService(session, event_emitter)

        # Create task with all fields
        task = service.create_task(
            user_id=user_id,
            title="Full Task",
            description="Complete description",
            priority="high",
            tags=["tag1", "tag2"],
        )

        # Retrieve it
        result = service.get_task(user_id=user_id, task_id=task.id)

        assert result is not None
        assert result.id == task.id
        assert result.title == "Full Task"
        assert result.description == "Complete description"
        assert result.priority == "high"
        assert result.tags == ["tag1", "tag2"]
        assert result.created_at is not None
        assert result.updated_at is not None

    def test_get_task_user_isolation(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID, another_user
    ):
        """
        T044: Test user cannot view another user's task by ID
        """
        service = TaskService(session, event_emitter)

        # Create task for user_id
        task = service.create_task(user_id=user_id, title="Private Task")

        # another_user tries to get it
        result = service.get_task(user_id=another_user.id, task_id=task.id)

        # Should return None (not expose error about task existence)
        assert result is None

    def test_get_nonexistent_task(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T044: Test getting non-existent task returns None
        """
        service = TaskService(session, event_emitter)

        result = service.get_task(user_id=user_id, task_id=uuid4())

        assert result is None


@pytest.mark.integration
@pytest.mark.US3
class TestTaskDeleteWorkflow:
    """Integration tests for task deletion workflow - T058, T059"""

    def test_delete_task_removes_from_database(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T058: Test task deletion workflow - DELETE removes task from DB
        """
        service = TaskService(session, event_emitter)

        # Create a task first
        task = service.create_task(
            user_id=user_id,
            title="Task to delete",
            description="This will be deleted"
        )

        # Verify task exists
        stored_before = session.get(Task, task.id)
        assert stored_before is not None
        assert stored_before.title == "Task to delete"

        # Delete the task
        service.delete_task(user_id=user_id, task_id=task.id)

        # Verify task no longer exists in database
        stored_after = session.get(Task, task.id)
        assert stored_after is None

    def test_delete_task_emits_event(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T058: Test task deletion emits TASK_DELETED event
        """
        # Track events emitted
        emitted_events = []
        original_emit = event_emitter.emit

        def track_emit(event_type, user_id, payload, log_level="info"):
            emitted_events.append((event_type, user_id, payload))
            return original_emit(event_type, user_id, payload, log_level)

        event_emitter.emit = track_emit
        service = TaskService(session, event_emitter)

        # Create a task first
        task = service.create_task(user_id=user_id, title="Task to delete")

        # Delete the task
        service.delete_task(user_id=user_id, task_id=task.id)

        # Verify TASK_DELETED event was emitted
        deleted_events = [e for e in emitted_events if e[0] == "TASK_DELETED"]
        assert len(deleted_events) == 1, f"Expected 1 TASK_DELETED event, got {len(deleted_events)}"

        event_type, event_user_id, payload = deleted_events[0]
        assert event_type == "TASK_DELETED"
        assert event_user_id == user_id
        assert payload["task_id"] == str(task.id)

    def test_get_deleted_task_returns_404(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T059: Test GET after DELETE returns 404
        """
        service = TaskService(session, event_emitter)

        # Create a task
        task = service.create_task(user_id=user_id, title="Task to delete")

        # Verify it exists
        retrieved_before = service.get_task(user_id=user_id, task_id=task.id)
        assert retrieved_before is not None

        # Delete the task
        service.delete_task(user_id=user_id, task_id=task.id)

        # Verify it no longer exists
        retrieved_after = service.get_task(user_id=user_id, task_id=task.id)
        assert retrieved_after is None

    def test_delete_task_user_isolation(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID, another_user
    ):
        """
        T058: Test user cannot delete another user's task
        """
        service = TaskService(session, event_emitter)

        # Create task for user_id
        task = service.create_task(user_id=user_id, title="My Task")

        # another_user tries to delete it
        with pytest.raises(ValueError, match="Task not found"):
            service.delete_task(user_id=another_user.id, task_id=task.id)

        # Task should still exist
        stored = session.get(Task, task.id)
        assert stored is not None
        assert stored.title == "My Task"


@pytest.mark.integration
@pytest.mark.US4
class TestTaskPriorityFiltering:
    """Integration tests for priority filtering - T069"""

    def test_get_tasks_filter_by_priority(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T069: Test GET /api/{user_id}/tasks?priority=high returns only high-priority tasks
        """
        service = TaskService(session, event_emitter)

        # Create tasks with different priorities
        high_task = service.create_task(user_id=user_id, title="High priority task", priority="high")
        medium_task = service.create_task(user_id=user_id, title="Medium priority task", priority="medium")
        low_task = service.create_task(user_id=user_id, title="Low priority task", priority="low")
        none_task = service.create_task(user_id=user_id, title="No priority task", priority=None)

        # Test filtering for high priority
        high_tasks, total = service.get_tasks(user_id=user_id, priority="high", page=1, limit=50)
        assert total == 1
        assert len(high_tasks) == 1
        assert high_tasks[0].id == high_task.id
        assert high_tasks[0].priority == "high"

        # Test filtering for medium priority
        medium_tasks, total = service.get_tasks(user_id=user_id, priority="medium", page=1, limit=50)
        assert total == 1
        assert len(medium_tasks) == 1
        assert medium_tasks[0].id == medium_task.id
        assert medium_tasks[0].priority == "medium"

        # Test filtering for low priority
        low_tasks, total = service.get_tasks(user_id=user_id, priority="low", page=1, limit=50)
        assert total == 1
        assert len(low_tasks) == 1
        assert low_tasks[0].id == low_task.id
        assert low_tasks[0].priority == "low"

        # Test filtering for null priority
        none_tasks, total = service.get_tasks(user_id=user_id, priority=None, page=1, limit=50)
        assert total == 1
        assert len(none_tasks) == 1
        assert none_tasks[0].id == none_task.id
        assert none_tasks[0].priority is None

    def test_get_tasks_combine_priority_with_other_filters(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T069: Test priority filter combines with other filters correctly
        """
        service = TaskService(session, event_emitter)

        # Create tasks with different combinations
        service.create_task(user_id=user_id, title="High pending task", priority="high", status="pending")
        service.create_task(user_id=user_id, title="High completed task", priority="high", status="completed")
        service.create_task(user_id=user_id, title="Low pending task", priority="low", status="pending")

        # Filter for high priority AND pending status
        high_pending_tasks, total = service.get_tasks(
            user_id=user_id, priority="high", status="pending", page=1, limit=50
        )
        assert total == 1
        assert len(high_pending_tasks) == 1
        assert high_pending_tasks[0].title == "High pending task"
        assert high_pending_tasks[0].priority == "high"
        assert high_pending_tasks[0].status == "pending"

        # Filter for low priority AND pending status
        low_pending_tasks, total = service.get_tasks(
            user_id=user_id, priority="low", status="pending", page=1, limit=50
        )
        assert total == 1
        assert len(low_pending_tasks) == 1
        assert low_pending_tasks[0].title == "Low pending task"
        assert low_pending_tasks[0].priority == "low"
        assert low_pending_tasks[0].status == "pending"


@pytest.mark.integration
@pytest.mark.US5
class TestTaskDueDateSorting:
    """Integration tests for due_date sorting - T083"""

    def test_get_tasks_sort_by_due_date_asc(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T083: Test GET /api/{user_id}/tasks?sort=due_date_asc sorts by due date ascending
        """
        from datetime import datetime, timedelta
        service = TaskService(session, event_emitter)

        # Create tasks with different due dates
        yesterday_task = service.create_task(
            user_id=user_id, title="Yesterday", due_date=datetime.now() - timedelta(days=1)
        )
        tomorrow_task = service.create_task(
            user_id=user_id, title="Tomorrow", due_date=datetime.now() + timedelta(days=1)
        )
        today_task = service.create_task(
            user_id=user_id, title="Today", due_date=datetime.now()
        )
        no_due_date_task = service.create_task(
            user_id=user_id, title="No due date", due_date=None
        )

        # Get tasks sorted by due_date ASC (nulls last)
        tasks, total = service.get_tasks(user_id=user_id, sort="due_date_asc", page=1, limit=50)

        # Should be ordered: yesterday, today, tomorrow, no_due_date
        assert total == 4
        assert len(tasks) == 4

        # Check order: tasks with due dates should come first, ordered by date, then nulls
        assert tasks[0].id == yesterday_task.id
        assert tasks[1].id == today_task.id
        assert tasks[2].id == tomorrow_task.id
        assert tasks[3].id == no_due_date_task.id

    def test_get_tasks_sort_by_due_date_desc(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T083: Test GET /api/{user_id}/tasks?sort=due_date_desc sorts by due date descending
        """
        from datetime import datetime, timedelta
        service = TaskService(session, event_emitter)

        # Create tasks with different due dates
        yesterday_task = service.create_task(
            user_id=user_id, title="Yesterday", due_date=datetime.now() - timedelta(days=1)
        )
        tomorrow_task = service.create_task(
            user_id=user_id, title="Tomorrow", due_date=datetime.now() + timedelta(days=1)
        )
        today_task = service.create_task(
            user_id=user_id, title="Today", due_date=datetime.now()
        )
        no_due_date_task = service.create_task(
            user_id=user_id, title="No due date", due_date=None
        )

        # Get tasks sorted by due_date DESC (nulls last)
        tasks, total = service.get_tasks(user_id=user_id, sort="due_date_desc", page=1, limit=50)

        # Should be ordered: tomorrow, today, yesterday, no_due_date
        assert total == 4
        assert len(tasks) == 4

        # Check order: tasks with due dates should come first, ordered by date descending, then nulls
        assert tasks[0].id == tomorrow_task.id
        assert tasks[1].id == today_task.id
        assert tasks[2].id == yesterday_task.id
        assert tasks[3].id == no_due_date_task.id


@pytest.mark.integration
@pytest.mark.US6
class TestTaskTagFiltering:
    """Integration tests for tag filtering - T099"""

    def test_get_tasks_filter_by_tags(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T099: Test GET /api/{user_id}/tasks?tags=work,urgent matches ANY tags
        """
        service = TaskService(session, event_emitter)

        # Create tasks with different tag combinations
        service.create_task(user_id=user_id, title="Work task", tags=["work", "important"])
        service.create_task(user_id=user_id, title="Urgent task", tags=["urgent", "client"])
        service.create_task(user_id=user_id, title="Both tags", tags=["work", "urgent"])
        service.create_task(user_id=user_id, title="Personal task", tags=["personal"])
        service.create_task(user_id=user_id, title="No tags", tags=[])

        # Test filtering for tasks with "work" tag
        work_tasks, total = service.get_tasks(user_id=user_id, tags=["work"], page=1, limit=50)
        assert total == 2
        assert len(work_tasks) == 2
        work_titles = {t.title for t in work_tasks}
        assert work_titles == {"Work task", "Both tags"}

        # Test filtering for tasks with "urgent" tag
        urgent_tasks, total = service.get_tasks(user_id=user_id, tags=["urgent"], page=1, limit=50)
        assert total == 2
        assert len(urgent_tasks) == 2
        urgent_titles = {t.title for t in urgent_tasks}
        assert urgent_titles == {"Urgent task", "Both tags"}

        # Test filtering for tasks with both "work" and "urgent" tags (ANY match)
        any_tasks, total = service.get_tasks(user_id=user_id, tags=["work", "urgent"], page=1, limit=50)
        assert total == 3
        assert len(any_tasks) == 3
        any_titles = {t.title for t in any_tasks}
        assert any_titles == {"Work task", "Urgent task", "Both tags"}

    def test_get_tasks_filter_by_tags_combines_with_other_filters(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T099: Test tag filter combines with other filters correctly
        """
        service = TaskService(session, event_emitter)

        # Create tasks with different combinations
        service.create_task(user_id=user_id, title="High work task", priority="high", tags=["work", "important"])
        service.create_task(user_id=user_id, title="Low work task", priority="low", tags=["work"])
        service.create_task(user_id=user_id, title="High personal task", priority="high", tags=["personal"])

        # Filter for high priority AND work tag
        high_work_tasks, total = service.get_tasks(
            user_id=user_id, priority="high", tags=["work"], page=1, limit=50
        )
        assert total == 1
        assert len(high_work_tasks) == 1
        assert high_work_tasks[0].title == "High work task"
        assert high_work_tasks[0].priority == "high"
        assert "work" in high_work_tasks[0].tags


@pytest.mark.integration
@pytest.mark.US7
class TestTaskSearch:
    """Integration tests for search functionality - T113, T114"""

    def test_get_tasks_search_by_title(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T113: Test GET /api/{user_id}/tasks?search=proposal matches in title
        """
        service = TaskService(session, event_emitter)

        # Create tasks with different titles
        service.create_task(user_id=user_id, title="Write project proposal", description="Detailed project plan")
        service.create_task(user_id=user_id, title="Review quarterly report", description="Financial analysis")
        service.create_task(user_id=user_id, title="Prepare presentation", description="Project overview")

        # Search for "proposal"
        results, total = service.get_tasks(user_id=user_id, search="proposal", page=1, limit=50)
        assert total == 1
        assert len(results) == 1
        assert "proposal" in results[0].title.lower()

    def test_get_tasks_search_by_description(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T113: Test GET /api/{user_id}/tasks?search=analysis matches in description
        """
        service = TaskService(session, event_emitter)

        # Create tasks with different descriptions
        service.create_task(user_id=user_id, title="Meeting notes", description="Write detailed meeting notes")
        service.create_task(user_id=user_id, title="Budget review", description="Analyze quarterly budget")
        service.create_task(user_id=user_id, title="Status update", description="Prepare weekly status")

        # Search for "analyze"
        results, total = service.get_tasks(user_id=user_id, search="analyze", page=1, limit=50)
        assert total == 1
        assert len(results) == 1
        assert "analyze" in results[0].description.lower()

    def test_get_tasks_search_title_and_description(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T113: Test GET /api/{user_id}/tasks?search=details matches both title and description
        """
        service = TaskService(session, event_emitter)

        # Create tasks where one matches title, another matches description
        task1 = service.create_task(user_id=user_id, title="Project details", description="Not relevant")
        task2 = service.create_task(user_id=user_id, title="Not relevant", description="Budget details here")
        service.create_task(user_id=user_id, title="Unrelated", description="Unrelated content")

        # Search for "details" - should match both title and description
        results, total = service.get_tasks(user_id=user_id, search="details", page=1, limit=50)
        assert total == 2
        assert len(results) == 2
        result_ids = {t.id for t in results}
        assert result_ids == {task1.id, task2.id}

    def test_get_tasks_search_case_insensitive(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T114: Test search is case-insensitive
        """
        service = TaskService(session, event_emitter)

        # Create a task with mixed case
        service.create_task(user_id=user_id, title="PROJECT Proposal", description="Business PLAN")

        # Search with lowercase should find uppercase content
        results_lower, total = service.get_tasks(user_id=user_id, search="project", page=1, limit=50)
        assert total == 1
        assert "PROJECT" in results_lower[0].title.upper()

        # Search with different case variations
        results_mixed, total = service.get_tasks(user_id=user_id, search="Plan", page=1, limit=50)
        assert total == 1
        assert "PLAN" in results_mixed[0].description.upper()

    def test_get_tasks_search_combines_with_other_filters(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T113: Test search combines with other filters correctly
        """
        service = TaskService(session, event_emitter)

        # Create tasks with different combinations
        service.create_task(user_id=user_id, title="Urgent client proposal", priority="high", tags=["work", "urgent"])
        service.create_task(user_id=user_id, title="Non-urgent client report", priority="low", tags=["work"])
        service.create_task(user_id=user_id, title="Personal task", priority="medium", tags=["personal"])

        # Search for "client" with high priority
        results, total = service.get_tasks(
            user_id=user_id, search="client", priority="high", page=1, limit=50
        )
        assert total == 1
        assert len(results) == 1
        assert "client" in results[0].title.lower()
        assert results[0].priority == "high"


@pytest.mark.integration
@pytest.mark.US8
class TestTaskStatusFiltering:
    """Integration tests for status filtering - T125, T126"""

    def test_get_tasks_filter_by_status(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T125: Test GET /api/{user_id}/tasks?status=pending returns only pending tasks
        """
        service = TaskService(session, event_emitter)

        # Create tasks with different statuses
        pending_task = service.create_task(user_id=user_id, title="Pending task", status="pending")
        in_progress_task = service.create_task(user_id=user_id, title="In progress task", status="in_progress")
        completed_task = service.create_task(user_id=user_id, title="Completed task", status="completed")

        # Test filtering for pending status
        pending_results, total = service.get_tasks(user_id=user_id, status="pending", page=1, limit=50)
        assert total == 1
        assert len(pending_results) == 1
        assert pending_results[0].id == pending_task.id
        assert pending_results[0].status == "pending"

        # Test filtering for in_progress status
        in_progress_results, total = service.get_tasks(user_id=user_id, status="in_progress", page=1, limit=50)
        assert total == 1
        assert len(in_progress_results) == 1
        assert in_progress_results[0].id == in_progress_task.id
        assert in_progress_results[0].status == "in_progress"

        # Test filtering for completed status
        completed_results, total = service.get_tasks(user_id=user_id, status="completed", page=1, limit=50)
        assert total == 1
        assert len(completed_results) == 1
        assert completed_results[0].id == completed_task.id
        assert completed_results[0].status == "completed"

    def test_get_tasks_combined_status_priority_filters(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T126: Test GET /api/{user_id}/tasks?status=pending&priority=high combines filters
        """
        service = TaskService(session, event_emitter)

        # Create tasks with different combinations
        service.create_task(user_id=user_id, title="High pending", status="pending", priority="high")
        service.create_task(user_id=user_id, title="Low pending", status="pending", priority="low")
        service.create_task(user_id=user_id, title="High in_progress", status="in_progress", priority="high")
        service.create_task(user_id=user_id, title="High completed", status="completed", priority="high")

        # Filter for pending status AND high priority
        results, total = service.get_tasks(
            user_id=user_id, status="pending", priority="high", page=1, limit=50
        )
        assert total == 1
        assert len(results) == 1
        assert results[0].title == "High pending"
        assert results[0].status == "pending"
        assert results[0].priority == "high"

        # Filter for in_progress status AND high priority
        results, total = service.get_tasks(
            user_id=user_id, status="in_progress", priority="high", page=1, limit=50
        )
        assert total == 1
        assert len(results) == 1
        assert results[0].title == "High in_progress"
        assert results[0].status == "in_progress"
        assert results[0].priority == "high"

    def test_get_tasks_filter_by_status_combines_with_other_filters(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T126: Test status filter combines with tags and search
        """
        service = TaskService(session, event_emitter)

        # Create tasks with different combinations
        service.create_task(user_id=user_id, title="Urgent work", status="pending", tags=["work", "urgent"])
        service.create_task(user_id=user_id, title="Urgent personal", status="pending", tags=["personal", "urgent"])
        service.create_task(user_id=user_id, title="Not urgent work", status="in_progress", tags=["work"])

        # Filter for pending status AND "work" tag
        results, total = service.get_tasks(
            user_id=user_id, status="pending", tags=["work"], page=1, limit=50
        )
        assert total == 1
        assert len(results) == 1
        assert results[0].title == "Urgent work"
        assert results[0].status == "pending"
        assert "work" in results[0].tags

        # Filter for pending status AND search term
        results, total = service.get_tasks(
            user_id=user_id, status="pending", search="urgent", page=1, limit=50
        )
        assert total == 2  # Both "Urgent work" and "Urgent personal" contain "urgent"
        assert len(results) == 2
        titles = {t.title for t in results}
        assert titles == {"Urgent work", "Urgent personal"}
        for result in results:
            assert result.status == "pending"


@pytest.mark.integration
@pytest.mark.US9
class TestTaskSorting:
    """Integration tests for sorting functionality - T136, T137"""

    def test_get_tasks_sort_by_created_at_desc(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T136: Test GET /api/{user_id}/tasks?sort=created_desc sorts by creation date descending (newest first)
        """
        from datetime import datetime, timedelta
        service = TaskService(session, event_emitter)

        # Create tasks with different creation times
        old_task = service.create_task(
            user_id=user_id,
            title="Old task",
            created_at=datetime.now() - timedelta(hours=2)
        )
        middle_task = service.create_task(
            user_id=user_id,
            title="Middle task",
            created_at=datetime.now() - timedelta(hours=1)
        )
        new_task = service.create_task(
            user_id=user_id,
            title="New task",
            created_at=datetime.now()
        )

        # Get tasks with default sort (created_desc)
        tasks, total = service.get_tasks(user_id=user_id, page=1, limit=50)

        assert total == 3
        assert len(tasks) == 3

        # Should be ordered: newest first
        assert tasks[0].id == new_task.id
        assert tasks[1].id == middle_task.id
        assert tasks[2].id == old_task.id

        # Verify they are sorted by created_at in descending order
        for i in range(len(tasks) - 1):
            assert tasks[i].created_at >= tasks[i + 1].created_at

    def test_get_tasks_sort_by_created_at_asc(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T136: Test GET /api/{user_id}/tasks?sort=created_asc sorts by creation date ascending (oldest first)
        """
        from datetime import datetime, timedelta
        service = TaskService(session, event_emitter)

        # Create tasks with different creation times
        old_task = service.create_task(
            user_id=user_id,
            title="Old task",
            created_at=datetime.now() - timedelta(hours=2)
        )
        middle_task = service.create_task(
            user_id=user_id,
            title="Middle task",
            created_at=datetime.now() - timedelta(hours=1)
        )
        new_task = service.create_task(
            user_id=user_id,
            title="New task",
            created_at=datetime.now()
        )

        # Get tasks sorted by created_at ASC
        tasks, total = service.get_tasks(user_id=user_id, sort="created_asc", page=1, limit=50)

        assert total == 3
        assert len(tasks) == 3

        # Should be ordered: oldest first
        assert tasks[0].id == old_task.id
        assert tasks[1].id == middle_task.id
        assert tasks[2].id == new_task.id

        # Verify they are sorted by created_at in ascending order
        for i in range(len(tasks) - 1):
            assert tasks[i].created_at <= tasks[i + 1].created_at

    def test_get_tasks_sort_by_priority_asc(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T136: Test GET /api/{user_id}/tasks?sort=priority_asc sorts by priority (high to low)
        """
        service = TaskService(session, event_emitter)

        # Create tasks with different priorities
        low_task = service.create_task(user_id=user_id, title="Low priority", priority="low")
        medium_task = service.create_task(user_id=user_id, title="Medium priority", priority="medium")
        high_task = service.create_task(user_id=user_id, title="High priority", priority="high")
        none_task = service.create_task(user_id=user_id, title="No priority", priority=None)

        # Get tasks sorted by priority ASC (high to low in our priority mapping)
        tasks, total = service.get_tasks(user_id=user_id, sort="priority_asc", page=1, limit=50)

        assert total == 4
        assert len(tasks) == 4

        # Should be ordered: high, medium, low, none (based on our priority mapping)
        assert tasks[0].id == high_task.id
        assert tasks[0].priority == "high"
        assert tasks[1].id == medium_task.id
        assert tasks[1].priority == "medium"
        assert tasks[2].id == low_task.id
        assert tasks[2].priority == "low"
        assert tasks[3].id == none_task.id
        assert tasks[3].priority is None

    def test_get_tasks_sort_combined_with_filters(
        self, session: Session, event_emitter: EventEmitter, user_id: UUID
    ):
        """
        T137: Test sorting combines with other filters correctly
        """
        from datetime import datetime, timedelta
        service = TaskService(session, event_emitter)

        # Create tasks with different combinations of properties
        old_high = service.create_task(
            user_id=user_id,
            title="Old High",
            priority="high",
            created_at=datetime.now() - timedelta(hours=2)
        )
        new_low = service.create_task(
            user_id=user_id,
            title="New Low",
            priority="low",
            created_at=datetime.now()
        )
        old_low = service.create_task(
            user_id=user_id,
            title="Old Low",
            priority="low",
            created_at=datetime.now() - timedelta(hours=1)
        )
        new_high = service.create_task(
            user_id=user_id,
            title="New High",
            priority="high",
            created_at=datetime.now()
        )

        # Filter by priority="high" and sort by created_at ASC (oldest first)
        tasks, total = service.get_tasks(
            user_id=user_id, priority="high", sort="created_asc", page=1, limit=50
        )

        assert total == 2
        assert len(tasks) == 2

        # Should only have high priority tasks, sorted by creation date (oldest first)
        assert tasks[0].id == old_high.id
        assert tasks[0].priority == "high"
        assert tasks[1].id == new_high.id
        assert tasks[1].priority == "high"
        assert tasks[0].created_at <= tasks[1].created_at
