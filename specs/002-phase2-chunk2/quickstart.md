# Quickstart Guide: Phase 2 Chunk 2 - Tasks Full Feature Set

**Feature**: 002-phase2-chunk2
**Date**: 2026-01-04
**Purpose**: Developer onboarding guide for implementing task management features

---

## Overview

This guide helps developers quickly understand and implement the task management system for Phase 2 Chunk 2. Follow these steps to add complete task CRUD operations, filtering, searching, sorting, and due date management to the existing application.

**Prerequisites**:
- Phase 2 Chunk 1 completed (authentication, database, event emitter)
- Local development environment set up
- Database connection working (Neon PostgreSQL)

**Time to Complete**: ~4-6 hours (backend + frontend + testing)

---

## Quick Reference

### API Endpoints

```
GET    /api/{user_id}/tasks                    # List tasks (with filters/search/sort)
POST   /api/{user_id}/tasks                    # Create task
GET    /api/{user_id}/tasks/{task_id}          # Get task details
PATCH  /api/{user_id}/tasks/{task_id}          # Update task
DELETE /api/{user_id}/tasks/{task_id}          # Delete task
PATCH  /api/{user_id}/tasks/{task_id}/complete # Mark as complete
```

### Query Parameters (List Endpoint)

```
?page=1&limit=50              # Pagination
?status=pending               # Filter by status
?priority=high                # Filter by priority
?tags=work,urgent             # Filter by tags (ANY match)
?search=proposal              # Search title/description
?sort=due_date_asc            # Sort order
```

### Task Entity Schema

```typescript
interface Task {
  id: UUID;
  user_id: UUID;
  title: string;              // Required, max 500 chars
  description: string | null; // Optional, max 5000 chars
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low' | null;
  tags: string[];             // Array of tags
  due_date: string | null;    // ISO 8601 timestamp
  completed: boolean;
  created_at: string;         // ISO 8601 timestamp
  updated_at: string;         // ISO 8601 timestamp
}
```

---

## Step 1: Database Migration (5 minutes)

### 1.1 Create Migration File

```bash
cd apps/api
alembic revision -m "Add tasks table for Phase 2 Chunk 2"
```

### 1.2 Edit Migration File

File: `apps/api/alembic/versions/002_add_tasks_table.py`

```python
"""Add tasks table for Phase 2 Chunk 2

Revision ID: 002
Revises: 001
Create Date: 2026-01-04
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None

def upgrade():
    # Create tasks table
    op.create_table(
        'tasks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.Text(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.VARCHAR(20), nullable=False, server_default='pending'),
        sa.Column('priority', sa.VARCHAR(10), nullable=True),
        sa.Column('tags', postgresql.ARRAY(sa.Text()), server_default='{}'),
        sa.Column('due_date', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.CheckConstraint("char_length(title) <= 500 AND char_length(trim(title)) > 0", name='check_title_valid'),
        sa.CheckConstraint("char_length(description) <= 5000", name='check_description_length'),
        sa.CheckConstraint("status IN ('pending', 'in_progress', 'completed')", name='check_status_valid'),
        sa.CheckConstraint("priority IN ('high', 'medium', 'low') OR priority IS NULL", name='check_priority_valid')
    )

    # Create indexes
    op.create_index('idx_tasks_user_id', 'tasks', ['user_id'])
    op.create_index('idx_tasks_user_status', 'tasks', ['user_id', 'status'])
    op.create_index('idx_tasks_user_priority', 'tasks', ['user_id', 'priority'])
    op.create_index('idx_tasks_user_due_date', 'tasks', ['user_id', 'due_date'])
    op.create_index('idx_tasks_user_created', 'tasks', ['user_id', sa.text('created_at DESC')])
    op.create_index('idx_tasks_tags', 'tasks', ['tags'], postgresql_using='gin')
    op.execute("CREATE INDEX idx_tasks_search ON tasks USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')))")

    # Trigger to auto-update updated_at
    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)
    op.execute("""
        CREATE TRIGGER update_tasks_updated_at
        BEFORE UPDATE ON tasks
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    """)

    # Trigger to sync completed flag with status
    op.execute("""
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
    """)
    op.execute("""
        CREATE TRIGGER sync_task_completed
        BEFORE INSERT OR UPDATE ON tasks
        FOR EACH ROW
        EXECUTE FUNCTION sync_completed_flag();
    """)

def downgrade():
    op.execute("DROP TRIGGER IF EXISTS sync_task_completed ON tasks")
    op.execute("DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks")
    op.execute("DROP FUNCTION IF EXISTS sync_completed_flag()")
    op.execute("DROP FUNCTION IF EXISTS update_updated_at_column()")
    op.drop_table('tasks')
```

### 1.3 Run Migration

```bash
# Development
alembic upgrade head

# Staging/Production
ENVIRONMENT=production alembic upgrade head
```

### 1.4 Verify Migration

```bash
# Check table exists
psql $DATABASE_URL -c "\d tasks"

# Check indexes
psql $DATABASE_URL -c "\d+ tasks"
```

---

## Step 2: Backend Implementation (2 hours)

### 2.1 Create Task Model

File: `apps/api/src/models/task.py`

```python
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import ARRAY, String
from typing import Optional
from datetime import datetime
import uuid

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", nullable=False, index=True)
    title: str = Field(max_length=500, nullable=False)
    description: Optional[str] = Field(default=None, max_length=5000)
    status: str = Field(default="pending", max_length=20)
    priority: Optional[str] = Field(default=None, max_length=10)
    tags: list[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)))
    due_date: Optional[datetime] = Field(default=None)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### 2.2 Create Task Service

File: `apps/api/src/services/task_service.py`

```python
from sqlmodel import Session, select, or_, func, case
from models.task import Task
from services.event_emitter import EventEmitter
from typing import Optional
from datetime import datetime
import uuid

class TaskService:
    def __init__(self, session: Session, event_emitter: EventEmitter):
        self.session = session
        self.event_emitter = event_emitter

    def create_task(
        self,
        user_id: uuid.UUID,
        title: str,
        description: Optional[str] = None,
        status: str = "pending",
        priority: Optional[str] = None,
        tags: Optional[list[str]] = None,
        due_date: Optional[datetime] = None
    ) -> Task:
        task = Task(
            user_id=user_id,
            title=title.strip(),
            description=description,
            status=status,
            priority=priority,
            tags=tags or [],
            due_date=due_date
        )
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)

        # Emit TASK_CREATED event
        self.event_emitter.emit("TASK_CREATED", {
            "user_id": str(user_id),
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "TASK_CREATED",
            "payload": {
                "task_id": str(task.id),
                "title": task.title,
                "description": task.description,
                "status": task.status,
                "priority": task.priority,
                "tags": task.tags,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "completed": task.completed
            }
        })

        return task

    def get_tasks(
        self,
        user_id: uuid.UUID,
        page: int = 1,
        limit: int = 50,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        tags: Optional[list[str]] = None,
        search: Optional[str] = None,
        sort: str = "created_desc"
    ) -> tuple[list[Task], int]:
        offset = (page - 1) * limit
        query = select(Task).where(Task.user_id == user_id)

        # Apply filters
        if status:
            query = query.where(Task.status == status)
        if priority:
            query = query.where(Task.priority == priority)
        if tags:
            query = query.where(Task.tags.op("&&")(tags))
        if search:
            query = query.where(or_(
                Task.title.ilike(f"%{search}%"),
                Task.description.ilike(f"%{search}%")
            ))

        # Apply sort
        sort_map = {
            "created_desc": Task.created_at.desc(),
            "created_asc": Task.created_at.asc(),
            "due_date_asc": Task.due_date.asc().nullslast(),
            "due_date_desc": Task.due_date.desc().nullslast(),
            "priority_asc": case(
                (Task.priority == "high", 1),
                (Task.priority == "medium", 2),
                (Task.priority == "low", 3),
                else_=4
            )
        }
        query = query.order_by(sort_map.get(sort, Task.created_at.desc()))

        # Count total
        total = self.session.exec(select(func.count()).select_from(query.subquery())).one()

        # Fetch page
        tasks = self.session.exec(query.offset(offset).limit(limit)).all()
        return list(tasks), total

    def update_task(self, user_id: uuid.UUID, task_id: uuid.UUID, **updates) -> Task:
        task = self.session.get(Task, task_id)
        if not task or task.user_id != user_id:
            raise ValueError("Task not found")

        for key, value in updates.items():
            if hasattr(task, key) and value is not None:
                setattr(task, key, value)

        task.updated_at = datetime.utcnow()
        self.session.commit()
        self.session.refresh(task)

        # Emit TASK_UPDATED event
        self.event_emitter.emit("TASK_UPDATED", {
            "user_id": str(user_id),
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "TASK_UPDATED",
            "payload": {"task_id": str(task_id), "title": task.title}
        })

        return task

    def mark_complete(self, user_id: uuid.UUID, task_id: uuid.UUID) -> Task:
        task = self.session.get(Task, task_id)
        if not task or task.user_id != user_id:
            raise ValueError("Task not found")

        task.status = "completed"
        task.completed = True
        task.updated_at = datetime.utcnow()
        self.session.commit()

        # Emit TASK_COMPLETED event
        self.event_emitter.emit("TASK_COMPLETED", {
            "user_id": str(user_id),
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "TASK_COMPLETED",
            "payload": {"task_id": str(task_id), "title": task.title}
        })

        return task

    def delete_task(self, user_id: uuid.UUID, task_id: uuid.UUID):
        task = self.session.get(Task, task_id)
        if not task or task.user_id != user_id:
            raise ValueError("Task not found")

        self.session.delete(task)
        self.session.commit()

        # Emit TASK_DELETED event
        self.event_emitter.emit("TASK_DELETED", {
            "user_id": str(user_id),
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "TASK_DELETED",
            "payload": {"task_id": str(task_id)}
        })
```

### 2.3 Create Task Routes

File: `apps/api/src/routes/tasks.py`

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

from database import get_session
from services.task_service import TaskService
from services.event_emitter import get_event_emitter
from middleware.auth import get_current_user

router = APIRouter(prefix="/api", tags=["tasks"])

# Request/Response Models
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = Field(None, max_length=5000)
    status: Optional[str] = "pending"
    priority: Optional[str] = None
    tags: Optional[list[str]] = []
    due_date: Optional[datetime] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = Field(None, max_length=5000)
    status: Optional[str] = None
    priority: Optional[str] = None
    tags: Optional[list[str]] = None
    due_date: Optional[datetime] = None

@router.get("/{user_id}/tasks")
def list_tasks(
    user_id: uuid.UUID,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    tags: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = "created_desc",
    session: Session = Depends(get_session),
    event_emitter = Depends(get_event_emitter),
    current_user = Depends(get_current_user)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    service = TaskService(session, event_emitter)
    tag_list = tags.split(",") if tags else None
    tasks, total = service.get_tasks(user_id, page, limit, status, priority, tag_list, search, sort)

    return {
        "tasks": tasks,
        "total": total,
        "page": page,
        "limit": limit
    }

@router.post("/{user_id}/tasks", status_code=201)
def create_task(
    user_id: uuid.UUID,
    task_data: TaskCreate,
    session: Session = Depends(get_session),
    event_emitter = Depends(get_event_emitter),
    current_user = Depends(get_current_user)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    service = TaskService(session, event_emitter)
    return service.create_task(user_id, **task_data.dict())

@router.patch("/{user_id}/tasks/{task_id}")
def update_task(
    user_id: uuid.UUID,
    task_id: uuid.UUID,
    task_data: TaskUpdate,
    session: Session = Depends(get_session),
    event_emitter = Depends(get_event_emitter),
    current_user = Depends(get_current_user)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    service = TaskService(session, event_emitter)
    try:
        return service.update_task(user_id, task_id, **task_data.dict(exclude_none=True))
    except ValueError:
        raise HTTPException(status_code=404, detail="Task not found")

@router.patch("/{user_id}/tasks/{task_id}/complete")
def complete_task(
    user_id: uuid.UUID,
    task_id: uuid.UUID,
    session: Session = Depends(get_session),
    event_emitter = Depends(get_event_emitter),
    current_user = Depends(get_current_user)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    service = TaskService(session, event_emitter)
    try:
        return service.mark_complete(user_id, task_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Task not found")

@router.delete("/{user_id}/tasks/{task_id}", status_code=204)
def delete_task(
    user_id: uuid.UUID,
    task_id: uuid.UUID,
    session: Session = Depends(get_session),
    event_emitter = Depends(get_event_emitter),
    current_user = Depends(get_current_user)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    service = TaskService(session, event_emitter)
    try:
        service.delete_task(user_id, task_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Task not found")
```

### 2.4 Register Routes

File: `apps/api/src/main.py`

```python
from fastapi import FastAPI
from routes import auth, tasks  # Add tasks import

app = FastAPI(title="Atomic Habits API")

app.include_router(auth.router)
app.include_router(tasks.router)  # Add this line
```

---

## Step 3: Frontend Implementation (2 hours)

### 3.1 Create Task Types

File: `apps/web/src/types/task.ts`

```typescript
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'high' | 'medium' | 'low' | null;

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  due_date: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  tags?: string;
  search?: string;
  sort?: string;
  page?: number;
}
```

### 3.2 Create API Client

File: `apps/web/src/lib/tasks-api.ts`

```typescript
import { Task, TaskFilters } from '@/types/task';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function getTasks(userId: string, filters: TaskFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, String(value));
  });

  const res = await fetch(`${API_URL}/${userId}/tasks?${params}`, {
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function createTask(userId: string, data: Partial<Task>) {
  const res = await fetch(`${API_URL}/${userId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

export async function updateTask(userId: string, taskId: string, data: Partial<Task>) {
  const res = await fetch(`${API_URL}/${userId}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
}

export async function completeTask(userId: string, taskId: string) {
  const res = await fetch(`${API_URL}/${userId}/tasks/${taskId}/complete`, {
    method: 'PATCH',
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Failed to complete task');
  return res.json();
}

export async function deleteTask(userId: string, taskId: string) {
  const res = await fetch(`${API_URL}/${userId}/tasks/${taskId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Failed to delete task');
}
```

### 3.3 Create Task List Page

File: `apps/web/src/app/tasks/page.tsx`

```typescript
import { getTasks } from '@/lib/tasks-api';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskFilters } from '@/components/tasks/TaskFilters';

export default async function TasksPage({
  searchParams
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const userId = 'current-user-id'; // Get from session
  const filters = {
    status: searchParams.status,
    priority: searchParams.priority,
    tags: searchParams.tags,
    search: searchParams.search,
    sort: searchParams.sort || 'created_desc',
    page: parseInt(searchParams.page || '1'),
  };

  const { tasks, total } = await getTasks(userId, filters);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Tasks</h1>
      <TaskFilters currentFilters={filters} />
      <TaskList tasks={tasks} total={total} currentPage={filters.page!} />
    </div>
  );
}
```

---

## Step 4: Testing (1 hour)

### 4.1 Backend Unit Tests

File: `apps/api/tests/unit/test_task_service.py`

```python
import pytest
from services.task_service import TaskService
from unittest.mock import Mock

def test_create_task_emits_event(session, event_emitter):
    mock_emitter = Mock()
    service = TaskService(session, mock_emitter)

    task = service.create_task(user_id, "Test task")

    assert task.title == "Test task"
    mock_emitter.emit.assert_called_once()
    assert mock_emitter.emit.call_args[0][0] == "TASK_CREATED"
```

### 4.2 API Integration Tests

```bash
# Test list tasks
curl -X GET "http://localhost:8000/api/{user_id}/tasks?status=pending" \
  --cookie "session_token=..."

# Test create task
curl -X POST "http://localhost:8000/api/{user_id}/tasks" \
  -H "Content-Type: application/json" \
  --cookie "session_token=..." \
  -d '{"title": "Test task", "priority": "high"}'

# Test complete task
curl -X PATCH "http://localhost:8000/api/{user_id}/tasks/{task_id}/complete" \
  --cookie "session_token=..."
```

---

## Troubleshooting

### Common Issues

**Issue**: Migration fails with "relation already exists"
- **Solution**: Check if migration already ran: `alembic current`
- **Rollback**: `alembic downgrade -1`

**Issue**: Foreign key constraint violation
- **Solution**: Ensure user exists before creating task
- **Check**: `SELECT * FROM users WHERE id = '{user_id}'`

**Issue**: Search returns no results
- **Solution**: Verify GIN index exists: `\d+ tasks`
- **Rebuild**: `REINDEX INDEX idx_tasks_search;`

**Issue**: Tags filter not working
- **Solution**: Ensure tags passed as array in SQL query
- **Debug**: Check query uses `&&` operator, not `=`

---

## Next Steps

After completing this quickstart:

1. ✅ Run `/sp.tasks` to generate actionable task breakdown
2. ✅ Implement backend (models, services, routes)
3. ✅ Implement frontend (pages, components)
4. ✅ Write tests (unit, integration, API contract)
5. ✅ Deploy to staging (Render + Vercel)
6. ✅ User acceptance testing
7. ✅ Deploy to production

---

## Resources

- **Full Spec**: [spec.md](./spec.md)
- **Implementation Plan**: [plan.md](./plan.md)
- **Data Model**: [data-model.md](./data-model.md)
- **API Contract**: [contracts/tasks-api.yaml](./contracts/tasks-api.yaml)
- **Research Decisions**: [research.md](./research.md)

**Need help?** Check the spec edge cases or consult the implementation plan for detailed architecture decisions.
