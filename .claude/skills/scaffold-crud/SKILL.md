---
name: scaffold-crud
description: Scaffolds complete CRUD API + frontend for an entity (database schema, API routes, React components, events)
version: 1.0.0
author: Phase 2 Atomic Habits Project
tags: [crud, api, frontend, backend, generator, boilerplate]
---

# Skill: Scaffold CRUD

Generate 80% of CRUD boilerplate code for any entity following project constitution patterns.

## Quick Start

```bash
/scaffold-crud entity=Task fields="title:str:required,description:str:optional,priority:str:enum=high|medium|low"
```

## What This Generates

- ✅ SQLModel database schema with constraints
- ✅ FastAPI CRUD endpoints (list, get, create, update, delete)
- ✅ Pydantic request/response models
- ✅ Event emitters (ENTITY_CREATED, ENTITY_UPDATED, ENTITY_DELETED)
- ✅ React components (list, card, form, detail pages)
- ✅ TypeScript types
- ✅ Alembic migration file

## Parameters

**Required:**
- `entity` - Entity name (PascalCase, singular)
- `fields` - Comma-separated field definitions

**Optional:**
- `relationships` - Relationship definitions
- `user_scoped` - Add user_id scoping (default: true)
- `skip_frontend` - Skip React generation (default: false)
- `skip_backend` - Skip API generation (default: false)

📖 **Full parameter reference:** See `parameters.md`

## Field Syntax

Format: `field_name:type:constraints`

**Common examples:**
```
title:str:required
email:str:required:unique
priority:str:enum=high|medium|low
user_id:uuid:foreign_key=users.id
tags:list[str]:optional
due_date:datetime:optional
```

📖 **All supported types & constraints:** See `docs/field-types.md`

## Output Structure

### Backend Files
```
apps/api/src/
├── models/{entity}.py              # SQLModel schema
├── schemas/{entity}.py             # Pydantic models
├── routes/{entity}.py              # FastAPI endpoints
└── events/{entity}_events.py       # Event emitters
```

### Frontend Files
```
apps/web/src/
├── types/{entity}.ts               # TypeScript types
├── components/
│   ├── {entity}-list.tsx
│   ├── {entity}-card.tsx
│   └── {entity}-form.tsx
└── pages/{entity-plural}/
    ├── index.tsx
    └── [id].tsx
```

## Usage Examples

### Example 1: Simple Task Entity
```bash
/scaffold-crud entity=Task fields="title:str:required,description:str:optional,completed:bool:default=false"
```

### Example 2: Habit with Relationships
```bash
/scaffold-crud entity=Habit fields="identity_statement:str:required,two_minute_version:str:required,category:str:enum=Health|Productivity|Mindfulness,current_streak:int:default=0" relationships="belongs_to:User:user_id,has_many:HabitCompletion:habit_id"
```

### Example 3: Complex HabitCompletion
```bash
/scaffold-crud entity=HabitCompletion fields="habit_id:uuid:foreign_key=habits.id,completion_type:str:enum=full|two_minute,completed_at:datetime:required" relationships="belongs_to:Habit:habit_id" user_scoped=true
```

📖 **More examples with customization:** See `examples.md`

## Generated Code Templates

The skill uses these templates (reference only, auto-applied):
- 📄 `templates/sqlmodel.template.py` - Database model
- 📄 `templates/fastapi.template.py` - API routes
- 📄 `templates/react.template.tsx` - React components
- 📄 `templates/events.template.py` - Event emitters

## Execution Flow

1. **Parse parameters** - Validate entity name and field definitions
2. **Generate SQLModel schema** - Using `templates/sqlmodel.template.py`
3. **Generate FastAPI routes** - Using `templates/fastapi.template.py`
4. **Generate Pydantic models** - Request/response schemas
5. **Generate event emitters** - CRUD events with proper schema
6. **Generate React components** - Using `templates/react.template.tsx`
7. **Generate TypeScript types** - Matching backend models
8. **Create Alembic migration** - Table creation with constraints
9. **Summary report** - List all generated files

## Constitution Compliance

Automatically enforces:
- ✅ Modular Architecture (Principle III)
- ✅ Event-Driven Design (Principle IV)
- ✅ Database as Source of Truth (Principle VI)
- ✅ API-First Architecture (Principle VIII)
- ✅ No Hardcoded Config (Principle XI)
- ✅ Composition Over Inheritance (Principle XII)

## Customization After Scaffolding

**Backend:**
- Add business logic to service layer
- Enhance validation rules
- Add custom query filters (search, date ranges)

**Frontend:**
- Apply Chunk 6 design system (cozy notebook styling)
- Add filtering/sorting UI
- Implement optimistic updates

**Events:**
- Add event subscribers for cross-module communication
- Enrich payloads with context

## Workflow Integration

**Step 1:** After spec approval, identify entities
```
Chunk 2: Task
Chunk 3: Habit
Chunk 4: HabitCompletion
```

**Step 2:** Run scaffold command
```bash
/scaffold-crud entity=Task fields="..."
```

**Step 3:** Review generated files
- Verify schema matches spec
- Check API endpoints complete

**Step 4:** Run migration
```bash
alembic upgrade head
```

**Step 5:** Test endpoints
- Open `/docs` for Swagger UI
- Test CRUD operations

**Step 6:** Customize as needed
- Add business logic
- Style components

## Error Handling

Common errors and solutions:

❌ **"Invalid field type"**
→ Check `docs/field-types.md` for supported types

❌ **"Foreign key constraint fails"**
→ Ensure referenced table exists, run migrations in order

❌ **"Files already exist"**
→ Skill will ask to overwrite or skip

📖 **Full troubleshooting guide:** See `docs/troubleshooting.md`

## Limitations

**Does NOT generate:**
- Complex business logic (streak calculation, recurring tasks)
- Many-to-many relationships (requires manual junction table)
- File upload handling
- WebSocket/real-time features

Use this skill as a starting point, then add custom code.

## Related Skills

- `/generate-migration` - Create Alembic migration
- `/add-api-endpoint` - Add custom endpoints
- `/create-react-component` - Generate individual components
- `/validate-constitution` - Verify compliance

## Next Steps After Running

1. ✅ Review generated files
2. ✅ Run migration: `alembic upgrade head`
3. ✅ Test API: Visit `/docs`
4. ✅ Customize business logic
5. ✅ Style components (Chunk 6)
6. ✅ Add tests

---

**Quick Links:**
- 📖 [Parameters Reference](./parameters.md)
- 📖 [Usage Examples](./examples.md)
- 📖 [Field Types Guide](./docs/field-types.md)
- 📖 [Troubleshooting](./docs/troubleshooting.md)
- 📄 [SQLModel Template](./templates/sqlmodel.template.py)
- 📄 [FastAPI Template](./templates/fastapi.template.py)
- 📄 [React Template](./templates/react.template.tsx)
