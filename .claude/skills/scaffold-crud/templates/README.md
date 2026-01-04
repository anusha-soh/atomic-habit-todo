# Code Templates

This directory contains code templates used by `/scaffold-crud` skill.

Templates are referenced by the skill but kept separate to:
- **Save tokens** - Main SKILL.md stays concise
- **Enable updates** - Templates can be versioned independently
- **Support customization** - Users can modify templates for their needs

## Template Files

**Planned templates (to be created):**
- `sqlmodel.template.py` - SQLModel database schema
- `fastapi.template.py` - FastAPI route handlers
- `pydantic.template.py` - Pydantic request/response models
- `events.template.py` - Event emitter functions
- `react.template.tsx` - React component structure
- `typescript.template.ts` - TypeScript type definitions
- `migration.template.py` - Alembic migration structure

## Template Variables

Templates use placeholder variables that get replaced during generation:

- `{{ENTITY_NAME}}` - PascalCase entity name (e.g., Task)
- `{{ENTITY_LOWER}}` - lowercase entity name (e.g., task)
- `{{ENTITY_SNAKE}}` - snake_case entity name (e.g., task_item)
- `{{TABLE_NAME}}` - Database table name (e.g., tasks)
- `{{FIELDS}}` - Field definitions
- `{{RELATIONSHIPS}}` - Relationship definitions
- `{{TIMESTAMP}}` - Generation timestamp
- `{{USER_SCOPED}}` - Boolean for user scoping

## Template Example

```python
# sqlmodel.template.py
from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime

class {{ENTITY_NAME}}(SQLModel, table=True):
    __tablename__ = "{{TABLE_NAME}}"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    {{#if USER_SCOPED}}
    user_id: UUID = Field(foreign_key="users.id", nullable=False)
    {{/if}}
    {{FIELDS}}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

## Future Enhancements

- Template customization via config file
- Multiple template themes (REST vs GraphQL vs tRPC)
- User-defined custom templates
- Template validation and linting
