"""
Miss detector: daily background job that detects habits not completed yesterday.

"Never Miss Twice" Rule:
  - 1st consecutive miss → increment consecutive_misses, emit HABIT_MISS_DETECTED
  - 2nd+ consecutive miss → reset streak to 0, emit HABIT_STREAK_RESET
  - Offline for a week+ → treated as 2+ misses; streak resets immediately, one notification

Schedule: Run daily at 00:01 UTC via APScheduler (registered in main.py).
"""
from datetime import datetime, timezone, timedelta
from sqlmodel import Session, select

from src.database import engine
from src.models.habit import Habit
from src.models.habit_completion import HabitCompletion
from src.services.event_emitter import EventEmitter
from src.services.notification_service import (
    create_miss_notification,
    create_streak_reset_notification,
)

_emitter = EventEmitter()


def _had_completion_on_date(session: Session, habit_id, target_date) -> bool:
    """Return True if a completion exists for habit_id on target_date (UTC day)."""
    day_start = datetime(target_date.year, target_date.month, target_date.day, tzinfo=timezone.utc)
    day_end = day_start + timedelta(days=1)
    result = session.exec(
        select(HabitCompletion).where(
            HabitCompletion.habit_id == habit_id,
            HabitCompletion.completed_at >= day_start,
            HabitCompletion.completed_at < day_end,
        )
    ).first()
    return result is not None


def detect_missed_habits() -> list[dict]:
    """
    Main job function. Checks all active daily habits for yesterday's miss.
    Returns list of notification payloads emitted.

    Called by APScheduler and also available for on-demand login-time checks.
    """
    notifications: list[dict] = []
    yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).date()

    with Session(engine) as session:
        habits = session.exec(
            select(Habit).where(Habit.status == "active")
        ).all()

        for habit in habits:
            # Only apply never-miss-twice to daily habits in MVP
            if habit.recurring_schedule.get("type") != "daily":
                continue

            if _had_completion_on_date(session, habit.id, yesterday):
                # Completed — no miss; reset misses (in case of prior misses)
                if habit.consecutive_misses > 0:
                    habit.consecutive_misses = 0
                    session.add(habit)
                continue

            # Miss detected
            habit.consecutive_misses = (habit.consecutive_misses or 0) + 1

            if habit.consecutive_misses >= 2:
                # Streak reset
                previous_streak = habit.current_streak
                habit.current_streak = 0
                session.add(habit)
                session.commit()

                notif = create_streak_reset_notification(habit.id, habit.identity_statement)
                notifications.append(notif)
                _emitter.emit("HABIT_STREAK_RESET", {
                    "habit_id": str(habit.id),
                    "user_id": str(habit.user_id),
                    "previous_streak": previous_streak,
                    "reason": "missed_twice",
                })
            else:
                # First miss
                session.add(habit)
                session.commit()

                notif = create_miss_notification(
                    habit.id, habit.identity_statement, habit.consecutive_misses
                )
                notifications.append(notif)
                _emitter.emit("HABIT_MISS_DETECTED", {
                    "habit_id": str(habit.id),
                    "user_id": str(habit.user_id),
                    "consecutive_misses": habit.consecutive_misses,
                    "message": notif["message"],
                })

    return notifications
