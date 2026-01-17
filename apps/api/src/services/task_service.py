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
import logging

# Configure logging for the service
logger = logging.getLogger(__name__)


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
        logger.info(f"Creating task for user {user_id} with title '{title[:50]}...'")

        # Validate title
        title = title.strip()
        if not title:
            error_msg = "Title cannot be empty or only whitespace"
            logger.warning(f"Task creation failed: {error_msg}")
            raise ValueError(error_msg)
        if len(title) > 500:
            error_msg = "Title must be 500 characters or less"
            logger.warning(f"Task creation failed: {error_msg}")
            raise ValueError(error_msg)

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

        logger.info(f"Task created successfully with ID {task.id}")

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
        logger.info(f"Retrieving tasks for user {user_id} with page={page}, limit={limit}, filters={bool(status or priority or tags or search)}, sort={sort}")

        offset = (page - 1) * limit
        query = select(Task).where(Task.user_id == user_id)

        # Apply filters
        if status:
            logger.debug(f"Applying status filter: {status}")
            query = query.where(Task.status == status)
        if priority:
            logger.debug(f"Applying priority filter: {priority}")
            query = query.where(Task.priority == priority)
        if tags:
            logger.debug(f"Applying tags filter: {tags}")
            query = query.where(Task.tags.op("&&")(tags))
        if search:
            logger.debug(f"Applying search filter: {search}")
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
        sort_order = sort_map.get(sort, Task.created_at.desc())
        query = query.order_by(sort_order)

        # Count total
        total_query = select(func.count()).select_from(query.subquery())
        total = self.session.exec(total_query).one()
        logger.debug(f"Total tasks matching query: {total}")

        # Fetch page
        tasks = self.session.exec(query.offset(offset).limit(limit)).all()
        logger.info(f"Retrieved {len(tasks)} tasks for user {user_id}")

        return list(tasks), total

    def get_task(self, user_id: UUID, task_id: UUID) -> Optional[Task]:
        """
        Get a single task by ID.

        Args:
            user_id: User ID for authorization
            task_id: Task ID to retrieve

        Returns:
            Task object if found and owned by user, None otherwise
        """
        logger.info(f"Retrieving task {task_id} for user {user_id}")

        query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        task = self.session.exec(query).first()

        if task:
            logger.info(f"Task {task_id} found for user {user_id}")
        else:
            logger.info(f"Task {task_id} not found for user {user_id} (may not exist or unauthorized)")

        return task

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
        logger.info(f"Updating task {task_id} for user {user_id} with updates: {list(updates.keys())}")

        # Find task owned by user
        task = self.get_task(user_id, task_id)
        if not task:
            error_msg = "Task not found"
            logger.warning(f"Task update failed: {error_msg}")
            raise ValueError(error_msg)

        # Allowed update fields
        allowed_fields = {"title", "description", "status", "priority", "tags", "due_date"}

        # Log which fields are being updated
        update_fields = {k: v for k, v in updates.items() if k in allowed_fields}
        logger.debug(f"Valid updates for task {task_id}: {list(update_fields.keys())}")

        # Apply updates
        for field, value in updates.items():
            if field not in allowed_fields:
                continue

            # Validate title if being updated
            if field == "title":
                if value is not None:
                    value = value.strip()
                    if not value:
                        error_msg = "Title cannot be empty or only whitespace"
                        logger.warning(f"Task update failed: {error_msg}")
                        raise ValueError(error_msg)
                    if len(value) > 500:
                        error_msg = "Title must be 500 characters or less"
                        logger.warning(f"Task update failed: {error_msg}")
                        raise ValueError(error_msg)

            setattr(task, field, value)

        # Update timestamp
        task.updated_at = datetime.utcnow()

        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)

        logger.info(f"Task {task_id} updated successfully for user {user_id}")

        # Emit TASK_UPDATED event
        self.event_emitter.emit("TASK_UPDATED", {
            "user_id": str(user_id),
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "TASK_UPDATED",
            "payload": {
                "task_id": str(task.id),
                "title": task.title,
                "description": task.description,
                "status": task.status,
                "priority": task.priority,
                "tags": task.tags,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "completed": task.completed,
                "updated_fields": list(updates.keys())
            }
        })

        return task

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
        logger.info(f"Marking task {task_id} as complete for user {user_id}")

        # Find task owned by user
        task = self.get_task(user_id, task_id)
        if not task:
            error_msg = "Task not found"
            logger.warning(f"Mark complete failed: {error_msg}")
            raise ValueError(error_msg)

        # Update status and completed flag
        old_status = task.status
        task.status = "completed"
        task.completed = True
        task.updated_at = datetime.utcnow()

        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)

        logger.info(f"Task {task_id} marked as complete for user {user_id} (was {old_status})")

        # Emit TASK_UPDATED event with completed flag
        self.event_emitter.emit("TASK_UPDATED", {
            "user_id": str(user_id),
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "TASK_UPDATED",
            "payload": {
                "task_id": str(task.id),
                "title": task.title,
                "status": "completed",
                "completed": True
            }
        })

        return task

    def delete_task(self, user_id: UUID, task_id: UUID) -> None:
        """
        Permanently delete a task (hard delete).

        Args:
            user_id: User ID for authorization
            task_id: Task ID to delete

        Raises:
            ValueError: If task not found or user doesn't own the task
        """
        logger.info(f"Deleting task {task_id} for user {user_id}")

        # Find task owned by user
        task = self.get_task(user_id, task_id)
        if not task:
            error_msg = "Task not found"
            logger.warning(f"Task deletion failed: {error_msg}")
            raise ValueError(error_msg)

        # Remove task from database
        self.session.delete(task)
        self.session.commit()

        logger.info(f"Task {task_id} deleted successfully for user {user_id}")

        # Emit TASK_DELETED event
        self.event_emitter.emit("TASK_DELETED", {
            "user_id": str(user_id),
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "TASK_DELETED",
            "payload": {
                "task_id": str(task.id),
                "title": task.title
            }
        })
