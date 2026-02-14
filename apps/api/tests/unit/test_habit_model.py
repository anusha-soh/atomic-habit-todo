import pytest
from pydantic import ValidationError
from src.models.habit import Habit, RecurringSchedule
from uuid import uuid4

@pytest.mark.unit
@pytest.mark.habits
@pytest.mark.US1_habits
class TestHabitModel:
    def test_identity_statement_validation(self):
        """T022: Identity statement must not be empty and trimmed"""
        # Valid
        habit = Habit(
            user_id=uuid4(),
            identity_statement="  I am a runner  ",
            two_minute_version="Put on shoes",
            category="Health & Fitness",
            recurring_schedule={"type": "daily"}
        )
        assert habit.identity_statement == "I am a runner"
        
        # Empty
        with pytest.raises(ValueError, match="Identity statement cannot be empty"):
            Habit(identity_statement="", user_id=uuid4(), two_minute_version="x", category="Other", recurring_schedule={"type":"daily"})
            
        # Too long
        with pytest.raises(ValueError, match="2000 characters or less"):
            Habit(identity_statement="a" * 2001, user_id=uuid4(), two_minute_version="x", category="Other", recurring_schedule={"type":"daily"})

    def test_two_minute_version_validation(self):
        """T023: 2-minute version must not be empty and trimmed"""
        habit = Habit(
            user_id=uuid4(),
            identity_statement="I am a reader",
            two_minute_version="  Read one page  ",
            category="Learning",
            recurring_schedule={"type": "daily"}
        )
        assert habit.two_minute_version == "Read one page"
        
        with pytest.raises(ValueError, match="2-minute version cannot be empty"):
            Habit(two_minute_version="", user_id=uuid4(), identity_statement="x", category="Other", recurring_schedule={"type":"daily"})

    def test_category_validation(self):
        """T024: Category must be one of the predefined values"""
        valid_categories = ["Health & Fitness", "Productivity", "Mindfulness", "Learning", "Social", "Finance", "Creative", "Other"]
        for cat in valid_categories:
            habit = Habit(
                user_id=uuid4(),
                identity_statement="x",
                two_minute_version="y",
                category=cat,
                recurring_schedule={"type": "daily"}
            )
            assert habit.category == cat
            
        with pytest.raises(ValueError, match="Category must be one of"):
            Habit(category="Invalid", user_id=uuid4(), identity_statement="x", two_minute_version="y", recurring_schedule={"type":"daily"})

    def test_status_validation(self):
        """T025: Status must be active or archived"""
        habit = Habit(user_id=uuid4(), identity_statement="x", two_minute_version="y", category="Other", recurring_schedule={"type":"daily"}, status="active")
        assert habit.status == "active"
        
        habit.status = "archived"
        assert habit.status == "archived"
        
        with pytest.raises(ValueError, match="Status must be 'active' or 'archived'"):
            Habit(status="deleted", user_id=uuid4(), identity_statement="x", two_minute_version="y", category="Other", recurring_schedule={"type":"daily"})

    def test_recurring_schedule_validation(self):
        """T026: RecurringSchedule complex validation"""
        # Daily is always valid if type matches
        s = RecurringSchedule(type="daily")
        assert s.type == "daily"
        
        # Weekly requires days
        with pytest.raises(ValidationError, match="Weekly schedule requires 'days' array"):
            RecurringSchedule(type="weekly")
            
        # Weekly with valid days
        s = RecurringSchedule(type="weekly", days=[0, 2, 4])
        assert s.days == [0, 2, 4]
        
        # Weekly with invalid days
        with pytest.raises(ValidationError, match="Days must be between 0 and 6"):
            RecurringSchedule(type="weekly", days=[7])
            
        # Monthly requires day_of_month
        with pytest.raises(ValidationError, match="Monthly schedule requires"):
            RecurringSchedule(type="monthly")
            
        # Monthly with valid day
        s = RecurringSchedule(type="monthly", day_of_month=15)
        assert s.day_of_month == 15
        
        # Monthly with invalid day
        with pytest.raises(ValidationError, match="day_of_month must be between 1 and 31"):
            RecurringSchedule(type="monthly", day_of_month=32)
