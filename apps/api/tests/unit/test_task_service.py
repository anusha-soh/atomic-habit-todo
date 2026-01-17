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


@pytest.fixture
def task_service(session: Session, mock_event_emitter) -> TaskService:
    return TaskService(session, mock_event_emitter)


@pytest.fixture
def create_task(session: Session, test_user):
    """Fixture to create test tasks - requires test_user fixture to ensure user exists"""
    def _create_task(**overrides):
        task = Task(
            id=overrides.get("id", uuid4()),
            user_id=overrides.get("user_id", test_user.id),
            title=overrides.get("title", "Sample Task"),
            description=overrides.get("description", "Sample description"),
            status=overrides.get("status", "pending"),
            priority=overrides.get("priority"),
            tags=overrides.get("tags", []),
            due_date=overrides.get("due_date"),
            completed=overrides.get("completed", False),
            created_at=overrides.get("created_at", datetime.now(timezone.utc)),
            updated_at=overrides.get("updated_at", datetime.now(timezone.utc)),
        )
        session.add(task)
        session.commit()
        session.refresh(task)
        return task

    return _create_task


@pytest.mark.unit
@pytest.mark.US1
class TestTaskServiceCreate:
    """Unit tests for TaskService.create_task() - T018"""

    def test_create_task_with_valid_title(self, task_service: TaskService, user_id: UUID):
        """
        T018: Test creating task with valid title
        """
        task = task_service.create_task(
            user_id=user_id,
            title="Write project proposal",
            description="Complete the Q1 project proposal document",
        )

        assert task is not None, "create_task should return a Task object"
        assert task.title == "Write project proposal"
        assert task.user_id == user_id
        assert task.status == "pending"  # Default status
        assert task.completed is False  # Default completed flag
        assert task.created_at is not None
        assert task.updated_at is not None
        task_service.event_emitter.emit.assert_called_once_with(
            "TASK_CREATED",
            pytest.helpers.match_event_payload("TASK_CREATED"),
        )

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


@pytest.mark.unit
@pytest.mark.US2
class TestTaskServiceUpdate:
    """Unit tests for TaskService.update_task() - T040"""

    def test_update_task_title(self, task_service: TaskService, user_id: UUID, create_task):
        """
        T040: Test updating task title
        """
        task = create_task(title="Original Title")

        updated = task_service.update_task(
            user_id=user_id,
            task_id=task.id,
            title="Updated Title"
        )

        assert updated.title == "Updated Title"
        assert updated.id == task.id

    def test_update_task_status(self, task_service: TaskService, user_id: UUID, create_task):
        """
        T040: Test updating task status
        """
        task = create_task(status="pending")

        updated = task_service.update_task(
            user_id=user_id,
            task_id=task.id,
            status="in_progress"
        )

        assert updated.status == "in_progress"

    def test_update_task_multiple_fields(self, task_service: TaskService, user_id: UUID, create_task):
        """
        T040: Test updating multiple task fields at once
        """
        task = create_task(title="Original", description="Old desc", priority="low")

        updated = task_service.update_task(
            user_id=user_id,
            task_id=task.id,
            title="New Title",
            description="New description",
            priority="high"
        )

        assert updated.title == "New Title"
        assert updated.description == "New description"
        assert updated.priority == "high"

    def test_update_task_emits_event(self, session: Session, mock_event_emitter, user_id: UUID, create_task):
        """
        T040: Test that update_task emits TASK_UPDATED event
        """
        task = create_task()
        service = TaskService(session, mock_event_emitter)

        service.update_task(
            user_id=user_id,
            task_id=task.id,
            title="Updated Title"
        )

        mock_event_emitter.emit.assert_called_once()
        call_args = mock_event_emitter.emit.call_args
        assert call_args[0][0] == "TASK_UPDATED"
        assert "task_id" in call_args[0][1]["payload"]

    def test_update_task_not_found_raises_error(self, task_service: TaskService, user_id: UUID):
        """
        T040: Test updating non-existent task raises error
        """
        with pytest.raises(ValueError, match="Task not found"):
            task_service.update_task(
                user_id=user_id,
                task_id=uuid4(),
                title="Updated"
            )

    def test_update_task_wrong_user_raises_error(self, task_service: TaskService, test_user, another_user, create_task):
        """
        T040: Test updating another user's task raises error
        """
        task = create_task(user_id=another_user.id)

        with pytest.raises(ValueError, match="Task not found"):
            task_service.update_task(
                user_id=test_user.id,  # Different from task owner
                task_id=task.id,
                title="Updated"
            )

    def test_update_task_trims_title_whitespace(self, task_service: TaskService, user_id: UUID, create_task):
        """
        T040: Test that update_task trims whitespace from title
        """
        task = create_task()

        updated = task_service.update_task(
            user_id=user_id,
            task_id=task.id,
            title="  Trimmed Title  "
        )

        assert updated.title == "Trimmed Title"

    def test_update_task_empty_title_raises_error(self, task_service: TaskService, user_id: UUID, create_task):
        """
        T040: Test updating with empty title raises error
        """
        task = create_task()

        with pytest.raises(ValueError, match="Title cannot be empty"):
            task_service.update_task(
                user_id=user_id,
                task_id=task.id,
                title=""
            )


@pytest.mark.unit
@pytest.mark.US2
class TestTaskServiceMarkComplete:
    """Unit tests for TaskService.mark_complete() - T041"""

    def test_mark_complete_sets_status_completed(self, task_service: TaskService, user_id: UUID, create_task):
        """
        T041: Test mark_complete sets status to 'completed'
        """
        task = create_task(status="pending", completed=False)

        completed = task_service.mark_complete(user_id=user_id, task_id=task.id)

        assert completed.status == "completed"
        assert completed.completed is True

    def test_mark_complete_emits_event(self, session: Session, mock_event_emitter, user_id: UUID, create_task):
        """
        T041: Test that mark_complete emits TASK_UPDATED event with completed flag
        """
        task = create_task(status="pending")
        service = TaskService(session, mock_event_emitter)

        service.mark_complete(user_id=user_id, task_id=task.id)

        mock_event_emitter.emit.assert_called_once()
        call_args = mock_event_emitter.emit.call_args
        assert call_args[0][0] == "TASK_UPDATED"
        payload = call_args[0][1]["payload"]
        assert payload.get("completed") is True or payload.get("status") == "completed"

    def test_mark_complete_not_found_raises_error(self, task_service: TaskService, user_id: UUID):
        """
        T041: Test marking non-existent task as complete raises error
        """
        with pytest.raises(ValueError, match="Task not found"):
            task_service.mark_complete(user_id=user_id, task_id=uuid4())

    def test_mark_complete_wrong_user_raises_error(self, task_service: TaskService, test_user, another_user, create_task):
        """
        T041: Test marking another user's task as complete raises error
        """
        task = create_task(user_id=another_user.id)

        with pytest.raises(ValueError, match="Task not found"):
            task_service.mark_complete(user_id=test_user.id, task_id=task.id)

    def test_mark_complete_already_completed_no_error(self, task_service: TaskService, user_id: UUID, create_task):
        """
        T041: Test marking already completed task does not raise error (idempotent)
        """
        task = create_task(status="completed", completed=True)

        # Should not raise - idempotent operation
        completed = task_service.mark_complete(user_id=user_id, task_id=task.id)

        assert completed.status == "completed"
        assert completed.completed is True


@pytest.mark.unit
@pytest.mark.US2
class TestTaskServiceGetTask:
    """Unit tests for TaskService.get_task() - T042"""

    def test_get_task_returns_task(self, task_service: TaskService, user_id: UUID, create_task):
        """
        T042: Test get_task returns the correct task
        """
        task = create_task(title="My Task", description="Task description")

        result = task_service.get_task(user_id=user_id, task_id=task.id)

        assert result is not None
        assert result.id == task.id
        assert result.title == "My Task"
        assert result.description == "Task description"

    def test_get_task_not_found_returns_none(self, task_service: TaskService, user_id: UUID):
        """
        T042: Test get_task returns None for non-existent task
        """
        result = task_service.get_task(user_id=user_id, task_id=uuid4())

        assert result is None

    def test_get_task_wrong_user_returns_none(self, task_service: TaskService, test_user, another_user, create_task):
        """
        T042: Test get_task returns None when accessing another user's task
        """
        task = create_task(user_id=another_user.id)

        result = task_service.get_task(user_id=test_user.id, task_id=task.id)

        assert result is None

    def test_get_task_returns_all_fields(self, task_service: TaskService, user_id: UUID, create_task):
        """
        T042: Test get_task returns task with all fields populated
        """
        task = create_task(
            title="Complete Task",
            description="Full description",
            status="in_progress",
            priority="high",
            tags=["work", "urgent"],
        )

        result = task_service.get_task(user_id=user_id, task_id=task.id)

        assert result.title == "Complete Task"
        assert result.description == "Full description"
        assert result.status == "in_progress"
        assert result.priority == "high"
        assert result.tags == ["work", "urgent"]
        assert result.created_at is not None
        assert result.updated_at is not None


@pytest.mark.unit
@pytest.mark.US3
class TestTaskServiceDelete:
    """Unit tests for TaskService.delete_task() - T057"""

    def test_delete_task_removes_from_database(self, task_service: TaskService, user_id: UUID, create_task):
        """
        T057: Test delete_task removes task from database
        """
        task = create_task(title="Task to delete")

        task_service.delete_task(user_id=user_id, task_id=task.id)

        # Verify task no longer exists in database
        from src.models.task import Task
        from sqlmodel import select
        deleted_task = task_service.session.exec(select(Task).where(Task.id == task.id)).first()
        assert deleted_task is None

    def test_delete_task_emits_event(self, session: Session, mock_event_emitter, user_id: UUID, create_task):
        """
        T057: Test that delete_task emits TASK_DELETED event
        """
        task = create_task()
        service = TaskService(session, mock_event_emitter)

        service.delete_task(user_id=user_id, task_id=task.id)

        mock_event_emitter.emit.assert_called_once()
        call_args = mock_event_emitter.emit.call_args
        assert call_args[0][0] == "TASK_DELETED"
        assert "task_id" in call_args[0][1]["payload"]

    def test_delete_task_not_found_raises_error(self, task_service: TaskService, user_id: UUID):
        """
        T057: Test deleting non-existent task raises error
        """
        with pytest.raises(ValueError, match="Task not found"):
            task_service.delete_task(user_id=user_id, task_id=uuid4())

    def test_delete_task_wrong_user_raises_error(self, task_service: TaskService, test_user, another_user, create_task):
        """
        T057: Test deleting another user's task raises error
        """
        task = create_task(user_id=another_user.id)

        with pytest.raises(ValueError, match="Task not found"):
            task_service.delete_task(user_id=test_user.id, task_id=task.id)


@pytest.mark.unit
@pytest.mark.US4
class TestTaskServicePriorityFiltering:
    """Unit tests for TaskService priority filtering - T067"""

    def test_get_tasks_filters_by_priority(self, session: Session, mock_event_emitter, user_id: UUID, create_task):
        """
        T067: Test get_tasks filters by priority
        """
        service = TaskService(session, mock_event_emitter)

        # Create tasks with different priorities
        high_task = create_task(title="High priority", priority="high")
        medium_task = create_task(title="Medium priority", priority="medium")
        low_task = create_task(title="Low priority", priority="low")
        none_task = create_task(title="No priority", priority=None)

        # Test filtering for high priority
        high_tasks, total = service.get_tasks(user_id=user_id, priority="high", page=1, limit=10)
        assert total == 1
        assert len(high_tasks) == 1
        assert high_tasks[0].id == high_task.id
        assert high_tasks[0].priority == "high"

        # Test filtering for medium priority
        medium_tasks, total = service.get_tasks(user_id=user_id, priority="medium", page=1, limit=10)
        assert total == 1
        assert len(medium_tasks) == 1
        assert medium_tasks[0].id == medium_task.id
        assert medium_tasks[0].priority == "medium"

        # Test filtering for low priority
        low_tasks, total = service.get_tasks(user_id=user_id, priority="low", page=1, limit=10)
        assert total == 1
        assert len(low_tasks) == 1
        assert low_tasks[0].id == low_task.id
        assert low_tasks[0].priority == "low"

        # Test filtering for null priority
        none_tasks, total = service.get_tasks(user_id=user_id, priority=None, page=1, limit=10)
        assert total == 1
        assert len(none_tasks) == 1
        assert none_tasks[0].id == none_task.id
        assert none_tasks[0].priority is None

    def test_get_tasks_with_priority_and_other_filters(self, session: Session, mock_event_emitter, user_id: UUID, create_task):
        """
        T067: Test get_tasks combines priority filter with other filters
        """
        service = TaskService(session, mock_event_emitter)

        # Create tasks with different combinations
        create_task(title="High pending", priority="high", status="pending")
        create_task(title="High in_progress", priority="high", status="in_progress")
        create_task(title="Medium pending", priority="medium", status="pending")

        # Test combining priority and status filters
        high_pending_tasks, total = service.get_tasks(
            user_id=user_id, priority="high", status="pending", page=1, limit=10
        )
        assert total == 1
        assert len(high_pending_tasks) == 1
        assert high_pending_tasks[0].title == "High pending"
        assert high_pending_tasks[0].priority == "high"
        assert high_pending_tasks[0].status == "pending"


@pytest.mark.unit
@pytest.mark.US5
class TestTaskServiceDueDateSorting:
    """Unit tests for TaskService due_date sorting - T079"""

    def test_get_tasks_sort_by_due_date_asc(self, session: Session, mock_event_emitter, user_id: UUID, create_task):
        """
        T079: Test get_tasks sorts by due_date ascending (nulls last)
        """
        from datetime import datetime, timedelta
        service = TaskService(session, mock_event_emitter)

        # Create tasks with different due dates
        yesterday_task = create_task(title="Yesterday", due_date=datetime.now() - timedelta(days=1))
        tomorrow_task = create_task(title="Tomorrow", due_date=datetime.now() + timedelta(days=1))
        today_task = create_task(title="Today", due_date=datetime.now())
        no_due_date_task = create_task(title="No due date", due_date=None)

        # Get tasks sorted by due_date ASC (nulls last)
        tasks, total = service.get_tasks(user_id=user_id, sort="due_date_asc", page=1, limit=10)

        # Should be ordered: yesterday, today, tomorrow, no_due_date
        assert total == 4
        assert len(tasks) == 4

        # Check order: tasks with due dates should come first, ordered by date, then nulls
        assert tasks[0].id == yesterday_task.id
        assert tasks[1].id == today_task.id
        assert tasks[2].id == tomorrow_task.id
        assert tasks[3].id == no_due_date_task.id

    def test_get_tasks_sort_by_due_date_desc(self, session: Session, mock_event_emitter, user_id: UUID, create_task):
        """
        T079: Test get_tasks sorts by due_date descending (nulls last)
        """
        from datetime import datetime, timedelta
        service = TaskService(session, mock_event_emitter)

        # Create tasks with different due dates
        yesterday_task = create_task(title="Yesterday", due_date=datetime.now() - timedelta(days=1))
        tomorrow_task = create_task(title="Tomorrow", due_date=datetime.now() + timedelta(days=1))
        today_task = create_task(title="Today", due_date=datetime.now())
        no_due_date_task = create_task(title="No due date", due_date=None)

        # Get tasks sorted by due_date DESC (nulls last)
        tasks, total = service.get_tasks(user_id=user_id, sort="due_date_desc", page=1, limit=10)

        # Should be ordered: tomorrow, today, yesterday, no_due_date
        assert total == 4
        assert len(tasks) == 4

        # Check order: tasks with due dates should come first, ordered by date descending, then nulls
        assert tasks[0].id == tomorrow_task.id
        assert tasks[1].id == today_task.id
        assert tasks[2].id == yesterday_task.id
        assert tasks[3].id == no_due_date_task.id


@pytest.mark.unit
@pytest.mark.US6
class TestTaskServiceTagsFiltering:
    """Unit tests for TaskService tags filtering - T097"""

    def test_get_tasks_filters_by_tags_overlap(self, session: Session, mock_event_emitter, user_id: UUID, create_task):
        """
        T097: Test get_tasks filters by tags using PostgreSQL && operator (ANY match)
        """
        service = TaskService(session, mock_event_emitter)

        # Create tasks with different tag combinations
        work_task = create_task(title="Work task", tags=["work", "important"])
        urgent_task = create_task(title="Urgent task", tags=["urgent", "client"])
        both_task = create_task(title="Both tags", tags=["work", "urgent"])
        neither_task = create_task(title="No tags", tags=[])

        # Test filtering for tasks with "work" tag
        work_tasks, total = service.get_tasks(user_id=user_id, tags=["work"], page=1, limit=10)
        assert total == 2
        assert len(work_tasks) == 2
        task_titles = {t.title for t in work_tasks}
        assert task_titles == {"Work task", "Both tags"}

        # Test filtering for tasks with "urgent" tag
        urgent_tasks, total = service.get_tasks(user_id=user_id, tags=["urgent"], page=1, limit=10)
        assert total == 2
        assert len(urgent_tasks) == 2
        task_titles = {t.title for t in urgent_tasks}
        assert task_titles == {"Urgent task", "Both tags"}

        # Test filtering for tasks with both "work" AND "urgent" tags (using ANY match - so either or both)
        both_tags_tasks, total = service.get_tasks(user_id=user_id, tags=["work", "urgent"], page=1, limit=10)
        assert total == 3
        assert len(both_tags_tasks) == 3
        task_titles = {t.title for t in both_tags_tasks}
        assert task_titles == {"Work task", "Urgent task", "Both tags"}


@pytest.mark.unit
@pytest.mark.US6
class TestTaskServiceTagsAutocomplete:
    """Unit tests for TaskService tags autocomplete - T098"""

    def test_get_unique_tags_for_autocomplete(self, session: Session, mock_event_emitter, user_id: UUID, create_task):
        """
        T098: Test get_tasks can be used to extract unique tags for autocomplete
        """
        service = TaskService(session, mock_event_emitter)

        # Create tasks with various tags
        create_task(title="Task 1", tags=["work", "important"])
        create_task(title="Task 2", tags=["work", "client"])
        create_task(title="Task 3", tags=["personal", "important"])
        create_task(title="Task 4", tags=["work"])  # Just one tag

        # Get all tasks and extract unique tags
        all_tasks, total = service.get_tasks(user_id=user_id, page=1, limit=50)

        # Collect all unique tags
        all_tags = set()
        for task in all_tasks:
            all_tags.update(task.tags)

        expected_tags = {"work", "important", "client", "personal"}
        assert all_tags == expected_tags


@pytest.mark.unit
@pytest.mark.US7
class TestTaskServiceSearch:
    """Unit tests for TaskService search functionality - T111, T112"""

    def test_get_tasks_search_by_title(self, session: Session, mock_event_emitter, user_id: UUID, create_task):
        """
        T111: Test get_tasks searches in title using ILIKE operator
        """
        service = TaskService(session, mock_event_emitter)

        # Create tasks with different titles
        task1 = create_task(title="Write project proposal", description="Detailed project plan")
        task2 = create_task(title="Review quarterly report", description="Financial analysis")
        task3 = create_task(title="Prepare presentation", description="Project overview")

        # Search for "proposal"
        results, total = service.get_tasks(user_id=user_id, search="proposal", page=1, limit=10)
        assert total == 1
        assert len(results) == 1
        assert results[0].id == task1.id
        assert "proposal" in results[0].title.lower()

        # Search for "report"
        results, total = service.get_tasks(user_id=user_id, search="report", page=1, limit=10)
        assert total == 1
        assert len(results) == 1
        assert results[0].id == task2.id
        assert "report" in results[0].title.lower()

    def test_get_tasks_search_by_description(self, session: Session, mock_event_emitter, user_id: UUID, create_task):
        """
        T111: Test get_tasks searches in description using ILIKE operator
        """
        service = TaskService(session, mock_event_emitter)

        # Create tasks with different descriptions
        task1 = create_task(title="Meeting notes", description="Write detailed meeting notes")
        task2 = create_task(title="Budget review", description="Analyze quarterly budget")
        task3 = create_task(title="Status update", description="Prepare weekly status")

        # Search for "meeting"
        results, total = service.get_tasks(user_id=user_id, search="meeting", page=1, limit=10)
        assert total == 1
        assert len(results) == 1
        assert results[0].id == task1.id
        assert "meeting" in results[0].description.lower()

    def test_get_tasks_search_title_or_description(self, session: Session, mock_event_emitter, user_id: UUID, create_task):
        """
        T111: Test get_tasks searches in both title AND description (OR condition)
        """
        service = TaskService(session, mock_event_emitter)

        # Create tasks where one matches title, another matches description
        task1 = create_task(title="Proposal writing", description="Not relevant")
        task2 = create_task(title="Not relevant", description="Budget proposal details")
        task3 = create_task(title="Unrelated task", description="Unrelated content")

        # Search for "proposal" - should match both title and description
        results, total = service.get_tasks(user_id=user_id, search="proposal", page=1, limit=10)
        assert total == 2
        assert len(results) == 2
        result_ids = {t.id for t in results}
        assert result_ids == {task1.id, task2.id}

    def test_get_tasks_search_case_insensitive(self, session: Session, mock_event_emitter, user_id: UUID, create_task):
        """
        T114: Test search is case-insensitive
        """
        service = TaskService(session, mock_event_emitter)

        task1 = create_task(title="PROJECT Proposal", description="Business PLAN")

        # Search with lowercase should find uppercase content
        results_lower, total = service.get_tasks(user_id=user_id, search="project", page=1, limit=10)
        assert total == 1
        assert results_lower[0].id == task1.id

        # Search with different case variations
        results_mixed, total = service.get_tasks(user_id=user_id, search="Plan", page=1, limit=10)
        assert total == 1
        assert results_mixed[0].id == task1.id

    def test_get_tasks_search_special_characters(self, session: Session, mock_event_emitter, user_id: UUID, create_task):
        """
        T112: Test search handles special characters properly (escaping)
        """
        service = TaskService(session, mock_event_emitter)

        # Create tasks with special characters in search terms
        task1 = create_task(title="Report: Q1 'Summary'", description="Includes 'quotes'")
        task2 = create_task(title="Back\\slash test", description="Path with back\\slash")

        # Search for content with quotes (should work without breaking SQL)
        results_quotes, total = service.get_tasks(user_id=user_id, search="'Summary'", page=1, limit=10)
        assert total >= 0  # Should not crash with special characters

        # Search for content with backslashes
        results_backslash, total = service.get_tasks(user_id=user_id, search="Back\\\\slash", page=1, limit=10)
        assert total >= 0  # Should not crash with backslashes


@pytest.mark.unit
@pytest.mark.US8
class TestTaskServiceStatusFiltering:
    """Unit tests for TaskService status filtering - T123"""

    def test_get_tasks_filters_by_status(self, session: Session, mock_event_emitter, user_id: UUID, create_task):
        """
        T123: Test get_tasks filters by status
        """
        service = TaskService(session, mock_event_emitter)

        # Create tasks with different statuses
        pending_task = create_task(title="Pending task", status="pending")
        in_progress_task = create_task(title="In progress task", status="in_progress")
        completed_task = create_task(title="Completed task", status="completed")

        # Test filtering for pending status
        pending_tasks, total = service.get_tasks(user_id=user_id, status="pending", page=1, limit=10)
        assert total == 1
        assert len(pending_tasks) == 1
        assert pending_tasks[0].id == pending_task.id
        assert pending_tasks[0].status == "pending"

        # Test filtering for in_progress status
        in_progress_tasks, total = service.get_tasks(user_id=user_id, status="in_progress", page=1, limit=10)
        assert total == 1
        assert len(in_progress_tasks) == 1
        assert in_progress_tasks[0].id == in_progress_task.id
        assert in_progress_tasks[0].status == "in_progress"

        # Test filtering for completed status
        completed_tasks, total = service.get_tasks(user_id=user_id, status="completed", page=1, limit=10)
        assert total == 1
        assert len(completed_tasks) == 1
        assert completed_tasks[0].id == completed_task.id
        assert completed_tasks[0].status == "completed"

    def test_get_tasks_combined_filters_status_and_priority(self, session: Session, mock_event_emitter, user_id: UUID, create_task):
        """
        T124: Test get_tasks combines status and priority filters
        """
        service = TaskService(session, mock_event_emitter)

        # Create tasks with different status and priority combinations
        high_pending_task = create_task(title="High pending", status="pending", priority="high")
        high_in_progress_task = create_task(title="High in progress", status="in_progress", priority="high")
        low_pending_task = create_task(title="Low pending", status="pending", priority="low")
        high_completed_task = create_task(title="High completed", status="completed", priority="high")

        # Filter for high priority AND pending status
        high_pending_tasks, total = service.get_tasks(
            user_id=user_id, status="pending", priority="high", page=1, limit=10
        )
        assert total == 1
        assert len(high_pending_tasks) == 1
        assert high_pending_tasks[0].id == high_pending_task.id
        assert high_pending_tasks[0].status == "pending"
        assert high_pending_tasks[0].priority == "high"

        # Filter for high priority AND in_progress status
        high_in_progress_tasks, total = service.get_tasks(
            user_id=user_id, status="in_progress", priority="high", page=1, limit=10
        )
        assert total == 1
        assert len(high_in_progress_tasks) == 1
        assert high_in_progress_tasks[0].id == high_in_progress_task.id
        assert high_in_progress_tasks[0].status == "in_progress"
        assert high_in_progress_tasks[0].priority == "high"

        # Filter for completed status AND high priority
        high_completed_tasks, total = service.get_tasks(
            user_id=user_id, status="completed", priority="high", page=1, limit=10
        )
        assert total == 1
        assert len(high_completed_tasks) == 1
        assert high_completed_tasks[0].id == high_completed_task.id
        assert high_completed_tasks[0].status == "completed"
        assert high_completed_tasks[0].priority == "high"


@pytest.mark.unit
@pytest.mark.US9
class TestTaskServiceSorting:
    """Unit tests for TaskService sorting functionality - T136"""

    def test_get_tasks_sort_by_created_at_desc(self, session: Session, mock_event_emitter, user_id: UUID, create_task):
        """
        T136: Test get_tasks sorts by created_at descending (newest first) - default
        """
        from datetime import datetime, timedelta
        service = TaskService(session, mock_event_emitter)

        # Create tasks with different creation times
        old_task = create_task(title="Old task", created_at=datetime.now() - timedelta(hours=2))
        middle_task = create_task(title="Middle task", created_at=datetime.now() - timedelta(hours=1))
        new_task = create_task(title="New task", created_at=datetime.now())

        # Get tasks with default sort (created_desc)
        tasks, total = service.get_tasks(user_id=user_id, page=1, limit=10)

        assert total == 3
        assert len(tasks) == 3

        # Should be ordered: newest first
        assert tasks[0].id == new_task.id
        assert tasks[1].id == middle_task.id
        assert tasks[2].id == old_task.id

        # Verify they are sorted by created_at in descending order
        for i in range(len(tasks) - 1):
            assert tasks[i].created_at >= tasks[i + 1].created_at

    def test_get_tasks_sort_by_created_at_asc(self, session: Session, mock_event_emitter, user_id: UUID, create_task):
        """
        T136: Test get_tasks sorts by created_at ascending (oldest first)
        """
        from datetime import datetime, timedelta
        service = TaskService(session, mock_event_emitter)

        # Create tasks with different creation times
        old_task = create_task(title="Old task", created_at=datetime.now() - timedelta(hours=2))
        middle_task = create_task(title="Middle task", created_at=datetime.now() - timedelta(hours=1))
        new_task = create_task(title="New task", created_at=datetime.now())

        # Get tasks sorted by created_at ASC
        tasks, total = service.get_tasks(user_id=user_id, sort="created_asc", page=1, limit=10)

        assert total == 3
        assert len(tasks) == 3

        # Should be ordered: oldest first
        assert tasks[0].id == old_task.id
        assert tasks[1].id == middle_task.id
        assert tasks[2].id == new_task.id

        # Verify they are sorted by created_at in ascending order
        for i in range(len(tasks) - 1):
            assert tasks[i].created_at <= tasks[i + 1].created_at

    def test_get_tasks_sort_by_priority_asc(self, session: Session, mock_event_emitter, user_id: UUID, create_task):
        """
        T136: Test get_tasks sorts by priority ascending (high to low priority)
        """
        service = TaskService(session, mock_event_emitter)

        # Create tasks with different priorities
        low_task = create_task(title="Low priority", priority="low")
        medium_task = create_task(title="Medium priority", priority="medium")
        high_task = create_task(title="High priority", priority="high")
        none_task = create_task(title="No priority", priority=None)

        # Get tasks sorted by priority ASC (high to low in our priority mapping)
        tasks, total = service.get_tasks(user_id=user_id, sort="priority_asc", page=1, limit=10)

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

    def test_get_tasks_sort_combined_with_filters(self, session: Session, mock_event_emitter, user_id: UUID, create_task):
        """
        T136: Test get_tasks combines sorting with other filters
        """
        from datetime import datetime, timedelta
        service = TaskService(session, mock_event_emitter)

        # Create tasks with different combinations of properties
        old_high = create_task(title="Old High", priority="high", created_at=datetime.now() - timedelta(hours=2))
        new_low = create_task(title="New Low", priority="low", created_at=datetime.now())
        old_low = create_task(title="Old Low", priority="low", created_at=datetime.now() - timedelta(hours=1))
        new_high = create_task(title="New High", priority="high", created_at=datetime.now())

        # Filter by priority="high" and sort by created_at ASC (oldest first)
        tasks, total = service.get_tasks(
            user_id=user_id, priority="high", sort="created_asc", page=1, limit=10
        )

        assert total == 2
        assert len(tasks) == 2

        # Should only have high priority tasks, sorted by creation date (oldest first)
        assert tasks[0].id == old_high.id
        assert tasks[0].priority == "high"
        assert tasks[1].id == new_high.id
        assert tasks[1].priority == "high"
        assert tasks[0].created_at <= tasks[1].created_at