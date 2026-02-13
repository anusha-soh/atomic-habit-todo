# API Consistency Guardian Memory

## Run Log
| Date | Scope | Endpoints audited | PASS | FAIL | WARN | New patterns found |
|------|-------|-------------------|------|------|------|--------------------|
| 2026-02-13 | entire project | 27 checks | 15 | 7 | 5 | 6 |

## Known Patterns

### Pattern: Contract error shape diverges from FastAPI default
- When: Contracts written early use {"error": str} but FastAPI always returns {"detail": str}
- How to detect: grep contracts for `error:` in error response schemas; grep backend for HTTPException
- Fix template: Update contract error schemas to use `detail` field
- Confidence: HIGH (confirmed in auth + tasks contracts)
- First seen: 2026-02-13 full project audit

### Pattern: Cookie name mismatch across contracts
- When: Multiple contracts reference the auth cookie but use different names
- How to detect: grep contracts for `in: cookie` and compare `name:` values
- Fix template: Standardise to `auth_token` (what the backend actually sets)
- Confidence: HIGH (found in tasks contract: `session_token` vs actual `auth_token`)
- First seen: 2026-02-13 full project audit

### Pattern: DELETE status code — contract says 200, backend returns 204
- When: Contract documents a 200 with body for DELETE endpoints; REST convention and backend use 204 No Content
- How to detect: check contracts for DELETE responses with 200; check backend for status_code=204
- Fix template: Update contract to 204, remove body schema from delete response
- Confidence: HIGH (habits delete: contract=200, backend=204)
- First seen: 2026-02-13 full project audit

### Pattern: Auth surface has no typed frontend consumer
- When: Backend auth routes exist but no apps/web/src/lib/auth-api.ts or apps/web/src/types/auth.ts
- How to detect: glob apps/web/src/lib/auth*.ts — if missing, flag
- Fix template: Generate auth-api.ts + auth.ts from contract
- Confidence: HIGH (confirmed missing in this project)
- First seen: 2026-02-13 full project audit

### Pattern: Undocumented convenience endpoints (archive/restore)
- When: Backend has POST /archive and POST /restore but contract only documents PATCH with status field
- How to detect: grep routes.py for archive/restore; grep contracts for same
- Fix template: Either add to contract or remove in favour of PATCH pattern
- Confidence: MEDIUM (design decision required)
- First seen: 2026-02-13 full project audit

### Pattern: Tags endpoint undocumented
- When: GET /tasks/tags is implemented + used by frontend but absent from contract
- How to detect: grep routes for tags; grep contracts for tags
- Fix template: Add tags endpoint to tasks contract YAML
- Confidence: HIGH (confirmed missing)
- First seen: 2026-02-13 full project audit

## False Positives

### False Positive: snake_case in TypeScript — intentional project convention
- This project uses snake_case throughout TypeScript (not camelCase)
- Do NOT flag snake_case field names in .ts files as a naming violation
- Confirmed: habit.ts, task.ts all use snake_case to match API responses directly
- First confirmed: 2026-02-13

## Project Conventions

### Convention: Route mounting
- Auth routes: mounted at /api/auth (prefix in main.py)
- Tasks + Habits routes: mounted at /api (no sub-prefix)
- All user-scoped routes use /{user_id}/ path parameter

### Convention: Auth mechanism
- httpOnly cookie named `auth_token` (JWT)
- Frontend sends `credentials: 'include'` on all API calls
- Dependency injected via `get_current_user_id` from `src.middleware.auth`

### Convention: Error format
- FastAPI default: `{"detail": str}` — this is what backend returns
- Habits contract (003, 004) correctly documents this
- Auth (001) and tasks (002) contracts need updating to match

### Convention: Response shapes
- Single resource: flat object
- List resources: `{resource_name: [], total: int, page: int, limit: int}`
- Completions list exception: `{completions: [], total: int}` (no pagination params)
- Delete operations: 204 No Content (no response body)
- Create operations: 201 Created with full resource object

### Convention: Import paths (Python)
- All internal imports use `src.` prefix: `from src.models.habit import Habit`
- Never use relative or bare module imports

### Convention: SQLModel field definitions
- ALL column attributes go inside Column(): `Field(sa_column=Column(Text, nullable=False))`
- NEVER combine: `Field(nullable=False, sa_column=Column(Text))` — causes RuntimeError

### Convention: Test prerequisites
- Tests require PostgreSQL (not SQLite) — ARRAY and JSONB columns fail on SQLite
- Set DATABASE_URL or TEST_DATABASE_URL env var before running tests
- Fixtures in apps/api/tests/conftest.py skip automatically without DB URL
