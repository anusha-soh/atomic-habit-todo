"""
Habit Task Generation Service
Feature: 005-habits-tasks-connection

Bridges the Habit and Task modules: reads habit schedules, creates tasks via
TaskService, and emits HABIT_GENERATES_TASK events. Idempotent by design.
"""
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, timezone
from uuid import UUID
from typing import Optional
import logging

from sqlmodel import Session, select

from src.models.habit import Habit
from src.models.task import Task
from src.services.event_emitter import EventEmitter
from src.services.schedule_parser import get_scheduled_dates
from src.services.task_service import TaskService

logger = logging.getLogger(__name__)


@dataclass
class GenerationResult:
    """Result of a task generation operation."""
    generated: int = 0
    skipped: int = 0
    habit_id: str = ""
    dates_generated: list[str] = field(default_factory=list)
    dates_skipped: list[str] = field(default_factory=list)

    @property
    def message(self) -> str:
        return f"Generated {self.generated} tasks, skipped {self.skipped} (already exist)"


class HabitTaskGenerationService:
    """
    Orchestrates task generation from habits with recurring schedules.

    Uses TaskService.create_task() for task creation to preserve TASK_CREATED events.
    Idempotent: checks for existing (habit_id, due_date) before creating.
    """

    def __init__(self, session: Session, event_emitter: EventEmitter):
        self.session = session
        self.event_emitter = event_emitter
        self.task_service = TaskService(session, event_emitter)

    def generate_tasks_for_habit(
        self,
        habit_id: UUID,
        user_id: UUID,
        lookahead_days: int = 7,
    ) -> GenerationResult:
        """
        Generate tasks for a single habit for the next N days.

        Args:
            habit_id: The habit to generate tasks for.
            user_id: Owner of the habit.
            lookahead_days: Number of days ahead to generate (default 7).

        Returns:
            GenerationResult with counts and date lists.

        Raises:
            ValueError: If habit not found, not owned by user, has no schedule,
                        or schedule's until date is in the past.
        """
        habit = self._get_habit(habit_id, user_id)

        schedule = habit.recurring_schedule
        if not schedule or not schedule.get("type"):
            raise ValueError("Habit has no recurring schedule")

        # Check if until date is entirely in the past
        until_str = schedule.get("until")
        if until_str:
            until_date = date.fromisoformat(until_str)
            if until_date < date.today():
                raise ValueError("Habit schedule 'until' date is in the past")

        return self._generate_for_habit(habit, lookahead_days)

    def generate_tasks_for_all_habits(
        self,
        lookahead_days: int = 7,
    ) -> list[GenerationResult]:
        """
        Generate tasks for ALL active habits with recurring schedules.
        Used by the daily background job.

        Returns:
            List of GenerationResult, one per habit processed.
        """
        logger.info("Starting task generation for all active habits")

        query = select(Habit).where(
            Habit.status == "active",
            Habit.recurring_schedule.isnot(None),
        )
        habits = self.session.exec(query).all()

        results = []
        for habit in habits:
            schedule = habit.recurring_schedule
            if not schedule or not schedule.get("type"):
                continue

            try:
                result = self._generate_for_habit(habit, lookahead_days)
                results.append(result)
            except Exception as e:
                logger.error(f"Failed to generate tasks for habit {habit.id}: {e}")
                # Continue processing remaining habits (FR: job doesn't fail entirely)
                continue

        total_generated = sum(r.generated for r in results)
        total_skipped = sum(r.skipped for r in results)
        logger.info(
            f"Task generation complete: {len(results)} habits processed, "
            f"{total_generated} tasks generated, {total_skipped} skipped"
        )

        return results

    def regenerate_future_tasks(
        self,
        habit_id: UUID,
        user_id: UUID,
    ) -> GenerationResult:
        """
        Delete future pending tasks for a habit and regenerate with current schedule.
        Called when a habit's recurring_schedule is updated.

        Only deletes tasks where status='pending' AND due_date >= today.
        Completed tasks are never touched.
        """
        habit = self._get_habit(habit_id, user_id)

        # Delete future pending tasks for this habit
        today_start = datetime(
            date.today().year, date.today().month, date.today().day,
            tzinfo=timezone.utc,
        )
        query = select(Task).where(
            Task.generated_by_habit_id == habit_id,
            Task.is_habit_task == True,  # noqa: E712
            Task.status == "pending",
            Task.due_date >= today_start,
        )
        future_tasks = self.session.exec(query).all()

        deleted_count = len(future_tasks)
        for task in future_tasks:
            self.session.delete(task)
        self.session.commit()

        logger.info(f"Deleted {deleted_count} future pending tasks for habit {habit_id}")

        # Regenerate
        return self._generate_for_habit(habit, lookahead_days=7)

    def _get_habit(self, habit_id: UUID, user_id: UUID) -> Habit:
        """Fetch habit and validate ownership."""
        query = select(Habit).where(Habit.id == habit_id, Habit.user_id == user_id)
        habit = self.session.exec(query).first()
        if not habit:
            raise ValueError("Habit not found")
        return habit

    def _generate_for_habit(
        self,
        habit: Habit,
        lookahead_days: int,
    ) -> GenerationResult:
        """Core generation logic for a single habit."""
        schedule = habit.recurring_schedule
        today = date.today()
        end_date = today + timedelta(days=lookahead_days - 1)
        habit_created_at = habit.created_at.date() if isinstance(habit.created_at, datetime) else habit.created_at

        # Calculate scheduled dates
        scheduled_dates = get_scheduled_dates(
            schedule=schedule,
            start_date=today,
            end_date=end_date,
            habit_created_at=habit_created_at,
        )

        result = GenerationResult(habit_id=str(habit.id))

        for sched_date in scheduled_dates:
            # Idempotency check: does a task already exist for this habit + date?
            due_datetime = datetime(
                sched_date.year, sched_date.month, sched_date.day,
                tzinfo=timezone.utc,
            )
            existing = self.session.exec(
                select(Task).where(
                    Task.generated_by_habit_id == habit.id,
                    Task.due_date == due_datetime,
                    Task.is_habit_task == True,  # noqa: E712
                )
            ).first()

            if existing:
                result.skipped += 1
                result.dates_skipped.append(sched_date.isoformat())
                continue

            # Build task description: "Full: [full]\n2-min: [two_minute]"
            desc_parts = []
            if habit.full_description:
                desc_parts.append(f"Full: {habit.full_description}")
            if habit.two_minute_version:
                desc_parts.append(f"2-min: {habit.two_minute_version}")
            description = "\n".join(desc_parts) if desc_parts else None

            # Build tags: habit category + "habit-generated"
            tags = []
            if habit.category:
                tags.append(habit.category)
            tags.append("habit-generated")

            # Build title using identity statement
            title = f"{habit.identity_statement}"

            # Create task via TaskService (preserves TASK_CREATED events)
            task = self.task_service.create_task(
                user_id=habit.user_id,
                title=title,
                description=description,
                due_date=due_datetime,
                tags=tags,
                generated_by_habit_id=habit.id,
                is_habit_task=True,
            )

            # Emit HABIT_GENERATES_TASK event
            self.event_emitter.emit(
                "HABIT_GENERATES_TASK",
                habit.user_id,
                {
                    "habit_id": str(habit.id),
                    "task_id": str(task.id),
                    "task_title": task.title,
                    "due_date": sched_date.isoformat(),
                    "recurring_schedule": {
                        "type": schedule.get("type"),
                        "frequency": schedule.get("frequency", 1),
                    },
                },
            )

            result.generated += 1
            result.dates_generated.append(sched_date.isoformat())

        logger.info(
            f"Habit {habit.id}: generated {result.generated}, "
            f"skipped {result.skipped}"
        )

        return result
