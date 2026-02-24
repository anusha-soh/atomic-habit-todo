"""
Unit Tests for Streak Calculator - UTC Awareness
Phase 2 - 008 Production Hardening (T056)
"""
import pytest
from datetime import datetime, timezone, timedelta

from src.services.streak_calculator import calculate_new_streak_value


@pytest.mark.unit
class TestStreakUsesUTC:
    """Unit tests verifying streak calculator works with UTC-aware datetimes"""

    def test_streak_first_completion_returns_one(self):
        """
        T056: First completion with UTC-aware datetime should return streak of 1.
        """
        now_utc = datetime.now(timezone.utc)
        result = calculate_new_streak_value(
            current_streak=0,
            last_completed_at=None,
            new_completion_time=now_utc,
        )
        assert result == 1

    def test_streak_consecutive_day_increments(self):
        """
        T056: Completing on consecutive UTC days should increment the streak.
        """
        yesterday_utc = datetime.now(timezone.utc) - timedelta(days=1)
        now_utc = datetime.now(timezone.utc)

        result = calculate_new_streak_value(
            current_streak=1,
            last_completed_at=yesterday_utc,
            new_completion_time=now_utc,
        )
        assert result == 2

    def test_streak_same_day_no_change(self):
        """
        T056: Completing twice on the same UTC day should not change the streak.
        """
        now_utc = datetime.now(timezone.utc)
        earlier_today_utc = now_utc - timedelta(hours=2)

        result = calculate_new_streak_value(
            current_streak=3,
            last_completed_at=earlier_today_utc,
            new_completion_time=now_utc,
        )
        assert result == 3

    def test_streak_gap_resets_to_one(self):
        """
        T056: A gap of 2+ days should reset the streak to 1.
        """
        two_days_ago_utc = datetime.now(timezone.utc) - timedelta(days=2)
        now_utc = datetime.now(timezone.utc)

        result = calculate_new_streak_value(
            current_streak=5,
            last_completed_at=two_days_ago_utc,
            new_completion_time=now_utc,
        )
        assert result == 1

    def test_streak_works_with_utc_aware_datetimes(self):
        """
        T056: Verify the function accepts and correctly processes
        UTC-aware datetimes (not naive).
        """
        # Use explicit UTC timezone
        last = datetime(2026, 2, 23, 23, 59, 0, tzinfo=timezone.utc)
        new = datetime(2026, 2, 24, 0, 1, 0, tzinfo=timezone.utc)

        result = calculate_new_streak_value(
            current_streak=4,
            last_completed_at=last,
            new_completion_time=new,
        )
        # These are consecutive days (Feb 23 -> Feb 24)
        assert result == 5
