# Backend Architectural Patterns

## Data Modeling (SQLModel)
All models MUST follow these conventions to maintain compatibility with the existing PostgreSQL (Neon) schema and Alembic migrations.

### Schema Requirements
- **Primary Keys:** Always `UUID` using `uuid4` default.
- **Foreign Keys:** Use `user_id: UUID = Field(foreign_key="users.id", index=True)`.
- **Timestamps:** Use `datetime` with `timezone.utc` and `func.now()`.
- **Isolation:** Every table MUST have a `user_id` to ensure strict multi-tenant isolation.

### Code Snippet: Standard Model
```python
from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime, timezone
from typing import Optional

class Habit(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    name: String = Field(index=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
```

## API Layer (FastAPI)
- **Dependency:** Use `db: Session = Depends(get_session)`.
- **Authentication:** Depend on `user_id: UUID = Depends(get_current_user_id)`.
- **Response Schemas:** Always return Pydantic models with `from_attributes=True`.
- **Error Handling:** Raise `HTTPException` with detail messages that the frontend can parse.

### Route Isolation Pattern
```python
@router.get("/{habit_id}", response_model=HabitResponse)
def get_habit(habit_id: UUID, user_id: UUID = Depends(get_current_user_id)):
    # Always filter by BOTH id AND user_id
    habit = db.exec(select(Habit).where(Habit.id == habit_id, Habit.user_id == user_id)).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit
```
