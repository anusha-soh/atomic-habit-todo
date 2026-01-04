# Troubleshooting Guide

Common issues and solutions when using `/scaffold-crud`.

## Parameter Errors

### ❌ "Invalid field type: xyz"

**Problem:** Unsupported field type specified

**Solution:** Check `docs/field-types.md` for supported types:
- Use `str`, `int`, `float`, `bool`, `datetime`, `uuid`, `list[str]`, `jsonb`
- Not `string`, `integer`, `date` (wrong syntax)

**Example:**
```bash
# Wrong:
fields="name:string:required"

# Correct:
fields="name:str:required"
```

### ❌ "Missing required parameter: entity"

**Problem:** Entity name not provided

**Solution:** Always include `entity=EntityName`

**Example:**
```bash
/scaffold-crud entity=Task fields="title:str:required"
```

### ❌ "Invalid enum syntax"

**Problem:** Enum constraint malformed

**Solution:** Use format `enum=val1|val2|val3` (pipe-separated, no spaces)

**Example:**
```bash
# Wrong:
priority:str:enum=high, medium, low

# Correct:
priority:str:enum=high|medium|low
```

---

## Database Errors

### ❌ "Foreign key constraint fails on insert"

**Problem:** Referenced table doesn't exist yet

**Solution:** Run migrations in dependency order

**Example:**
```bash
# 1. Create users table first
/scaffold-crud entity=User fields="..."
alembic upgrade head

# 2. Then create tasks (references users)
/scaffold-crud entity=Task fields="...,user_id:uuid:foreign_key=users.id"
alembic upgrade head
```

### ❌ "Duplicate key value violates unique constraint"

**Problem:** Trying to insert duplicate value in unique field

**Solution:** Check for existing data before insert

**Example:**
```python
# Check if email exists
existing_user = session.exec(
    select(User).where(User.email == email)
).first()

if existing_user:
    raise HTTPException(409, "Email already exists")
```

### ❌ "Migration failed: column already exists"

**Problem:** Running migration twice or manual column addition

**Solution:**
1. Check current migration state: `alembic current`
2. If column exists, skip this migration: `alembic stamp head`
3. Or drop column manually and rerun migration

**Example:**
```bash
# Check migration state
alembic current

# If stuck, reset to head
alembic stamp head

# Then run pending migrations
alembic upgrade head
```

---

## API Errors

### ❌ "401 Unauthorized"

**Problem:** Missing or invalid JWT token

**Solution:** Include JWT in Authorization header

**Example:**
```bash
curl -X GET http://localhost:8000/api/{user_id}/tasks \
  -H "Authorization: Bearer {your_jwt_token}"
```

**Check:**
- JWT token is valid (not expired)
- BETTER_AUTH_SECRET matches between frontend and backend
- user_id in URL matches JWT claim

### ❌ "404 Not Found"

**Problem:** Entity doesn't exist or user_id mismatch

**Solution:** Verify user_id and entity_id

**Example:**
```python
# Always check user_id ownership
task = session.get(Task, task_id)
if not task or task.user_id != user_id:
    raise HTTPException(404, "Task not found")
```

### ❌ "422 Validation Error"

**Problem:** Request body doesn't match Pydantic schema

**Solution:** Check request payload matches schema

**Example:**
```bash
# Wrong:
{"name": "Task 1"}  # Field is "title", not "name"

# Correct:
{"title": "Task 1"}
```

**Debug:**
- Check `/docs` for exact schema
- Look at error response for field details
- Verify enum values match exactly (case-sensitive)

---

## CORS Errors

### ❌ "CORS policy: No 'Access-Control-Allow-Origin' header"

**Problem:** Backend not configured to allow frontend domain

**Solution:** Configure CORS middleware in FastAPI

**Example:**
```python
# apps/api/src/main.py
from fastapi.middleware.cors import CORSMiddleware

origins = os.getenv("CORS_ORIGINS", "").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # ["http://localhost:3000", "https://yourapp.vercel.app"]
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

**Environment Variable:**
```bash
# .env
CORS_ORIGINS=http://localhost:3000,https://yourapp.vercel.app
```

---

## Frontend Errors

### ❌ "Module not found: Can't resolve '@/types/task'"

**Problem:** TypeScript path alias not configured

**Solution:** Configure paths in `tsconfig.json`

**Example:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### ❌ "React Hook useQuery is called conditionally"

**Problem:** React Query hook called inside condition

**Solution:** Always call hooks at top level

**Example:**
```typescript
// Wrong:
if (userId) {
  const { data } = useQuery(['tasks', userId], ...);
}

// Correct:
const { data } = useQuery({
  queryKey: ['tasks', userId],
  queryFn: () => fetchTasks(userId),
  enabled: !!userId  // Control with enabled option
});
```

---

## Migration Errors

### ❌ "Alembic command not found"

**Problem:** Alembic not installed or not in PATH

**Solution:** Install Alembic and ensure it's in your Python environment

**Example:**
```bash
# Using UV
uv pip install alembic

# Using pip
pip install alembic

# Verify installation
alembic --version
```

### ❌ "Can't locate revision identified by 'xyz'"

**Problem:** Migration history out of sync

**Solution:** Check migration files and database state

**Example:**
```bash
# Check current migration
alembic current

# Check migration history
alembic history

# If needed, stamp to specific revision
alembic stamp xyz

# Then upgrade
alembic upgrade head
```

---

## File Generation Errors

### ❌ "File already exists: apps/api/src/models/task.py"

**Problem:** Running scaffold twice for same entity

**Solution:** Choose to overwrite or skip

**Options:**
1. **Overwrite:** Delete existing files and regenerate
2. **Skip:** Keep existing files, only generate missing ones
3. **Rename:** Change entity name (e.g., `Task` → `TaskV2`)

### ❌ "Permission denied: apps/api/src/"

**Problem:** Insufficient file system permissions

**Solution:** Check directory permissions

**Example:**
```bash
# Check permissions
ls -la apps/api/src/

# Fix if needed (Unix/Mac)
chmod -R u+w apps/api/src/

# Windows: Run as Administrator
```

---

## Performance Issues

### ❌ "API response time > 1 second"

**Problem:** Missing database indexes on filtered columns

**Solution:** Add indexes to frequently queried columns

**Example:**
```python
# Add to SQLModel class
class Task(SQLModel, table=True):
    # ...
    user_id: UUID = Field(foreign_key="users.id", index=True)  # Add index
    status: str = Field(index=True)  # Add index
    created_at: datetime = Field(index=True)  # Add index
```

**Or add index in migration:**
```python
# Alembic migration
def upgrade():
    op.create_index('idx_tasks_user_id', 'tasks', ['user_id'])
    op.create_index('idx_tasks_status', 'tasks', ['status'])
```

### ❌ "N+1 query problem"

**Problem:** Loading related entities in loop

**Solution:** Use eager loading (joinedload)

**Example:**
```python
from sqlmodel import Session, select
from sqlalchemy.orm import joinedload

# Bad (N+1 queries)
tasks = session.exec(select(Task)).all()
for task in tasks:
    print(task.user.email)  # Triggers query for each task

# Good (1 query with join)
tasks = session.exec(
    select(Task).options(joinedload(Task.user))
).all()
for task in tasks:
    print(task.user.email)  # Already loaded
```

---

## Constitution Compliance Errors

### ❌ "Generated code doesn't emit events"

**Problem:** Event emitters not called in custom code

**Solution:** Always call event emitters after database operations

**Example:**
```python
# After creating entity
session.add(task)
session.commit()
session.refresh(task)

# Emit event
await emit_task_created(user_id, task)
```

### ❌ "User A can see User B's tasks"

**Problem:** Missing user_id filter in query

**Solution:** Always filter by user_id

**Example:**
```python
# Wrong:
tasks = session.exec(select(Task)).all()

# Correct:
tasks = session.exec(
    select(Task).where(Task.user_id == user_id)
).all()
```

---

## Getting Help

If issue persists:

1. **Check generated code:** Review scaffolded files for errors
2. **Check logs:** Backend logs (`render.com logs`) and browser console
3. **Test with curl:** Isolate frontend vs backend issues
4. **Check database:** Verify data with SQL query
5. **Review spec:** Ensure spec matches implementation

**Useful Commands:**
```bash
# Backend logs
tail -f apps/api/logs/app.log

# Database query
psql $DATABASE_URL -c "SELECT * FROM tasks LIMIT 10;"

# Test API
curl -X GET http://localhost:8000/docs

# Check migration state
alembic current
alembic history
```
