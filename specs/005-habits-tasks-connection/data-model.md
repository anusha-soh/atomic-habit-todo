# Data Model: Habits ↔ Tasks Connection

**Feature**: 005-habits-tasks-connection
**Date**: 2026-02-13

---

## Entity Changes

### 1. Task (MODIFIED)

**Table**: `tasks`
**File**: `apps/api/src/models/task.py`

**New columns**:

| Column | Type | Nullable | Default | FK | Index | Notes |
|--------|------|----------|---------|-----|-------|-------|
| `generated_by_habit_id` | UUID | YES | NULL | `habits.id ON DELETE SET NULL` | YES (composite) | Which habit generated this task |
| `is_habit_task` | BOOLEAN | NO | false | — | YES (composite) | Distinguishes habit-generated from manual tasks |

**Composite index**: `idx_tasks_habit_generated(generated_by_habit_id, due_date, is_habit_task)` — used for idempotent generation checks.

**SQLModel field definitions** (following CLAUDE.md pitfall #1 — all attributes inside `Column()`):

```python
from sqlalchemy import Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

generated_by_habit_id: Optional[UUID] = Field(
    default=None,
    sa_column=Column(
        PG_UUID(as_uuid=True),
        ForeignKey("habits.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
)
is_habit_task: bool = Field(
    default=False,
    sa_column=Column(Boolean, nullable=False, default=False)
)
```

**Validation rules**:
- `generated_by_habit_id` can be NULL (manual tasks) or a valid habit UUID
- `is_habit_task` must be `true` when `generated_by_habit_id` is not NULL
- Existing tasks are unaffected (both columns default to NULL/false)

---

### 2. RecurringSchedule (MODIFIED)

**Embedded in**: `habits.recurring_schedule` (JSONB)
**File**: `apps/api/src/models/habit.py`

**Current schema**:
```python
class RecurringSchedule(BaseModel):
    type: Literal["daily", "weekly", "monthly"]
    until: Optional[str] = None
    days: Optional[List[int]] = None        # weekly: 0-6
    day_of_month: Optional[int] = None      # monthly: 1-31 (singular)
```

**New schema** (backward-compatible evolution):
```python
class RecurringSchedule(BaseModel):
    type: Literal["daily", "weekly", "monthly"]
    frequency: int = 1                       # NEW: every N days (daily only)
    until: Optional[str] = None              # ISO date string, optional end date
    days: Optional[List[int]] = None         # weekly: 0=Sun, 1=Mon, ..., 6=Sat
    days_of_month: Optional[List[int]] = None  # RENAMED: monthly, multiple days
    day_of_month: Optional[int] = None       # DEPRECATED: kept for backward compat
```

**Migration strategy**:
- `day_of_month` kept but deprecated — existing habits with `day_of_month: 5` continue to work
- Schedule parser checks `days_of_month` first; if absent, falls back to `[day_of_month]`
- New habits always use `days_of_month`

**Validation rules**:
- `frequency` must be >= 1 (daily only; ignored for weekly/monthly)
- `days` values must be 0-6 (weekly only)
- `days_of_month` values must be 1-31 (monthly only)
- `until` must be a valid ISO date string if provided
- Weekly requires `days` to be non-empty
- Monthly requires either `days_of_month` or `day_of_month` to be set

---

### 3. Habit (UNCHANGED)

The `habits` table is not modified. The `recurring_schedule` JSONB column already exists and stores the `RecurringSchedule` data. The JSONB nature means schema evolution happens at the application level, not the database level.

---

### 4. HabitCompletion (UNCHANGED)

No changes needed. The existing completion model and streak logic are reused as-is.

---

## New Entities

### None

No new tables are introduced. The feature works by:
1. Extending the `tasks` table with two new columns
2. Evolving the `RecurringSchedule` Pydantic model
3. Adding new service logic (`HabitTaskGenerationService`, `schedule_parser`)
4. Adding new API endpoints on existing routers

---

## Relationships

```
habits (1) ──────── (*) tasks
   │                    │
   │ recurring_schedule │ generated_by_habit_id (FK, ON DELETE SET NULL)
   │ (JSONB)           │ is_habit_task (boolean)
   │                    │
   └── habit_completions
       (existing, unchanged)
```

**Key relationship semantics**:
- **One habit → Many tasks**: A habit with a recurring schedule generates multiple tasks (one per scheduled date)
- **ON DELETE SET NULL**: Deleting a habit orphans its tasks (tasks remain, FK becomes NULL)
- **No CASCADE**: Task deletion does NOT affect the parent habit in any way

---

## State Transitions

### Task (habit-generated)

```
[Generated] → pending → completed
                 ↓
           (habit deleted)
                 ↓
         pending (orphaned, generated_by_habit_id = NULL)
                 ↓
              completed (no streak update)
```

### Task Generation Lifecycle

```
Habit Created (with recurring_schedule)
  → Generate tasks for next 7 days
  → Each task: pending, is_habit_task=true

Daily Background Job (00:01 UTC)
  → For each active habit with recurring_schedule:
    → Calculate scheduled dates for next 7 days
    → For each date: check if task exists (idempotent)
    → If not: create task, emit HABIT_GENERATES_TASK

Habit Schedule Updated
  → Delete future pending tasks for this habit
  → Regenerate tasks for next 7 days with new schedule

Habit Deleted
  → Tasks remain (ON DELETE SET NULL)
  → generated_by_habit_id → NULL
  → is_habit_task remains true (for display purposes)
```

---

## Alembic Migration

**Migration name**: `add_habit_task_columns`

```sql
-- Up
ALTER TABLE tasks ADD COLUMN generated_by_habit_id UUID REFERENCES habits(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN is_habit_task BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX idx_tasks_habit_generated ON tasks(generated_by_habit_id, due_date, is_habit_task);

-- Down
DROP INDEX IF EXISTS idx_tasks_habit_generated;
ALTER TABLE tasks DROP COLUMN IF EXISTS is_habit_task;
ALTER TABLE tasks DROP COLUMN IF EXISTS generated_by_habit_id;
```
