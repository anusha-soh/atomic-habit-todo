"""
Habit Model
Phase 2 Chunk 3 - Habits MVP
"""
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB as PG_JSONB
from uuid import UUID, uuid4
from datetime import datetime, timezone
from typing import Optional, Literal
from pydantic import BaseModel, field_validator


class RecurringSchedule(BaseModel):
    """
    Pydantic model for recurring schedule validation (stored as JSONB).

    Attributes:
        type: Schedule type (daily, weekly, or monthly)
        until: Optional end date in ISO 8601 format
        days: For weekly schedules - list of weekdays (0=Sunday, 6=Saturday)
        day_of_month: For monthly schedules - day of month (1-31)
    """

    type: Literal["daily", "weekly", "monthly"]
    until: Optional[str] = None  # ISO 8601 date
    days: Optional[list[int]] = None  # For weekly: 0-6
    day_of_month: Optional[int] = None  # For monthly: 1-31

    @field_validator("days")
    @classmethod
    def validate_days(cls, v, info):
        """Validate days array for weekly schedules"""
        schedule_type = info.data.get("type")
        if schedule_type == "weekly":
            if not v or len(v) == 0:
                raise ValueError("Weekly habits must specify at least one day")
            if not all(0 <= day <= 6 for day in v):
                raise ValueError("Days must be between 0 (Sunday) and 6 (Saturday)")
        return v

    @field_validator("day_of_month")
    @classmethod
    def validate_day_of_month(cls, v, info):
        """Validate day_of_month for monthly schedules"""
        schedule_type = info.data.get("type")
        if schedule_type == "monthly":
            if not v:
                raise ValueError("Monthly habits must specify day_of_month")
            if not 1 <= v <= 31:
                raise ValueError("day_of_month must be between 1 and 31")
        return v


# Fixed predefined categories per ADR-006
HABIT_CATEGORIES = [
    "Health & Fitness",
    "Productivity",
    "Mindfulness",
    "Learning",
    "Social",
    "Finance",
    "Creative",
    "Other"
]


class Habit(SQLModel, table=True):
    """
    Habit entity representing a recurring behavior and identity focus.

    Implements Atomic Habits Four Laws framework:
    - Law 1 (Make It Obvious): habit_stacking_cue, anchor_habit_id
    - Law 2 (Make It Attractive): identity_statement, motivation
    - Law 3 (Make It Easy): two_minute_version
    - Law 4 (Make It Satisfying): current_streak, last_completed_at (Phase 2 Chunk 4)

    Attributes:
        id: Unique habit identifier (UUID)
        user_id: Foreign key to users table
        identity_statement: "I am a person who..." statement (required, max 2000 chars)
        full_description: Optional detailed habit description (max 5000 chars)
        two_minute_version: Starter version of the habit (required, max 500 chars)
        habit_stacking_cue: "After I [ANCHOR], I will [THIS]" cue text (optional)
        anchor_habit_id: Foreign key to anchor habit for stacking (optional)
        motivation: Why the user wants this habit (optional, max 2000 chars)
        category: Predefined category (required)
        recurring_schedule: JSONB schedule data (daily/weekly/monthly)
        status: active or archived (default: active)
        current_streak: Consecutive days completed (default: 0) [Chunk 4]
        last_completed_at: Last completion timestamp [Chunk 4]
        consecutive_misses: Consecutive days missed (default: 0) [Chunk 4]
        created_at: Habit creation timestamp
        updated_at: Last modification timestamp (auto-updated via trigger)
    """

    __tablename__ = "habits"

    # Primary Identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)

    # Core Atomic Habits Fields
    identity_statement: str = Field(sa_column=Column(Text, nullable=False))
    full_description: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    two_minute_version: str = Field(sa_column=Column(Text, nullable=False))

    # Habit Stacking (Law 1: Make It Obvious)
    habit_stacking_cue: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    anchor_habit_id: Optional[UUID] = Field(
        default=None,
        foreign_key="habits.id",
        nullable=True
    )

    # Motivation & Organization
    motivation: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    category: str = Field(nullable=False, max_length=50)

    # Scheduling (JSONB for flexibility per ADR-006)
    recurring_schedule: dict = Field(sa_column=Column(PG_JSONB, nullable=False))

    # Status Management
    status: str = Field(default="active", nullable=False, max_length=20)

    # Tracking Fields (Phase 2 Chunk 4)
    current_streak: int = Field(default=0, nullable=False)
    last_completed_at: Optional[datetime] = Field(default=None)
    consecutive_misses: int = Field(default=0, nullable=False)

    # Timestamps
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Validators
    @field_validator("identity_statement")
    @classmethod
    def identity_not_empty(cls, v: str) -> str:
        """Validate identity statement is not empty and within length limit"""
        if not v or not v.strip():
            raise ValueError("Identity statement cannot be empty")
        v = v.strip()
        if len(v) > 2000:
            raise ValueError("Identity statement must be 2000 characters or less")
        return v

    @field_validator("two_minute_version")
    @classmethod
    def two_minute_not_empty(cls, v: str) -> str:
        """Validate 2-minute version is not empty and within length limit"""
        if not v or not v.strip():
            raise ValueError("2-minute version cannot be empty")
        v = v.strip()
        if len(v) > 500:
            raise ValueError("2-minute version must be 500 characters or less")
        return v

    @field_validator("status")
    @classmethod
    def status_valid(cls, v: str) -> str:
        """Validate status is active or archived per ADR-006 two-state enum"""
        if v not in ["active", "archived"]:
            raise ValueError("Status must be 'active' or 'archived'")
        return v

    @field_validator("category")
    @classmethod
    def category_valid(cls, v: str) -> str:
        """Validate category is in predefined list per ADR-006 fixed categories"""
        if v not in HABIT_CATEGORIES:
            raise ValueError(
                f"Category must be one of: {', '.join(HABIT_CATEGORIES)}"
            )
        return v

    @field_validator("full_description", mode="before")
    @classmethod
    def description_max_length(cls, v):
        """Validate full description length"""
        if v is not None and len(v) > 5000:
            raise ValueError("Full description must be 5000 characters or less")
        return v

    @field_validator("habit_stacking_cue", mode="before")
    @classmethod
    def stacking_cue_max_length(cls, v):
        """Validate habit stacking cue length"""
        if v is not None and len(v) > 500:
            raise ValueError("Habit stacking cue must be 500 characters or less")
        return v

    @field_validator("motivation", mode="before")
    @classmethod
    def motivation_max_length(cls, v):
        """Validate motivation length"""
        if v is not None and len(v) > 2000:
            raise ValueError("Motivation must be 2000 characters or less")
        return v

    class Config:
        """Pydantic configuration"""

        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "user_id": "650e8400-e29b-41d4-a716-446655440000",
                "identity_statement": "I am a person who reads daily",
                "full_description": "Read at least one chapter of a book every day",
                "two_minute_version": "Read one page",
                "habit_stacking_cue": "After I pour my morning coffee, I will read one page",
                "anchor_habit_id": "750e8400-e29b-41d4-a716-446655440000",
                "motivation": "I want to expand my knowledge and vocabulary",
                "category": "Learning",
                "recurring_schedule": {"type": "daily", "until": "2026-12-31"},
                "status": "active",
                "current_streak": 0,
                "last_completed_at": None,
                "consecutive_misses": 0,
                "created_at": "2026-02-10T10:00:00Z",
                "updated_at": "2026-02-10T10:00:00Z",
            }
        }
