from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from uuid import UUID
from typing import Optional
from datetime import datetime, timezone

from src.database import get_session
from src.models.habit import Habit
from src.models.habit_completion import HabitCompletion
from src.services.habit_service import HabitService
from src.services.event_emitter import EventEmitter, event_emitter
from src.services.streak_calculator import calculate_streak, calculate_new_streak_value
from src.middleware.auth import get_current_user_id
from src.schemas.habit_schemas import (
    HabitCreate,
    HabitUpdate,
    HabitResponse,
    HabitListResponse,
    CompleteHabitRequest,
    CompleteHabitResponse,
    HabitCompletionResponse,
    StreakInfoResponse,
    GetCompletionsResponse,
    UndoCompletionResponse,
    GenerateTasksRequest,
    GenerateTasksResponse,
)
from src.services.habit_task_service import HabitTaskGenerationService

router = APIRouter()


# Dependency: Get HabitService instance
def get_habit_service(
    session: Session = Depends(get_session),
    emitter: EventEmitter = Depends(lambda: event_emitter)
) -> HabitService:
    """Dependency injection for HabitService"""
    return HabitService(session, emitter)


# ── Existing CRUD endpoints ──────────────────────────────────────────────────

@router.post("/{user_id}/habits", response_model=HabitResponse, status_code=201)
async def create_habit(
    user_id: UUID,
    habit_data: HabitCreate,
    current_user_id: UUID = Depends(get_current_user_id),
    habit_service: HabitService = Depends(get_habit_service)
):
    """Create a new habit for the user"""
    if current_user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied: Cannot create habits for another user")

    try:
        return habit_service.create_habit(user_id, habit_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{user_id}/habits", response_model=HabitListResponse)
async def list_habits(
    user_id: UUID,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = "active",
    category: Optional[str] = None,
    include_archived: bool = False,
    current_user_id: UUID = Depends(get_current_user_id),
    habit_service: HabitService = Depends(get_habit_service)
):
    """List habits for a user with filtering and pagination"""
    if current_user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied: Cannot access another user's habits")

    habits, total = habit_service.get_habits(
        user_id=user_id,
        page=page,
        limit=limit,
        status=status,
        category=category,
        include_archived=include_archived
    )

    return {
        "habits": habits,
        "total": total,
        "page": page,
        "limit": limit
    }


@router.get("/{user_id}/habits/{habit_id}", response_model=HabitResponse)
async def get_habit(
    user_id: UUID,
    habit_id: UUID,
    current_user_id: UUID = Depends(get_current_user_id),
    habit_service: HabitService = Depends(get_habit_service)
):
    """Get a specific habit by ID"""
    if current_user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied: Cannot access another user's habit")

    habit = habit_service.get_habit(user_id, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    return habit


@router.patch("/{user_id}/habits/{habit_id}", response_model=HabitResponse)
async def update_habit(
    user_id: UUID,
    habit_id: UUID,
    habit_data: HabitUpdate,
    current_user_id: UUID = Depends(get_current_user_id),
    habit_service: HabitService = Depends(get_habit_service)
):
    """Update a specific habit"""
    if current_user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        habit = habit_service.update_habit(user_id, habit_id, habit_data)
        if not habit:
            raise HTTPException(status_code=404, detail="Habit not found")
        return habit
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{user_id}/habits/{habit_id}", status_code=204)
async def delete_habit(
    user_id: UUID,
    habit_id: UUID,
    force: bool = False,
    current_user_id: UUID = Depends(get_current_user_id),
    habit_service: HabitService = Depends(get_habit_service)
):
    """Delete a habit"""
    if current_user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        habit_service.delete_habit(user_id, habit_id, force=force)
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{user_id}/habits/{habit_id}/archive", response_model=HabitResponse)
async def archive_habit(
    user_id: UUID,
    habit_id: UUID,
    current_user_id: UUID = Depends(get_current_user_id),
    habit_service: HabitService = Depends(get_habit_service)
):
    """Archive a specific habit"""
    if current_user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        return habit_service.archive_habit(user_id, habit_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{user_id}/habits/{habit_id}/restore", response_model=HabitResponse)
async def restore_habit(
    user_id: UUID,
    habit_id: UUID,
    current_user_id: UUID = Depends(get_current_user_id),
    habit_service: HabitService = Depends(get_habit_service)
):
    """Restore a specific habit"""
    if current_user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        return habit_service.restore_habit(user_id, habit_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ── Phase 3: US1 – Mark Habit as Complete ───────────────────────────────────

@router.post(
    "/{user_id}/habits/{habit_id}/complete",
    response_model=CompleteHabitResponse,
    status_code=201
)
async def complete_habit(
    user_id: UUID,
    habit_id: UUID,
    request: CompleteHabitRequest,
    current_user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session),
    emitter: EventEmitter = Depends(lambda: event_emitter)
):
    """
    Mark a habit as completed today.

    Business rules:
    - One completion per habit per day (UTC). Returns 409 if already completed today.
    - Updates streak counter, last_completed_at, and resets consecutive_misses.
    - Emits HABIT_COMPLETED event.
    """
    if current_user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Verify habit exists and belongs to user
    habit = session.get(Habit, habit_id)
    if not habit or habit.user_id != user_id:
        raise HTTPException(status_code=404, detail="Habit not found")

    now_utc = datetime.now(timezone.utc)

    # T010: Check for duplicate completion today (UTC)
    today_date = now_utc.date()
    existing = session.exec(
        select(HabitCompletion)
        .where(HabitCompletion.habit_id == habit_id)
        .where(HabitCompletion.user_id == user_id)
    ).all()

    already_today = any(
        c.completed_at.date() == today_date for c in existing
    )
    if already_today:
        raise HTTPException(
            status_code=409,
            detail="Habit already completed today"
        )

    # T011: Calculate new streak using streak_calculator
    new_streak = calculate_new_streak_value(
        current_streak=habit.current_streak,
        last_completed_at=habit.last_completed_at,
        new_completion_time=now_utc
    )

    # Create completion record
    completion = HabitCompletion(
        habit_id=habit_id,
        user_id=user_id,
        completed_at=now_utc,
        completion_type=request.completion_type,
    )
    session.add(completion)

    # T012: Update habit streak fields
    habit.current_streak = new_streak
    habit.last_completed_at = now_utc
    habit.consecutive_misses = 0
    habit.updated_at = now_utc
    session.add(habit)

    session.commit()
    session.refresh(completion)
    session.refresh(habit)

    # T013: Emit HABIT_COMPLETED event
    emitter.emit(
        event_type="HABIT_COMPLETED",
        user_id=user_id,
        payload={
            "habit_id": str(habit_id),
            "completion_type": request.completion_type,
            "new_streak": new_streak,
        }
    )

    return CompleteHabitResponse(
        habit_id=str(habit_id),
        current_streak=new_streak,
        completion=HabitCompletionResponse.model_validate(completion),
        message="Habit completed successfully"
    )


# ── Phase 5: US3 – Streak endpoint ───────────────────────────────────────────

@router.get("/{user_id}/habits/{habit_id}/streak", response_model=StreakInfoResponse)
async def get_habit_streak(
    user_id: UUID,
    habit_id: UUID,
    current_user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Get current streak information for a habit"""
    if current_user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    habit = session.get(Habit, habit_id)
    if not habit or habit.user_id != user_id:
        raise HTTPException(status_code=404, detail="Habit not found")

    return StreakInfoResponse(
        habit_id=str(habit_id),
        current_streak=habit.current_streak,
        last_completed_at=habit.last_completed_at,
        consecutive_misses=habit.consecutive_misses,
    )


# ── Phase 9: US7 – Completion History ────────────────────────────────────────

@router.get("/{user_id}/habits/{habit_id}/completions", response_model=GetCompletionsResponse)
async def get_completions(
    user_id: UUID,
    habit_id: UUID,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Get completion history for a habit with optional date range"""
    if current_user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    habit = session.get(Habit, habit_id)
    if not habit or habit.user_id != user_id:
        raise HTTPException(status_code=404, detail="Habit not found")

    query = select(HabitCompletion).where(
        HabitCompletion.habit_id == habit_id,
        HabitCompletion.user_id == user_id,
    )
    if start_date:
        query = query.where(HabitCompletion.completed_at >= start_date)
    if end_date:
        query = query.where(HabitCompletion.completed_at <= end_date)

    completions = session.exec(query.order_by(HabitCompletion.completed_at.desc())).all()

    return GetCompletionsResponse(
        completions=[HabitCompletionResponse.model_validate(c) for c in completions],
        total=len(completions),
    )


# ── Phase 10: US8 – Undo Completion ─────────────────────────────────────────

@router.delete(
    "/{user_id}/habits/{habit_id}/completions/{completion_id}",
    response_model=UndoCompletionResponse,
)
async def undo_completion(
    user_id: UUID,
    habit_id: UUID,
    completion_id: UUID,
    current_user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Remove an accidental completion and recalculate streak"""
    if current_user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    habit = session.get(Habit, habit_id)
    if not habit or habit.user_id != user_id:
        raise HTTPException(status_code=404, detail="Habit not found")

    completion = session.get(HabitCompletion, completion_id)
    if not completion or completion.habit_id != habit_id or completion.user_id != user_id:
        raise HTTPException(status_code=404, detail="Completion not found")

    # Delete the completion
    session.delete(completion)
    session.flush()

    # Recalculate streak from remaining completions
    remaining = session.exec(
        select(HabitCompletion)
        .where(HabitCompletion.habit_id == habit_id)
        .where(HabitCompletion.user_id == user_id)
    ).all()

    new_streak = calculate_streak(remaining)

    # Update habit
    habit.current_streak = new_streak
    habit.last_completed_at = (
        max(remaining, key=lambda c: c.completed_at).completed_at
        if remaining else None
    )
    habit.updated_at = datetime.now(timezone.utc)
    session.add(habit)
    session.commit()

    return UndoCompletionResponse(
        deleted=True,
        recalculated_streak=new_streak,
        message="Completion undone and streak recalculated",
    )


# ── Chunk 5: Habits ↔ Tasks Connection ────────────────────────────────────────

@router.post(
    "/{user_id}/habits/{habit_id}/generate-tasks",
    response_model=GenerateTasksResponse,
)
async def generate_tasks(
    user_id: UUID,
    habit_id: UUID,
    request: Optional[GenerateTasksRequest] = None,
    current_user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session),
    emitter: EventEmitter = Depends(lambda: event_emitter),
):
    """
    Manually trigger task generation for a habit (developer/testing endpoint).
    Generates tasks for the next N days based on the habit's recurring schedule.
    """
    if current_user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    lookahead = request.lookahead_days if request else 7

    gen_service = HabitTaskGenerationService(session, emitter)
    try:
        result = gen_service.generate_tasks_for_habit(habit_id, user_id, lookahead)
    except ValueError as e:
        msg = str(e).lower()
        if "not found" in msg:
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))

    return GenerateTasksResponse(
        generated=result.generated,
        skipped=result.skipped,
        habit_id=result.habit_id,
        dates_generated=result.dates_generated,
        dates_skipped=result.dates_skipped,
        message=result.message,
    )


@router.get("/{user_id}/habits/{habit_id}/generated-tasks")
async def get_generated_tasks(
    user_id: UUID,
    habit_id: UUID,
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session),
    habit_service: HabitService = Depends(get_habit_service),
):
    """
    List all tasks generated by a specific habit.
    """
    if current_user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    habit = habit_service.get_habit(user_id, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    from src.models.task import Task
    from sqlmodel import func

    query = select(Task).where(
        Task.generated_by_habit_id == habit_id,
        Task.is_habit_task == True,  # noqa: E712
    )

    if status and status in ("pending", "completed"):
        query = query.where(Task.status == status)

    # Count
    count_q = select(func.count()).select_from(query.subquery())
    total = session.exec(count_q).one()

    # Paginate
    offset = (page - 1) * limit
    tasks = session.exec(
        query.order_by(Task.due_date.asc()).offset(offset).limit(limit)
    ).all()

    return {
        "tasks": tasks,
        "total": total,
        "page": page,
        "limit": limit,
    }
