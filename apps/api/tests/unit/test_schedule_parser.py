"""
Unit tests for schedule_parser — pure date calculation logic.
Feature: 005-habits-tasks-connection (T005)
"""
from datetime import date

from src.services.schedule_parser import get_scheduled_dates


# ── Daily schedule ────────────────────────────────────────────────

class TestDailySchedule:
    def test_daily_every_day(self):
        schedule = {"type": "daily", "frequency": 1}
        result = get_scheduled_dates(
            schedule,
            start_date=date(2026, 2, 13),
            end_date=date(2026, 2, 19),
            habit_created_at=date(2026, 2, 13),
        )
        assert len(result) == 7
        assert result[0] == date(2026, 2, 13)
        assert result[-1] == date(2026, 2, 19)

    def test_daily_every_2_days(self):
        schedule = {"type": "daily", "frequency": 2}
        result = get_scheduled_dates(
            schedule,
            start_date=date(2026, 2, 13),
            end_date=date(2026, 2, 19),
            habit_created_at=date(2026, 2, 13),
        )
        # Feb 13, 15, 17, 19
        assert result == [date(2026, 2, 13), date(2026, 2, 15), date(2026, 2, 17), date(2026, 2, 19)]

    def test_daily_every_3_days(self):
        schedule = {"type": "daily", "frequency": 3}
        result = get_scheduled_dates(
            schedule,
            start_date=date(2026, 2, 13),
            end_date=date(2026, 2, 19),
            habit_created_at=date(2026, 2, 13),
        )
        # Feb 13, 16, 19
        assert result == [date(2026, 2, 13), date(2026, 2, 16), date(2026, 2, 19)]

    def test_daily_frequency_with_offset_start(self):
        """Start date is after habit creation — frequency anchored to creation date."""
        schedule = {"type": "daily", "frequency": 2}
        result = get_scheduled_dates(
            schedule,
            start_date=date(2026, 2, 14),  # 1 day after creation
            end_date=date(2026, 2, 19),
            habit_created_at=date(2026, 2, 13),
        )
        # Anchored: 13, 15, 17, 19 — starting from 14: 15, 17, 19
        assert result == [date(2026, 2, 15), date(2026, 2, 17), date(2026, 2, 19)]

    def test_daily_default_frequency(self):
        """Missing frequency defaults to 1."""
        schedule = {"type": "daily"}
        result = get_scheduled_dates(
            schedule,
            start_date=date(2026, 2, 13),
            end_date=date(2026, 2, 15),
            habit_created_at=date(2026, 2, 13),
        )
        assert len(result) == 3


# ── Weekly schedule ───────────────────────────────────────────────

class TestWeeklySchedule:
    def test_weekly_mon_wed_fri(self):
        # 0=Sun, 1=Mon, 3=Wed, 5=Fri
        schedule = {"type": "weekly", "days": [1, 3, 5]}
        # Feb 13 2026 = Friday, Feb 19 = Thursday
        result = get_scheduled_dates(
            schedule,
            start_date=date(2026, 2, 13),
            end_date=date(2026, 2, 19),
            habit_created_at=date(2026, 2, 1),
        )
        # Fri 13, Mon 16, Wed 18
        assert result == [date(2026, 2, 13), date(2026, 2, 16), date(2026, 2, 18)]

    def test_weekly_sunday(self):
        schedule = {"type": "weekly", "days": [0]}  # Sunday
        result = get_scheduled_dates(
            schedule,
            start_date=date(2026, 2, 13),
            end_date=date(2026, 2, 19),
            habit_created_at=date(2026, 2, 1),
        )
        # Feb 15 is Sunday
        assert result == [date(2026, 2, 15)]

    def test_weekly_empty_days(self):
        schedule = {"type": "weekly", "days": []}
        result = get_scheduled_dates(
            schedule,
            start_date=date(2026, 2, 13),
            end_date=date(2026, 2, 19),
            habit_created_at=date(2026, 2, 1),
        )
        assert result == []


# ── Monthly schedule ──────────────────────────────────────────────

class TestMonthlySchedule:
    def test_monthly_1st_and_15th(self):
        schedule = {"type": "monthly", "days_of_month": [1, 15]}
        result = get_scheduled_dates(
            schedule,
            start_date=date(2026, 2, 1),
            end_date=date(2026, 3, 2),
            habit_created_at=date(2026, 1, 1),
        )
        assert date(2026, 2, 1) in result
        assert date(2026, 2, 15) in result
        assert date(2026, 3, 1) in result

    def test_monthly_day_31_in_feb(self):
        """Day 31 doesn't exist in Feb — should be skipped."""
        schedule = {"type": "monthly", "days_of_month": [31]}
        result = get_scheduled_dates(
            schedule,
            start_date=date(2026, 2, 1),
            end_date=date(2026, 2, 28),
            habit_created_at=date(2026, 1, 1),
        )
        assert result == []

    def test_monthly_backward_compat_day_of_month(self):
        """Deprecated day_of_month field still works as fallback."""
        schedule = {"type": "monthly", "day_of_month": 5}
        result = get_scheduled_dates(
            schedule,
            start_date=date(2026, 2, 1),
            end_date=date(2026, 2, 28),
            habit_created_at=date(2026, 1, 1),
        )
        assert result == [date(2026, 2, 5)]

    def test_monthly_no_days_specified(self):
        schedule = {"type": "monthly"}
        result = get_scheduled_dates(
            schedule,
            start_date=date(2026, 2, 1),
            end_date=date(2026, 2, 28),
            habit_created_at=date(2026, 1, 1),
        )
        assert result == []


# ── Until date ────────────────────────────────────────────────────

class TestUntilDate:
    def test_until_clips_end(self):
        schedule = {"type": "daily", "frequency": 1, "until": "2026-02-15"}
        result = get_scheduled_dates(
            schedule,
            start_date=date(2026, 2, 13),
            end_date=date(2026, 2, 19),
            habit_created_at=date(2026, 2, 13),
        )
        # Should include until date itself (13, 14, 15)
        assert len(result) == 3
        assert result[-1] == date(2026, 2, 15)

    def test_until_in_past(self):
        schedule = {"type": "daily", "frequency": 1, "until": "2026-02-10"}
        result = get_scheduled_dates(
            schedule,
            start_date=date(2026, 2, 13),
            end_date=date(2026, 2, 19),
            habit_created_at=date(2026, 2, 1),
        )
        assert result == []

    def test_until_equals_today(self):
        """Until == start → generates one task for today."""
        schedule = {"type": "daily", "frequency": 1, "until": "2026-02-13"}
        result = get_scheduled_dates(
            schedule,
            start_date=date(2026, 2, 13),
            end_date=date(2026, 2, 19),
            habit_created_at=date(2026, 2, 13),
        )
        assert result == [date(2026, 2, 13)]


# ── Edge cases ────────────────────────────────────────────────────

class TestEdgeCases:
    def test_start_before_habit_created(self):
        """Don't generate dates before habit was created."""
        schedule = {"type": "daily", "frequency": 1}
        result = get_scheduled_dates(
            schedule,
            start_date=date(2026, 2, 10),
            end_date=date(2026, 2, 15),
            habit_created_at=date(2026, 2, 13),
        )
        assert len(result) == 3
        assert result[0] == date(2026, 2, 13)

    def test_unknown_type_returns_empty(self):
        schedule = {"type": "yearly"}
        result = get_scheduled_dates(
            schedule,
            start_date=date(2026, 2, 13),
            end_date=date(2026, 2, 19),
            habit_created_at=date(2026, 2, 13),
        )
        assert result == []

    def test_empty_schedule_returns_empty(self):
        result = get_scheduled_dates(
            {},
            start_date=date(2026, 2, 13),
            end_date=date(2026, 2, 19),
            habit_created_at=date(2026, 2, 13),
        )
        assert result == []
