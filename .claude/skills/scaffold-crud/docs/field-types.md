# Field Types & Constraints Reference

Complete reference for field types and constraints supported by `/scaffold-crud`.

## Supported Field Types

### String Types

#### `str`
**PostgreSQL Type:** TEXT
**Python Type:** str
**TypeScript Type:** string

**Usage:**
```
title:str:required
description:str:optional
```

### Numeric Types

#### `int`
**PostgreSQL Type:** INTEGER
**Python Type:** int
**TypeScript Type:** number

**Usage:**
```
age:int:required
count:int:default=0
```

#### `float`
**PostgreSQL Type:** DOUBLE PRECISION
**Python Type:** float
**TypeScript Type:** number

**Usage:**
```
price:float:required
rating:float:optional
```

### Boolean Type

#### `bool`
**PostgreSQL Type:** BOOLEAN
**Python Type:** bool
**TypeScript Type:** boolean

**Usage:**
```
completed:bool:default=false
is_active:bool:required
```

### Date/Time Types

#### `datetime`
**PostgreSQL Type:** TIMESTAMPTZ (timestamp with timezone)
**Python Type:** datetime
**TypeScript Type:** string (ISO 8601)

**Usage:**
```
created_at:datetime:required
due_date:datetime:optional
```

**Note:** Always stored with timezone (UTC recommended)

### UUID Type

#### `uuid`
**PostgreSQL Type:** UUID
**Python Type:** UUID
**TypeScript Type:** string

**Usage:**
```
id:uuid:required
user_id:uuid:foreign_key=users.id
```

**Note:** Auto-generated for primary keys

### Array Types

#### `list[str]`
**PostgreSQL Type:** ARRAY(TEXT)
**Python Type:** List[str]
**TypeScript Type:** string[]

**Usage:**
```
tags:list[str]:optional
categories:list[str]:default=[]
```

#### `list[int]`
**PostgreSQL Type:** ARRAY(INTEGER)
**Python Type:** List[int]
**TypeScript Type:** number[]

**Usage:**
```
scores:list[int]:optional
```

### JSON Types

#### `jsonb`
**PostgreSQL Type:** JSONB
**Python Type:** dict
**TypeScript Type:** Record<string, any>

**Usage:**
```
config:jsonb:optional
metadata:jsonb:default={}
recurring_schedule:jsonb:optional
```

**Note:** JSONB is indexed and queryable (better than JSON)

---

## Supported Constraints

### `required`

**Effect:** NOT NULL constraint
**Usage:** Field must have a value

**Example:**
```
title:str:required
email:str:required
```

### `optional`

**Effect:** NULL allowed (default behavior)
**Usage:** Field can be empty

**Example:**
```
description:str:optional
due_date:datetime:optional
```

**Note:** This is the default, can be omitted

### `unique`

**Effect:** UNIQUE constraint
**Usage:** No duplicate values allowed

**Example:**
```
email:str:required:unique
username:str:required:unique
```

### `default=value`

**Effect:** Default value if not provided
**Usage:** Sets column default

**Examples:**
```
completed:bool:default=false
status:str:default=pending
count:int:default=0
tags:list[str]:default=[]
created_at:datetime:default=now
```

**Special defaults:**
- `now` - Current timestamp (for datetime fields)
- `uuid` - Generate new UUID (for uuid fields)
- `[]` - Empty array (for list fields)
- `{}` - Empty object (for jsonb fields)

### `foreign_key=table.column`

**Effect:** Foreign key constraint with CASCADE
**Usage:** References another table

**Examples:**
```
user_id:uuid:required:foreign_key=users.id
habit_id:uuid:foreign_key=habits.id
```

**Generated SQL:**
```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
```

### `enum=val1|val2|val3`

**Effect:** CHECK constraint for allowed values
**Usage:** Restrict field to specific values

**Examples:**
```
priority:str:enum=high|medium|low
status:str:enum=pending|in_progress|completed
completion_type:str:enum=full|two_minute
```

**Generated SQL:**
```sql
CHECK (priority IN ('high', 'medium', 'low'))
```

**Note:** Type must be `str` for enum constraints

### `index`

**Effect:** Creates database index
**Usage:** Speeds up queries on this field

**Example:**
```
email:str:required:unique:index
created_at:datetime:index
```

**Generated SQL:**
```sql
CREATE INDEX idx_users_email ON users(email);
```

---

## Constraint Combinations

### Common Patterns

**Required unique field:**
```
email:str:required:unique
```

**Optional foreign key:**
```
parent_id:uuid:optional:foreign_key=tasks.id
```

**Enum with default:**
```
status:str:enum=pending|active|completed:default=pending
```

**Indexed foreign key:**
```
user_id:uuid:required:foreign_key=users.id:index
```

**Array with default:**
```
tags:list[str]:default=[]
```

---

## Type Conversion Examples

### String Enum (Priority)
```
Input:  priority:str:enum=high|medium|low
Output: priority: Optional[str] = Field(None)
Check:  CHECK (priority IN ('high', 'medium', 'low'))
```

### Foreign Key (User ID)
```
Input:  user_id:uuid:required:foreign_key=users.id
Output: user_id: UUID = Field(foreign_key="users.id")
SQL:    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
```

### Array with Default
```
Input:  tags:list[str]:default=[]
Output: tags: List[str] = Field(default_factory=list)
SQL:    tags TEXT[] DEFAULT ARRAY[]::TEXT[]
```

### JSONB Config
```
Input:  config:jsonb:optional
Output: config: Optional[dict] = Field(default=None, sa_column=Column(JSONB))
SQL:    config JSONB
```

---

## Validation Rules

### String (`str`)
- Max length: 200 characters (can be overridden with `max_length` constraint)
- Empty strings allowed unless `required`

### Integer (`int`)
- Range: -2147483648 to 2147483647 (standard PostgreSQL INT)
- Use `bigint` for larger numbers (future enhancement)

### Float (`float`)
- PostgreSQL DOUBLE PRECISION
- 15 decimal digits precision

### Boolean (`bool`)
- Only `true` or `false`
- No NULL unless `optional`

### DateTime (`datetime`)
- Always stored with timezone (TIMESTAMPTZ)
- ISO 8601 format in API: `2026-01-03T10:30:00Z`
- Use UTC for storage

### UUID (`uuid`)
- Version 4 UUID (random)
- Format: `123e4567-e89b-12d3-a456-426614174000`

### Enum (`enum`)
- Case-sensitive
- Must be exact match
- Validated at API layer (Pydantic) and database layer (CHECK constraint)

---

## Future Enhancements

Planned for future versions:

- `bigint` - Large integers
- `decimal` - Precise decimal numbers
- `date` - Date without time
- `time` - Time without date
- `text_search` - Full-text search index
- `geo_point` - Geographic coordinates
- `max_length=N` - Custom string length limits
- `min_value=N`, `max_value=N` - Numeric range constraints
