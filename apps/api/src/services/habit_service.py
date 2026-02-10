"""
Habit Service
Phase 2 Chunk 3 - Habits MVP
"""
from sqlmodel import Session, select, func
from src.services.event_emitter import EventEmitter
from src.models.habit import Habit
from uuid import UUID
from typing import Optional
import logging

# Configure logging for the service
logger = logging.getLogger(__name__)


class HabitService:
    """
    Business logic for habit management operations.

    Handles habit CRUD operations with event emission for habit lifecycle changes.
    All methods enforce user_id isolation to prevent cross-user data leakage.

    Events emitted:
        - HABIT_CREATED: When a new habit is created
        - HABIT_UPDATED: When a habit is modified
        - HABIT_DELETED: When a habit is permanently deleted
        - HABIT_ARCHIVED: When a habit status changes to archived
        - HABIT_RESTORED: When a habit status changes from archived to active
    """

    def __init__(self, session: Session, event_emitter: EventEmitter):
        """
        Initialize HabitService with dependency injection.

        Args:
            session: SQLModel database session
            event_emitter: Event emitter for habit lifecycle events
        """
        self.session = session
        self.event_emitter = event_emitter

    def create_habit(
        self,
        user_id: UUID,
        identity_statement: str,
        two_minute_version: str,
        category: str,
        recurring_schedule: dict,
        full_description: Optional[str] = None,
        habit_stacking_cue: Optional[str] = None,
        anchor_habit_id: Optional[UUID] = None,
        motivation: Optional[str] = None,
    ) -> Habit:
        """
        Create a new habit for the user.

        Args:
            user_id: User who owns the habit
            identity_statement: "I am a person who..." statement (required)
            two_minute_version: Starter version (required)
            category: Predefined category (required)
            recurring_schedule: Schedule data (required)
            full_description: Full habit description (optional)
            habit_stacking_cue: Stacking cue text (optional)
            anchor_habit_id: Anchor habit for stacking (optional)
            motivation: Why the user wants this habit (optional)

        Returns:
            Created Habit object

        Raises:
            ValueError: If validation fails or circular dependency detected
        """
        logger.info(f"Creating habit for user {user_id} with identity '{identity_statement[:50]}...'")

        # Validate anchor_habit_id if provided
        if anchor_habit_id:
            # Verify anchor habit exists and belongs to same user
            anchor = self.session.exec(
                select(Habit).where(
                    Habit.id == anchor_habit_id,
                    Habit.user_id == user_id
                )
            ).first()
            if not anchor:
                raise ValueError("Anchor habit not found or does not belong to this user")

            # Validate no circular dependency (stub - will implement in Phase 5)
            # if not self.validate_no_circular_dependency(habit.id, anchor_habit_id):
            #     raise ValueError("Circular dependency detected")

        # Create habit
        habit = Habit(
            user_id=user_id,
            identity_statement=identity_statement,
            full_description=full_description,
            two_minute_version=two_minute_version,
            habit_stacking_cue=habit_stacking_cue,
            anchor_habit_id=anchor_habit_id,
            motivation=motivation,
            category=category,
            recurring_schedule=recurring_schedule,
            status="active",
            current_streak=0,
            consecutive_misses=0,
        )

        self.session.add(habit)
        self.session.commit()
        self.session.refresh(habit)

        # Emit HABIT_CREATED event
        self.event_emitter.emit("HABIT_CREATED", user_id, {
            "habit_id": str(habit.id),
            "identity_statement": habit.identity_statement,
            "category": habit.category,
            "recurring_schedule": habit.recurring_schedule
        })

        logger.info(f"Created habit {habit.id} for user {user_id}")
        return habit

    def get_habits(
        self,
        user_id: UUID,
        status: Optional[str] = None,
        category: Optional[str] = None,
        include_archived: bool = False,
        page: int = 1,
        limit: int = 50,
    ) -> tuple[list[Habit], int]:
        """
        Get habits for a user with optional filtering and pagination.

        Args:
            user_id: User ID to get habits for
            status: Filter by status (active or archived)
            category: Filter by category
            include_archived: Include archived habits (default: False)
            page: Page number (1-indexed)
            limit: Items per page (max 100)

        Returns:
            Tuple of (habits list, total count)
        """
        logger.info(f"Fetching habits for user {user_id} (page={page}, limit={limit})")

        # Build base query with user isolation
        query = select(Habit).where(Habit.user_id == user_id)

        # Apply status filter (default: exclude archived)
        if status:
            query = query.where(Habit.status == status)
        elif not include_archived:
            query = query.where(Habit.status == "active")

        # Apply category filter
        if category:
            query = query.where(Habit.category == category)

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = self.session.exec(count_query).one()

        # Apply pagination
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)

        # Order by created_at descending
        query = query.order_by(Habit.created_at.desc())

        habits = self.session.exec(query).all()

        logger.info(f"Found {len(habits)} habits (total: {total})")
        return habits, total

    def get_habit(self, user_id: UUID, habit_id: UUID) -> Habit:
        """
        Get a single habit by ID with user isolation.

        Args:
            user_id: User ID (for isolation)
            habit_id: Habit ID to retrieve

        Returns:
            Habit object

        Raises:
            ValueError: If habit not found or doesn't belong to user
        """
        logger.info(f"Fetching habit {habit_id} for user {user_id}")

        habit = self.session.exec(
            select(Habit).where(
                Habit.id == habit_id,
                Habit.user_id == user_id
            )
        ).first()

        if not habit:
            raise ValueError("Habit not found")

        return habit

    def update_habit(
        self,
        user_id: UUID,
        habit_id: UUID,
        **updates
    ) -> Habit:
        """
        Update a habit with user isolation.

        Args:
            user_id: User ID (for isolation)
            habit_id: Habit ID to update
            **updates: Fields to update

        Returns:
            Updated Habit object

        Raises:
            ValueError: If habit not found or validation fails
        """
        logger.info(f"Updating habit {habit_id} for user {user_id}")

        # Get habit with user isolation
        habit = self.get_habit(user_id, habit_id)

        # Track updated fields for event
        updated_fields = []

        # Validate anchor_habit_id if being updated
        if "anchor_habit_id" in updates and updates["anchor_habit_id"]:
            anchor_id = updates["anchor_habit_id"]
            # Verify anchor exists and belongs to same user
            anchor = self.session.exec(
                select(Habit).where(
                    Habit.id == anchor_id,
                    Habit.user_id == user_id
                )
            ).first()
            if not anchor:
                raise ValueError("Anchor habit not found or does not belong to this user")

            # Validate no circular dependency (stub - will implement in Phase 5)
            # if not self.validate_no_circular_dependency(habit_id, anchor_id):
            #     raise ValueError("Circular dependency detected")

        # Apply updates
        for field, value in updates.items():
            if hasattr(habit, field) and value is not None:
                setattr(habit, field, value)
                updated_fields.append(field)

        self.session.add(habit)
        self.session.commit()
        self.session.refresh(habit)

        # Emit HABIT_UPDATED event
        self.event_emitter.emit("HABIT_UPDATED", user_id, {
            "habit_id": str(habit.id),
            "identity_statement": habit.identity_statement,
            "updated_fields": updated_fields
        })

        logger.info(f"Updated habit {habit.id} for user {user_id}")
        return habit

    def delete_habit(
        self,
        user_id: UUID,
        habit_id: UUID,
        force: bool = False
    ) -> None:
        """
        Delete a habit with dependency checking.

        Args:
            user_id: User ID (for isolation)
            habit_id: Habit ID to delete
            force: Force deletion even if dependencies exist

        Raises:
            ValueError: If habit not found or has dependencies without force
        """
        logger.info(f"Deleting habit {habit_id} for user {user_id} (force={force})")

        # Get habit with user isolation
        habit = self.get_habit(user_id, habit_id)

        # Find dependent habits (those that use this as anchor)
        dependent_habits = self.session.exec(
            select(Habit).where(Habit.anchor_habit_id == habit_id)
        ).all()

        if dependent_habits and not force:
            # Return list of dependent habits
            dependent_titles = [h.identity_statement for h in dependent_habits]
            raise ValueError(
                f"This habit is used as an anchor by {len(dependent_habits)} other habit(s): "
                f"{', '.join(dependent_titles)}. "
                f"Deleting will break their stacking cues."
            )

        # Emit HABIT_DELETED event
        self.event_emitter.emit("HABIT_DELETED", user_id, {
            "habit_id": str(habit.id),
            "identity_statement": habit.identity_statement,
            "had_dependencies": len(dependent_habits) > 0,
            "dependent_count": len(dependent_habits)
        })

        # Delete habit (CASCADE will set anchor_habit_id=NULL for dependents)
        self.session.delete(habit)
        self.session.commit()

        logger.info(f"Deleted habit {habit.id} for user {user_id}")

    def validate_no_circular_dependency(
        self,
        habit_id: UUID,
        anchor_id: UUID
    ) -> bool:
        """
        Validate that setting anchor_id won't create a circular dependency.

        Args:
            habit_id: The habit being updated
            anchor_id: The proposed anchor habit

        Returns:
            True if no circular dependency, False if circular

        Note: Stub implementation - will be fully implemented in Phase 5 (User Story 3)
        """
        # Self-reference check
        if habit_id == anchor_id:
            return False

        # TODO: Implement full recursive traversal in Phase 5 (T057)
        # Check if anchor_id is already stacked on habit_id (direct or transitive)
        # visited = set()
        # current = anchor_id
        # while current and current not in visited:
        #     visited.add(current)
        #     anchor_habit = self.session.exec(
        #         select(Habit).where(Habit.id == current)
        #     ).first()
        #     if not anchor_habit:
        #         break
        #     if anchor_habit.anchor_habit_id == habit_id:
        #         return False  # Circular dependency detected
        #     current = anchor_habit.anchor_habit_id

        return True
