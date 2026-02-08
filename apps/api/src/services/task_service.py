"""
Task Service
Phase 2 Chunk 2 - Tasks Full Feature Set
"""
from sqlmodel import Session, select, or_, func, case
from src.services.event_emitter import EventEmitter
from src.models.task import Task
from uuid import UUID
from typing import Optional
from datetime import datetime, timezone
import logging

# Configure logging for the service
logger = logging.getLogger(__name__)

# Sentinel for missing arguments
UNSET = object()


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
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
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
            created_at: Optional creation timestamp (for testing/migration)
            updated_at: Optional update timestamp (for testing/migration)

        Returns:
            Created Task object

        Raises:
            ValueError: If title is empty or exceeds max length
        """
        logger.info(f"Creating task for user {user_id} with title '{title[:50]}...'")

        # Validate and trim title
        if not title or not title.strip():
            raise ValueError("Title cannot be empty or only whitespace")
        title = title.strip()

        # Trim tags
        trimmed_tags = []
        if tags:
            trimmed_tags = [tag.strip() for tag in tags if tag.strip()]

        # Create task
        task = Task(
            user_id=user_id,
            title=title,
            description=description,
            status=status,
            priority=priority,
            tags=trimmed_tags,
            due_date=due_date,
        )
        
        if created_at:
            task.created_at = created_at
        if updated_at:
            task.updated_at = updated_at

        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)

        logger.info(f"Task created successfully with ID {task.id}")

        # Emit TASK_CREATED event
        self.event_emitter.emit("TASK_CREATED", user_id, {
            "task_id": str(task.id),
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "priority": task.priority,
            "tags": task.tags,
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "completed": task.completed
        })

        return task

    def get_tasks(
        self,
        user_id: UUID,
        page: int = 1,
        limit: int = 50,
        status: Optional[str] = None,
        priority: Optional[str] = UNSET,
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
            priority: Filter by priority (high, medium, low, or None for no priority)
            tags: Filter by tags (ANY match)
            search: Search in title and description (case-insensitive)
            sort: Sort order (created_desc, due_date_asc, priority_asc, etc.)

        Returns:
            Tuple of (list of tasks, total count)
        """
        logger.info(f"Retrieving tasks for user {user_id} with page={page}, limit={limit}, filters={bool(status or priority is not UNSET or tags or search)}, sort={sort}")

        offset = (page - 1) * limit
        query = select(Task).where(Task.user_id == user_id)

        # Apply filters
        if status:
            logger.debug(f"Applying status filter: {status}")
            query = query.where(Task.status == status)
        
        if priority is not UNSET:
            logger.debug(f"Applying priority filter: {priority}")
            query = query.where(Task.priority == priority)
            
        if tags:
            logger.debug(f"Applying tags filter: {tags}")
            # Use PostgreSQL array overlap operator with proper binding
            from sqlalchemy import text
            # Create the overlap condition manually to ensure proper casting
            query = query.where(text("tasks.tags && cast(:tags AS TEXT[])").bindparams(tags=tags))
            
        if search:
            logger.debug(f"Applying search filter: {search}")
            # Escape SQL LIKE wildcards to prevent unintended pattern matching
            escaped = search.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
            query = query.where(or_(
                Task.title.ilike(f"%{escaped}%"),
                func.coalesce(Task.description, '').ilike(f"%{escaped}%")
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
            ),
            "priority_desc": case(
                (Task.priority == "low", 1),
                (Task.priority == "medium", 2),
                (Task.priority == "high", 3),
                else_=4
            )
        }
        sort_order = sort_map.get(sort, Task.created_at.desc())
        query = query.order_by(sort_order)

        # Count total using a separate count query for better compatibility
        count_query = select(func.count()).select_from(Task).where(Task.user_id == user_id)
        if status:
            count_query = count_query.where(Task.status == status)
        if priority is not UNSET:
            count_query = count_query.where(Task.priority == priority)
        if tags:
            from sqlalchemy import text
            count_query = count_query.where(text("tasks.tags && cast(:tags AS TEXT[])").bindparams(tags=tags))
        if search:
            escaped = search.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
            count_query = count_query.where(or_(
                Task.title.ilike(f"%{escaped}%"),
                func.coalesce(Task.description, '').ilike(f"%{escaped}%")
            ))
            
        total = self.session.exec(count_query).one()
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
                    if not value.strip():
                        error_msg = "Title cannot be empty or only whitespace"
                        logger.warning(f"Task update failed: {error_msg}")
                        raise ValueError(error_msg)
                    value = value.strip()
                    if len(value) > 500:
                        error_msg = "Title must be 500 characters or less"
                        logger.warning(f"Task update failed: {error_msg}")
                        raise ValueError(error_msg)

            setattr(task, field, value)

        # Handle tag trimming if tags are being updated
        if "tags" in updates and updates["tags"] is not None:
            task.tags = [tag.strip() for tag in updates["tags"] if tag.strip()]

        # Update timestamp
        task.updated_at = datetime.now(timezone.utc)

        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)

        logger.info(f"Task {task_id} updated successfully for user {user_id}")

        # Emit TASK_UPDATED event
        self.event_emitter.emit("TASK_UPDATED", user_id, {
            "task_id": str(task.id),
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "priority": task.priority,
            "tags": task.tags,
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "completed": task.completed,
            "updated_fields": list(updates.keys())
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
        task.updated_at = datetime.now(timezone.utc)

        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)

        logger.info(f"Task {task_id} marked as complete for user {user_id} (was {old_status})")

        # Emit TASK_COMPLETED event (FR-020)
        self.event_emitter.emit("TASK_COMPLETED", user_id, {
            "task_id": str(task.id),
            "title": task.title,
            "description": task.description,
            "status": "completed",
            "priority": task.priority,
            "tags": task.tags,
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "completed": True
        })

        return task

    def get_unique_tags(self, user_id: UUID) -> list[str]:
        """
        Get all unique tags for a user's tasks using SQL DISTINCT unnest.

        Args:
            user_id: User ID to filter tasks

        Returns:
            Sorted list of unique tag strings
        """
        logger.info(f"Retrieving unique tags for user {user_id}")
        from sqlalchemy import text
        result = self.session.execute(
            text("SELECT DISTINCT unnest(tags) AS tag FROM tasks WHERE user_id = :uid ORDER BY tag"),
            {"uid": user_id}
        )
        tags = [row[0] for row in result]
        logger.info(f"Found {len(tags)} unique tags for user {user_id}")
        return tags

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
        self.event_emitter.emit("TASK_DELETED", user_id, {
            "task_id": str(task.id),
            "title": task.title
        })
