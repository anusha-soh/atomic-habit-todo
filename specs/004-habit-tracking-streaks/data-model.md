# Data Model: Habit Tracking & Streaks

**Feature**: 004-habit-tracking-streaks
**Date**: 2026-02-12
**Status**: Design Phase

## Overview

This document defines the database schema, entity relationships, validation rules, and state transitions for habit completion tracking and streak management. The model extends the existing `habits` table (from Chunk 3) and adds a new `habit_completions` table to track daily completions.

## Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
│─────────────────│
│ id (PK)         │
│ email           │
│ ...             │
└────────┬────────┘
         │ 1
         │
         │ N
         ▼
┌─────────────────────────────────┐         ┌──────────────────────────────┐
│          habits                 │ 1       │    habit_completions         │
│─────────────────────────────────│◄────────│──────────────────────────────│
│ id (PK)                         │       N │ id (PK)                      │
│ user_id (FK → users.id)         │         │ habit_id (FK → habits.id)    │
│ identity_statement              │         │ user_id (FK → users.id)      │
│ full_description                │         │ completed_at (TIMESTAMPTZ)   │
│ two_minute_version              │         │ completion_type (VARCHAR)    │
│ current_streak (INT)            │         │ created_at (TIMESTAMPTZ)     │
│ last_completed_at (TIMESTAMPTZ) │         │                              │
│ consecutive_misses (INT)        │         │ UNIQUE(habit_id, DATE(...))  │
│ ...                             │         └──────────────────────────────┘
└─────────────────────────────────┘
```

## Database Schema

### New Table: `habit_completions`

**Purpose**: Record each habit completion with timestamp and completion type (full vs 2-minute version).

**DDL (PostgreSQL)**:

```sql
CREATE TABLE habit_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL,
    user_id UUID NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL,
    completion_type VARCHAR(20) NOT NULL CHECK (completion_type IN ('full', 'two_minute')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_habit
        FOREIGN KEY (habit_id)
        REFERENCES habits(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_habit_day
        UNIQUE (habit_id, (DATE(completed_at AT TIME ZONE 'UTC')))
);

CREATE INDEX idx_habit_completions_habit_id ON habit_completions(habit_id);
CREATE INDEX idx_habit_completions_user_id ON habit_completions(user_id);
CREATE INDEX idx_habit_completions_completed_at ON habit_completions(completed_at);
```

**Alembic Migration** (`apps/api/alembic/versions/xxx_add_habit_completions.py`):

```python
"""Add habit_completions table

Revision ID: xxx
Revises: yyy
Create Date: 2026-02-12
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

def upgrade():
    op.create_table(
        'habit_completions',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('habit_id', UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('completed_at', sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column('completion_type', sa.String(20), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['habit_id'], ['habits.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.CheckConstraint("completion_type IN ('full', 'two_minute')", name='check_completion_type'),
        sa.UniqueConstraint('habit_id', sa.func.DATE(sa.func.timezone('UTC', sa.column('completed_at'))), name='unique_habit_day')
    )

    op.create_index('idx_habit_completions_habit_id', 'habit_completions', ['habit_id'])
    op.create_index('idx_habit_completions_user_id', 'habit_completions', ['user_id'])
    op.create_index('idx_habit_completions_completed_at', 'habit_completions', ['completed_at'])

def downgrade():
    op.drop_index('idx_habit_completions_completed_at')
    op.drop_index('idx_habit_completions_user_id')
    op.drop_index('idx_habit_completions_habit_id')
    op.drop_table('habit_completions')
```

### Extended Table: `habits` (add columns)

**Purpose**: Track streak metadata directly on habit record for fast access.

**DDL (PostgreSQL)**:

```sql
ALTER TABLE habits
    ADD COLUMN last_completed_at TIMESTAMPTZ,
    ADD COLUMN consecutive_misses INT NOT NULL DEFAULT 0;

COMMENT ON COLUMN habits.last_completed_at IS 'Timestamp of most recent completion (UTC)';
COMMENT ON COLUMN habits.consecutive_misses IS 'Count of consecutive missed days (0 = no misses, 1 = one miss, 2+ = reset triggered)';
```

**Alembic Migration** (`apps/api/alembic/versions/xxx_add_habit_streak_fields.py`):

```python
"""Add streak tracking fields to habits table

Revision ID: xxx
Revises: yyy
Create Date: 2026-02-12
"""

from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('habits', sa.Column('last_completed_at', sa.TIMESTAMP(timezone=True), nullable=True))
    op.add_column('habits', sa.Column('consecutive_misses', sa.Integer(), nullable=False, server_default='0'))

def downgrade():
    op.drop_column('habits', 'consecutive_misses')
    op.drop_column('habits', 'last_completed_at')
```

## SQLModel Definitions

### HabitCompletion Model

```python
# apps/api/src/models/habit_completion.py

from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, Column, String
from sqlalchemy import Text, CheckConstraint

class HabitCompletion(SQLModel, table=True):
    __tablename__ = "habit_completions"

    id: Optional[str] = Field(default=None, primary_key=True)
    habit_id: str = Field(foreign_key="habits.id", index=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    completed_at: datetime = Field(
        sa_column=Column(sa.TIMESTAMP(timezone=True), nullable=False, index=True)
    )
    completion_type: str = Field(
        sa_column=Column(
            String(20),
            CheckConstraint("completion_type IN ('full', 'two_minute')", name='check_completion_type'),
            nullable=False
        )
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(sa.TIMESTAMP(timezone=True), nullable=False)
    )

    class Config:
        schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "habit_id": "789e4567-e89b-12d3-a456-426614174001",
                "user_id": "456e4567-e89b-12d3-a456-426614174002",
                "completed_at": "2026-01-10T07:30:00Z",
                "completion_type": "full",
                "created_at": "2026-01-10T07:30:05Z"
            }
        }
```

### Habit Model Extension

```python
# apps/api/src/models/habit.py (extend existing model)

from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, Column
from sqlalchemy import TIMESTAMP

class Habit(SQLModel, table=True):
    # ... existing fields (id, user_id, identity_statement, etc.) ...

    # NEW FIELDS for Chunk 4:
    last_completed_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(TIMESTAMP(timezone=True), nullable=True)
    )
    consecutive_misses: int = Field(default=0)
```

## Validation Rules

### HabitCompletion Constraints

1. **completion_type Enum**: Must be one of: `'full'`, `'two_minute'`
   - Enforced by: Database CHECK constraint + Pydantic validation

2. **completed_at Not in Future**: Completion timestamp cannot be > NOW()
   - Enforced by: API endpoint validation (Pydantic)

3. **One Completion Per Day**: Only one completion allowed per habit per UTC day
   - Enforced by: Database UNIQUE constraint on `(habit_id, DATE(completed_at))`
   - Note: Uses UTC day boundaries (00:00-23:59 UTC)

4. **habit_id Exists**: Must reference a valid habit
   - Enforced by: Foreign key constraint

5. **user_id Matches Habit Owner**: Completion user_id must match habit.user_id
   - Enforced by: API endpoint authorization logic

### Habit Streak Constraints

1. **consecutive_misses Range**: Must be >= 0
   - Enforced by: Database default (0) + application logic (never negative)

2. **last_completed_at Consistency**: If last_completed_at is set, must correspond to an actual completion record
   - Enforced by: Application logic (updated atomically with completion creation)

3. **Streak Reset Logic**: When consecutive_misses >= 2, current_streak resets to 0
   - Enforced by: Miss detection background job

## Pydantic Schemas

### Request Schemas

```python
# apps/api/src/schemas/habit_schemas.py

from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Literal

class CompleteHabitRequest(BaseModel):
    completion_type: Literal['full', 'two_minute'] = Field(
        ...,
        description="Type of completion: 'full' for full habit, 'two_minute' for 2-minute version"
    )

    class Config:
        schema_extra = {
            "example": {
                "completion_type": "full"
            }
        }

class GetCompletionsQuery(BaseModel):
    start_date: datetime | None = Field(None, description="Filter completions from this date (UTC)")
    end_date: datetime | None = Field(None, description="Filter completions to this date (UTC)")

    @validator('end_date')
    def end_date_after_start_date(cls, v, values):
        if v and 'start_date' in values and values['start_date']:
            if v < values['start_date']:
                raise ValueError('end_date must be >= start_date')
        return v
```

### Response Schemas

```python
class HabitCompletionResponse(BaseModel):
    id: str
    habit_id: str
    user_id: str
    completed_at: datetime
    completion_type: str
    created_at: datetime

class CompleteHabitResponse(BaseModel):
    habit_id: str
    current_streak: int
    completion: HabitCompletionResponse
    message: str = "Habit completed successfully"

class GetCompletionsResponse(BaseModel):
    completions: list[HabitCompletionResponse]
    total: int

class StreakInfoResponse(BaseModel):
    habit_id: str
    current_streak: int
    last_completed_at: datetime | None
    consecutive_misses: int

class UndoCompletionResponse(BaseModel):
    deleted: bool
    recalculated_streak: int
    message: str
```

## State Transitions

### Habit Streak State Machine

```
Initial State:
  current_streak = 0
  consecutive_misses = 0
  last_completed_at = NULL

Event: COMPLETE_HABIT
  Inputs: completion_time (datetime)
  Logic:
    1. Calculate day_gap = (completion_time.date() - last_completed_at.date()).days
    2. If day_gap == 0 (same day):
         - No state change (idempotent)
    3. If day_gap == 1 (consecutive day):
         - current_streak += 1
         - last_completed_at = completion_time
         - consecutive_misses = 0
    4. If day_gap > 1 (gap exists):
         - current_streak = 1 (new streak)
         - last_completed_at = completion_time
         - consecutive_misses = 0
  Output: Updated habit with new streak values

Event: DETECT_MISS
  Inputs: missed_date (date)
  Logic:
    1. Verify missed_date was a scheduled day (check recurring_schedule)
    2. If not scheduled: No action
    3. If scheduled:
         - consecutive_misses += 1
         - If consecutive_misses == 1:
             * Emit HABIT_MISS_DETECTED event
             * Create notification: "Get back on track today!"
         - If consecutive_misses >= 2:
             * current_streak = 0
             * consecutive_misses = 0
             * Emit HABIT_STREAK_RESET event
             * Create notification: "Your streak has reset. Start fresh today!"
  Output: Updated habit with miss tracking

Event: UNDO_COMPLETION
  Inputs: completion_id (str)
  Logic:
    1. Delete completion record
    2. Recalculate streak from remaining completions:
         - Get all completions for habit (sorted DESC by completed_at)
         - Run streak calculation algorithm
         - Update habit.current_streak
    3. Update habit.last_completed_at to most recent remaining completion (or NULL if none)
  Output: Updated habit with recalculated streak
```

### State Transition Diagram

```
                    ┌─────────────────┐
                    │   No Streak     │
                    │  streak = 0     │
                    │  misses = 0     │
                    └────────┬────────┘
                             │
                             │ Complete habit
                             │ (first time)
                             ▼
                    ┌─────────────────┐
                    │  Active Streak  │
                    │  streak >= 1    │
                    │  misses = 0     │
                    └────┬────────┬───┘
                         │        │
         Complete next   │        │  Miss scheduled day
         day (day_gap=1) │        │  (first miss)
                         │        │
                         │        ▼
                         │   ┌─────────────────┐
                         │   │  First Miss     │
                         │   │  streak = same  │
                         │   │  misses = 1     │
                         │   └────┬────────────┘
                         │        │
                         │        │  Miss again
                         │        │  (second consecutive)
                         │        ▼
                         │   ┌─────────────────┐
                         │   │  Streak Reset   │
                         │   │  streak = 0     │
                         └───┤  misses = 0     │
                             └─────────────────┘
```

## Query Examples

### Get Recent Completions for Habit

```sql
SELECT *
FROM habit_completions
WHERE habit_id = :habit_id
  AND completed_at >= :start_date
  AND completed_at <= :end_date
ORDER BY completed_at DESC;
```

### Check If Completion Exists for Today (UTC)

```sql
SELECT EXISTS(
    SELECT 1
    FROM habit_completions
    WHERE habit_id = :habit_id
      AND DATE(completed_at AT TIME ZONE 'UTC') = DATE(NOW() AT TIME ZONE 'UTC')
);
```

### Get All Habits with Active Streaks

```sql
SELECT id, identity_statement, current_streak, last_completed_at
FROM habits
WHERE user_id = :user_id
  AND current_streak > 0
  AND deleted = FALSE
ORDER BY current_streak DESC;
```

### Get Habits Needing Miss Detection (missed yesterday)

```sql
SELECT h.id, h.identity_statement, h.current_streak, h.consecutive_misses
FROM habits h
WHERE h.deleted = FALSE
  AND h.recurring_schedule IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM habit_completions hc
      WHERE hc.habit_id = h.id
        AND DATE(hc.completed_at AT TIME ZONE 'UTC') = CURRENT_DATE - INTERVAL '1 day'
  );
```

## Performance Considerations

### Indexes

- `habit_completions.habit_id` - For fetching completions by habit
- `habit_completions.user_id` - For fetching user's completions
- `habit_completions.completed_at` - For date range queries and streak calculation
- `habits.last_completed_at` - For miss detection queries
- `habits.current_streak` - For sorting by streak (optional, if frequently queried)

### Query Optimization

1. **Streak Calculation**: Run in-memory (fetch completions, sort, iterate) rather than complex SQL window functions
   - Typical: 30 completions per habit, O(n log n) = ~150 operations
   - Faster than database round-trip for complex query

2. **Miss Detection**: Batch process all habits in single job
   - Runs daily at off-peak time (00:01 UTC)
   - Uses single transaction for all updates

3. **Completion Uniqueness**: Enforced by database constraint, no application check needed
   - Database raises error if duplicate, API returns 409 Conflict

## Testing Strategy

### Database Tests

```python
# apps/api/tests/integration/test_habit_completion_db.py

def test_unique_constraint_prevents_duplicate_completions(session):
    """Verify database prevents multiple completions per day."""
    # Given: one completion for today
    # When: attempt to create another for same habit + today
    # Then: IntegrityError raised

def test_cascade_delete_habit_removes_completions(session):
    """Verify completions deleted when habit deleted."""
    # Given: habit with 10 completions
    # When: delete habit
    # Then: all 10 completions also deleted

def test_cascade_delete_user_removes_completions(session):
    """Verify completions deleted when user deleted."""
    # Given: user with habits and completions
    # When: delete user
    # Then: all completions also deleted
```

### Model Tests

```python
# apps/api/tests/unit/test_habit_completion_model.py

def test_habit_completion_creation():
    """Test creating valid HabitCompletion instance."""
    completion = HabitCompletion(
        habit_id="123",
        user_id="456",
        completed_at=datetime.utcnow(),
        completion_type="full"
    )
    assert completion.completion_type == "full"

def test_invalid_completion_type_rejected():
    """Test invalid completion_type raises validation error."""
    with pytest.raises(ValidationError):
        HabitCompletion(
            habit_id="123",
            user_id="456",
            completed_at=datetime.utcnow(),
            completion_type="invalid"  # Should be 'full' or 'two_minute'
        )
```

## Migration Checklist

Before deploying:
- [ ] Create Alembic migration for `habit_completions` table
- [ ] Create Alembic migration for `habits` table columns
- [ ] Apply migrations to development database
- [ ] Verify constraints (unique, foreign keys, check) work
- [ ] Run database tests
- [ ] Apply migrations to staging database
- [ ] Run smoke tests
- [ ] Create rollback plan (downgrade migrations)
- [ ] Apply to production database

**Status**: ✅ Data model complete. Ready for contract generation.
