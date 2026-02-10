"""
Habit Routes
Phase 2 Chunk 3 - Habits MVP
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from uuid import UUID
from typing import Optional

from src.database import get_session
from src.services.habit_service import HabitService
from src.services.event_emitter import EventEmitter
from src.middleware.auth import get_current_user_id
from src.schemas.habit_schemas import (
    HabitCreate,
    HabitUpdate,
    HabitResponse,
    HabitListResponse
)

router = APIRouter()


# Dependency: Get HabitService instance
def get_habit_service(
    session: Session = Depends(get_session),
    event_emitter: EventEmitter = Depends(lambda: EventEmitter())
) -> HabitService:
    """Dependency injection for HabitService"""
    return HabitService(session, event_emitter)


# POST /api/{user_id}/habits - Create habit
@router.post("/{user_id}/habits", response_model=HabitResponse, status_code=201)
async def create_habit(
    user_id: UUID,
    habit_data: HabitCreate,
    current_user_id: UUID = Depends(get_current_user_id),
    habit_service: HabitService = Depends(get_habit_service)
):
    """
    Create a new habit for the user.

    Authorization: User can only create habits for themselves.

    Request Body:
        - identity_statement: "I am a person who..." (required)
        - two_minute_version: Starter version (required)
        - category: Predefined category (required)
        - recurring_schedule: Schedule data (required)
        - full_description: Full description (optional)
        - habit_stacking_cue: Stacking cue (optional)
        - anchor_habit_id: Anchor habit for stacking (optional)
        - motivation: Why this habit (optional)

    Returns:
        201 Created: Habit object
        400 Bad Request: Validation error
        401 Unauthorized: No valid authentication
        403 Forbidden: User ID mismatch
    """
    # Authorization: Ensure current user can only create habits for themselves
    if current_user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied: Cannot create habits for another user"
        )

    try:
        habit = habit_service.create_habit(
            user_id=user_id,
            identity_statement=habit_data.identity_statement,
            full_description=habit_data.full_description,
            two_minute_version=habit_data.two_minute_version,
            habit_stacking_cue=habit_data.habit_stacking_cue,
            anchor_habit_id=habit_data.anchor_habit_id,
            motivation=habit_data.motivation,
            category=habit_data.category,
            recurring_schedule=habit_data.recurring_schedule,
        )
        return habit
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# GET /api/{user_id}/habits - List habits
@router.get("/{user_id}/habits", response_model=HabitListResponse)
async def list_habits(
    user_id: UUID,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    category: Optional[str] = None,
    include_archived: bool = False,
    current_user_id: UUID = Depends(get_current_user_id),
    habit_service: HabitService = Depends(get_habit_service)
):
    """
    List habits for a user with filtering and pagination.

    Authorization: User can only list their own habits.

    Query Parameters:
        - page: Page number (default: 1)
        - limit: Items per page (default: 50, max: 100)
        - status: Filter by status (active or archived)
        - category: Filter by category
        - include_archived: Include archived habits (default: false)

    Returns:
        200 OK: Paginated habit list
        400 Bad Request: Invalid filter parameters
        401 Unauthorized: No valid authentication
        403 Forbidden: User ID mismatch
    """
    # Authorization: Ensure current user can only access their own habits
    if current_user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied: Cannot access another user's habits"
        )

    try:
        habits, total = habit_service.get_habits(
            user_id=user_id,
            status=status,
            category=category,
            include_archived=include_archived,
            page=page,
            limit=limit,
        )

        return HabitListResponse(
            habits=habits,
            total=total,
            page=page,
            limit=limit
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# GET /api/{user_id}/habits/{habit_id} - Get single habit
@router.get("/{user_id}/habits/{habit_id}", response_model=HabitResponse)
async def get_habit(
    user_id: UUID,
    habit_id: UUID,
    current_user_id: UUID = Depends(get_current_user_id),
    habit_service: HabitService = Depends(get_habit_service)
):
    """
    Get a single habit by ID.

    Authorization: User can only get their own habits.

    Returns:
        200 OK: Habit object
        401 Unauthorized: No valid authentication
        403 Forbidden: User ID mismatch
        404 Not Found: Habit not found
    """
    # Authorization: Ensure current user can only access their own habits
    if current_user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied: Cannot access another user's habits"
        )

    try:
        habit = habit_service.get_habit(user_id, habit_id)
        return habit
    except ValueError:
        raise HTTPException(status_code=404, detail="Habit not found")


# PATCH /api/{user_id}/habits/{habit_id} - Update habit
@router.patch("/{user_id}/habits/{habit_id}", response_model=HabitResponse)
async def update_habit(
    user_id: UUID,
    habit_id: UUID,
    habit_data: HabitUpdate,
    current_user_id: UUID = Depends(get_current_user_id),
    habit_service: HabitService = Depends(get_habit_service)
):
    """
    Update a habit (partial updates).

    Authorization: User can only update their own habits.

    Request Body: All fields optional for partial updates
        - identity_statement
        - two_minute_version
        - category
        - recurring_schedule
        - full_description
        - habit_stacking_cue
        - anchor_habit_id
        - motivation
        - status

    Returns:
        200 OK: Updated habit object
        400 Bad Request: Validation error or circular dependency
        401 Unauthorized: No valid authentication
        403 Forbidden: User ID mismatch
        404 Not Found: Habit not found
    """
    # Authorization: Ensure current user can only update their own habits
    if current_user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied: Cannot update another user's habits"
        )

    try:
        # Convert Pydantic model to dict, excluding unset fields
        updates = habit_data.model_dump(exclude_unset=True)

        habit = habit_service.update_habit(
            user_id=user_id,
            habit_id=habit_id,
            **updates
        )
        return habit
    except ValueError as e:
        error_msg = str(e)
        if "not found" in error_msg.lower():
            raise HTTPException(status_code=404, detail=error_msg)
        elif "circular" in error_msg.lower():
            raise HTTPException(status_code=400, detail=error_msg)
        else:
            raise HTTPException(status_code=400, detail=error_msg)


# DELETE /api/{user_id}/habits/{habit_id} - Delete habit
@router.delete("/{user_id}/habits/{habit_id}")
async def delete_habit(
    user_id: UUID,
    habit_id: UUID,
    force: bool = Query(False),
    current_user_id: UUID = Depends(get_current_user_id),
    habit_service: HabitService = Depends(get_habit_service)
):
    """
    Delete a habit.

    Authorization: User can only delete their own habits.

    Query Parameters:
        - force: Force deletion even if dependencies exist (default: false)

    Returns:
        200 OK: Success message
        400 Bad Request: Habit has dependencies (without force)
        401 Unauthorized: No valid authentication
        403 Forbidden: User ID mismatch
        404 Not Found: Habit not found

    Note: If habit is used as an anchor by other habits and force=false,
    returns 400 with list of dependent habits.
    """
    # Authorization: Ensure current user can only delete their own habits
    if current_user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied: Cannot delete another user's habits"
        )

    try:
        habit_service.delete_habit(user_id, habit_id, force=force)
        return {"message": "Habit deleted successfully"}
    except ValueError as e:
        error_msg = str(e)
        if "not found" in error_msg.lower():
            raise HTTPException(status_code=404, detail=error_msg)
        elif "anchor" in error_msg.lower() or "dependencies" in error_msg.lower():
            raise HTTPException(status_code=400, detail=error_msg)
        else:
            raise HTTPException(status_code=400, detail=error_msg)
