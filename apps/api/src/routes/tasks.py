"""
Task Routes
Phase 2 Chunk 2 - Tasks Full Feature Set
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional
from datetime import datetime

from src.database import get_session
from src.services.task_service import TaskService
from src.services.event_emitter import EventEmitter
from src.middleware.auth import get_current_user_id

router = APIRouter()


# Request/Response Models
class TaskCreate(BaseModel):
    """Task creation request"""
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = Field(None, max_length=5000)
    status: Optional[str] = "pending"
    priority: Optional[str] = None
    tags: Optional[list[str]] = []
    due_date: Optional[datetime] = None


class TaskUpdate(BaseModel):
    """Task update request (partial)"""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = Field(None, max_length=5000)
    status: Optional[str] = None
    priority: Optional[str] = None
    tags: Optional[list[str]] = None
    due_date: Optional[datetime] = None


class TaskResponse(BaseModel):
    """Task response"""
    id: str
    user_id: str
    title: str
    description: Optional[str]
    status: str
    priority: Optional[str]
    tags: list[str]
    due_date: Optional[str]
    completed: bool
    created_at: str
    updated_at: str


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
    current_user_id: UUID = Depends(get_current_user_id),
    task_service: TaskService = Depends(get_task_service)
):
    """
    List tasks for a user with filtering, searching, and sorting.

    Implementation: US1 (T028)
    """
    # Authorization: Ensure current user can only access their own tasks
    if current_user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Parse tags (comma-separated string to list)
    tag_list = tags.split(",") if tags else None

    # Get tasks from service
    tasks, total = task_service.get_tasks(
        user_id=user_id,
        page=page,
        limit=limit,
        status=status,
        priority=priority,
        tags=tag_list,
        search=search,
        sort=sort
    )

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
        raise HTTPException(status_code=403, detail="Forbidden")

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
        raise HTTPException(status_code=400, detail=str(e))


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
        raise HTTPException(status_code=403, detail="Forbidden")

    # Implementation will be added in US2 (T049)
    raise HTTPException(status_code=501, detail="Not implemented")


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
        raise HTTPException(status_code=403, detail="Forbidden")

    # Implementation will be added in US2 (T047)
    raise HTTPException(status_code=501, detail="Not implemented")


@router.patch("/{user_id}/tasks/{task_id}/complete", response_model=TaskResponse)
async def complete_task(
    user_id: UUID,
    task_id: UUID,
    current_user_id: UUID = Depends(get_current_user_id),
    task_service: TaskService = Depends(get_task_service)
):
    """
    Mark a task as completed.

    Implementation: US2 (T048)
    """
    # Authorization
    if current_user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Implementation will be added in US2 (T048)
    raise HTTPException(status_code=501, detail="Not implemented")


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
        raise HTTPException(status_code=403, detail="Forbidden")

    # Implementation will be added in US3 (T061)
    raise HTTPException(status_code=501, detail="Not implemented")
