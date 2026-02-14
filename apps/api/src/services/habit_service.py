from typing import List, Optional, Tuple, Any
from uuid import UUID
from datetime import datetime, timezone
import logging
from sqlalchemy.orm import Session
from src.models.habit import Habit
from src.schemas.habit_schemas import HabitCreate, HabitUpdate
from src.services.event_emitter import EventEmitter

logger = logging.getLogger(__name__)


class HabitService:
    """Service for managing habit lifecycle and business logic"""

    def __init__(self, session: Session, event_emitter: EventEmitter):
        self.session = session
        self.event_emitter = event_emitter

    def create_habit(self, user_id: UUID, habit_data: HabitCreate) -> Habit:
        """Create a new identity-driven habit"""
        # Validate anchor habit if provided
        if habit_data.anchor_habit_id:
            anchor = self.session.get(Habit, habit_data.anchor_habit_id)
            if not anchor:
                raise ValueError("Anchor habit not found")
            if anchor.user_id != user_id:
                raise ValueError("Cannot anchor to another user's habit")
            
            # Check for circular dependency
            if not self.validate_no_circular_dependency(None, habit_data.anchor_habit_id, user_id):
                 raise ValueError("Circular dependency detected")

        # Create habit instance
        habit = Habit(
            user_id=user_id,
            identity_statement=habit_data.identity_statement,
            full_description=habit_data.full_description,
            two_minute_version=habit_data.two_minute_version,
            habit_stacking_cue=habit_data.habit_stacking_cue,
            anchor_habit_id=habit_data.anchor_habit_id,
            motivation=habit_data.motivation,
            category=habit_data.category,
            recurring_schedule=habit_data.recurring_schedule.model_dump(),
            status="active"
        )
        
        self.session.add(habit)
        self.session.commit()
        self.session.refresh(habit)
        
        # Emit HABIT_CREATED event
        self.event_emitter.emit(
            event_type="HABIT_CREATED",
            user_id=user_id,
            payload={
                "habit_id": str(habit.id),
                "identity_statement": habit.identity_statement,
                "category": habit.category,
                "recurring_schedule": habit.recurring_schedule
            }
        )

        # Generate tasks for habit if recurring schedule is set (Chunk 5)
        if habit.recurring_schedule and habit.recurring_schedule.get("type"):
            try:
                from src.services.habit_task_service import HabitTaskGenerationService
                gen_service = HabitTaskGenerationService(self.session, self.event_emitter)
                result = gen_service.generate_tasks_for_habit(habit.id, user_id)
                logger.info(f"Auto-generated {result.generated} tasks for new habit {habit.id}")
            except Exception as e:
                logger.error(f"Failed to auto-generate tasks for habit {habit.id}: {e}")

        return habit

    def get_habits(
        self,
        user_id: UUID,
        status: Optional[str] = "active",
        category: Optional[str] = None,
        page: int = 1,
        limit: int = 50,
        include_archived: bool = False
    ) -> Tuple[List[Habit], int]:
        """Get paginated habits for a specific user with filtering"""
        from sqlmodel import select, func
        
        offset = (page - 1) * limit
        query = select(Habit).where(Habit.user_id == user_id)
        
        # Apply status filter
        if not include_archived:
            if status:
                query = query.where(Habit.status == status)
            else:
                query = query.where(Habit.status == "active")
        
        # Apply category filter
        if category:
            query = query.where(Habit.category == category)
            
        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total = self.session.exec(count_query).one()
        
        # Apply pagination and sorting
        query = query.order_by(Habit.created_at.desc())
        results = self.session.exec(query.offset(offset).limit(limit)).all()
        
        return list(results), total

    def get_habit(self, user_id: UUID, habit_id: UUID) -> Optional[Habit]:
        """Get a specific habit by ID with user isolation"""
        from sqlmodel import select
        query = select(Habit).where(Habit.id == habit_id, Habit.user_id == user_id)
        return self.session.exec(query).first()

    def update_habit(
        self, user_id: UUID, habit_id: UUID, habit_data: HabitUpdate
    ) -> Habit:
        """Update an existing habit with circular dependency check"""
        habit = self.get_habit(user_id, habit_id)
        if not habit:
            raise ValueError("Habit not found")

        updates = habit_data.model_dump(exclude_unset=True)
        
        # Check for circular dependency if anchor_habit_id is being updated
        if "anchor_habit_id" in updates and updates["anchor_habit_id"]:
            new_anchor_id = updates["anchor_habit_id"]
            if not self.validate_no_circular_dependency(habit_id, new_anchor_id, user_id):
                raise ValueError("Circular dependency detected")
            
            # Verify anchor exists and belongs to user
            anchor = self.session.get(Habit, new_anchor_id)
            if not anchor or anchor.user_id != user_id:
                raise ValueError("Anchor habit not found or unauthorized")

        # Handle recurring_schedule conversion if present
        schedule_changed = False
        if "recurring_schedule" in updates and updates["recurring_schedule"]:
            old_schedule = habit.recurring_schedule
            new_schedule = updates["recurring_schedule"].model_dump()
            schedule_changed = old_schedule != new_schedule
            updates["recurring_schedule"] = new_schedule

        # Apply updates
        for key, value in updates.items():
            setattr(habit, key, value)

        habit.updated_at = datetime.now(timezone.utc)
        self.session.add(habit)
        self.session.commit()
        self.session.refresh(habit)

        # Emit HABIT_UPDATED event
        self.event_emitter.emit(
            event_type="HABIT_UPDATED",
            user_id=user_id,
            payload={
                "habit_id": str(habit.id),
                "updated_fields": list(updates.keys())
            }
        )

        # Regenerate tasks if recurring schedule changed (Chunk 5)
        if schedule_changed:
            try:
                from src.services.habit_task_service import HabitTaskGenerationService
                gen_service = HabitTaskGenerationService(self.session, self.event_emitter)
                result = gen_service.regenerate_future_tasks(habit.id, user_id)
                logger.info(f"Regenerated tasks for habit {habit.id}: {result.generated} created")
            except Exception as e:
                logger.error(f"Failed to regenerate tasks for habit {habit.id}: {e}")

        return habit

    def delete_habit(self, user_id: UUID, habit_id: UUID, force: bool = False) -> bool:
        """Delete a habit with dependency checking"""
        habit = self.get_habit(user_id, habit_id)
        if not habit:
            raise ValueError("Habit not found")

        # Check for dependent habits
        from sqlmodel import select
        dependents_query = select(Habit).where(Habit.anchor_habit_id == habit_id)
        dependents = self.session.exec(dependents_query).all()

        if dependents and not force:
            dependent_titles = [h.identity_statement for h in dependents]
            raise ValueError(f"Habit is an anchor for: {', '.join(dependent_titles)}")

        self.session.delete(habit)
        self.session.commit()

        # Emit HABIT_DELETED event
        self.event_emitter.emit(
            event_type="HABIT_DELETED",
            user_id=user_id,
            payload={
                "habit_id": str(habit_id),
                "identity_statement": habit.identity_statement
            }
        )

        return True

    def archive_habit(self, user_id: UUID, habit_id: UUID) -> Habit:
        """Archive a habit (soft delete)"""
        habit = self.get_habit(user_id, habit_id)
        if not habit:
            raise ValueError("Habit not found")
        
        habit.status = "archived"
        habit.updated_at = datetime.now(timezone.utc)
        
        self.session.add(habit)
        self.session.commit()
        self.session.refresh(habit)
        
        self.event_emitter.emit(
            event_type="HABIT_ARCHIVED",
            user_id=user_id,
            payload={"habit_id": str(habit_id), "identity_statement": habit.identity_statement}
        )
        return habit

    def restore_habit(self, user_id: UUID, habit_id: UUID) -> Habit:
        """Restore an archived habit"""
        habit = self.get_habit(user_id, habit_id)
        if not habit:
            raise ValueError("Habit not found")
        
        habit.status = "active"
        habit.updated_at = datetime.now(timezone.utc)
        
        self.session.add(habit)
        self.session.commit()
        self.session.refresh(habit)
        
        self.event_emitter.emit(
            event_type="HABIT_RESTORED",
            user_id=user_id,
            payload={"habit_id": str(habit_id), "identity_statement": habit.identity_statement}
        )
        return habit

    def validate_no_circular_dependency(self, habit_id: Optional[UUID], anchor_id: UUID, user_id: UUID) -> bool:
        """
        Check for circular dependencies in habit stacking chains.
        Returns True if no cycle detected, False if cycle found.
        """
        if habit_id == anchor_id:
            return False
            
        visited = set()
        if habit_id:
            visited.add(habit_id)
            
        current_anchor_id = anchor_id
        depth = 0
        max_depth = 10
        
        while current_anchor_id and depth < max_depth:
            if current_anchor_id in visited:
                return False
            
            visited.add(current_anchor_id)
            
            # Fetch the anchor habit to find ITS anchor
            anchor_habit = self.session.get(Habit, current_anchor_id)
            if not anchor_habit or anchor_habit.user_id != user_id:
                break
                
            current_anchor_id = anchor_habit.anchor_habit_id
            depth += 1
            
        return True