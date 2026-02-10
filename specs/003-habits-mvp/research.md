# Habits MVP: Implementation Research Document

**Feature**: Phase 2 Chunk 3 - Habits MVP
**Created**: 2026-02-10
**Purpose**: Consolidate technical research and implementation guidance for Habits MVP feature

---

## Table of Contents

1. [Database Schema Design](#1-database-schema-design)
2. [Recurring Schedule Design](#2-recurring-schedule-design)
3. [Habit Stacking Implementation](#3-habit-stacking-implementation)
4. [Status and Archiving](#4-status-and-archiving)
5. [Category Management](#5-category-management)
6. [API Contract Design](#6-api-contract-design)
7. [Event Schema](#7-event-schema)
8. [Best Practices and Pitfalls](#8-best-practices-and-pitfalls)
9. [Testing Strategy](#9-testing-strategy)
10. [References](#10-references)

---

## 1. Database Schema Design

### 1.1 Habits Table

Based on the existing `tasks` table pattern and constitution requirements, the `habits` table should follow this structure:

```sql
CREATE TABLE habits (
    -- Primary Identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Core Atomic Habits Fields (Law 2: Make It Attractive)
    identity_statement TEXT NOT NULL,  -- "I am a person who..."
    full_description TEXT,             -- Full habit description
    two_minute_version TEXT NOT NULL,  -- Law 3: Make It Easy

    -- Law 1: Make It Obvious
    habit_stacking_cue TEXT,           -- "After I [ANCHOR], I will [THIS]"
    anchor_habit_id UUID REFERENCES habits(id) ON DELETE SET NULL,  -- Foreign key to anchor

    -- Motivation & Organization
    motivation TEXT,                   -- "Why do you want this habit?"
    category VARCHAR(50) NOT NULL,     -- Predefined categories + "Other"

    -- Scheduling
    recurring_schedule JSONB NOT NULL, -- Structured schedule data

    -- Status Management
    status VARCHAR(20) NOT NULL DEFAULT 'active',  -- 'active' or 'archived'

    -- Tracking Fields (Phase 2 Chunk 4)
    current_streak INTEGER DEFAULT 0,
    last_completed_at TIMESTAMPTZ,
    consecutive_misses INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT check_identity_not_empty
        CHECK (char_length(trim(identity_statement)) > 0),
    CONSTRAINT check_two_minute_not_empty
        CHECK (char_length(trim(two_minute_version)) > 0),
    CONSTRAINT check_status_valid
        CHECK (status IN ('active', 'archived')),
    CONSTRAINT check_category_valid
        CHECK (category IN ('Health & Fitness', 'Productivity', 'Mindfulness',
                            'Learning', 'Social', 'Finance', 'Creative', 'Other'))
);

-- Performance Indexes
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_user_status ON habits(user_id, status);
CREATE INDEX idx_habits_user_category ON habits(user_id, category);
CREATE INDEX idx_habits_anchor ON habits(anchor_habit_id);
CREATE INDEX idx_habits_schedule ON habits USING GIN(recurring_schedule);

-- Auto-update trigger for updated_at
CREATE TRIGGER update_habits_updated_at
    BEFORE UPDATE ON habits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 1.2 Habit Completions Table

For tracking completion history (Phase 2 Chunk 4):

```sql
CREATE TABLE habit_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completion_type VARCHAR(20) NOT NULL,  -- 'full' or 'two_minute'

    CONSTRAINT check_completion_type_valid
        CHECK (completion_type IN ('full', 'two_minute'))
);

-- Performance Indexes
CREATE INDEX idx_completions_habit ON habit_completions(habit_id, completed_at DESC);
CREATE INDEX idx_completions_user ON habit_completions(user_id, completed_at DESC);
CREATE INDEX idx_completions_date ON habit_completions(completed_at);
```

### 1.3 SQLModel Implementation Pattern

**CRITICAL**: Follow the existing codebase pattern to avoid SQLModel pitfalls.

```python
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import Text, JSONB
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB as PG_JSONB
from uuid import UUID, uuid4
from datetime import datetime, timezone
from typing import Optional
from pydantic import field_validator


class Habit(SQLModel, table=True):
    """
    Habit entity representing a recurring behavior and identity focus.

    Implements Atomic Habits Four Laws framework.
    """

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

**Key Pattern**: When using `sa_column=Column(...)`, ALL column attributes (nullable, default, etc.) go INSIDE the Column() call. Never mix Field() parameters with sa_column parameters.

---

## 2. Recurring Schedule Design

### 2.1 JSON Schema for Recurring Patterns

Based on PostgreSQL JSONB best practices and the [postgres-rrule extension](https://github.com/volkanunsal/postgres-rrule) patterns:

```json
{
  "type": "daily" | "weekly" | "monthly",
  "until": "2026-12-31",  // ISO 8601 date (optional)
  "days": [0, 1, 2, 3, 4, 5, 6],  // For weekly: 0=Sunday, 6=Saturday
  "day_of_month": 15  // For monthly: 1-31
}
```

### 2.2 Schedule Examples

**Daily Habit:**
```json
{
  "type": "daily",
  "until": "2026-12-31"
}
```

**Weekly Habit (specific days):**
```json
{
  "type": "weekly",
  "days": [1, 3, 5],  // Monday, Wednesday, Friday
  "until": "2026-06-30"
}
```

**Monthly Habit:**
```json
{
  "type": "monthly",
  "day_of_month": 1,  // First day of each month
  "until": null  // No end date
}
```

### 2.3 Validation Schema

```python
from pydantic import BaseModel, field_validator
from typing import Optional, Literal

class RecurringSchedule(BaseModel):
    """Pydantic model for recurring schedule validation"""

    type: Literal["daily", "weekly", "monthly"]
    until: Optional[str] = None  # ISO 8601 date
    days: Optional[list[int]] = None  # For weekly: 0-6
    day_of_month: Optional[int] = None  # For monthly: 1-31

    @field_validator("days")
    @classmethod
    def validate_days(cls, v, info):
        if info.data.get("type") == "weekly":
            if not v or len(v) == 0:
                raise ValueError("Weekly habits must specify at least one day")
            if not all(0 <= day <= 6 for day in v):
                raise ValueError("Days must be between 0 (Sunday) and 6 (Saturday)")
        return v

    @field_validator("day_of_month")
    @classmethod
    def validate_day_of_month(cls, v, info):
        if info.data.get("type") == "monthly":
            if not v:
                raise ValueError("Monthly habits must specify day_of_month")
            if not 1 <= v <= 31:
                raise ValueError("day_of_month must be between 1 and 31")
        return v
```

### 2.4 Timezone Handling

**Recommendation**: Store all times in UTC, handle timezone conversion in the application layer.

- `recurring_schedule` is schedule definition (no timezone needed)
- `last_completed_at` is stored as TIMESTAMPTZ (PostgreSQL handles UTC)
- Frontend converts to user's local timezone for display
- Backend calculations use UTC consistently

---

## 3. Habit Stacking Implementation

### 3.1 Foreign Key Approach

**Decision**: Use foreign key with `ON DELETE SET NULL` to link habits.

```sql
anchor_habit_id UUID REFERENCES habits(id) ON DELETE SET NULL
```

**Rationale**:
- Maintains referential integrity
- Prevents linking to non-existent habits
- When anchor deleted, dependent habits retain their `habit_stacking_cue` text but lose the link
- Allows querying all habits stacked on a given anchor

### 3.2 Cascade Behavior

When anchor habit is deleted:
1. **Warn user** before deletion (UI/API layer)
2. **Display list** of dependent habits
3. **On confirmation**, set `anchor_habit_id = NULL` for all dependent habits
4. **Preserve** `habit_stacking_cue` text for user reference

```python
def delete_habit(self, user_id: UUID, habit_id: UUID) -> None:
    """Delete habit with dependency warning"""
    habit = self.get_habit(user_id, habit_id)
    if not habit:
        raise ValueError("Habit not found")

    # Find dependent habits (those that use this as anchor)
    dependent_habits = self.session.exec(
        select(Habit).where(Habit.anchor_habit_id == habit_id)
    ).all()

    if dependent_habits:
        # Return warning with dependent habit list
        dependent_titles = [h.identity_statement for h in dependent_habits]
        raise ValueError(
            f"This habit is used as an anchor by {len(dependent_habits)} other habit(s): "
            f"{', '.join(dependent_titles)}. "
            f"Deleting will break their stacking cues."
        )

    # Proceed with deletion
    self.session.delete(habit)
    self.session.commit()
```

### 3.3 Circular Dependency Prevention

**Validation rule**: A habit cannot use itself or its descendants as an anchor.

```python
def validate_no_circular_dependency(
    self,
    habit_id: UUID,
    anchor_id: UUID
) -> bool:
    """Prevent circular dependencies in habit stacking"""
    if habit_id == anchor_id:
        return False

    # Check if anchor_id is already stacked on habit_id (direct or transitive)
    visited = set()
    current = anchor_id

    while current and current not in visited:
        visited.add(current)
        anchor_habit = self.session.exec(
            select(Habit).where(Habit.id == current)
        ).first()

        if not anchor_habit:
            break

        if anchor_habit.anchor_habit_id == habit_id:
            return False  # Circular dependency detected

        current = anchor_habit.anchor_habit_id

    return True
```

---

## 4. Status and Archiving

### 4.1 Status Enum

```python
from enum import Enum

class HabitStatus(str, Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"
```

### 4.2 Filtering Logic

**Default behavior**: Exclude archived habits from list views.

```python
def get_habits(
    self,
    user_id: UUID,
    include_archived: bool = False,
    **filters
) -> list[Habit]:
    """Get habits for user, excluding archived by default"""
    query = select(Habit).where(Habit.user_id == user_id)

    if not include_archived:
        query = query.where(Habit.status == "active")

    # Apply other filters...
    return self.session.exec(query).all()
```

### 4.3 Archive vs Delete

**Archive** (soft delete):
- Preserves historical data
- Allows restoration
- Maintains completion history
- Use case: Temporarily pausing a habit

**Delete** (hard delete):
- Permanent removal
- Cascades to `habit_completions`
- Breaks stacking links for dependent habits
- Use case: Removing unwanted habit entirely

---

## 5. Category Management

### 5.1 Predefined Categories

Based on [2026 habit tracking trends](https://reclaim.ai/blog/habit-tracker-apps) and industry standards:

```python
HABIT_CATEGORIES = [
    "Health & Fitness",    # Exercise, nutrition, sleep
    "Productivity",        # Work habits, time management
    "Mindfulness",         # Meditation, journaling, reflection
    "Learning",            # Reading, courses, skill development
    "Social",              # Relationships, networking
    "Finance",             # Budgeting, saving, investing
    "Creative",            # Art, music, writing
    "Other"                # Custom category
]
```

### 5.2 Category Validation

```python
@field_validator("category")
@classmethod
def category_valid(cls, v: str) -> str:
    if v not in HABIT_CATEGORIES:
        raise ValueError(
            f"Category must be one of: {', '.join(HABIT_CATEGORIES)}"
        )
    return v
```

### 5.3 Future Extensibility

**Phase 2**: Fixed predefined categories
**Post-Phase V**: Allow custom categories per user

Consider future schema:
```sql
CREATE TABLE habit_categories (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    name VARCHAR(50) NOT NULL,
    is_predefined BOOLEAN DEFAULT false,
    UNIQUE(user_id, name)
);
```

For now, keep it simple with VARCHAR enum.

---

## 6. API Contract Design

### 6.1 Standard REST Endpoints

Following the existing `tasks` route patterns:

```python
# Create Habit
POST /api/{user_id}/habits
Request Body:
{
    "identity_statement": "I am a person who reads daily",
    "full_description": "Read at least one chapter of a book",
    "two_minute_version": "Read one page",
    "habit_stacking_cue": "After I pour my morning coffee, I will read one page",
    "anchor_habit_id": "uuid-of-anchor-habit",  // optional
    "motivation": "I want to expand my knowledge and vocabulary",
    "category": "Learning",
    "recurring_schedule": {
        "type": "daily",
        "until": "2026-12-31"
    }
}

Response: 201 Created
{
    "id": "uuid",
    "user_id": "uuid",
    "identity_statement": "I am a person who reads daily",
    "full_description": "Read at least one chapter of a book",
    "two_minute_version": "Read one page",
    "habit_stacking_cue": "After I pour my morning coffee, I will read one page",
    "anchor_habit_id": "uuid-of-anchor-habit",
    "motivation": "I want to expand my knowledge and vocabulary",
    "category": "Learning",
    "recurring_schedule": {
        "type": "daily",
        "until": "2026-12-31"
    },
    "status": "active",
    "current_streak": 0,
    "last_completed_at": null,
    "consecutive_misses": 0,
    "created_at": "2026-02-10T10:00:00Z",
    "updated_at": "2026-02-10T10:00:00Z"
}

# List Habits
GET /api/{user_id}/habits?status=active&category=Learning&page=1&limit=50

Response: 200 OK
{
    "habits": [...],
    "total": 10,
    "page": 1,
    "limit": 50
}

# Get Single Habit
GET /api/{user_id}/habits/{habit_id}

Response: 200 OK
{...}

# Update Habit
PATCH /api/{user_id}/habits/{habit_id}
Request Body: (partial update)
{
    "identity_statement": "I am a person who reads every morning",
    "recurring_schedule": {
        "type": "weekly",
        "days": [1, 2, 3, 4, 5],
        "until": null
    }
}

Response: 200 OK
{...}

# Delete Habit
DELETE /api/{user_id}/habits/{habit_id}

Response: 200 OK (with warning if dependencies exist)
OR 400 Bad Request (with dependent habit list)

# Archive Habit
PATCH /api/{user_id}/habits/{habit_id}
Request Body:
{
    "status": "archived"
}

Response: 200 OK
```

### 6.2 Request/Response Schemas

```python
from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional
from datetime import datetime

class HabitCreate(BaseModel):
    """Habit creation request"""
    identity_statement: str = Field(..., min_length=1, max_length=2000)
    full_description: Optional[str] = Field(None, max_length=5000)
    two_minute_version: str = Field(..., min_length=1, max_length=500)
    habit_stacking_cue: Optional[str] = Field(None, max_length=500)
    anchor_habit_id: Optional[UUID] = None
    motivation: Optional[str] = Field(None, max_length=2000)
    category: str
    recurring_schedule: dict  # RecurringSchedule validated separately


class HabitUpdate(BaseModel):
    """Habit update request (partial)"""
    identity_statement: Optional[str] = Field(None, min_length=1, max_length=2000)
    full_description: Optional[str] = Field(None, max_length=5000)
    two_minute_version: Optional[str] = Field(None, min_length=1, max_length=500)
    habit_stacking_cue: Optional[str] = Field(None, max_length=500)
    anchor_habit_id: Optional[UUID] = None
    motivation: Optional[str] = Field(None, max_length=2000)
    category: Optional[str] = None
    recurring_schedule: Optional[dict] = None
    status: Optional[str] = None


class HabitResponse(BaseModel):
    """Habit response"""
    id: UUID
    user_id: UUID
    identity_statement: str
    full_description: Optional[str]
    two_minute_version: str
    habit_stacking_cue: Optional[str]
    anchor_habit_id: Optional[UUID]
    motivation: Optional[str]
    category: str
    recurring_schedule: dict
    status: str
    current_streak: int
    last_completed_at: Optional[datetime]
    consecutive_misses: int
    created_at: datetime
    updated_at: datetime


class HabitListResponse(BaseModel):
    """Paginated habit list response"""
    habits: list[HabitResponse]
    total: int
    page: int
    limit: int
```

### 6.3 Validation Rules

```python
# Required fields validation
- identity_statement: NOT NULL, min_length=1, max_length=2000
- two_minute_version: NOT NULL, min_length=1, max_length=500
- category: NOT NULL, must be in HABIT_CATEGORIES
- recurring_schedule: NOT NULL, must pass RecurringSchedule validation

# Optional fields
- full_description: max_length=5000
- habit_stacking_cue: max_length=500
- anchor_habit_id: must reference existing habit owned by same user
- motivation: max_length=2000

# Business rules
- If anchor_habit_id provided, must validate no circular dependency
- recurring_schedule must match type-specific requirements
- status must be 'active' or 'archived'
```

### 6.4 Error Response Format

```json
{
    "detail": "Validation error message",
    "errors": [
        {
            "field": "identity_statement",
            "message": "Identity statement cannot be empty"
        }
    ]
}
```

---

## 7. Event Schema

### 7.1 Event Types

Following the existing event emitter pattern:

```python
# HABIT_CREATED
{
    "event_type": "HABIT_CREATED",
    "user_id": "uuid",
    "timestamp": "2026-02-10T10:00:00Z",
    "payload": {
        "habit_id": "uuid",
        "identity_statement": "I am a person who reads daily",
        "category": "Learning",
        "recurring_schedule": {...}
    }
}

# HABIT_UPDATED
{
    "event_type": "HABIT_UPDATED",
    "user_id": "uuid",
    "timestamp": "2026-02-10T11:00:00Z",
    "payload": {
        "habit_id": "uuid",
        "identity_statement": "I am a person who reads daily",
        "updated_fields": ["identity_statement", "recurring_schedule"]
    }
}

# HABIT_DELETED
{
    "event_type": "HABIT_DELETED",
    "user_id": "uuid",
    "timestamp": "2026-02-10T12:00:00Z",
    "payload": {
        "habit_id": "uuid",
        "identity_statement": "I am a person who reads daily",
        "had_dependencies": false
    }
}

# HABIT_ARCHIVED
{
    "event_type": "HABIT_ARCHIVED",
    "user_id": "uuid",
    "timestamp": "2026-02-10T13:00:00Z",
    "payload": {
        "habit_id": "uuid",
        "identity_statement": "I am a person who reads daily"
    }
}

# HABIT_RESTORED (from archived)
{
    "event_type": "HABIT_RESTORED",
    "user_id": "uuid",
    "timestamp": "2026-02-10T14:00:00Z",
    "payload": {
        "habit_id": "uuid",
        "identity_statement": "I am a person who reads daily"
    }
}
```

### 7.2 Service-Level Event Emission

```python
class HabitService:
    def __init__(self, session: Session, event_emitter: EventEmitter):
        self.session = session
        self.event_emitter = event_emitter

    def create_habit(self, user_id: UUID, **data) -> Habit:
        """Create habit with event emission"""
        habit = Habit(user_id=user_id, **data)
        self.session.add(habit)
        self.session.commit()
        self.session.refresh(habit)

        # Emit event
        self.event_emitter.emit("HABIT_CREATED", user_id, {
            "habit_id": str(habit.id),
            "identity_statement": habit.identity_statement,
            "category": habit.category,
            "recurring_schedule": habit.recurring_schedule
        })

        return habit
```

---

## 8. Best Practices and Pitfalls

### 8.1 SQLModel Field Definitions

**CRITICAL PITFALL**: Never mix Field() parameters with sa_column parameters.

```python
# ❌ BAD - Will cause RuntimeError
title: str = Field(nullable=False, sa_column=Column(Text))
title: str = Field(max_length=500, sa_column=Column(Text))

# ✅ GOOD - All attributes inside Column()
title: str = Field(sa_column=Column(Text, nullable=False))
description: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
```

**Rule**: When using `sa_column=Column(...)`, ALL column attributes (nullable, default, etc.) go INSIDE the Column() call.

Source: [SQLModel Issue #314](https://github.com/fastapi/sqlmodel/issues/314) - Parameters are not passed forward when set on Field and a column is provided via sa_column.

### 8.2 Import Paths

**ALWAYS use `src.` prefix for internal imports:**

```python
# ❌ BAD - Will cause ModuleNotFoundError
from services.event_emitter import EventEmitter
from models.habit import Habit
from database import get_session

# ✅ GOOD - Full path with src. prefix
from src.services.event_emitter import EventEmitter
from src.models.habit import Habit
from src.database import get_session
```

### 8.3 Database Compatibility

**PostgreSQL-specific types don't work with SQLite:**

```python
# These require PostgreSQL - tests will fail with SQLite
tags: list[str] = Field(sa_column=Column(ARRAY(String)))  # ARRAY
schedule: dict = Field(sa_column=Column(JSONB))           # JSONB
```

**Rule**: Set `DATABASE_URL` or `TEST_DATABASE_URL` environment variable before running tests. SQLite cannot handle ARRAY, JSONB, or other PostgreSQL-specific types.

### 8.4 JSONB Performance

Based on [AWS PostgreSQL JSONB best practices](https://aws.amazon.com/blogs/database/postgresql-as-a-json-database-advanced-patterns-and-best-practices/):

**Indexing Strategies:**
- Use `jsonb_path_ops` for simple containment queries (smaller, faster)
- Use `jsonb_ops` for complex path queries and composite operations
- For frequent queries on specific keys, create expression indexes

```sql
-- GIN index for general JSONB queries
CREATE INDEX idx_habits_schedule ON habits USING GIN(recurring_schedule);

-- Expression index for specific key (faster for equality checks)
CREATE INDEX idx_habits_schedule_type
    ON habits((recurring_schedule->>'type'));
```

Source: [PostgreSQL JSONB - Powerful Storage](https://www.architecture-weekly.com/p/postgresql-jsonb-powerful-storage)

### 8.5 Test Fixture Patterns

Follow existing conftest.py patterns:

```python
@pytest.fixture(name="sample_habit")
def sample_habit_fixture(session: Session, user_id: UUID):
    """Create a sample habit for testing"""
    habit = Habit(
        id=uuid4(),
        user_id=user_id,
        identity_statement="I am a person who reads daily",
        two_minute_version="Read one page",
        category="Learning",
        recurring_schedule={"type": "daily", "until": None},
        status="active",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    session.add(habit)
    session.commit()
    session.refresh(habit)
    return habit
```

---

## 9. Testing Strategy

### 9.1 Test Organization

Follow existing test structure:

```
tests/
├── unit/
│   ├── test_habit_model.py          # Model validation tests
│   └── test_habit_service.py        # Business logic tests
├── integration/
│   └── test_habit_routes.py         # API endpoint tests
├── contract/
│   └── test_habit_contract.py       # OpenAPI schema tests
└── conftest.py                       # Shared fixtures
```

### 9.2 Unit Test Coverage

**Model Tests (test_habit_model.py)**:
- Field validation (identity_statement, two_minute_version required)
- Status enum validation
- Category enum validation
- RecurringSchedule validation
- Foreign key constraints

**Service Tests (test_habit_service.py)**:
- CRUD operations
- User isolation (cannot access other users' habits)
- Circular dependency detection
- Archive/restore logic
- Event emission

### 9.3 Integration Test Coverage

**API Tests (test_habit_routes.py)**:
- All REST endpoints (POST, GET, PATCH, DELETE)
- Authentication (requires valid user)
- Authorization (can only access own habits)
- Validation error responses (400 Bad Request)
- Success responses (200, 201 Created)
- Pagination
- Filtering by status, category

### 9.4 Test Markers

```python
@pytest.mark.unit
@pytest.mark.US1  # User Story 1
class TestHabitCreation:
    """Tests for User Story 1: Create Identity-Driven Habit"""

    def test_create_habit_with_identity_statement(self, ...):
        """T001: Create habit with valid identity statement"""
        pass
```

### 9.5 Acceptance Criteria Mapping

Each test should map directly to spec acceptance criteria:

```python
def test_identity_statement_required(self, session, user_id):
    """
    US1-AC2: When identity statement is empty, system prevents submission

    GIVEN the habit creation form
    WHEN I leave the identity statement empty
    THEN the system prevents submission and displays a validation error
    """
    with pytest.raises(ValueError, match="Identity statement cannot be empty"):
        habit = Habit(
            user_id=user_id,
            identity_statement="",  # Empty
            two_minute_version="Read one page",
            category="Learning",
            recurring_schedule={"type": "daily"}
        )
```

---

## 10. References

### External Resources

- [PostgreSQL JSONB Best Practices | AWS](https://aws.amazon.com/blogs/database/postgresql-as-a-json-database-advanced-patterns-and-best-practices/)
- [postgres-rrule: Recurring dates in Postgres](https://github.com/volkanunsal/postgres-rrule)
- [SQLModel Issue #314: sa_column parameter conflicts](https://github.com/fastapi/sqlmodel/issues/314)
- [SQLModel Issue #464: Nullable field pitfalls](https://github.com/fastapi/sqlmodel/issues/464)
- [Best Habit Tracking Apps 2026 | Reclaim](https://reclaim.ai/blog/habit-tracker-apps)
- [PostgreSQL JSONB - Powerful Storage](https://www.architecture-weekly.com/p/postgresql-jsonb-powerful-storage)

### Internal References

- **Constitution**: `C:\my-drive\spec-kit\hackathon_2_phases\phase-2-webapp\.specify\memory\constitution.md`
- **Spec**: `C:\my-drive\spec-kit\hackathon_2_phases\phase-2-webapp\specs\003-habits-mvp\spec.md`
- **Existing Models**: `C:\my-drive\spec-kit\hackathon_2_phases\phase-2-webapp\apps\api\src\models\task.py`
- **Existing Service**: `C:\my-drive\spec-kit\hackathon_2_phases\phase-2-webapp\apps\api\src\services\task_service.py`
- **Existing Routes**: `C:\my-drive\spec-kit\hackathon_2_phases\phase-2-webapp\apps\api\src\routes\tasks.py`
- **Test Patterns**: `C:\my-drive\spec-kit\hackathon_2_phases\phase-2-webapp\apps\api\tests\conftest.py`

### Key Decisions

1. **Database Schema**: Foreign key for habit stacking with `ON DELETE SET NULL`
2. **Recurring Schedule**: JSONB with type-specific validation (daily/weekly/monthly)
3. **Categories**: Fixed predefined list with "Other" option for Phase 2
4. **Status**: Two-state enum (active/archived) for simple filtering
5. **Events**: Follow existing EventEmitter pattern with file-based logging
6. **Testing**: PostgreSQL required for JSONB and array support

---

**Document Status**: Complete
**Ready for**: Planning phase (spec.md → plan.md)
**Next Steps**: Create architectural plan based on this research
