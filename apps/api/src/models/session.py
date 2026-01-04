"""
Session Model
Phase 2 Core Infrastructure
"""
from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime, timezone, timedelta
from typing import Optional


class Session(SQLModel, table=True):
    """
    Session entity for database-backed JWT session tracking.
    Enables server-side session invalidation (logout).

    Attributes:
        id: Unique session identifier (UUID)
        user_id: Foreign key to users table
        token: JWT token string
        expires_at: Session expiration timestamp (7 days from creation)
        created_at: Session creation timestamp (login time)
        is_active: Session status (FALSE when logged out or invalidated)
    """

    __tablename__ = "sessions"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    token: str = Field(nullable=False, index=True)
    expires_at: datetime = Field(nullable=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
    is_active: bool = Field(default=True, nullable=False, index=True)

    class Config:
        """Pydantic configuration"""

        json_schema_extra = {
            "example": {
                "id": "660f9511-f3ac-52e5-b827-557766551111",
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "expires_at": "2026-01-10T10:00:00Z",
                "created_at": "2026-01-03T10:00:00Z",
                "is_active": True,
            }
        }
