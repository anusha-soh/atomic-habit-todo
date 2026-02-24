from typing import List, Optional, Literal
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field
from src.models.habit import RecurringSchedule
from enum import Enum


class HabitCategory(str, Enum):
    """Habit category enum"""
    health_fitness = "Health & Fitness"
    productivity = "Productivity"
    mindfulness = "Mindfulness"
    learning = "Learning"
    social = "Social"
    finance = "Finance"
    creative = "Creative"
    other = "Other"


class HabitStatus(str, Enum):
    """Habit status enum"""
    active = "active"
    archived = "archived"


class HabitBase(BaseModel):
    identity_statement: str = Field(..., min_length=1, max_length=2000)
    full_description: Optional[str] = Field(None, max_length=5000)
    two_minute_version: str = Field(..., min_length=1, max_length=500)
    habit_stacking_cue: Optional[str] = Field(None, max_length=500)
    anchor_habit_id: Optional[UUID] = None
    motivation: Optional[str] = Field(None, max_length=2000)
    category: HabitCategory
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
    category: Optional[HabitCategory] = None
    recurring_schedule: Optional[RecurringSchedule] = None
    status: Optional[HabitStatus] = None

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


# ── Chunk 5: Habits ↔ Tasks Connection ────────────────────────────────────────

class GenerateTasksRequest(BaseModel):
    """Request body for POST /habits/{id}/generate-tasks"""
    lookahead_days: int = Field(default=7, ge=1, le=30)


class GenerateTasksResponse(BaseModel):
    """Response for POST /habits/{id}/generate-tasks"""
    generated: int
    skipped: int
    habit_id: str
    dates_generated: list[str]
    dates_skipped: list[str]
    message: str


class HabitSyncResponse(BaseModel):
    """Habit sync info returned when completing a habit-generated task"""
    synced: bool
    habit_id: Optional[str] = None
    new_streak: Optional[int] = None
    completion_type: Optional[str] = None
    message: str
    error: Optional[str] = None