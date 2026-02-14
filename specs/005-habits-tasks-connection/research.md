# Research: Habits ↔ Tasks Connection

**Feature**: 005-habits-tasks-connection
**Date**: 2026-02-13

---

## R1: RecurringSchedule Model Alignment

**Context**: The spec defines `days_of_week: [1,3,5]` and `days_of_month: [1,15]` with `frequency` fields, but the existing `RecurringSchedule` Pydantic model (in `apps/api/src/models/habit.py:10-30`) uses different field names: `days: List[int]` (weekly) and `day_of_month: int` (monthly, singular — only one day supported).

**Decision**: Evolve the existing `RecurringSchedule` model to match the spec's richer schema while maintaining backward compatibility with existing habits.

**Changes needed**:
- `days` → keep field name `days` (matches existing DB data); spec's `days_of_week` is the conceptual name
- `day_of_month: int` → `days_of_month: List[int]` (support multiple days per month per spec)
- Add `frequency: int = 1` field (for daily every-N-days support)
- Existing habits with `day_of_month: 5` migrate to `days_of_month: [5]`

**Rationale**: The existing model is simpler than the spec requires. The spec needs multi-day monthly support and daily frequency. Evolving the model is safer than breaking existing data.

**Alternatives considered**:
- Create a new `RecurringScheduleV2` model → rejected (unnecessary indirection, no V1 habits in production yet)
- Keep existing model unchanged → rejected (doesn't support spec requirements)

---

## R2: Task Model Extension Strategy

**Context**: The Task model (`apps/api/src/models/task.py`) needs two new columns: `generated_by_habit_id` (UUID FK → habits.id, nullable, ON DELETE SET NULL) and `is_habit_task` (boolean, default false).

**Decision**: Add columns directly to the existing Task model. Use Alembic migration for the schema change.

**Rationale**: These are simple additive columns with sensible defaults. No existing data is affected — all existing tasks get `generated_by_habit_id=NULL` and `is_habit_task=false`.

**Key constraint**: `sa_column=Column(...)` pattern must be used because the Task model already uses `sa_column` for `title` and `description`. Per CLAUDE.md pitfall #1, we MUST NOT mix `Field()` params with `sa_column`.

**Index**: Add `idx_tasks_habit_generated` on `(generated_by_habit_id, due_date, is_habit_task)` for efficient duplicate-checking queries during task generation.

---

## R3: Background Job Mechanism

**Context**: The spec requires a daily background job at 00:01 UTC. The current backend is a stateless FastAPI app deployed to Render. There is no existing task queue (Celery, APScheduler, etc.).

**Decision**: Use `APScheduler` (AsyncIOScheduler) embedded in the FastAPI process as a lightweight cron-like scheduler. Additionally, expose a manual trigger endpoint for testing.

**Rationale**:
- APScheduler is lightweight (~50KB), no external infrastructure needed
- Runs inside the existing FastAPI process — no separate worker deployment
- Perfect for Phase 2 scale (single-server, <100 users)
- Can be replaced with Celery/Kafka in Phase V without API changes

**Alternatives considered**:
- Celery + Redis → rejected (overkill for Phase 2; adds Redis dependency and worker deployment)
- Render Cron Jobs → rejected (Render cron has minimum 15-min intervals and limited; also couples to hosting platform)
- External cron service → rejected (adds external dependency; harder to test)

**Implementation**:
- Add `apscheduler[asyncio]` to requirements
- Initialize scheduler in `main.py` on startup
- Job function calls the same service method as the manual trigger endpoint

---

## R4: Task Generation Service Architecture

**Context**: Need a service that orchestrates task generation from habits. Must interact with both the Habit model and Task model, which per constitution Principle III (Modular Architecture) should remain loosely coupled.

**Decision**: Create a new `HabitTaskGenerationService` in `apps/api/src/services/habit_task_service.py`. This service:
- Takes a `Session` and `EventEmitter` (same DI pattern as existing services)
- Reads habits from the habits table (read-only)
- Creates tasks via `TaskService.create_task()` (not direct SQL) to preserve event emission
- Emits `HABIT_GENERATES_TASK` events

**Rationale**: Using `TaskService.create_task()` for task creation ensures TASK_CREATED events fire naturally and existing task business logic (validation, tag trimming) is reused. The new service bridges the two modules without either module importing the other directly.

**Alternatives considered**:
- Put generation logic in HabitService → rejected (violates single responsibility; HabitService shouldn't know about Task model)
- Put generation logic in TaskService → rejected (TaskService shouldn't know about Habit model)
- Direct SQL INSERT → rejected (bypasses event emission and validation)

---

## R5: Idempotent Task Generation

**Context**: The spec mandates that task generation MUST be idempotent — no duplicate tasks for the same (habit_id, due_date).

**Decision**: Before creating each task, query for existing task where `generated_by_habit_id = habit_id AND due_date = target_date AND is_habit_task = true`. If found, skip. This uses the composite index from R2.

**Rationale**: Application-level check is simpler and more portable than a DB UNIQUE constraint on (generated_by_habit_id, due_date) since `due_date` is a timestamp (not a date) and habits could theoretically generate tasks at different times of day.

**Alternatives considered**:
- DB UNIQUE constraint on (generated_by_habit_id, DATE(due_date)) → rejected (PostgreSQL partial unique indexes work but are less portable and harder to test; also `due_date` is `Optional[datetime]` which complicates the constraint)
- Upsert (INSERT ON CONFLICT) → rejected (doesn't emit events for skipped items; harder to debug)

---

## R6: Habit-Task Completion Synchronization

**Context**: When a habit-generated task is completed, the habit's streak must update automatically. The existing `complete_task` route (`apps/api/src/routes/tasks.py:293-317`) calls `TaskService.mark_complete()` which emits a `TASK_COMPLETED` event.

**Decision**: Extend the `complete_task` route handler to check for `generated_by_habit_id` after marking the task complete. If present and the habit still exists, call the existing `POST /{user_id}/habits/{habit_id}/complete` logic (via the same service method, not an HTTP call). Return the updated streak info in the response.

**Rationale**: Inline synchronization in the route handler is simpler and more reliable than event-driven async processing for this use case. The user needs to see the streak update immediately in the response. Using the existing completion logic ensures streak calculation, duplicate-check (one completion per day), and HABIT_COMPLETED event emission all happen correctly.

**Alternatives considered**:
- Event subscriber on TASK_COMPLETED → rejected (adds async complexity; user won't see streak update in the task completion response; harder to handle errors)
- Separate API call from frontend → rejected (requires frontend to know about habit-task relationship; two separate API calls for one user action)

---

## R7: Frontend Completion Type Modal Trigger

**Context**: When completing a habit-generated task that has both a full description and 2-minute version, the frontend must show a modal asking which version was completed.

**Decision**: The task completion response will include a `habit_sync` object when a habit was auto-completed. The frontend checks this field. If the task's description contains "2-min:", the frontend shows the CompletionTypeModal (already exists at `apps/web/src/components/habits/CompletionTypeModal.tsx`). The initial API call defaults to `completion_type: "full"`. If the user selects "two_minute", a follow-up PATCH updates the completion record.

**Rationale**: Reuses the existing CompletionTypeModal component. Defaulting to "full" and allowing override is simpler than blocking task completion until the user selects.

**Alternative approach** (simpler, chosen): The complete_task route accepts an optional `completion_type` query param. The frontend detects habit tasks client-side (via `is_habit_task` flag) and shows the modal BEFORE calling the API. This way, a single API call handles everything.

**Final decision**: Frontend-first modal approach. The task card already knows if `is_habit_task` is true. When user clicks complete on a habit task, the frontend shows the modal first, then sends `PATCH /tasks/{id}/complete?completion_type=full` (or `two_minute`). The backend reads `completion_type` from the query param.

---

## R8: Schedule Update → Future Task Regeneration

**Context**: When a habit's recurring schedule changes, future pending tasks must be deleted and regenerated.

**Decision**: In `HabitService.update_habit()`, after detecting that `recurring_schedule` changed, call `HabitTaskGenerationService.regenerate_future_tasks(habit_id)` which:
1. Deletes all tasks where `generated_by_habit_id = habit_id AND status = 'pending' AND due_date >= today`
2. Generates new tasks for the next 7 days based on the new schedule

**Rationale**: Deleting only future pending tasks preserves completed history. Regenerating immediately ensures the user sees correct tasks without waiting for the daily job.

---

## R9: RecurringSchedule Parser Design

**Context**: Need a pure function that takes a `RecurringSchedule` dict and a date range, and returns the list of dates when tasks should be generated.

**Decision**: Create `apps/api/src/services/schedule_parser.py` with a pure function:
```python
def get_scheduled_dates(
    schedule: dict,
    start_date: date,
    end_date: date,
    habit_created_at: date
) -> list[date]
```

**Logic**:
- **Daily**: Generate every `frequency` days starting from `habit_created_at` (or `start_date` if later), up to `end_date`. Respect `until`.
- **Weekly**: Check `days` array. For each date in range, include if `date.weekday()` matches (converting 0=Sunday convention to Python's 0=Monday).
- **Monthly**: Check `days_of_month` array. For each date in range, include if `date.day` matches.

**Rationale**: Pure function is easy to unit test without DB or mocks. Separation of schedule parsing from task creation allows independent testing.

**Day-of-week convention note**: The spec uses 0=Sunday, 6=Saturday. Python's `datetime.weekday()` uses 0=Monday, 6=Sunday. The parser must convert: spec_day 0 (Sunday) → Python weekday 6, spec_day 1 (Monday) → Python weekday 0, etc. Formula: `python_weekday = (spec_day - 1) % 7`.
