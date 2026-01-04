# Parameters Reference

Complete parameter documentation for `/scaffold-crud` skill.

## Required Parameters

### `entity` (string)

**Description:** Entity name in PascalCase, singular form

**Examples:**
- `Task`
- `Habit`
- `HabitCompletion`
- `UserProfile`

**Rules:**
- Must be PascalCase (first letter uppercase)
- Must be singular (not `Tasks`, use `Task`)
- No special characters or spaces
- Will be converted to snake_case for table names

### `fields` (string)

**Description:** Comma-separated field definitions

**Format:** `field_name:type:constraint1:constraint2:...`

**Example:**
```
fields="title:str:required,priority:str:enum=high|medium|low,due_date:datetime:optional"
```

---

## Optional Parameters

### `relationships` (string)

**Description:** Defines relationships between entities

**Format:** `relationship_type:TargetEntity:foreign_key_field`

**Relationship Types:**
- `belongs_to` - Many-to-one (Task belongs to User)
- `has_many` - One-to-many (User has many Tasks)
- `has_one` - One-to-one

**Examples:**
```
relationships="belongs_to:User:user_id"
relationships="belongs_to:User:user_id,has_many:HabitCompletion:habit_id"
```

### `table_name` (string)

**Description:** Override default table name

**Default:** Lowercase plural of entity (Task → tasks)

**Example:**
```
table_name="task_items"
```

### `api_prefix` (string)

**Description:** API route prefix

**Default:** `/api/{user_id}`

**Example:**
```
api_prefix="/api/v1/{user_id}"
```

### `frontend_path` (string)

**Description:** Frontend source directory

**Default:** `apps/web/src`

**Example:**
```
frontend_path="frontend/src"
```

### `backend_path` (string)

**Description:** Backend source directory

**Default:** `apps/api/src`

**Example:**
```
backend_path="backend/src"
```

### `skip_frontend` (boolean)

**Description:** Skip React component generation

**Default:** `false`

**Example:**
```
skip_frontend=true
```

### `skip_backend` (boolean)

**Description:** Skip API endpoint generation

**Default:** `false`

**Example:**
```
skip_backend=true
```

### `user_scoped` (boolean)

**Description:** Add user_id foreign key and scope all queries by user

**Default:** `true`

**Example:**
```
user_scoped=false
```

---

## Field Syntax Details

### Basic Format

```
field_name:type:constraint
```

### Multiple Constraints

```
field_name:type:constraint1:constraint2:constraint3
```

### Examples

**Simple required field:**
```
title:str:required
```

**Unique email:**
```
email:str:required:unique
```

**Enum with default:**
```
status:str:enum=pending|in_progress|completed:default=pending
```

**Foreign key:**
```
user_id:uuid:required:foreign_key=users.id
```

**Optional array:**
```
tags:list[str]:optional
```

**JSONB config:**
```
settings:jsonb:optional
```

---

## Supported Types

See `docs/field-types.md` for complete type reference.

## Supported Constraints

See `docs/field-types.md` for complete constraint reference.
