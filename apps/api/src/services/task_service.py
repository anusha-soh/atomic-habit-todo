"""
Task Service
Phase 2 Chunk 2 - Tasks Full Feature Set
"""
from sqlmodel import Session, select, or_, func, case
from src.services.event_emitter import EventEmitter
from src.models.task import Task
from uuid import UUID
from typing import Optional
from datetime import datetime


class TaskService:
    """
    Business logic for task management operations.

    Handles task CRUD operations with event emission for task lifecycle changes.
    All methods enforce user_id isolation to prevent cross-user data leakage.

    Events emitted:
        - TASK_CREATED: When a new task is created
        - TASK_UPDATED: When a task is modified
        - TASK_COMPLETED: When a task is marked as complete
        - TASK_DELETED: When a task is permanently deleted
    """

    def __init__(self, session: Session, event_emitter: EventEmitter):
        """
        Initialize TaskService with dependency injection.

        Args:
            session: SQLModel database session
            event_emitter: Event emitter for task lifecycle events
        """
        self.session = session
        self.event_emitter = event_emitter

    def create_task(
        self,
        user_id: UUID,
        title: str,
        description: Optional[str] = None,
        status: str = "pending",
        priority: Optional[str] = None,
        tags: Optional[list[str]] = None,
        due_date: Optional[datetime] = None,
    ) -> Task:
        """
        Create a new task for the user.

        Args:
            user_id: User who owns the task
            title: Task title (required, max 500 chars)
            description: Optional detailed description (max 5000 chars)
            status: Task status (default: pending)
            priority: Priority level (high, medium, low, or null)
            tags: List of tags/categories
            due_date: Optional deadline

        Returns:
            Created Task object

        Raises:
            ValueError: If title is empty or exceeds max length
        """
        # Validate title
        title = title.strip()
        if not title:
            raise ValueError("Title cannot be empty or only whitespace")
        if len(title) > 500:
            raise ValueError("Title must be 500 characters or less")

        # Create task
        task = Task(
            user_id=user_id,
            title=title,
            description=description,
            status=status,
            priority=priority,
            tags=tags or [],
            due_date=due_date,
        )

        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)

        # Emit TASK_CREATED event
        self.event_emitter.emit("TASK_CREATED", {
            "user_id": str(user_id),
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "TASK_CREATED",
            "payload": {
                "task_id": str(task.id),
                "title": task.title,
                "description": task.description,
                "status": task.status,
                "priority": task.priority,
                "tags": task.tags,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "completed": task.completed
            }
        })

        return task

    def get_tasks(
        self,
        user_id: UUID,
        page: int = 1,
        limit: int = 50,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        tags: Optional[list[str]] = None,
        search: Optional[str] = None,
        sort: str = "created_desc",
    ) -> tuple[list[Task], int]:
        """
        Retrieve tasks for a user with filtering, searching, and sorting.

        Args:
            user_id: User ID to filter tasks
            page: Page number (1-indexed)
            limit: Tasks per page (max 100)
            status: Filter by status (pending, in_progress, completed)
            priority: Filter by priority (high, medium, low)
            tags: Filter by tags (ANY match)
            search: Search in title and description (case-insensitive)
            sort: Sort order (created_desc, due_date_asc, priority_asc, etc.)

        Returns:
            Tuple of (list of tasks, total count)
        """
        offset = (page - 1) * limit
        query = select(Task).where(Task.user_id == user_id)

        # Apply filters
        if status:
            query = query.where(Task.status == status)
        if priority:
            query = query.where(Task.priority == priority)
        if tags:
            query = query.where(Task.tags.op("&&")(tags))
        if search:
            query = query.where(or_(
                Task.title.ilike(f"%{search}%"),
                Task.description.ilike(f"%{search}%")
            ))

        # Apply sort
        sort_map = {
            "created_desc": Task.created_at.desc(),
            "created_asc": Task.created_at.asc(),
            "due_date_asc": Task.due_date.asc().nullslast(),
            "due_date_desc": Task.due_date.desc().nullslast(),
            "priority_asc": case(
                (Task.priority == "high", 1),
                (Task.priority == "medium", 2),
                (Task.priority == "low", 3),
                else_=4
            )
        }
        query = query.order_by(sort_map.get(sort, Task.created_at.desc()))

        # Count total
        total = self.session.exec(select(func.count()).select_from(query.subquery())).one()

        # Fetch page
        tasks = self.session.exec(query.offset(offset).limit(limit)).all()
        return list(tasks), total

    def update_task(
        self, user_id: UUID, task_id: UUID, **updates
    ) -> Task:
        """
        Update task attributes (partial update).

        Args:
            user_id: User ID for authorization
            task_id: Task ID to update
            **updates: Fields to update (title, description, status, priority, tags, due_date)

        Returns:
            Updated Task object

        Raises:
            ValueError: If task not found or user doesn't own the task
        """
        # Implementation will be added in US2 (T045)
        pass

    def mark_complete(self, user_id: UUID, task_id: UUID) -> Task:
        """
        Mark a task as completed.

        Args:
            user_id: User ID for authorization
            task_id: Task ID to complete

        Returns:
            Updated Task object with status='completed' and completed=True

        Raises:
            ValueError: If task not found or user doesn't own the task
        """
        # Implementation will be added in US2 (T046)
        pass

    def delete_task(self, user_id: UUID, task_id: UUID) -> None:
        """
        Permanently delete a task (hard delete).

        Args:
            user_id: User ID for authorization
            task_id: Task ID to delete

        Raises:
            ValueError: If task not found or user doesn't own the task
        """
        # Implementation will be added in US3 (T060)
        pass
