# Data Model: Phase 2 Core Infrastructure

**Feature**: Phase 2 Core Infrastructure
**Branch**: `001-phase2-chunk1`
**Date**: 2026-01-03

## Overview

This document defines the database schema for Phase 2 Chunk 1 (Core Infrastructure). The data model includes two primary entities: **User** (for authentication) and **Session** (for database-backed JWT session tracking). This chunk does NOT include tasks or habits tables (those are in later chunks).

---

## Entity-Relationship Diagram

```
┌─────────────────────┐
│       User          │
│─────────────────────│
│ id (UUID, PK)       │
│ email (unique)      │
│ password_hash       │
│ created_at          │
│ updated_at          │
└─────────────────────┘
          │
          │ 1:N
          │
          ▼
┌─────────────────────┐
│      Session        │
│─────────────────────│
│ id (UUID, PK)       │
│ user_id (UUID, FK)  │
│ token (text)        │
│ expires_at          │
│ created_at          │
│ is_active (boolean) │
└─────────────────────┘
```

**Relationships**:
- One User can have many Sessions (1:N)
- Each Session belongs to exactly one User

---

## Entity Definitions

### 1. User

**Purpose**: Represents an authenticated user of the system.

**Attributes**:

| Column         | Type              | Constraints                  | Description                                    |
|----------------|-------------------|------------------------------|------------------------------------------------|
| `id`           | UUID              | PRIMARY KEY                  | Unique identifier (auto-generated UUID)        |
| `email`        | VARCHAR(255)      | UNIQUE, NOT NULL, INDEX      | User's email address (used for login)          |
| `password_hash`| VARCHAR(255)      | NOT NULL                     | bcrypt-hashed password (never store plaintext) |
| `created_at`   | TIMESTAMPTZ       | NOT NULL, DEFAULT NOW()      | Timestamp when account was created             |
| `updated_at`   | TIMESTAMPTZ       | NOT NULL, DEFAULT NOW()      | Timestamp of last update (auto-updated)        |

**Validation Rules**:
- `email`: Must match standard email regex pattern (validated at API layer)
- `password_hash`: Must be bcrypt hash (handled by Better Auth, never accept plaintext)

**Indexes**:
- Primary index on `id`
- Unique index on `email` (for fast login lookups and duplicate prevention)

**SQLModel Definition**:
```python
from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True, nullable=False, max_length=255)
    password_hash: str = Field(nullable=False, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
```

**Business Rules**:
1. Email addresses are case-insensitive (normalize to lowercase before storage)
2. Duplicate emails are rejected with HTTP 409 Conflict
3. Passwords must be at least 8 characters (validated before hashing)
4. Password composition rules are NOT enforced (NIST SP 800-63B guideline)
5. Users cannot be deleted in Phase 2 (soft delete in future phases)

---

### 2. Session

**Purpose**: Tracks active authentication sessions for server-side invalidation. Enables logout and session auditing.

**Attributes**:

| Column      | Type         | Constraints               | Description                                      |
|-------------|--------------|---------------------------|--------------------------------------------------|
| `id`        | UUID         | PRIMARY KEY               | Unique session identifier                        |
| `user_id`   | UUID         | FOREIGN KEY → users(id)   | Reference to the user who owns this session      |
| `token`     | TEXT         | NOT NULL                  | JWT token string (for validation)                |
| `expires_at`| TIMESTAMPTZ  | NOT NULL                  | Expiration timestamp (7 days from creation)      |
| `created_at`| TIMESTAMPTZ  | NOT NULL, DEFAULT NOW()   | When the session was created (login timestamp)   |
| `is_active` | BOOLEAN      | NOT NULL, DEFAULT TRUE    | FALSE when user logs out or admin invalidates    |

**Validation Rules**:
- `expires_at`: Must be in the future at creation time
- `is_active`: Defaults to TRUE on session creation
- `token`: Must be a valid JWT string (validated by Better Auth)

**Indexes**:
- Primary index on `id`
- Index on `user_id` (for fast user session lookups)
- Index on `token` (for fast token validation)
- Index on `is_active` (for filtering active sessions)

**SQLModel Definition**:
```python
from sqlmodel import SQLModel, Field, Relationship
from uuid import UUID, uuid4
from datetime import datetime, timedelta

class Session(SQLModel, table=True):
    __tablename__ = "sessions"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    token: str = Field(nullable=False, index=True)
    expires_at: datetime = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    is_active: bool = Field(default=True, nullable=False, index=True)

    # Relationship (optional, for ORM convenience)
    # user: Optional["User"] = Relationship(back_populates="sessions")
```

**Business Rules**:
1. Sessions are created on successful login
2. JWT tokens expire after 7 days (`expires_at = now() + 7 days`)
3. Logout sets `is_active = FALSE` (soft delete, preserves audit trail)
4. Expired sessions (`expires_at < now()`) are treated as invalid even if `is_active = TRUE`
5. Multiple active sessions per user are allowed (user can be logged in on multiple devices)
6. Session cleanup job (future): Periodically delete sessions where `expires_at < now() - 30 days` (garbage collection)

---

## State Transitions

### User Lifecycle
```
[Registration] → User created (email + password_hash)
                       ↓
                 [Active State]
                       │
                       └─ (Future: Soft Delete) → is_deleted = TRUE
```

### Session Lifecycle
```
[Login] → Session created (is_active = TRUE, expires_at = now() + 7d)
                ↓
          [Active Session]
                │
                ├─ [Logout] → is_active = FALSE
                ├─ [Expiration] → expires_at < now() (invalid)
                └─ [Admin Invalidation] → is_active = FALSE
```

---

## Migration Strategy

### Initial Migration (Alembic)

**Migration File**: `alembic/versions/001_create_users_and_sessions.py`

```python
"""Create users and sessions tables

Revision ID: 001
Revises:
Create Date: 2026-01-03
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False, index=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.func.now())
    )

    # Create sessions table
    op.create_table(
        'sessions',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('token', sa.Text, nullable=False, index=True),
        sa.Column('expires_at', sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default=sa.true(), index=True)
    )

def downgrade() -> None:
    op.drop_table('sessions')
    op.drop_table('users')
```

**Running Migrations**:
```bash
# Generate migration (auto-detect model changes)
alembic revision --autogenerate -m "Create users and sessions tables"

# Apply migration
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

---

## Data Integrity Constraints

### Foreign Key Constraints
- `sessions.user_id` → `users.id` (ON DELETE CASCADE)
  - If a user is deleted (future feature), all their sessions are also deleted

### Unique Constraints
- `users.email` must be unique across all users

### Check Constraints
- None required for Phase 2 Chunk 1 (validation handled at application layer)

---

## Future Extensions (Later Chunks)

### Chunk 2: Tasks Table
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'todo',  -- 'todo', 'in_progress', 'completed'
  priority VARCHAR(20) DEFAULT 'medium',  -- 'low', 'medium', 'high'
  tags TEXT[],
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Chunk 3: Habits Table
```sql
CREATE TABLE habits (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  identity_statement TEXT NOT NULL,  -- "I am a person who..."
  full_description TEXT,
  two_minute_version TEXT NOT NULL,
  habit_stacking_cue TEXT,
  motivation TEXT,
  category VARCHAR(50),
  recurring_schedule JSONB,  -- {type: 'daily', until: '2026-12-31'}
  current_streak INT DEFAULT 0,
  last_completed_at TIMESTAMPTZ,
  consecutive_misses INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE habit_completions (
  id UUID PRIMARY KEY,
  habit_id UUID REFERENCES habits(id),
  user_id UUID REFERENCES users(id),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  completion_type VARCHAR(20)  -- 'full' or 'two_minute'
);
```

---

## Summary

This data model provides the foundation for Phase 2 Chunk 1:

1. **User**: Authentication and account management
2. **Session**: Database-backed JWT session tracking for logout and auditing

**Key Design Decisions**:
- UUID primary keys (globally unique, good for distributed systems)
- TIMESTAMPTZ for all timestamps (timezone-aware)
- Indexes on lookup columns (email, user_id, token, is_active)
- Soft delete pattern for sessions (is_active flag)
- Foreign key cascade (sessions deleted when user deleted)

**Alignment with Constitution**:
- ✅ Database as single source of truth (Principle VI)
- ✅ Stateless services (sessions in DB, not in-memory)
- ✅ No hardcoded values (all env vars: DATABASE_URL)

This model supports the functional requirements FR-012 through FR-020 from the specification.
