# Data Model: Habits MVP

**Feature**: Phase 2 Chunk 3 - Habits MVP
**Created**: 2026-02-10
**Status**: Draft

---

## Overview

This document defines the data model for the Habits MVP feature, implementing the Atomic Habits Four Laws framework within a multi-user PostgreSQL database. The design follows the existing `tasks` table patterns and constitutional requirements for modular architecture with event-driven design.

---

## Entity Relationship Diagram

```
┌─────────────────────┐
│       users         │
│                     │
│  id: UUID (PK)      │
│  email: VARCHAR     │
│  password_hash      │
│  created_at         │
└──────────┬──────────┘
           │
           │ 1:N
           │
┌──────────▼──────────────────────────────────────────┐
│                     habits                          │
│                                                     │
│  id: UUID (PK)                                      │
│  user_id: UUID (FK → users.id)                      │
│  identity_statement: TEXT                           │
│  full_description: TEXT                             │
│  two_minute_version: TEXT                           │
│  habit_stacking_cue: TEXT                           │
│  anchor_habit_id: UUID (FK → habits.id, nullable)   │◄─┐
│  motivation: TEXT                                   │  │
│  category: VARCHAR(50)                              │  │
│  recurring_schedule: JSONB                          │  │
│  status: VARCHAR(20)                                │  │
│  current_streak: INTEGER                            │  │
│  last_completed_at: TIMESTAMPTZ                     │  │
│  consecutive_misses: INTEGER                        │  │
│  created_at: TIMESTAMPTZ                            │  │
│  updated_at: TIMESTAMPTZ                            │  │
└─────────────────────────────────────────────────────┘  │
           │                                              │
           └──────────────────────────────────────────────┘
           Self-referential: Habit Stacking
```

---

## Core Entities

### 1. Habit

**Purpose**: Represents a recurring behavior and identity focus, implementing the Atomic Habits framework.

**Table Name**: `habits`

**Fields**:

| Field                  | Type         | Constraints                       | Description                                          |
|------------------------|--------------|-----------------------------------|------------------------------------------------------|
| `id`                   | UUID         | PRIMARY KEY, DEFAULT uuid4()      | Unique habit identifier                              |
| `user_id`              | UUID         | NOT NULL, FK → users.id, INDEX    | User who owns the habit                              |
| `identity_statement`   | TEXT         | NOT NULL, CHECK(trim != '')       | "I am a person who..." (Law 2)                       |
| `full_description`     | TEXT         | NULLABLE                          | Full habit description                               |
| `two_minute_version`   | TEXT         | NOT NULL, CHECK(trim != '')       | Starter version (Law 3)                              |
| `habit_stacking_cue`   | TEXT         | NULLABLE                          | "After I [X], I will [Y]" (Law 1)                    |
| `anchor_habit_id`      | UUID         | NULLABLE, FK → habits.id          | Habit used as stacking anchor                        |
| `motivation`           | TEXT         | NULLABLE                          | Why the user wants this habit                        |
| `category`             | VARCHAR(50)  | NOT NULL, CHECK(in enum)          | Category label (predefined)                          |
| `recurring_schedule`   | JSONB        | NOT NULL                          | Structured schedule (daily/weekly/monthly)           |
| `status`               | VARCHAR(20)  | NOT NULL, DEFAULT 'active'        | 'active' or 'archived'                               |
| `current_streak`       | INTEGER      | NOT NULL, DEFAULT 0               | Consecutive days completed (Phase 2 Chunk 4)         |
| `last_completed_at`    | TIMESTAMPTZ  | NULLABLE                          | Last completion timestamp (Phase 2 Chunk 4)          |
| `consecutive_misses`   | INTEGER      | NOT NULL, DEFAULT 0               | Consecutive days missed (Phase 2 Chunk 4)            |
| `created_at`           | TIMESTAMPTZ  | NOT NULL, DEFAULT NOW()           | Creation timestamp                                   |
| `updated_at`           | TIMESTAMPTZ  | NOT NULL, DEFAULT NOW()           | Last update timestamp (auto-updated via trigger)     |

**Indexes**:
```sql
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_user_status ON habits(user_id, status);
CREATE INDEX idx_habits_user_category ON habits(user_id, category);
CREATE INDEX idx_habits_anchor ON habits(anchor_habit_id);
CREATE INDEX idx_habits_schedule ON habits USING GIN(recurring_schedule);
```

**Constraints**:
```sql
CONSTRAINT check_identity_not_empty
    CHECK (char_length(trim(identity_statement)) > 0);

CONSTRAINT check_two_minute_not_empty
    CHECK (char_length(trim(two_minute_version)) > 0);

CONSTRAINT check_status_valid
    CHECK (status IN ('active', 'archived'));

CONSTRAINT check_category_valid
    CHECK (category IN ('Health & Fitness', 'Productivity', 'Mindfulness',
                        'Learning', 'Social', 'Finance', 'Creative', 'Other'));
```

**Foreign Keys**:
```sql
user_id REFERENCES users(id) ON DELETE CASCADE;
anchor_habit_id REFERENCES habits(id) ON DELETE SET NULL;
```

**Cascade Behavior**:
- When **user deleted**: All their habits are deleted (CASCADE)
- When **anchor habit deleted**: Dependent habits retain their `habit_stacking_cue` text but `anchor_habit_id` is set to NULL

---

### 2. Habit Completions (Phase 2 Chunk 4)

**Purpose**: Track individual habit completion events for streak calculation and analytics.

**Table Name**: `habit_completions`

**Fields**:

| Field              | Type         | Constraints                        | Description                          |
|--------------------|--------------|-------------------------------------|--------------------------------------|
| `id`               | UUID         | PRIMARY KEY, DEFAULT uuid4()        | Unique completion identifier         |
| `habit_id`         | UUID         | NOT NULL, FK → habits.id            | Habit that was completed             |
| `user_id`          | UUID         | NOT NULL, FK → users.id             | User who completed the habit         |
| `completed_at`     | TIMESTAMPTZ  | NOT NULL, DEFAULT NOW()             | Completion timestamp                 |
| `completion_type`  | VARCHAR(20)  | NOT NULL, CHECK(in enum)            | 'full' or 'two_minute'               |

**Indexes**:
```sql
CREATE INDEX idx_completions_habit ON habit_completions(habit_id, completed_at DESC);
CREATE INDEX idx_completions_user ON habit_completions(user_id, completed_at DESC);
CREATE INDEX idx_completions_date ON habit_completions(completed_at);
```

**Constraints**:
```sql
CONSTRAINT check_completion_type_valid
    CHECK (completion_type IN ('full', 'two_minute'));
```

**Foreign Keys**:
```sql
habit_id REFERENCES habits(id) ON DELETE CASCADE;
user_id REFERENCES users(id) ON DELETE CASCADE;
```

---

## Field Specifications

### Identity Statement

**Purpose**: Implements Law 2 (Make It Attractive) by framing habits as identity transformations.

**Format**: "I am a person who..."

**Validation**:
- NOT NULL
- Cannot be empty or only whitespace
- Maximum 2000 characters
- UI suggestion: Pre-fill "I am a person who..." prefix

**Examples**:
- "I am a person who exercises daily"
- "I am a person who reads before bed"
- "I am a runner"

---

### Two-Minute Version

**Purpose**: Implements Law 3 (Make It Easy) - reduce friction with a starter version.

**Format**: Ultra-simple version that takes 2 minutes or less

**Validation**:
- NOT NULL
- Cannot be empty or only whitespace
- Maximum 500 characters

**Examples**:
- Full habit: "Run 5km" → 2-min: "Put on running shoes"
- Full habit: "Read 30 pages" → 2-min: "Read one page"
- Full habit: "Meditate 20 minutes" → 2-min: "Take three deep breaths"

---

### Habit Stacking Cue

**Purpose**: Implements Law 1 (Make It Obvious) by linking new habits to existing triggers.

**Format**: "After I [ANCHOR HABIT], I will [THIS HABIT]"

**Validation**:
- NULLABLE (not all habits need stacking)
- Maximum 500 characters
- If `anchor_habit_id` is provided, must reference existing habit owned by same user

**Examples**:
- "After I pour my morning coffee, I will meditate for 1 minute"
- "After I brush my teeth, I will do 10 push-ups"
- "After I close my laptop, I will write in my journal"

---

### Recurring Schedule (JSONB)

**Purpose**: Store flexible schedule data for daily/weekly/monthly recurrence.

**Schema**:
```typescript
type RecurringSchedule = {
  type: "daily" | "weekly" | "monthly";
  until?: string;  // ISO 8601 date (optional)
  days?: number[];  // For weekly: 0=Sunday, 6=Saturday
  day_of_month?: number;  // For monthly: 1-31
}
```

**Examples**:

**Daily Habit**:
```json
{
  "type": "daily",
  "until": "2026-12-31"
}
```

**Weekly Habit (specific days)**:
```json
{
  "type": "weekly",
  "days": [1, 3, 5],  // Monday, Wednesday, Friday
  "until": "2026-06-30"
}
```

**Monthly Habit**:
```json
{
  "type": "monthly",
  "day_of_month": 1,  // First day of each month
  "until": null  // No end date
}
```

**Validation Rules**:
- `type` is required and must be one of: daily, weekly, monthly
- Weekly habits: `days` array required, each value 0-6
- Monthly habits: `day_of_month` required, value 1-31
- `until` is optional, must be ISO 8601 date if provided

---

### Category

**Purpose**: Organize habits by life domain for filtering and visualization.

**Predefined Categories**:
1. **Health & Fitness** - Exercise, nutrition, sleep
2. **Productivity** - Work habits, time management
3. **Mindfulness** - Meditation, journaling, reflection
4. **Learning** - Reading, courses, skill development
5. **Social** - Relationships, networking
6. **Finance** - Budgeting, saving, investing
7. **Creative** - Art, music, writing
8. **Other** - Custom category

**Validation**:
- NOT NULL
- Must be one of the predefined categories

**Future Extensibility**: Post-Phase V, allow custom user-defined categories.

---

### Status

**Purpose**: Support archiving habits without deleting historical data.

**Values**:
- `active` (default) - Habit is currently tracked
- `archived` - Habit is paused/inactive but preserved

**Behavior**:
- Default list views exclude archived habits
- Archived habits retain completion history
- Archived habits can be restored to active

**Difference from Delete**:
- **Archive**: Soft delete, preserves data, reversible
- **Delete**: Hard delete, removes all data including completions, permanent

---

## Data Validation

### SQLModel Implementation

```python
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB as PG_JSONB
from uuid import UUID, uuid4
from datetime import datetime, timezone
from typing import Optional
from pydantic import field_validator


class Habit(SQLModel, table=True):
    """Habit entity - recurring behavior and identity focus"""

    __tablename__ = "habits"

    # Primary Identification
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)

    # Core Atomic Habits Fields
    identity_statement: str = Field(sa_column=Column(Text, nullable=False))
    full_description: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    two_minute_version: str = Field(sa_column=Column(Text, nullable=False))

    # Habit Stacking (Law 1)
    habit_stacking_cue: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    anchor_habit_id: Optional[UUID] = Field(
        default=None,
        foreign_key="habits.id",
        nullable=True
    )

    # Motivation & Organization
    motivation: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    category: str = Field(nullable=False, max_length=50)

    # Scheduling (JSONB for flexibility)
    recurring_schedule: dict = Field(sa_column=Column(PG_JSONB, nullable=False))

    # Status Management
    status: str = Field(default="active", nullable=False, max_length=20)

    # Tracking Fields
    current_streak: int = Field(default=0, nullable=False)
    last_completed_at: Optional[datetime] = Field(default=None)
    consecutive_misses: int = Field(default=0, nullable=False)

    # Timestamps
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Validators
    @field_validator("identity_statement")
    @classmethod
    def identity_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Identity statement cannot be empty")
        v = v.strip()
        if len(v) > 2000:
            raise ValueError("Identity statement must be 2000 characters or less")
        return v

    @field_validator("two_minute_version")
    @classmethod
    def two_minute_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("2-minute version cannot be empty")
        v = v.strip()
        if len(v) > 500:
            raise ValueError("2-minute version must be 500 characters or less")
        return v

    @field_validator("status")
    @classmethod
    def status_valid(cls, v: str) -> str:
        if v not in ["active", "archived"]:
            raise ValueError("Status must be 'active' or 'archived'")
        return v

    @field_validator("category")
    @classmethod
    def category_valid(cls, v: str) -> str:
        valid_categories = [
            "Health & Fitness", "Productivity", "Mindfulness",
            "Learning", "Social", "Finance", "Creative", "Other"
        ]
        if v not in valid_categories:
            raise ValueError(f"Category must be one of: {', '.join(valid_categories)}")
        return v
```

---

## Migration Strategy

### Alembic Migration

**File**: `apps/api/alembic/versions/003_create_habits_table.py`

**Operations**:
1. Create `habits` table with all fields and constraints
2. Create indexes for performance
3. Create auto-update trigger for `updated_at` field
4. (Future: Phase 2 Chunk 4) Create `habit_completions` table

**Rollback**:
- Drop indexes
- Drop habits table
- (Future) Drop habit_completions table

---

## Atomic Habits Mapping

| Law | Principle | Data Model Implementation |
|-----|-----------|---------------------------|
| **Law 1: Make It Obvious** | Behavior begins with awareness | `habit_stacking_cue` + `anchor_habit_id` link habits to existing triggers |
| **Law 2: Make It Attractive** | Dopamine drives motivation | `identity_statement` + `motivation` reinforce positive self-image |
| **Law 3: Make It Easy** | Reduce friction | `two_minute_version` provides ultra-simple starter action |
| **Law 4: Make It Satisfying** | Immediate rewards | `current_streak` + `habit_completions` track progress (Phase 2 Chunk 4) |

---

## Security Considerations

### User Isolation

**Requirement**: Users MUST NOT access or modify habits belonging to others.

**Enforcement**:
- All queries include `WHERE user_id = {authenticated_user_id}`
- API routes validate `user_id` matches authenticated user
- Foreign key cascade ensures orphaned data is cleaned up

### Data Privacy

- No personally identifiable information beyond user association
- Habit content is user-generated and private
- Event logs include `user_id` for auditing

---

## Performance Considerations

### Query Optimization

**Common Queries**:
1. List active habits for user: `WHERE user_id = ? AND status = 'active'`
2. Filter by category: `WHERE user_id = ? AND category = ?`
3. Find habits stacked on anchor: `WHERE anchor_habit_id = ?`
4. Query recurring schedule: `WHERE recurring_schedule->>'type' = 'daily'`

**Indexes to Support**:
- Composite index: `(user_id, status)` for filtered lists
- Composite index: `(user_id, category)` for category filtering
- Single index: `anchor_habit_id` for dependency lookups
- GIN index: `recurring_schedule` for JSONB queries

### Expected Scale (Phase 2)

- **Users**: Up to 10,000
- **Habits per user**: 5-20 typical, 100 max
- **Total habits**: ~100,000 records
- **Database size**: < 50 MB for habits + completions

---

## Future Enhancements (Post-Phase V)

### Custom Categories

Allow users to create custom categories:
```sql
CREATE TABLE habit_categories (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    name VARCHAR(50) NOT NULL,
    is_predefined BOOLEAN DEFAULT false,
    UNIQUE(user_id, name)
);
```

### Habit Templates

Pre-defined habit templates for common goals:
```sql
CREATE TABLE habit_templates (
    id UUID PRIMARY KEY,
    identity_statement TEXT NOT NULL,
    two_minute_version TEXT NOT NULL,
    category VARCHAR(50),
    suggested_schedule JSONB
);
```

### Habit Relationships

Track habit bundles and dependencies:
```sql
CREATE TABLE habit_relationships (
    id UUID PRIMARY KEY,
    habit_id UUID REFERENCES habits(id),
    related_habit_id UUID REFERENCES habits(id),
    relationship_type VARCHAR(50),  -- 'bundle', 'prerequisite', 'alternative'
    UNIQUE(habit_id, related_habit_id, relationship_type)
);
```

---

**Document Status**: Complete
**Ready for**: API contract design
**Next Steps**: Define REST endpoints and request/response schemas in `contracts/`
