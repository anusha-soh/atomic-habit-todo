"""
User Model
Phase 2 Core Infrastructure
"""
from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime, timezone
from typing import Optional


class User(SQLModel, table=True):
    """
    User entity representing an authenticated user.

    Attributes:
        id: Unique user identifier (UUID)
        email: User's email address (unique, used for login)
        password_hash: Hashed password (bcrypt via Better Auth)
        created_at: Account creation timestamp
        updated_at: Last update timestamp
    """

    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True, nullable=False, max_length=255)
    password_hash: str = Field(nullable=False, max_length=255)
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
                "email": "user@example.com",
                "created_at": "2026-01-03T10:00:00Z",
                "updated_at": "2026-01-03T10:00:00Z",
            }
        }
