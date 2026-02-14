"""
Schedule Parser - Pure function for calculating scheduled dates from RecurringSchedule.
Feature: 005-habits-tasks-connection
"""
from datetime import date, timedelta
from typing import Optional


def get_scheduled_dates(
    schedule: dict,
    start_date: date,
    end_date: date,
    habit_created_at: date,
) -> list[date]:
    """
    Calculate all dates within [start_date, end_date] that match the recurring schedule.

    Args:
        schedule: RecurringSchedule dict with type, frequency, days, days_of_month, until, etc.
        start_date: First date of the window (inclusive).
        end_date: Last date of the window (inclusive).
        habit_created_at: Date the habit was created (don't generate before this).

    Returns:
        Sorted list of dates that match the schedule.
    """
    schedule_type = schedule.get("type")
    until_str: Optional[str] = schedule.get("until")

    # Parse until date if present
    until_date: Optional[date] = None
    if until_str:
        until_date = date.fromisoformat(until_str)

    # Effective window: clamp start to habit creation date
    effective_start = max(start_date, habit_created_at)

    # Clamp end to until date if present
    effective_end = end_date
    if until_date is not None:
        effective_end = min(end_date, until_date)

    # If window is invalid, return empty
    if effective_start > effective_end:
        return []

    if schedule_type == "daily":
        return _daily_dates(schedule, effective_start, effective_end, habit_created_at)
    elif schedule_type == "weekly":
        return _weekly_dates(schedule, effective_start, effective_end)
    elif schedule_type == "monthly":
        return _monthly_dates(schedule, effective_start, effective_end)
    else:
        return []


def _daily_dates(
    schedule: dict,
    start: date,
    end: date,
    habit_created_at: date,
) -> list[date]:
    """Generate dates for daily schedule with frequency."""
    frequency = schedule.get("frequency", 1)
    if frequency < 1:
        frequency = 1

    dates = []
    if frequency == 1:
        # Every day
        current = start
        while current <= end:
            dates.append(current)
            current += timedelta(days=1)
    else:
        # Every N days from habit creation
        days_since_creation = (start - habit_created_at).days
        # Find the first matching date >= start
        remainder = days_since_creation % frequency
        if remainder == 0:
            first_match = start
        else:
            first_match = start + timedelta(days=frequency - remainder)

        current = first_match
        while current <= end:
            dates.append(current)
            current += timedelta(days=frequency)

    return dates


# Spec convention: 0=Sun, 1=Mon, ..., 6=Sat
# Python isoweekday(): 1=Mon, ..., 7=Sun
_SPEC_TO_PYTHON_WEEKDAY = {
    0: 7,  # Sun
    1: 1,  # Mon
    2: 2,  # Tue
    3: 3,  # Wed
    4: 4,  # Thu
    5: 5,  # Fri
    6: 6,  # Sat
}


def _weekly_dates(schedule: dict, start: date, end: date) -> list[date]:
    """Generate dates for weekly schedule on specific days."""
    days = schedule.get("days", [])
    if not days:
        return []

    # Convert spec days (0=Sun) to Python isoweekday (1=Mon, 7=Sun)
    target_weekdays = {_SPEC_TO_PYTHON_WEEKDAY[d] for d in days if 0 <= d <= 6}

    dates = []
    current = start
    while current <= end:
        if current.isoweekday() in target_weekdays:
            dates.append(current)
        current += timedelta(days=1)

    return dates


def _monthly_dates(schedule: dict, start: date, end: date) -> list[date]:
    """Generate dates for monthly schedule on specific days of month."""
    # Prefer days_of_month; fall back to [day_of_month] for backward compat
    days_of_month = schedule.get("days_of_month")
    if not days_of_month:
        day_of_month = schedule.get("day_of_month")
        if day_of_month is not None:
            days_of_month = [day_of_month]
        else:
            return []

    target_days = sorted(set(days_of_month))

    dates = []
    current = start
    while current <= end:
        if current.day in target_days:
            dates.append(current)
        current += timedelta(days=1)

    return dates
