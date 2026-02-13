"""
Notification service for habit miss alerts.
Creates in-app notification payloads (banners/toasts).
"""
from datetime import datetime, timezone
from uuid import UUID


def create_miss_notification(habit_id: UUID, habit_name: str, consecutive_misses: int) -> dict:
    """Build a first-miss notification payload."""
    return {
        "type": "HABIT_MISS",
        "habit_id": str(habit_id),
        "consecutive_misses": consecutive_misses,
        "message": f"Get back on track today! You missed {habit_name} yesterday.",
        "icon": "bell",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


def create_streak_reset_notification(habit_id: UUID, habit_name: str) -> dict:
    """Build a streak-reset notification payload (2nd consecutive miss)."""
    return {
        "type": "STREAK_RESET",
        "habit_id": str(habit_id),
        "consecutive_misses": 2,
        "message": f"Your streak has reset to 0 for {habit_name}. Start fresh today!",
        "icon": "warning",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
