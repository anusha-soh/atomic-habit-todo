---
description: Pre-implementation validation to catch common issues before coding. Auto-runs before sp.implement.
---

## User Input

```text
$ARGUMENTS
```

## Purpose

This skill validates the codebase for common issues BEFORE implementation begins. It catches:
- SQLModel field definition errors
- Import path inconsistencies
- Database compatibility issues
- TDD placeholder tests
- Missing environment configuration

## Outline

### Step 1: Run Prerequisites Check

Run `.specify/scripts/powershell/check-prerequisites.ps1 -Json` to get FEATURE_DIR.

### Step 2: Execute Preflight Validation Script

Run the validation script:
```bash
python .specify/scripts/python/preflight_validator.py --feature-dir <FEATURE_DIR>
```

If the script doesn't exist, perform manual checks (Step 3).

### Step 3: Manual Validation Checks

If script not available, perform these checks manually:

#### 3.1 SQLModel Field Validation

Search for problematic patterns in Python model files:

```
Pattern to FIND (ERROR): Field(nullable=*, sa_column=Column(
Pattern to FIND (ERROR): Field(max_length=*, sa_column=Column(
```

**Check**: `apps/api/src/models/*.py`

**Rule**: When using `sa_column=Column(...)`, put ALL column attributes inside Column():
```python
# BAD - Will cause RuntimeError
title: str = Field(nullable=False, sa_column=Column(Text))

# GOOD - All attributes in Column
title: str = Field(sa_column=Column(Text, nullable=False))
```

Report any violations found.

#### 3.2 Import Path Consistency

Search for inconsistent imports in `apps/api/src/`:

```
Pattern to FIND (ERROR): from services.
Pattern to FIND (ERROR): from models.
Pattern to FIND (ERROR): from routes.
Pattern to FIND (ERROR): from middleware.
Pattern to FIND (ERROR): from database import
```

**Rule**: All internal imports must use `src.` prefix:
```python
# BAD
from services.event_emitter import EventEmitter
from models.task import Task

# GOOD
from src.services.event_emitter import EventEmitter
from src.models.task import Task
```

Report any violations found.

#### 3.3 Database Compatibility Check

Search for PostgreSQL-specific types in models:

```
Patterns to FIND (WARNING):
- ARRAY(
- JSONB
- postgresql.
- gen_random_uuid()
```

**Check if**: `DATABASE_URL` or `TEST_DATABASE_URL` environment variable is set.

**Warning**: If PostgreSQL types found but no DATABASE_URL, tests will fail with SQLite.

#### 3.4 TDD Placeholder Detection

Search for unimplemented test placeholders:

```
Patterns to FIND (WARNING):
- assert False, "
- raise NotImplementedError
- pass  # TODO
- # Implementation will be added
```

**Location**: `apps/api/tests/**/*.py`

Report count of placeholders that need implementation.

#### 3.5 Environment Configuration

Check for required environment variables:

```
Required for full testing:
- DATABASE_URL or TEST_DATABASE_URL (for PostgreSQL tests)

Optional but recommended:
- NEXT_PUBLIC_API_URL (for frontend API calls)
```

### Step 4: Generate Report

Create a preflight report:

```
╔══════════════════════════════════════════════════════════════╗
║                    PREFLIGHT VALIDATION                       ║
╠══════════════════════════════════════════════════════════════╣
║ Feature: {feature_name}                                       ║
║ Date: {date}                                                  ║
╠══════════════════════════════════════════════════════════════╣

┌─────────────────────────────────────────────────────────────┐
│ CHECK                          │ STATUS  │ ISSUES          │
├─────────────────────────────────────────────────────────────┤
│ SQLModel Fields                │ ✓ PASS  │ 0               │
│ Import Consistency             │ ✗ FAIL  │ 3 violations    │
│ Database Compatibility         │ ⚠ WARN  │ PostgreSQL req  │
│ TDD Placeholders               │ ⚠ WARN  │ 5 placeholders  │
│ Environment Config             │ ✓ PASS  │ 0               │
└─────────────────────────────────────────────────────────────┘

CRITICAL ISSUES (must fix before implementation):
1. [IMPORT] apps/api/src/services/task_service.py:6
   - Found: from services.event_emitter import EventEmitter
   - Fix:   from src.services.event_emitter import EventEmitter

WARNINGS (should fix, won't block):
1. [DB] PostgreSQL-specific ARRAY type used, ensure DATABASE_URL is set
2. [TDD] 5 test placeholders need implementation after code is written

╚══════════════════════════════════════════════════════════════╝
```

### Step 5: Decision Point

Based on results:

**If CRITICAL issues found (FAIL status)**:
- Display all critical issues with file:line references
- Display fix suggestions
- Ask: "Critical issues found. Fix them before proceeding? (yes/no)"
- If yes: Attempt auto-fix for known patterns
- If no: Halt and let user fix manually

**If only WARNINGS found**:
- Display warnings
- Automatically proceed (warnings don't block)

**If all PASS**:
- Display "✓ All preflight checks passed"
- Automatically proceed

### Step 6: Auto-Fix Capability

For certain issues, offer automatic fixes:

#### Import Path Fixes
```python
# Auto-fix: Add 'src.' prefix to internal imports
# Before: from services.x import Y
# After:  from src.services.x import Y
```

#### SQLModel Field Fixes
```python
# Auto-fix: Move nullable into Column
# Before: Field(nullable=False, sa_column=Column(Text))
# After:  Field(sa_column=Column(Text, nullable=False))
```

After auto-fix, re-run validation to confirm fixes.

---

## Integration with sp.implement

This skill is designed to run automatically at the START of `/sp.implement`.

When `/sp.implement` is invoked:
1. First run `/sp.preflight`
2. If preflight passes → continue with implementation
3. If preflight fails → stop and require fixes

---

## Standalone Usage

Run preflight independently:
```
/sp.preflight
/sp.preflight --auto-fix
/sp.preflight --feature 002-phase2-chunk2
```

---

## Output

After completion, save the preflight report to:
`specs/{feature}/preflight-report.md`

This provides a record of what was checked before implementation.
