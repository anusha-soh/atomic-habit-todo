"""Streak calculation service for habit tracking

Algorithm: O(n log n) sort + linear scan
- Sort completions by date (descending)
- Iterate backward from most recent
- Count consecutive days (day_gap == 1)
- Break on gaps (day_gap > 1)
"""
from datetime import date, datetime, timezone
from typing import List, Optional
from src.models.habit_completion import HabitCompletion


def calculate_streak(
    completions: List[HabitCompletion],
    today: Optional[date] = None
) -> int:
    """
    Calculate the current streak from a list of completions.

    Algorithm:
    1. Sort completions by completed_at (descending, most recent first)
    2. Check if most recent completion is yesterday or today
    3. Iterate backward counting consecutive days
    4. Stop when gap > 1 day is found

    Args:
        completions: List of HabitCompletion records for a habit
        today: Reference date for "today" (defaults to UTC now)

    Returns:
        Current streak count (0 if no streak, >= 1 if active streak)

    Examples:
        >>> # No completions
        >>> calculate_streak([])
        0

        >>> # Completed today and yesterday
        >>> calculate_streak([completion_today, completion_yesterday])
        2

        >>> # Completed 3 days ago (broken streak)
        >>> calculate_streak([completion_3_days_ago])
        0

        >>> # Same day multiple completions (counts as 1)
        >>> calculate_streak([completion1_today, completion2_today])
        1
    """
    if not completions:
        return 0

    # Use provided today or default to UTC now
    if today is None:
        today = datetime.now(timezone.utc).date()

    # Sort completions by date (descending, most recent first)
    sorted_completions = sorted(
        completions,
        key=lambda c: c.completed_at,
        reverse=True
    )

    # Get the most recent completion date
    most_recent_completion = sorted_completions[0]
    current_date = most_recent_completion.completed_at.date()

    # Calculate day gap from today to most recent completion
    day_gap_from_today = (today - current_date).days

    # If most recent completion is more than 1 day ago, streak is broken
    if day_gap_from_today > 1:
        return 0

    # Start counting streak
    streak = 1
    previous_date = current_date

    # Iterate through remaining completions
    for i in range(1, len(sorted_completions)):
        completion_date = sorted_completions[i].completed_at.date()

        # Calculate day gap between consecutive completions
        day_gap = (previous_date - completion_date).days

        if day_gap == 0:
            # Same day (multiple completions) - don't increment streak
            continue
        elif day_gap == 1:
            # Consecutive day - increment streak
            streak += 1
            previous_date = completion_date
        else:
            # Gap detected - streak ends here
            break

    return streak


def get_last_completion_date(completions: List[HabitCompletion]) -> Optional[date]:
    """
    Get the date of the most recent completion.

    Args:
        completions: List of HabitCompletion records

    Returns:
        Date of most recent completion, or None if no completions
    """
    if not completions:
        return None

    most_recent = max(completions, key=lambda c: c.completed_at)
    return most_recent.completed_at.date()


def is_streak_active(
    completions: List[HabitCompletion],
    today: Optional[date] = None
) -> bool:
    """
    Check if a habit has an active streak (completed today or yesterday).

    Args:
        completions: List of HabitCompletion records
        today: Reference date (defaults to UTC now)

    Returns:
        True if streak is active (completed today or yesterday), False otherwise
    """
    if not completions:
        return False

    if today is None:
        today = datetime.now(timezone.utc).date()

    last_completion = get_last_completion_date(completions)
    if last_completion is None:
        return False

    day_gap = (today - last_completion).days
    return day_gap <= 1


def should_increment_streak(
    last_completed_at: Optional[datetime],
    new_completion_time: datetime
) -> bool:
    """
    Determine if completing a habit now should increment the streak.

    Rules:
    - If never completed before: Start new streak (don't increment, will be 1)
    - If last completion was yesterday: Increment streak
    - If last completion was today: Don't increment (idempotent)
    - If last completion was 2+ days ago: Reset to 1 (don't increment)

    Args:
        last_completed_at: When the habit was last completed
        new_completion_time: When the new completion is happening

    Returns:
        True if streak should increment, False otherwise
    """
    if last_completed_at is None:
        # First completion ever - don't increment (will be set to 1)
        return False

    last_date = last_completed_at.date()
    new_date = new_completion_time.date()
    day_gap = (new_date - last_date).days

    if day_gap == 0:
        # Same day - idempotent, don't change streak
        return False
    elif day_gap == 1:
        # Consecutive day - increment streak
        return True
    else:
        # Gap detected - reset to 1 (don't increment)
        return False


def calculate_new_streak_value(
    current_streak: int,
    last_completed_at: Optional[datetime],
    new_completion_time: datetime
) -> int:
    """
    Calculate the new streak value after a completion.

    Args:
        current_streak: Current streak count
        last_completed_at: When habit was last completed
        new_completion_time: When the new completion is happening

    Returns:
        New streak value
    """
    if last_completed_at is None:
        # First completion - streak becomes 1
        return 1

    last_date = last_completed_at.date()
    new_date = new_completion_time.date()
    day_gap = (new_date - last_date).days

    if day_gap == 0:
        # Same day - no change
        return current_streak
    elif day_gap == 1:
        # Consecutive day - increment
        return current_streak + 1
    else:
        # Gap detected - reset to 1
        return 1
