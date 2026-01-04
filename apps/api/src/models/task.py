"""
Task Model
Phase 2 Chunk 2 - Tasks Full Feature Set
"""
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import ARRAY, String, Text
from uuid import UUID, uuid4
from datetime import datetime, timezone
from typing import Optional


class Task(SQLModel, table=True):
    """
    Task entity representing a user's to-do item.

    Attributes:
        id: Unique task identifier (UUID)
        user_id: Foreign key to users table
        title: Task title (required, max 500 chars)
        description: Optional detailed description (max 5000 chars)
        status: Task lifecycle status (pending, in_progress, completed)
        priority: Priority level (high, medium, low, or null)
        tags: Array of user-defined tags/categories
        due_date: Optional deadline timestamp (UTC)
        completed: Completion flag (synced with status via trigger)
        created_at: Task creation timestamp
        updated_at: Last modification timestamp (auto-updated via trigger)
    """

    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    title: str = Field(nullable=False, max_length=500, sa_column=Column(Text))
    description: Optional[str] = Field(default=None, max_length=5000, sa_column=Column(Text))
    status: str = Field(default="pending", nullable=False, max_length=20)
    priority: Optional[str] = Field(default=None, max_length=10)
    tags: list[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)))
    due_date: Optional[datetime] = Field(default=None)
    completed: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )

    class Config:
        """Pydantic configuration"""

        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "user_id": "650e8400-e29b-41d4-a716-446655440000",
                "title": "Write project proposal",
                "description": "Complete the Q1 project proposal document",
                "status": "pending",
                "priority": "high",
                "tags": ["work", "urgent", "client"],
                "due_date": "2026-01-10T00:00:00Z",
                "completed": False,
                "created_at": "2026-01-04T10:00:00Z",
                "updated_at": "2026-01-04T10:00:00Z",
            }
        }
