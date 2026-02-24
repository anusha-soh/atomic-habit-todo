"""
Task Routes
Phase 2 Chunk 2 - Tasks Full Feature Set
"""
import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional
from datetime import datetime, timezone
from enum import Enum

from src.database import get_session
from src.services.task_service import TaskService, UNSET
from src.services.event_emitter import EventEmitter
from src.middleware.auth import get_current_user_id
from src.schemas.habit_schemas import HabitSyncResponse

logger = logging.getLogger(__name__)

router = APIRouter()


# Enums for validation
class TaskStatus(str, Enum):
    """Task status enum"""
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"


class TaskPriority(str, Enum):
    """Task priority enum"""
    high = "high"
    medium = "medium"
    low = "low"


# Request/Response Models
class TaskCreate(BaseModel):
    """Task creation request"""
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = Field(None, max_length=5000)
    status: Optional[TaskStatus] = TaskStatus.pending
    priority: Optional[TaskPriority] = None
    tags: Optional[list[str]] = []
    due_date: Optional[datetime] = None


class TaskUpdate(BaseModel):
    """Task update request (partial)"""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = Field(None, max_length=5000)
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    tags: Optional[list[str]] = None
    due_date: Optional[datetime] = None


class TaskResponse(BaseModel):
    """Task response"""
    id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    status: str
    priority: Optional[str]
    tags: list[str]
    due_date: Optional[datetime]
    completed: bool
    is_habit_task: bool = False
    generated_by_habit_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime


class TaskCompleteResponse(TaskResponse):
    """Task completion response — extends TaskResponse with optional habit sync info"""
    habit_sync: Optional[HabitSyncResponse] = None


class TaskListResponse(BaseModel):
    """Paginated task list response"""
    tasks: list[TaskResponse]
    total: int
    page: int
    limit: int


# Dependency: Get TaskService instance
def get_task_service(
    session: Session = Depends(get_session),
    event_emitter: EventEmitter = Depends(lambda: EventEmitter())
) -> TaskService:
    """Dependency injection for TaskService"""
    return TaskService(session, event_emitter)


# Routes (skeletons - implementation in user story tasks)
@router.get("/{user_id}/tasks", response_model=TaskListResponse)
async def list_tasks(
    user_id: UUID,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    tags: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = "created_desc",
    is_habit_task: Optional[bool] = None,
    current_user_id: UUID = Depends(get_current_user_id),
    task_service: TaskService = Depends(get_task_service)
):
    """
    List tasks for a user with filtering, searching, and sorting.

    Implementation: US1 (T028)
    """
    # Authorization: Ensure current user can only access their own tasks
    if current_user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied: Cannot access another user's tasks")

    # Validate sort parameter
    valid_sort_options = {"created_desc", "created_asc", "due_date_asc", "due_date_desc", "priority_asc", "priority_desc"}
    if sort not in valid_sort_options:
        raise HTTPException(status_code=400, detail=f"Invalid sort option. Valid options: {', '.join(valid_sort_options)}")

    # Parse tags (comma-separated string to list)
    tag_list = None
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()]
        if len(tag_list) > 20:
            raise HTTPException(status_code=400, detail="Too many tags. Maximum 20 tags allowed.")

    # Validate status parameter
    if status and status not in ["pending", "in_progress", "completed"]:
        raise HTTPException(status_code=400, detail="Invalid status. Valid values: pending, in_progress, completed")

    # Validate priority parameter
    if priority and priority not in ["high", "medium", "low", "none"]:
        raise HTTPException(status_code=400, detail="Invalid priority. Valid values: high, medium, low, none")

    # Map 'none' to None for NULL filtering, and use UNSET if missing
    priority_value = UNSET
    if priority is not None:
        priority_value = None if priority == "none" else priority

    # Get tasks from service
    try:
        tasks, total = task_service.get_tasks(
            user_id=user_id,
            page=page,
            limit=limit,
            status=status,
            priority=priority_value,
            tags=tag_list,
            search=search,
            sort=sort,
            is_habit_task=is_habit_task,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving tasks: {str(e)}")

    return {
        "tasks": tasks,
        "total": total,
        "page": page,
        "limit": limit
    }


@router.post("/{user_id}/tasks", status_code=201)
async def create_task(
    user_id: UUID,
    task_data: TaskCreate,
    current_user_id: UUID = Depends(get_current_user_id),
    task_service: TaskService = Depends(get_task_service)
):
    """
    Create a new task for the user.

    Implementation: US1 (T027)
    """
    # Authorization
    if current_user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied: Cannot create tasks for another user")

    # Validate tags
    if task_data.tags and len(task_data.tags) > 20:
        raise HTTPException(status_code=400, detail="Too many tags. Maximum 20 tags allowed.")

    # Validate status
    if task_data.status and task_data.status not in ["pending", "in_progress", "completed"]:
        raise HTTPException(status_code=400, detail="Invalid status. Valid values: pending, in_progress, completed")

    # Validate priority
    if task_data.priority and task_data.priority not in ["high", "medium", "low"]:
        raise HTTPException(status_code=400, detail="Invalid priority. Valid values: high, medium, low")

    try:
        task = task_service.create_task(
            user_id=user_id,
            title=task_data.title,
            description=task_data.description,
            status=task_data.status or "pending",
            priority=task_data.priority,
            tags=task_data.tags or [],
            due_date=task_data.due_date
        )
        return task
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating task: {str(e)}")


@router.get("/{user_id}/tasks/tags", response_model=list[str])
async def get_task_tags(
    user_id: UUID,
    current_user_id: UUID = Depends(get_current_user_id),
    task_service: TaskService = Depends(get_task_service)
):
    """
    Get unique tags for autocomplete suggestions.
    MUST be defined before /{user_id}/tasks/{task_id} to avoid route collision.

    Implementation: US6 (T104)
    """
    # Authorization
    if current_user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied: Cannot access another user's tags")

    try:
        return task_service.get_unique_tags(user_id=user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving tags: {str(e)}")


@router.get("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    user_id: UUID,
    task_id: UUID,
    current_user_id: UUID = Depends(get_current_user_id),
    task_service: TaskService = Depends(get_task_service)
):
    """
    Get a specific task by ID.

    Implementation: US2 (T049)
    """
    # Authorization
    if current_user_id != user_id:
        raise HTTPException(status_code=403, detail=f"Access denied: You are logged in as {current_user_id} but trying to access tasks for {user_id}")

    task = task_service.get_task(user_id=user_id, task_id=task_id)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found for user {user_id}")

    return task


@router.patch("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    user_id: UUID,
    task_id: UUID,
    task_data: TaskUpdate,
    current_user_id: UUID = Depends(get_current_user_id),
    task_service: TaskService = Depends(get_task_service)
):
    """
    Update a task (partial update).

    Implementation: US2 (T047)
    """
    # Authorization
    if current_user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied: Cannot update another user's task")

    # Validate tags
    if task_data.tags is not None and len(task_data.tags) > 20:
        raise HTTPException(status_code=400, detail="Too many tags. Maximum 20 tags allowed.")

    # Validate status
    if task_data.status is not None and task_data.status not in ["pending", "in_progress", "completed"]:
        raise HTTPException(status_code=400, detail="Invalid status. Valid values: pending, in_progress, completed")

    # Validate priority
    if task_data.priority is not None and task_data.priority not in ["high", "medium", "low"]:
        raise HTTPException(status_code=400, detail="Invalid priority. Valid values: high, medium, low")

    # Build updates dict from non-None values
    updates = {}
    if task_data.title is not None:
        updates["title"] = task_data.title
    if task_data.description is not None:
        updates["description"] = task_data.description
    if task_data.status is not None:
        updates["status"] = task_data.status
    if task_data.priority is not None:
        updates["priority"] = task_data.priority
    if task_data.tags is not None:
        updates["tags"] = task_data.tags
    if task_data.due_date is not None:
        updates["due_date"] = task_data.due_date

    try:
        task = task_service.update_task(
            user_id=user_id,
            task_id=task_id,
            **updates
        )
        return task
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Task not found: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating task: {str(e)}")


@router.patch("/{user_id}/tasks/{task_id}/complete", response_model=TaskCompleteResponse)
async def complete_task(
    user_id: UUID,
    task_id: UUID,
    completion_type: str = Query("full", pattern="^(full|two_minute)$"),
    current_user_id: UUID = Depends(get_current_user_id),
    task_service: TaskService = Depends(get_task_service),
    session: Session = Depends(get_session),
    event_emitter_dep: EventEmitter = Depends(lambda: EventEmitter()),
):
    """
    Mark a task as completed. If the task is habit-generated, also syncs
    the completion to the linked habit and returns streak info.
    """
    # Authorization
    if current_user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied: Cannot complete another user's task")

    try:
        task = task_service.mark_complete(user_id=user_id, task_id=task_id)
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Task not found: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error completing task: {str(e)}")

    # Habit sync: if task is habit-generated, update the linked habit's streak
    habit_sync = None
    _is_habit_task = getattr(task, 'is_habit_task', None) if not isinstance(task, dict) else task.get('is_habit_task')
    _generated_by_habit_id = getattr(task, 'generated_by_habit_id', None) if not isinstance(task, dict) else task.get('generated_by_habit_id')
    if _is_habit_task and _generated_by_habit_id:
        try:
            from src.models.habit import Habit
            from src.models.habit_completion import HabitCompletion
            from src.services.streak_calculator import calculate_new_streak_value
            from sqlmodel import select as sql_select

            habit = session.get(Habit, _generated_by_habit_id)
            if habit and habit.user_id == user_id:
                now_utc = datetime.now(timezone.utc)
                today_date = now_utc.date()

                # Check if already completed today (avoid duplicate)
                existing_completions = session.exec(
                    sql_select(HabitCompletion)
                    .where(HabitCompletion.habit_id == habit.id)
                    .where(HabitCompletion.user_id == user_id)
                ).all()

                already_today = any(
                    c.completed_at.date() == today_date for c in existing_completions
                )

                if already_today:
                    habit_sync = HabitSyncResponse(
                        synced=False,
                        habit_id=str(habit.id),
                        message="Habit already completed today",
                    )
                else:
                    new_streak = calculate_new_streak_value(
                        current_streak=habit.current_streak,
                        last_completed_at=habit.last_completed_at,
                        new_completion_time=now_utc,
                    )

                    completion = HabitCompletion(
                        habit_id=habit.id,
                        user_id=user_id,
                        completed_at=now_utc,
                        completion_type=completion_type,
                    )
                    session.add(completion)

                    habit.current_streak = new_streak
                    habit.last_completed_at = now_utc
                    habit.consecutive_misses = 0
                    habit.updated_at = now_utc
                    session.add(habit)
                    session.commit()
                    session.refresh(habit)

                    habit_sync = HabitSyncResponse(
                        synced=True,
                        habit_id=str(habit.id),
                        new_streak=new_streak,
                        completion_type=completion_type,
                        message=f"Great! Your habit streak for '{habit.identity_statement}' is now {new_streak} days",
                    )

                    event_emitter_dep.emit(
                        "HABIT_COMPLETED",
                        user_id,
                        {
                            "habit_id": str(habit.id),
                            "completion_type": completion_type,
                            "new_streak": new_streak,
                            "via_task": str(_get_attr(task, 'id')),
                        },
                    )
            # else: habit deleted (FK set NULL in DB, but Python still has old value)
            # → habit_sync stays None
        except Exception as e:
            # Graceful degradation: task completes even if habit sync fails
            logger.warning(
                f"Habit sync failed for task {task_id}: {e}",
                exc_info=True,
            )
            habit_sync = HabitSyncResponse(
                synced=False,
                habit_id=str(_generated_by_habit_id) if _generated_by_habit_id else None,
                message="Habit streak could not be updated. Please check your habit manually.",
                error=str(e),
            )

    def _get_attr(obj, key):
        return obj[key] if isinstance(obj, dict) else getattr(obj, key)

    # Build response
    return TaskCompleteResponse(
        id=_get_attr(task, 'id'),
        user_id=_get_attr(task, 'user_id'),
        title=_get_attr(task, 'title'),
        description=_get_attr(task, 'description'),
        status=_get_attr(task, 'status'),
        priority=_get_attr(task, 'priority'),
        tags=_get_attr(task, 'tags'),
        due_date=_get_attr(task, 'due_date'),
        completed=_get_attr(task, 'completed'),
        is_habit_task=_get_attr(task, 'is_habit_task') or False,
        generated_by_habit_id=_get_attr(task, 'generated_by_habit_id'),
        created_at=_get_attr(task, 'created_at'),
        updated_at=_get_attr(task, 'updated_at'),
        habit_sync=habit_sync,
    )


@router.delete("/{user_id}/tasks/{task_id}", status_code=204)
async def delete_task(
    user_id: UUID,
    task_id: UUID,
    current_user_id: UUID = Depends(get_current_user_id),
    task_service: TaskService = Depends(get_task_service)
):
    """
    Delete a task permanently.

    Implementation: US3 (T061)
    """
    # Authorization
    if current_user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied: Cannot delete another user's task")

    try:
        task_service.delete_task(user_id=user_id, task_id=task_id)
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Task not found: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting task: {str(e)}")


