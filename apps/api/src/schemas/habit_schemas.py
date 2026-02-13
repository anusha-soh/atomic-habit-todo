from typing import List, Optional, Literal
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field
from src.models.habit import RecurringSchedule

class HabitBase(BaseModel):
    identity_statement: str = Field(..., min_length=1, max_length=2000)
    full_description: Optional[str] = Field(None, max_length=5000)
    two_minute_version: str = Field(..., min_length=1, max_length=500)
    habit_stacking_cue: Optional[str] = Field(None, max_length=500)
    anchor_habit_id: Optional[UUID] = None
    motivation: Optional[str] = Field(None, max_length=2000)
    category: str
    recurring_schedule: RecurringSchedule

class HabitCreate(HabitBase):
    pass

class HabitUpdate(BaseModel):
    identity_statement: Optional[str] = Field(None, min_length=1, max_length=2000)
    full_description: Optional[str] = Field(None, max_length=5000)
    two_minute_version: Optional[str] = Field(None, min_length=1, max_length=500)
    habit_stacking_cue: Optional[str] = Field(None, max_length=500)
    anchor_habit_id: Optional[UUID] = None
    motivation: Optional[str] = Field(None, max_length=2000)
    category: Optional[str] = None
    recurring_schedule: Optional[RecurringSchedule] = None
    status: Optional[str] = None

class HabitResponse(HabitBase):
    id: UUID
    user_id: UUID
    status: str
    current_streak: int
    last_completed_at: Optional[datetime] = None
    consecutive_misses: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class HabitListResponse(BaseModel):
    habits: List[HabitResponse]
    total: int
    page: int
    limit: int


# ── Phase 3 / US1: Completion schemas ────────────────────────────────────────

class CompleteHabitRequest(BaseModel):
    """Request body for POST /habits/{id}/complete"""
    completion_type: Literal["full", "two_minute"] = Field(
        ...,
        description="Type of completion: 'full' for full habit, 'two_minute' for 2-minute version"
    )


class HabitCompletionResponse(BaseModel):
    """Single completion record returned in responses"""
    id: UUID
    habit_id: UUID
    user_id: UUID
    completed_at: datetime
    completion_type: str
    created_at: datetime

    class Config:
        from_attributes = True


class CompleteHabitResponse(BaseModel):
    """Response for POST /habits/{id}/complete"""
    habit_id: str
    current_streak: int
    completion: HabitCompletionResponse
    message: str = "Habit completed successfully"


# ── Phase 5 / US3: Streak schema ─────────────────────────────────────────────

class StreakInfoResponse(BaseModel):
    """Response for GET /habits/{id}/streak"""
    habit_id: str
    current_streak: int
    last_completed_at: Optional[datetime] = None
    consecutive_misses: int


# ── Phase 9 / US7: Completion history ────────────────────────────────────────

class GetCompletionsResponse(BaseModel):
    """Response for GET /habits/{id}/completions"""
    completions: List[HabitCompletionResponse]
    total: int


# ── Phase 10 / US8: Undo completion ─────────────────────────────────────────

class UndoCompletionResponse(BaseModel):
    """Response for DELETE /habits/{id}/completions/{completion_id}"""
    deleted: bool
    recalculated_streak: int
    message: str