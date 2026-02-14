from sqlmodel import SQLModel, Field, Column
from sqlalchemy import Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB as PG_JSONB
from uuid import UUID, uuid4
from datetime import datetime, timezone
from typing import Optional, List, Literal, Any
from pydantic import field_validator, BaseModel, model_validator, ConfigDict


class RecurringSchedule(BaseModel):
    """Recurring schedule schema for JSONB storage"""
    model_config = ConfigDict(validate_assignment=True)
    type: Literal["daily", "weekly", "monthly"]
    frequency: int = 1  # Every N days (daily only)
    until: Optional[str] = None  # ISO date string
    days: Optional[List[int]] = None  # 0=Sun, 1=Mon, ..., 6=Sat (weekly)
    days_of_month: Optional[List[int]] = None  # 1-31 (monthly, multiple days)
    day_of_month: Optional[int] = None  # DEPRECATED: kept for backward compat

    @model_validator(mode="after")
    def validate_schedule(self) -> "RecurringSchedule":
        if self.frequency < 1:
            raise ValueError("Frequency must be >= 1")
        if self.type == "weekly":
            if self.days is None:
                raise ValueError("Weekly schedule requires 'days' array")
            if not all(0 <= d <= 6 for d in self.days):
                raise ValueError("Days must be between 0 and 6")
        elif self.type == "monthly":
            if self.days_of_month is not None:
                if not all(1 <= d <= 31 for d in self.days_of_month):
                    raise ValueError("days_of_month values must be between 1 and 31")
            elif self.day_of_month is not None:
                if not (1 <= self.day_of_month <= 31):
                    raise ValueError("day_of_month must be between 1 and 31")
            else:
                raise ValueError("Monthly schedule requires 'days_of_month' or 'day_of_month'")
        return self


class Habit(SQLModel, table=True):
    """Habit entity - recurring behavior and identity focus"""

    model_config = ConfigDict(validate_assignment=True)
    __tablename__ = "habits"

    # Primary Identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)

    # Core Atomic Habits Fields
    identity_statement: str = Field(sa_column=Column(Text, nullable=False))
    full_description: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    two_minute_version: str = Field(sa_column=Column(Text, nullable=False))

    # Habit Stacking (Law 1)
    habit_stacking_cue: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    anchor_habit_id: Optional[UUID] = Field(
        default=None,
        foreign_key="habits.id",
        nullable=True,
        index=True
    )

    # Motivation & Organization
    motivation: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    category: str = Field(nullable=False, max_length=50)

    # Scheduling (JSONB for flexibility)
    recurring_schedule: dict = Field(sa_column=Column(PG_JSONB, nullable=False))

    # Status Management
    status: str = Field(default="active", nullable=False, max_length=20)

    # Tracking Fields
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
    @model_validator(mode="before")
    @classmethod
    def trim_strings(cls, data: Any) -> Any:
        if isinstance(data, dict):
            for field in ["identity_statement", "two_minute_version"]:
                if field in data and isinstance(data[field], str):
                    data[field] = data[field].strip()
        return data

    @field_validator("identity_statement")
    @classmethod
    def identity_not_empty(cls, v: str) -> str:
        if not v:
            raise ValueError("Identity statement cannot be empty")
        if len(v) > 2000:
            raise ValueError("Identity statement must be 2000 characters or less")
        return v

    @field_validator("two_minute_version")
    @classmethod
    def two_minute_not_empty(cls, v: str) -> str:
        if not v:
            raise ValueError("2-minute version cannot be empty")
        if len(v) > 500:
            raise ValueError("2-minute version must be 500 characters or less")
        return v

    @field_validator("status")
    @classmethod
    def status_valid(cls, v: str) -> str:
        if v not in ["active", "archived"]:
            raise ValueError("Status must be 'active' or 'archived'")
        return v

    @field_validator("category")
    @classmethod
    def category_valid(cls, v: str) -> str:
        valid_categories = [
            "Health & Fitness", "Productivity", "Mindfulness",
            "Learning", "Social", "Finance", "Creative", "Other"
        ]
        if v not in valid_categories:
            raise ValueError(f"Category must be one of: {', '.join(valid_categories)}")
        return v