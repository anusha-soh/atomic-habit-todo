from typing import Any, Dict, Optional
from uuid import UUID, uuid4
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from unittest.mock import Mock

from src.models.habit import Habit
from src.services.event_emitter import EventEmitter


def create_test_habit(
    session: Session,
    user_id: UUID,
    overrides: Optional[Dict[str, Any]] = None
) -> Habit:
    """Helper to create a habit for testing with sensible defaults"""
    defaults = {
        "id": uuid4(),
        "user_id": user_id,
        "identity_statement": "I am a person who reads daily",
        "two_minute_version": "Read one page",
        "category": "Learning",
        "recurring_schedule": {"type": "daily"},
        "status": "active",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    if overrides:
        defaults.update(overrides)
    
    habit = Habit(**defaults)
    session.add(habit)
    session.commit()
    session.refresh(habit)
    return habit


def assert_habit_equals(
    habit1: Habit,
    habit2: Habit,
    exclude_fields: Optional[list] = None
) -> None:
    """Helper to assert that two habit objects are equal, excluding specific fields"""
    exclude = exclude_fields or []
    
    h1_dict = habit1.model_dump()
    h2_dict = habit2.model_dump()
    
    for field in exclude:
        h1_dict.pop(field, None)
        h2_dict.pop(field, None)
        
    assert h1_dict == h2_dict


def mock_event_emitter() -> Mock:
    """Helper to create a mock event emitter"""
    return Mock(spec=EventEmitter)
