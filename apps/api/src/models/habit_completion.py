"""HabitCompletion model for tracking daily habit completions"""
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import String, CheckConstraint, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from uuid import UUID, uuid4
from datetime import datetime, timezone
from typing import Optional, Literal
from pydantic import ConfigDict, field_validator


class HabitCompletion(SQLModel, table=True):
    """
    Habit completion record - tracks when a user completes a habit.

    Business Rules:
    - One completion per habit per day (enforced by unique constraint in DB)
    - Completion type must be 'full' or 'two_minute'
    - completed_at uses UTC timezone for consistency
    """

    model_config = ConfigDict(validate_assignment=True)
    __tablename__ = "habit_completions"

    # Primary Key
    id: UUID = Field(default_factory=uuid4, primary_key=True)

    # Foreign Keys
    habit_id: UUID = Field(
        foreign_key="habits.id",
        nullable=False,
        index=True,
        description="Reference to the habit that was completed"
    )
    user_id: UUID = Field(
        foreign_key="users.id",
        nullable=False,
        index=True,
        description="Reference to the user who completed the habit"
    )

    # Completion Data
    completed_at: datetime = Field(
        sa_column=Column(
            TIMESTAMP(timezone=True),
            nullable=False,
            index=True
        ),
        description="When the habit was completed (UTC)"
    )
    completion_type: str = Field(
        sa_column=Column(
            String(20),
            CheckConstraint(
                "completion_type IN ('full', 'two_minute')",
                name='check_completion_type_valid'
            ),
            nullable=False
        ),
        description="Type of completion: 'full' or 'two_minute'"
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False),
        description="When this record was created"
    )

    # Validators
    @field_validator("completion_type")
    @classmethod
    def validate_completion_type(cls, v: str) -> str:
        """Ensure completion_type is valid"""
        if v not in ["full", "two_minute"]:
            raise ValueError("completion_type must be 'full' or 'two_minute'")
        return v

    @field_validator("completed_at")
    @classmethod
    def validate_completed_at_not_future(cls, v: datetime) -> datetime:
        """Prevent completions in the future"""
        now = datetime.now(timezone.utc)
        if v > now:
            raise ValueError("completed_at cannot be in the future")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "habit_id": "789e4567-e89b-12d3-a456-426614174001",
                "user_id": "456e4567-e89b-12d3-a456-426614174002",
                "completed_at": "2026-02-12T07:30:00Z",
                "completion_type": "full",
                "created_at": "2026-02-12T07:30:05Z"
            }
        }
