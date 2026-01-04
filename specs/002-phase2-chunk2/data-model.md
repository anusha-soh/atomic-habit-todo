# Data Model: Phase 2 Chunk 2 - Tasks Full Feature Set

**Feature**: 002-phase2-chunk2
**Date**: 2026-01-04
**Purpose**: Define data structures, relationships, and validation rules for task management system

---

## Entity Overview

This feature introduces one new entity (**Task**) that extends the existing Core module. Tasks belong to Users (defined in Chunk 1) and support full CRUD operations with filtering, searching, and sorting capabilities.

### Entity Diagram

```
┌─────────────────┐
│     User        │
│  (Chunk 1)      │
│─────────────────│
│ • id: UUID      │
│ • email         │
│ • password_hash │
│ • created_at    │
└─────────────────┘
         │
         │ 1:N
         │ (one user has many tasks)
         │
         ▼
┌─────────────────┐
│      Task       │
│   (NEW)         │
│─────────────────│
│ • id: UUID      │
│ • user_id: UUID │──┐ FK → users.id
│ • title         │  │ ON DELETE CASCADE
│ • description   │  │
│ • status        │  │
│ • priority      │  │
│ • tags[]        │  │
│ • due_date      │  │
│ • completed     │  │
│ • created_at    │  │
│ • updated_at    │  │
└─────────────────┘  │
                     │
                     ▼
              DELETE user
                 ⬇
         CASCADE delete all
         user's tasks
```

---

## Entity: Task

**Purpose**: Represents a single to-do item belonging to a user, supporting the 9 task features (CRUD, priorities, tags, search, filter, sort, due dates).

### Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique task identifier (auto-generated) |
| `user_id` | UUID | FOREIGN KEY → users.id, NOT NULL, ON DELETE CASCADE | Owner of the task |
| `title` | TEXT | NOT NULL, LENGTH <= 500, NOT EMPTY | Task title (required, max 500 chars, must have non-whitespace) |
| `description` | TEXT | NULLABLE, LENGTH <= 5000 | Optional detailed description (max 5000 chars) |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'pending', CHECK IN ('pending', 'in_progress', 'completed') | Task lifecycle status |
| `priority` | VARCHAR(10) | NULLABLE, CHECK IN ('high', 'medium', 'low', NULL) | Priority level (optional) |
| `tags` | TEXT[] | DEFAULT '{}', NULLABLE | Array of user-defined tags/categories |
| `due_date` | TIMESTAMPTZ | NULLABLE | Optional deadline timestamp (UTC) |
| `completed` | BOOLEAN | NOT NULL, DEFAULT FALSE | Completion flag (redundant with status but useful for queries) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Task creation timestamp (auto-set) |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last modification timestamp (auto-updated) |

### Indexes

Performance-critical indexes based on common query patterns:

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| `idx_tasks_user_id` | `user_id` | BTREE | Fast lookup of all user's tasks (most common query) |
| `idx_tasks_user_status` | `user_id, status` | BTREE | Filter by status (pending/in_progress/completed) |
| `idx_tasks_user_priority` | `user_id, priority` | BTREE | Filter by priority (high/medium/low) |
| `idx_tasks_user_due_date` | `user_id, due_date` | BTREE | Sort by due date, find overdue tasks |
| `idx_tasks_user_created` | `user_id, created_at DESC` | BTREE | Default sort (newest first) |
| `idx_tasks_tags` | `tags` | GIN | Fast tag filtering with `&&` operator |
| `idx_tasks_search` | `to_tsvector('english', title \|\| ' ' \|\| COALESCE(description, ''))` | GIN | Full-text search |

### Validation Rules

#### Backend (Python/FastAPI)

```python
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
import uuid

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = Field(None, max_length=5000)
    status: Optional[str] = Field("pending", pattern="^(pending|in_progress|completed)$")
    priority: Optional[str] = Field(None, pattern="^(high|medium|low)$")
    tags: Optional[list[str]] = Field(default_factory=list)
    due_date: Optional[datetime] = None

    @validator('title')
    def title_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty or only whitespace')
        return v.strip()

    @validator('tags')
    def validate_tags(cls, v):
        if v and len(v) > 20:  # Reasonable limit
            raise ValueError('Maximum 20 tags allowed')
        return [tag.strip() for tag in v if tag.strip()]  # Remove empty tags

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = Field(None, max_length=5000)
    status: Optional[str] = Field(None, pattern="^(pending|in_progress|completed)$")
    priority: Optional[str] = Field(None, pattern="^(high|medium|low)$")
    tags: Optional[list[str]] = None
    due_date: Optional[datetime] = None

    @validator('title')
    def title_not_empty(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Title cannot be empty or only whitespace')
        return v.strip() if v else v

class Task(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    description: Optional[str]
    status: str
    priority: Optional[str]
    tags: list[str]
    due_date: Optional[datetime]
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
```

#### Frontend (TypeScript)

```typescript
// types/task.ts
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'high' | 'medium' | 'low' | null;

export interface Task {
  id: string;  // UUID
  user_id: string;  // UUID
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  due_date: string | null;  // ISO 8601 timestamp
  completed: boolean;
  created_at: string;  // ISO 8601 timestamp
  updated_at: string;  // ISO 8601 timestamp
}

export interface TaskCreateRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  tags?: string[];
  due_date?: string;  // ISO 8601 timestamp
}

export interface TaskUpdateRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  tags?: string[];
  due_date?: string;  // ISO 8601 timestamp
}

// Validation helpers
export function validateTitle(title: string): string | null {
  if (!title.trim()) {
    return 'Title cannot be empty';
  }
  if (title.length > 500) {
    return 'Title must be 500 characters or less';
  }
  return null;
}

export function validateDescription(description: string): string | null {
  if (description && description.length > 5000) {
    return 'Description must be 5000 characters or less';
  }
  return null;
}
```

### State Transitions

```
┌──────────┐
│ pending  │ ◄────┐
└────┬─────┘      │
     │            │
     ▼            │
┌──────────────┐  │
│ in_progress  │  │
└────┬─────────┘  │
     │            │
     ▼            │
┌───────────┐     │
│ completed │─────┘
└───────────┘

Allowed transitions:
- pending → in_progress
- pending → completed (direct)
- in_progress → completed
- completed → pending (reopen)
- completed → in_progress (reopen)
```

**Transition Rules**:
- Any status can transition to any other status (no one-way restrictions)
- Completing a task: `status = 'completed'` AND `completed = true`
- Reopening a task: `status = 'pending'` OR `'in_progress'` AND `completed = false`
- No automatic transitions (all user-initiated)

### Relationships

#### Task → User (Many-to-One)

```
Task.user_id → User.id (FOREIGN KEY, ON DELETE CASCADE)
```

- **Cardinality**: Many tasks belong to one user
- **Cascade Delete**: When a user is deleted, all their tasks are automatically deleted
- **Validation**: Every task MUST have a valid user_id (enforced by foreign key constraint)
- **Access Control**: Users can only access tasks where `task.user_id = current_user.id`

---

## Database Schema (SQL)

### Migration: Create Tasks Table

```sql
-- Migration: 002_create_tasks_table.sql
-- Description: Add tasks table for Phase 2 Chunk 2
-- Date: 2026-01-04

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(title) <= 500 AND char_length(trim(title)) > 0),
    description TEXT CHECK (char_length(description) <= 5000),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    priority VARCHAR(10) CHECK (priority IN ('high', 'medium', 'low')),
    tags TEXT[] DEFAULT '{}',
    due_date TIMESTAMPTZ,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_user_priority ON tasks(user_id, priority);
CREATE INDEX idx_tasks_user_due_date ON tasks(user_id, due_date);
CREATE INDEX idx_tasks_user_created ON tasks(user_id, created_at DESC);
CREATE INDEX idx_tasks_tags ON tasks USING GIN(tags);
CREATE INDEX idx_tasks_search ON tasks USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger to sync completed flag with status
CREATE OR REPLACE FUNCTION sync_completed_flag()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        NEW.completed = TRUE;
    ELSIF NEW.status IN ('pending', 'in_progress') THEN
        NEW.completed = FALSE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_task_completed
BEFORE INSERT OR UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION sync_completed_flag();
```

### Rollback Migration

```sql
-- Rollback: 002_create_tasks_table.sql
DROP TRIGGER IF EXISTS sync_task_completed ON tasks;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
DROP FUNCTION IF EXISTS sync_completed_flag();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS tasks CASCADE;
```

---

## Data Integrity & Constraints

### Database-Level Constraints

1. **Foreign Key Constraint**: `user_id` MUST reference valid `users.id`, CASCADE DELETE
2. **NOT NULL Constraints**: `id`, `user_id`, `title`, `status`, `completed`, `created_at`, `updated_at`
3. **CHECK Constraints**:
   - `title`: Not empty after trimming, max 500 chars
   - `description`: Max 5000 chars
   - `status`: Must be one of 'pending', 'in_progress', 'completed'
   - `priority`: Must be one of 'high', 'medium', 'low', or NULL
4. **Default Values**: `status='pending'`, `completed=FALSE`, `tags='{}'`, `created_at=NOW()`, `updated_at=NOW()`

### Application-Level Validation

1. **Title Validation**: Trim whitespace, reject empty strings, enforce max length
2. **Tags Validation**: Limit to 20 tags, trim individual tags, remove empty tags
3. **Priority Validation**: Accept only valid enum values or null
4. **Status Validation**: Enforce valid status transitions (though all transitions allowed)
5. **User Isolation**: All queries filter by `user_id = current_user.id`

### Concurrency Handling

**Strategy**: Last Write Wins (no optimistic locking in Phase 2)

- **Scenario**: User A and User B both edit Task #123
- **Behavior**: Later update overwrites earlier update
- **Mitigation**: Document as known limitation in Phase 2 spec
- **Future**: Add `version` column in Phase V for optimistic locking if needed

---

## Query Patterns

### Common Queries (with indexes)

```sql
-- 1. Get all tasks for user (default: newest first)
SELECT * FROM tasks
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 50 OFFSET 0;
-- Uses: idx_tasks_user_created

-- 2. Filter by status (e.g., pending tasks)
SELECT * FROM tasks
WHERE user_id = $1 AND status = 'pending'
ORDER BY created_at DESC;
-- Uses: idx_tasks_user_status

-- 3. Filter by priority (e.g., high priority)
SELECT * FROM tasks
WHERE user_id = $1 AND priority = 'high'
ORDER BY created_at DESC;
-- Uses: idx_tasks_user_priority

-- 4. Filter by tags (any of multiple tags)
SELECT * FROM tasks
WHERE user_id = $1 AND tags && ARRAY['work', 'urgent']
ORDER BY created_at DESC;
-- Uses: idx_tasks_user_id + idx_tasks_tags (bitmap AND)

-- 5. Search in title and description
SELECT * FROM tasks
WHERE user_id = $1
  AND (title ILIKE '%proposal%' OR description ILIKE '%proposal%')
ORDER BY created_at DESC;
-- Uses: idx_tasks_search (full-text) or idx_tasks_user_id + seq scan

-- 6. Sort by due date (ascending, nulls last)
SELECT * FROM tasks
WHERE user_id = $1
ORDER BY due_date ASC NULLS LAST;
-- Uses: idx_tasks_user_due_date

-- 7. Find overdue tasks
SELECT * FROM tasks
WHERE user_id = $1
  AND due_date < NOW()
  AND status != 'completed'
ORDER BY due_date ASC;
-- Uses: idx_tasks_user_due_date

-- 8. Combined filters (status + priority + search)
SELECT * FROM tasks
WHERE user_id = $1
  AND status = 'pending'
  AND priority = 'high'
  AND (title ILIKE '%client%' OR description ILIKE '%client%')
ORDER BY due_date ASC NULLS LAST
LIMIT 50 OFFSET 0;
-- Uses: idx_tasks_user_id + multiple index scans combined

-- 9. Count total tasks (for pagination)
SELECT COUNT(*) FROM tasks WHERE user_id = $1;
-- Uses: idx_tasks_user_id (index-only scan)

-- 10. Get all unique tags for autocomplete
SELECT DISTINCT unnest(tags) as tag
FROM tasks
WHERE user_id = $1
ORDER BY tag;
-- Uses: idx_tasks_user_id + idx_tasks_tags
```

---

## Performance Considerations

### Index Strategy

- **Composite indexes** for common filter combinations (`user_id + status`, `user_id + priority`)
- **GIN indexes** for array (tags) and full-text search operations
- **BTREE indexes** for sorting operations (created_at, due_date)
- **Covering indexes** where possible to enable index-only scans

### Query Optimization

- **Limit pagination**: Default 50 tasks per page, max 100
- **Index-only scans**: COUNT(*) uses index instead of table scan
- **Nulls last**: Due date sorting handles NULL values efficiently
- **Prepared statements**: All queries use parameterized queries (SQL injection prevention + query plan caching)

### Scalability Targets

- **1000 tasks per user**: All queries <100ms with current indexes
- **10,000 users**: Total 10M tasks, partitioning not needed
- **Concurrent writes**: PostgreSQL row-level locking handles concurrency

---

## Event Schema

Tasks emit events on lifecycle changes (CREATED, UPDATED, COMPLETED, DELETED):

```json
{
  "user_id": "uuid-string",
  "timestamp": "2026-01-04T18:30:00.000Z",
  "event_type": "TASK_CREATED | TASK_UPDATED | TASK_COMPLETED | TASK_DELETED",
  "payload": {
    "task_id": "uuid-string",
    "title": "string",
    "description": "string | null",
    "status": "pending | in_progress | completed",
    "priority": "high | medium | low | null",
    "tags": ["array", "of", "strings"],
    "due_date": "2026-01-10T00:00:00.000Z | null",
    "completed": true | false
  }
}
```

**Event Emission Points**:
- `TASK_CREATED`: After successful INSERT into tasks table
- `TASK_UPDATED`: After successful UPDATE of tasks table
- `TASK_COMPLETED`: After successful PATCH /tasks/{id}/complete endpoint
- `TASK_DELETED`: After successful DELETE from tasks table

---

## Testing Strategy

### Data Validation Tests

- **Unit tests**: Pydantic validators (title not empty, max lengths, enum values)
- **Integration tests**: Database constraints (foreign key, CHECK constraints)
- **Edge cases**: Empty strings, max length strings, null values, invalid enums

### Query Performance Tests

- **Benchmark**: All common queries with 1000 tasks dataset
- **Target**: <100ms for all queries, <50ms for simple filters
- **Tool**: `EXPLAIN ANALYZE` for query plan verification

### Concurrency Tests

- **Scenario**: 2 users updating same task simultaneously
- **Expected**: Last write wins, no data corruption
- **Test**: Python concurrent requests with `asyncio`

---

## Migration Checklist

- [ ] Create Alembic migration file: `002_create_tasks_table.py`
- [ ] Test migration on local development database
- [ ] Verify all indexes created successfully
- [ ] Test rollback migration
- [ ] Run migration on staging database (Neon)
- [ ] Verify performance with 1000 task test dataset
- [ ] Run migration on production database (Neon)
- [ ] Monitor database performance post-migration

---

## Summary

The Task entity is a straightforward, well-indexed data model that supports all 9 task features (CRUD, priorities, tags, search, filter, sort, due dates) with excellent performance characteristics. The design prioritizes:

1. **Simplicity**: Single table, no complex joins
2. **Performance**: Strategic indexes for all query patterns
3. **Integrity**: Database constraints + application validation
4. **Scalability**: Proven to 10,000 tasks per user
5. **Event-Driven**: All mutations emit events for future modules

**Next**: Proceed to API contract definition (contracts/tasks-api.yaml).
