import pytest
from uuid import uuid4
from sqlalchemy.orm import Session
from unittest.mock import MagicMock
from src.services.habit_service import HabitService
from src.schemas.habit_schemas import HabitCreate
from src.models.habit import Habit

@pytest.fixture
def habit_service(session: Session, mock_event_emitter):
    return HabitService(session, mock_event_emitter)

@pytest.mark.unit
@pytest.mark.habits
@pytest.mark.US1_habits
def test_create_habit_service(habit_service, user_id, mock_event_emitter):
    """T027: HabitService.create_habit() business logic"""
    habit_data = HabitCreate(
        identity_statement="I am a person who reads daily",
        two_minute_version="Read one page",
        category="Learning",
        recurring_schedule={"type": "daily"}
    )
    
    habit = habit_service.create_habit(user_id, habit_data)
    
    assert habit.identity_statement == habit_data.identity_statement
    assert habit.user_id == user_id
    
    # Verify HABIT_CREATED event was emitted (create_habit also triggers task generation events)
    mock_event_emitter.emit.assert_any_call(
        event_type="HABIT_CREATED",
        user_id=user_id,
        payload={
            "habit_id": str(habit.id),
            "identity_statement": habit.identity_statement,
            "category": habit.category,
            "recurring_schedule": habit.recurring_schedule
        }
    )

@pytest.mark.unit
@pytest.mark.habits
@pytest.mark.US1_habits
def test_get_habits_isolation(habit_service, user_id, another_user):
    """T028: HabitService.get_habits() user isolation"""
    # Create habit for user_id
    habit_service.create_habit(user_id, HabitCreate(
        identity_statement="User 1 Habit",
        two_minute_version="x",
        category="Other",
        recurring_schedule={"type": "daily"}
    ))
    
    # Create habit for another_user
    habit_service.create_habit(another_user.id, HabitCreate(
        identity_statement="User 2 Habit",
        two_minute_version="y",
        category="Other",
        recurring_schedule={"type": "daily"}
    ))
    
    # Fetch habits for user_id
    habits, total = habit_service.get_habits(user_id)

    assert total == 1
    assert habits[0].identity_statement == "User 1 Habit"
    assert habits[0].user_id == user_id

# ===== T052-T053: Circular Dependency Tests (User Story 3) =====

@pytest.mark.unit
@pytest.mark.habits
@pytest.mark.US3_habits
def test_validate_no_circular_dependency_valid_chain(habit_service, user_id):
    """T052: validate_no_circular_dependency() returns True for valid chains (A→B→C)"""
    # Create habit chain: A → B → C
    habit_a = habit_service.create_habit(user_id, HabitCreate(
        identity_statement="I am a person who wakes up early",
        two_minute_version="Open eyes",
        category="Other",
        recurring_schedule={"type": "daily"}
    ))

    habit_b = habit_service.create_habit(user_id, HabitCreate(
        identity_statement="I am a person who drinks water",
        two_minute_version="Grab glass",
        category="Health & Fitness",
        recurring_schedule={"type": "daily"},
        anchor_habit_id=habit_a.id
    ))

    habit_c = habit_service.create_habit(user_id, HabitCreate(
        identity_statement="I am a person who exercises",
        two_minute_version="Put on shoes",
        category="Health & Fitness",
        recurring_schedule={"type": "daily"},
        anchor_habit_id=habit_b.id
    ))

    # Valid chain A → B → C should return True
    result = habit_service.validate_no_circular_dependency(None, habit_a.id, user_id)
    assert result is True

@pytest.mark.unit
@pytest.mark.habits
@pytest.mark.US3_habits
def test_validate_no_circular_dependency_detects_self_reference(habit_service, user_id):
    """T052: validate_no_circular_dependency() returns False for self-reference (A→A)"""
    habit_a = habit_service.create_habit(user_id, HabitCreate(
        identity_statement="I am a person who meditates",
        two_minute_version="Sit down",
        category="Mindfulness",
        recurring_schedule={"type": "daily"}
    ))

    # Self-reference should return False
    result = habit_service.validate_no_circular_dependency(habit_a.id, habit_a.id, user_id)
    assert result is False

@pytest.mark.unit
@pytest.mark.habits
@pytest.mark.US3_habits
def test_validate_no_circular_dependency_detects_simple_cycle(habit_service, user_id):
    """T052: validate_no_circular_dependency() returns False for circular (A→B→A)"""
    habit_a = habit_service.create_habit(user_id, HabitCreate(
        identity_statement="I am a person who drinks coffee",
        two_minute_version="Boil water",
        category="Other",
        recurring_schedule={"type": "daily"}
    ))

    habit_b = habit_service.create_habit(user_id, HabitCreate(
        identity_statement="I am a person who reads",
        two_minute_version="Open book",
        category="Learning",
        recurring_schedule={"type": "daily"},
        anchor_habit_id=habit_a.id
    ))

    # Attempting to make A → B (circular) should return False
    result = habit_service.validate_no_circular_dependency(habit_a.id, habit_b.id, user_id)
    assert result is False

@pytest.mark.unit
@pytest.mark.habits
@pytest.mark.US3_habits
def test_validate_no_circular_dependency_detects_deep_cycle(habit_service, user_id):
    """T052: validate_no_circular_dependency() returns False for deep cycle (A→B→C→D→A)"""
    habit_a = habit_service.create_habit(user_id, HabitCreate(
        identity_statement="Habit A",
        two_minute_version="Start A",
        category="Other",
        recurring_schedule={"type": "daily"}
    ))

    habit_b = habit_service.create_habit(user_id, HabitCreate(
        identity_statement="Habit B",
        two_minute_version="Start B",
        category="Other",
        recurring_schedule={"type": "daily"},
        anchor_habit_id=habit_a.id
    ))

    habit_c = habit_service.create_habit(user_id, HabitCreate(
        identity_statement="Habit C",
        two_minute_version="Start C",
        category="Other",
        recurring_schedule={"type": "daily"},
        anchor_habit_id=habit_b.id
    ))

    habit_d = habit_service.create_habit(user_id, HabitCreate(
        identity_statement="Habit D",
        two_minute_version="Start D",
        category="Other",
        recurring_schedule={"type": "daily"},
        anchor_habit_id=habit_c.id
    ))

    # Attempting to close the loop D → A → B → C → D should return False
    result = habit_service.validate_no_circular_dependency(habit_a.id, habit_d.id, user_id)
    assert result is False

@pytest.mark.unit
@pytest.mark.habits
@pytest.mark.US3_habits
def test_validate_no_circular_dependency_orphan_habit(habit_service, user_id):
    """T052: validate_no_circular_dependency() returns True for orphan (no anchor)"""
    habit = habit_service.create_habit(user_id, HabitCreate(
        identity_statement="I am a person who journals",
        two_minute_version="Open notebook",
        category="Other",
        recurring_schedule={"type": "daily"}
    ))

    # Orphan habit with no anchor should return True
    result = habit_service.validate_no_circular_dependency(habit.id, None, user_id)
    assert result is True

@pytest.mark.unit
@pytest.mark.habits
@pytest.mark.US3_habits
def test_delete_habit_with_no_dependents(habit_service, user_id):
    """T053: delete_habit() succeeds when no dependents exist"""
    habit = habit_service.create_habit(user_id, HabitCreate(
        identity_statement="I am a person who walks",
        two_minute_version="Put on shoes",
        category="Health & Fitness",
        recurring_schedule={"type": "daily"}
    ))

    # Delete should succeed
    result = habit_service.delete_habit(user_id, habit.id, force=False)
    assert result is True

    # Verify habit is deleted
    deleted_habit = habit_service.get_habit(user_id, habit.id)
    assert deleted_habit is None

@pytest.mark.unit
@pytest.mark.habits
@pytest.mark.US3_habits
def test_delete_habit_with_dependents_raises_error(habit_service, user_id):
    """T053: delete_habit() raises ValueError when dependents exist (no force)"""
    # Create anchor habit
    anchor = habit_service.create_habit(user_id, HabitCreate(
        identity_statement="I am a person who drinks coffee",
        two_minute_version="Boil water",
        category="Other",
        recurring_schedule={"type": "daily"}
    ))

    # Create dependent habits
    dependent1 = habit_service.create_habit(user_id, HabitCreate(
        identity_statement="I am a person who meditates",
        two_minute_version="Sit down",
        category="Mindfulness",
        recurring_schedule={"type": "daily"},
        anchor_habit_id=anchor.id
    ))

    dependent2 = habit_service.create_habit(user_id, HabitCreate(
        identity_statement="I am a person who reads",
        two_minute_version="Open book",
        category="Learning",
        recurring_schedule={"type": "daily"},
        anchor_habit_id=anchor.id
    ))

    # Attempt to delete anchor without force should raise ValueError
    with pytest.raises(ValueError) as exc_info:
        habit_service.delete_habit(user_id, anchor.id, force=False)

    assert "is an anchor for" in str(exc_info.value).lower()

    # Verify anchor still exists
    existing_anchor = habit_service.get_habit(user_id, anchor.id)
    assert existing_anchor is not None

@pytest.mark.unit
@pytest.mark.habits
@pytest.mark.US3_habits
def test_delete_habit_with_dependents_force_mode(habit_service, user_id):
    """T053: delete_habit() succeeds with force=True and sets dependents' anchor to NULL"""
    # Create anchor habit
    anchor = habit_service.create_habit(user_id, HabitCreate(
        identity_statement="I am a person who wakes up early",
        two_minute_version="Open eyes",
        category="Other",
        recurring_schedule={"type": "daily"}
    ))

    # Create dependent habit
    dependent = habit_service.create_habit(user_id, HabitCreate(
        identity_statement="I am a person who exercises",
        two_minute_version="Put on shoes",
        category="Health & Fitness",
        recurring_schedule={"type": "daily"},
        anchor_habit_id=anchor.id,
        habit_stacking_cue="After I wake up early, I will exercise"
    ))

    # Delete anchor with force=True
    result = habit_service.delete_habit(user_id, anchor.id, force=True)
    assert result is True

    # Verify anchor is deleted
    deleted_anchor = habit_service.get_habit(user_id, anchor.id)
    assert deleted_anchor is None

    # Verify dependent still exists but anchor_habit_id is NULL
    # Note: Database CASCADE SET NULL should handle this
    remaining_dependent = habit_service.get_habit(user_id, dependent.id)
    assert remaining_dependent is not None
    assert remaining_dependent.anchor_habit_id is None
    # habit_stacking_cue text should be preserved
    assert remaining_dependent.habit_stacking_cue == "After I wake up early, I will exercise"
