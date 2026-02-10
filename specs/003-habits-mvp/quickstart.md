# Habits MVP - Quickstart Guide

**Feature**: Phase 2 Chunk 3 - Habits MVP
**Created**: 2026-02-10
**Audience**: Developers implementing the Habits MVP feature

---

## Overview

This quickstart guide provides developers with the essential information needed to implement the Habits MVP feature. It complements the full specification with implementation-focused guidance.

**Key Deliverable**: A fully functional habit management system that implements the Atomic Habits Four Laws framework.

---

## Quick Reference

### Files to Create

**Backend (FastAPI)**:
```
apps/api/
├── src/
│   ├── models/
│   │   └── habit.py                    # Habit SQLModel + RecurringSchedule Pydantic model
│   ├── services/
│   │   └── habit_service.py            # Business logic (CRUD + validation)
│   ├── routes/
│   │   └── habits.py                   # REST endpoints
│   └── schemas/
│       └── habit_schemas.py            # Request/response Pydantic models
├── alembic/versions/
│   └── 003_create_habits_table.py      # Database migration
└── tests/
    ├── unit/
    │   ├── test_habit_model.py         # Model validation tests
    │   └── test_habit_service.py       # Service logic tests
    └── integration/
        └── test_habit_routes.py        # API endpoint tests
```

**Frontend (Next.js)**:
```
apps/web/src/
├── app/
│   └── (authenticated)/
│       └── habits/
│           ├── page.tsx                # Habits list page
│           ├── new/
│           │   └── page.tsx            # Create habit page
│           └── [id]/
│               └── page.tsx            # Habit detail/edit page
├── components/
│   └── habits/
│       ├── HabitCard.tsx               # Habit card component
│       ├── HabitForm.tsx               # Create/edit form
│       ├── CategoryFilter.tsx          # Category filter dropdown
│       └── StatusFilter.tsx            # Active/archived filter
└── lib/
    └── api/
        └── habits.ts                   # API client functions
```

---

## Implementation Sequence

### Phase 1: Backend Foundation (Days 1-2)

**T001-T010**: Core database and models

1. **Create Alembic migration** (`003_create_habits_table.py`)
   - Create `habits` table with all fields
   - Add indexes and constraints
   - Create auto-update trigger for `updated_at`

2. **Create Habit model** (`models/habit.py`)
   - SQLModel class with all fields
   - Pydantic validators for required fields
   - RecurringSchedule validation model

3. **Run migration and verify schema**
   ```bash
   cd apps/api
   alembic upgrade head
   psql $DATABASE_URL -c "\d habits"
   ```

**T011-T020**: Business logic

4. **Create HabitService** (`services/habit_service.py`)
   - CRUD operations
   - User isolation enforcement
   - Circular dependency validation
   - Event emission

5. **Create request/response schemas** (`schemas/habit_schemas.py`)
   - HabitCreate, HabitUpdate, HabitResponse
   - HabitListResponse with pagination

**T021-T030**: API endpoints

6. **Create routes** (`routes/habits.py`)
   - POST `/api/{user_id}/habits` - Create
   - GET `/api/{user_id}/habits` - List with filters
   - GET `/api/{user_id}/habits/{id}` - Get single
   - PATCH `/api/{user_id}/habits/{id}` - Update
   - DELETE `/api/{user_id}/habits/{id}` - Delete

7. **Register routes in main.py**
   ```python
   from src.routes import habits
   app.include_router(habits.router)
   ```

### Phase 2: Testing (Day 3)

**T031-T050**: Comprehensive test coverage

8. **Unit tests** (`test_habit_model.py`)
   - Field validation (identity_statement, two_minute_version required)
   - Category enum validation
   - Status enum validation
   - RecurringSchedule validation

9. **Service tests** (`test_habit_service.py`)
   - CRUD operations
   - User isolation
   - Circular dependency prevention
   - Event emission

10. **Integration tests** (`test_habit_routes.py`)
    - All REST endpoints
    - Authentication/authorization
    - Validation errors
    - Success responses

11. **Run tests**
    ```bash
    cd apps/api
    pytest tests/ -v --cov=src
    ```

### Phase 3: Frontend (Days 4-5)

**T051-T070**: UI components and pages

12. **Create API client** (`lib/api/habits.ts`)
    ```typescript
    export async function createHabit(data: HabitCreate): Promise<Habit>
    export async function getHabits(filters?: HabitFilters): Promise<HabitListResponse>
    export async function updateHabit(id: string, data: HabitUpdate): Promise<Habit>
    export async function deleteHabit(id: string): Promise<void>
    ```

13. **Create HabitForm component** (`components/habits/HabitForm.tsx`)
    - Identity statement input (pre-filled with "I am a person who...")
    - 2-minute version input (required)
    - Habit stacking cue (optional, with anchor habit dropdown)
    - Motivation textarea
    - Category dropdown
    - Recurring schedule builder (daily/weekly/monthly)

14. **Create habits list page** (`app/(authenticated)/habits/page.tsx`)
    - Fetch and display user's habits
    - Filter by category and status
    - Navigate to create/edit pages

15. **Create habit creation page** (`app/(authenticated)/habits/new/page.tsx`)
    - Render HabitForm component
    - Submit to API
    - Redirect to habits list on success

16. **Create habit detail/edit page** (`app/(authenticated)/habits/[id]/page.tsx`)
    - Fetch habit by ID
    - Render HabitForm with pre-filled data
    - Update on submit

---

## Core Concepts

### Atomic Habits Four Laws

Every feature maps to one of the Four Laws:

| Law | Implementation | Code Location |
|-----|----------------|---------------|
| **Law 1: Make It Obvious** | Habit stacking cue + anchor habit | `habit_stacking_cue`, `anchor_habit_id` fields |
| **Law 2: Make It Attractive** | Identity statements + motivation | `identity_statement`, `motivation` fields |
| **Law 3: Make It Easy** | 2-minute version (required) | `two_minute_version` field |
| **Law 4: Make It Satisfying** | Streaks (Phase 2 Chunk 4) | `current_streak`, `last_completed_at` fields |

### Data Validation Rules

**Required Fields**:
- `identity_statement` (NOT NULL, 1-2000 chars)
- `two_minute_version` (NOT NULL, 1-500 chars)
- `category` (must be in predefined list)
- `recurring_schedule` (must pass RecurringSchedule validation)

**Optional Fields**:
- `full_description` (max 5000 chars)
- `habit_stacking_cue` (max 500 chars, requires `anchor_habit_id` validation)
- `anchor_habit_id` (must reference existing habit, no circular deps)
- `motivation` (max 2000 chars)

**Business Rules**:
- Users can only access their own habits (`user_id` filter)
- Circular dependencies are prevented (A → B → A)
- Deleting anchor habit warns about dependent habits
- Archived habits are excluded from default lists

### Event Emission

All CRUD operations emit events:

```python
# After creating a habit
event_emitter.emit("HABIT_CREATED", user_id, {
    "habit_id": str(habit.id),
    "identity_statement": habit.identity_statement,
    "category": habit.category,
    "recurring_schedule": habit.recurring_schedule
})

# After updating a habit
event_emitter.emit("HABIT_UPDATED", user_id, {
    "habit_id": str(habit.id),
    "updated_fields": ["identity_statement", "recurring_schedule"]
})

# After deleting a habit
event_emitter.emit("HABIT_DELETED", user_id, {
    "habit_id": str(habit.id),
    "identity_statement": habit.identity_statement,
    "had_dependencies": len(dependent_habits) > 0
})
```

---

## Development Workflow

### 1. Read the Spec

Start by reading these documents in order:
1. **Feature Spec** (`specs/003-habits-mvp/spec.md`) - User stories and requirements
2. **Research** (`specs/003-habits-mvp/research.md`) - Technical decisions and patterns
3. **Data Model** (`specs/003-habits-mvp/data-model.md`) - Database schema
4. **API Contract** (`specs/003-habits-mvp/contracts/habits-api.yaml`) - OpenAPI spec
5. **This Quickstart** - Implementation guidance

### 2. Set Up Environment

```bash
# Backend
cd apps/api
export DATABASE_URL="postgresql://user:pass@host:5432/db"
export TEST_DATABASE_URL="postgresql://user:pass@host:5432/test_db"

# Run migrations
alembic upgrade head

# Frontend
cd apps/web
export NEXT_PUBLIC_API_URL="http://localhost:8000"
npm run dev
```

### 3. TDD Workflow

**For each task**:
1. Write test first (red)
2. Implement minimal code to pass (green)
3. Refactor for clarity (refactor)
4. Verify all tests still pass

**Example**:
```python
# 1. Write test (RED)
def test_create_habit_requires_identity_statement(session, user_id):
    with pytest.raises(ValueError, match="Identity statement cannot be empty"):
        habit = Habit(
            user_id=user_id,
            identity_statement="",  # Empty
            two_minute_version="Read one page",
            category="Learning",
            recurring_schedule={"type": "daily"}
        )

# 2. Implement validator (GREEN)
@field_validator("identity_statement")
@classmethod
def identity_not_empty(cls, v: str) -> str:
    if not v or not v.strip():
        raise ValueError("Identity statement cannot be empty")
    return v.strip()

# 3. Refactor if needed
# 4. Run: pytest tests/unit/test_habit_model.py::test_create_habit_requires_identity_statement
```

### 4. Manual Testing

**Create a habit via API**:
```bash
curl -X POST http://localhost:8000/api/{user_id}/habits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "identity_statement": "I am a person who reads daily",
    "two_minute_version": "Read one page",
    "category": "Learning",
    "recurring_schedule": {
      "type": "daily",
      "until": "2026-12-31"
    }
  }'
```

**List habits**:
```bash
curl http://localhost:8000/api/{user_id}/habits?status=active&category=Learning \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Common Pitfalls (MUST AVOID)

### 1. SQLModel Field Definitions

**❌ WRONG**:
```python
identity_statement: str = Field(nullable=False, sa_column=Column(Text))
```

**✅ CORRECT**:
```python
identity_statement: str = Field(sa_column=Column(Text, nullable=False))
```

**Rule**: When using `sa_column=Column(...)`, ALL column attributes go INSIDE Column().

### 2. Import Paths

**❌ WRONG**:
```python
from models.habit import Habit
from services.habit_service import HabitService
```

**✅ CORRECT**:
```python
from src.models.habit import Habit
from src.services.habit_service import HabitService
```

**Rule**: Always use `src.` prefix for internal imports.

### 3. Database Testing

**❌ WRONG**:
```python
# Using SQLite for tests (JSONB not supported)
TEST_DATABASE_URL = "sqlite:///test.db"
```

**✅ CORRECT**:
```python
# Use PostgreSQL for tests
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "postgresql://...")
```

**Rule**: PostgreSQL required for JSONB and ARRAY types.

### 4. Circular Dependencies

**❌ WRONG**:
```python
# Allowing circular stacking without validation
habit_a.anchor_habit_id = habit_b.id
habit_b.anchor_habit_id = habit_a.id  # Circular!
```

**✅ CORRECT**:
```python
# Validate before setting anchor
if not validate_no_circular_dependency(habit_id, anchor_id):
    raise ValueError("Circular dependency detected")
```

**Rule**: Always validate habit stacking to prevent cycles.

---

## Testing Checklist

### Unit Tests

- [ ] Habit model validation (identity_statement, two_minute_version required)
- [ ] Category enum validation (must be in predefined list)
- [ ] Status enum validation (active/archived)
- [ ] RecurringSchedule validation (type-specific rules)
- [ ] HabitService CRUD operations
- [ ] User isolation (cannot access other users' habits)
- [ ] Circular dependency prevention
- [ ] Event emission on all CRUD operations

### Integration Tests

- [ ] POST `/api/{user_id}/habits` - Create habit (201 Created)
- [ ] POST with invalid data - Validation error (400 Bad Request)
- [ ] GET `/api/{user_id}/habits` - List habits (200 OK)
- [ ] GET with filters (status, category) - Filtered results
- [ ] GET `/api/{user_id}/habits/{id}` - Get single habit (200 OK)
- [ ] GET non-existent habit - Not found (404)
- [ ] PATCH `/api/{user_id}/habits/{id}` - Update habit (200 OK)
- [ ] PATCH with invalid data - Validation error (400)
- [ ] DELETE `/api/{user_id}/habits/{id}` - Delete habit (200 OK)
- [ ] DELETE with dependencies - Warning (400 with dependent list)

### E2E Tests (Frontend)

- [ ] Navigate to habits page
- [ ] Create new habit with all required fields
- [ ] View habit list (active habits only)
- [ ] Filter by category
- [ ] Filter by status (active/archived)
- [ ] Edit existing habit
- [ ] Archive habit (status change)
- [ ] Restore archived habit
- [ ] Delete habit (with confirmation)

---

## Performance Targets

**API Response Times**:
- List habits: < 200ms (for 50 habits)
- Create habit: < 100ms
- Update habit: < 100ms
- Delete habit: < 100ms

**Database Queries**:
- List habits: 1 query (with indexes)
- Create habit: 1 INSERT + 1 event write
- Update habit: 1 UPDATE + 1 event write
- Delete habit: 1-2 queries (check dependencies + DELETE)

**Frontend Rendering**:
- Habits list page: < 500ms (for 20 habits)
- Habit form: < 100ms
- Form validation: < 50ms (client-side)

---

## Debugging Tips

### Backend Issues

**Database connection errors**:
```bash
# Verify DATABASE_URL
echo $DATABASE_URL
# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

**Migration issues**:
```bash
# Check current revision
alembic current
# Rollback last migration
alembic downgrade -1
# Re-apply
alembic upgrade head
```

**Import errors**:
```bash
# Verify Python path
cd apps/api
python -c "from src.models.habit import Habit; print('OK')"
```

### Frontend Issues

**API calls failing**:
```typescript
// Check environment variable
console.log(process.env.NEXT_PUBLIC_API_URL)
// Check network tab in browser dev tools
```

**TypeScript errors**:
```bash
# Regenerate types from OpenAPI
npm run generate-types
# Check for type mismatches
npm run type-check
```

---

## Success Criteria

### Phase 2 Chunk 3 Complete When:

**Backend**:
- [ ] `habits` table created with all fields
- [ ] Habit model with validators implemented
- [ ] HabitService with CRUD + validation working
- [ ] All REST endpoints responding correctly
- [ ] Events emitted for all CRUD operations
- [ ] All tests passing (unit + integration)
- [ ] API documented in OpenAPI spec

**Frontend**:
- [ ] Habits list page displaying user's habits
- [ ] Create habit form with all required fields
- [ ] Habit detail/edit page working
- [ ] Category and status filters functional
- [ ] Navigation between pages smooth
- [ ] Error handling and loading states

**Quality**:
- [ ] Test coverage > 80%
- [ ] No SQLModel/import path pitfalls
- [ ] User isolation enforced
- [ ] Circular dependency prevention working
- [ ] Performance targets met

---

## Next Steps (Phase 2 Chunk 4)

After completing Chunk 3, proceed to Chunk 4:

**Habit Tracking & Streaks**:
- Completion logging (checkbox + sound effect)
- Streak calculation (consecutive days)
- Never miss twice logic (1 miss = notification, 2 miss = reset)
- `habit_completions` table implementation

**Reference**: `specs/004-habit-tracking/spec.md` (to be created)

---

## Support & Resources

**Documentation**:
- Full spec: `specs/003-habits-mvp/spec.md`
- Research: `specs/003-habits-mvp/research.md`
- Data model: `specs/003-habits-mvp/data-model.md`
- API contract: `specs/003-habits-mvp/contracts/habits-api.yaml`

**Code Examples**:
- Task model: `apps/api/src/models/task.py`
- Task service: `apps/api/src/services/task_service.py`
- Task routes: `apps/api/src/routes/tasks.py`
- Test patterns: `apps/api/tests/conftest.py`

**External References**:
- SQLModel docs: https://sqlmodel.tiangolo.com
- FastAPI docs: https://fastapi.tiangolo.com
- PostgreSQL JSONB: https://www.postgresql.org/docs/current/datatype-json.html
- Atomic Habits: https://jamesclear.com/atomic-habits

---

**Document Status**: Complete
**Ready for**: Task generation (`/sp.tasks`)
**Next Command**: `/sp.tasks` to generate actionable tasks in `tasks.md`
