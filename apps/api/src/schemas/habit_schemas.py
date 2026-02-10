"""
Habit Request/Response Schemas
Phase 2 Chunk 3 - Habits MVP
"""
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional


class HabitCreate(BaseModel):
    """
    Habit creation request schema.

    Attributes:
        identity_statement: "I am a person who..." statement (required, 1-2000 chars)
        full_description: Full habit description (optional, max 5000 chars)
        two_minute_version: Starter version (required, 1-500 chars)
        habit_stacking_cue: "After I [X], I will [Y]" cue (optional, max 500 chars)
        anchor_habit_id: UUID of anchor habit for stacking (optional)
        motivation: Why the user wants this habit (optional, max 2000 chars)
        category: Predefined category (required)
        recurring_schedule: Schedule data (required, validated by RecurringSchedule)
    """

    identity_statement: str = Field(..., min_length=1, max_length=2000)
    full_description: Optional[str] = Field(None, max_length=5000)
    two_minute_version: str = Field(..., min_length=1, max_length=500)
    habit_stacking_cue: Optional[str] = Field(None, max_length=500)
    anchor_habit_id: Optional[UUID] = None
    motivation: Optional[str] = Field(None, max_length=2000)
    category: str
    recurring_schedule: dict  # Validated by RecurringSchedule model

    model_config = {
        "json_schema_extra": {
            "example": {
                "identity_statement": "I am a person who reads daily",
                "full_description": "Read at least one chapter of a book every day to expand knowledge",
                "two_minute_version": "Read one page",
                "habit_stacking_cue": "After I pour my morning coffee, I will read one page",
                "anchor_habit_id": "750e8400-e29b-41d4-a716-446655440000",
                "motivation": "I want to expand my knowledge, vocabulary, and learn from great authors",
                "category": "Learning",
                "recurring_schedule": {
                    "type": "daily",
                    "until": "2026-12-31"
                }
            }
        }
    }


class HabitUpdate(BaseModel):
    """
    Habit update request schema (partial updates).

    All fields are optional to allow partial updates.

    Attributes:
        identity_statement: Updated identity statement (optional, 1-2000 chars)
        full_description: Updated description (optional, max 5000 chars)
        two_minute_version: Updated starter version (optional, 1-500 chars)
        habit_stacking_cue: Updated stacking cue (optional, max 500 chars)
        anchor_habit_id: Updated anchor habit (optional)
        motivation: Updated motivation (optional, max 2000 chars)
        category: Updated category (optional)
        recurring_schedule: Updated schedule (optional)
        status: Updated status (optional, active|archived)
    """

    identity_statement: Optional[str] = Field(None, min_length=1, max_length=2000)
    full_description: Optional[str] = Field(None, max_length=5000)
    two_minute_version: Optional[str] = Field(None, min_length=1, max_length=500)
    habit_stacking_cue: Optional[str] = Field(None, max_length=500)
    anchor_habit_id: Optional[UUID] = None
    motivation: Optional[str] = Field(None, max_length=2000)
    category: Optional[str] = None
    recurring_schedule: Optional[dict] = None
    status: Optional[str] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "identity_statement": "I am a person who reads every morning",
                "recurring_schedule": {
                    "type": "weekly",
                    "days": [1, 2, 3, 4, 5],
                    "until": None
                }
            }
        }
    }


class HabitResponse(BaseModel):
    """
    Habit response schema.

    Complete habit data returned from API endpoints.

    Attributes:
        id: Unique habit identifier
        user_id: User who owns the habit
        identity_statement: "I am a person who..." statement
        full_description: Full habit description
        two_minute_version: Starter version
        habit_stacking_cue: Stacking cue text
        anchor_habit_id: Anchor habit ID for stacking
        motivation: Why the user wants this habit
        category: Habit category
        recurring_schedule: Schedule data (JSONB)
        status: active or archived
        current_streak: Consecutive days completed
        last_completed_at: Last completion timestamp
        consecutive_misses: Consecutive days missed
        created_at: Creation timestamp
        updated_at: Last update timestamp
    """

    id: UUID
    user_id: UUID
    identity_statement: str
    full_description: Optional[str]
    two_minute_version: str
    habit_stacking_cue: Optional[str]
    anchor_habit_id: Optional[UUID]
    motivation: Optional[str]
    category: str
    recurring_schedule: dict
    status: str
    current_streak: int
    last_completed_at: Optional[datetime]
    consecutive_misses: int
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
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
    }


class HabitListResponse(BaseModel):
    """
    Paginated habit list response.

    Attributes:
        habits: List of habits
        total: Total number of habits matching filters
        page: Current page number
        limit: Items per page
    """

    habits: list[HabitResponse]
    total: int
    page: int
    limit: int

    model_config = {
        "json_schema_extra": {
            "example": {
                "habits": [
                    {
                        "id": "550e8400-e29b-41d4-a716-446655440000",
                        "user_id": "650e8400-e29b-41d4-a716-446655440000",
                        "identity_statement": "I am a person who reads daily",
                        "two_minute_version": "Read one page",
                        "category": "Learning",
                        "status": "active",
                        "current_streak": 5,
                        "recurring_schedule": {"type": "daily"},
                        "created_at": "2026-02-10T10:00:00Z",
                        "updated_at": "2026-02-10T10:00:00Z",
                    }
                ],
                "total": 10,
                "page": 1,
                "limit": 50
            }
        }
    }
