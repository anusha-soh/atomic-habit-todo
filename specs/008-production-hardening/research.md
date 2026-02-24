# Research: Production Hardening & Quality Fixes

**Feature**: 008-production-hardening
**Phase**: 0 — Research & Unknowns Resolution
**Date**: 2026-02-21

---

## 1. API URL Normalization

### Decision
Standardize all three frontend API clients to use `NEXT_PUBLIC_API_URL` as the base (with `/api` suffix stripped), then each client builds its own paths with the `/api/` prefix inline.

### Current State (Exact Lines)
| File | Line | Current Value | Problem |
|------|------|--------------|---------|
| `apps/web/src/lib/api.ts` | 6 | `http://localhost:8000` | Auth routes add `/api/auth/login` directly — works today |
| `apps/web/src/lib/tasks-api.ts` | 15 | `http://localhost:8000/api` | Tasks append `/${userId}/tasks` — works today |
| `apps/web/src/lib/habits-api.ts` | 19 | `http://localhost:8000` | Habits add `/api/${userId}/habits` — works today |

### Rationale
The cleanest fix is to define a single `API_BASE` constant exported from `api.ts`:
```typescript
// api.ts
export const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/$/, '')
```
Then each client constructs: `${API_BASE}/api/auth/...`, `${API_BASE}/api/${userId}/tasks`, etc.
This handles trailing slashes and env var configuration uniformly.

### Alternatives Considered
- **Keep three separate definitions**: Simple but error-prone — already diverged
- **Proxy through Next.js `/api` routes**: Adds complexity, changes CORS model
- **Move to SWR/React Query**: Overcomplicated for this fix; keep fetch-based approach

---

## 2. Middleware Route Protection Fix

### Decision
Extend `middleware.ts` matcher to include `/tasks`, `/habits`, and their sub-routes. Replace the cookie presence check with an actual JWT decode/verify using the Web Crypto API available in the Edge runtime.

### Current State
```typescript
// middleware.ts line 13 — only checks cookie existence
const hasAuthToken = request.cookies.has('auth_token')
// middleware.ts line 37 — matcher only covers /dashboard
matcher: ['/dashboard/:path*', '/login', '/register']
```

### Rationale
- `/tasks` and `/habits` routes are unprotected — unauthenticated users reach them
- The tasks page has a hardcoded `'test-user-id'` fallback for when the session is missing
- Fix: expand matcher + redirect to login when `auth_token` cookie absent
- Token signature validation in middleware requires Edge-compatible crypto (available in Next.js middleware)

### Alternatives Considered
- **Server-side check per page**: Already attempted with `cookies()` in `tasks/page.tsx` but left with dev fallback
- **API-level auth check**: Already exists but frontend still renders before the API call fails

---

## 3. Habit Sync Error Handling

### Decision
Replace the bare `except Exception: pass` in `complete_task` route with structured logging and a partial-success response. The task completion always succeeds; habit sync failure is communicated to the frontend as a non-fatal warning.

### Current State (`apps/api/src/routes/tasks.py` lines 406-408)
```python
except Exception:
    # Graceful degradation: task completes even if habit sync fails
    pass
```

### Rationale
The response object at line 329 already has a `habit_sync` field. We should:
1. Log the exception using `logger.warning()` with full traceback
2. Set `habit_sync.synced = False` with an error message
3. Return 200 (task complete) but with `habit_sync.synced = False` so frontend knows

### Alternatives Considered
- **Raise exception / 500**: Task completion is the primary action — shouldn't fail for sync
- **Background retry queue**: Over-engineering for current scale; simple logging suffices
- **Database transaction rollback**: Would undo task completion — wrong behavior

---

## 4. EventEmitter Logging

### Decision
Replace `print()` with `logger.warning()` using Python's `logging` module. Add a failure counter (module-level int) that escalates to `logger.error()` after 3 failures within a session.

### Current State (`apps/api/src/services/event_emitter.py` line 76)
```python
print(f"[EventEmitter] Failed to write event: {e}")
```

### Rationale
- `print()` goes to stdout, which may or may not be captured by the log aggregator
- Python `logging` is always captured and can be configured with handlers
- Failure counter pattern is low-cost and doesn't require external dependencies

### Alternatives Considered
- **Sentry/external error tracking**: Valid for production but adds a new dependency
- **Retry with backoff**: Good but complicates fire-and-forget model; deferred

---

## 5. Health Endpoint Real DB Check

### Decision
Execute `SELECT 1` via SQLAlchemy in a try/except. Return `{"status": "healthy", "database": "connected"}` on success, `{"status": "unhealthy", "database": "disconnected"}` with HTTP 503 on failure.

### Current State (`apps/api/src/main.py` line 113)
```python
"database": "connected",  # TODO: Add actual database health check
```

### Rationale
- Monitoring tools (Render, UptimeRobot) call `/health` to determine restart decisions
- Hardcoded "connected" means a DB outage goes undetected until users report it
- `SELECT 1` is the lightest possible DB probe; negligible overhead

### Alternatives Considered
- **Full DB stats query**: More info but slower; not needed for liveness probe
- **Connection pool check**: Lower-level but requires SQLAlchemy internals

---

## 6. Rate Limiting on Auth Endpoints

### Decision
Use `slowapi` (built on `limits` library) with an in-memory store. Apply:
- Login: 10 attempts per minute per IP
- Register: 5 attempts per 5 minutes per IP
- Return 429 with `Retry-After` header

### Rationale
- `slowapi` is the standard FastAPI rate limiting library; minimal integration overhead
- In-memory store acceptable for single-instance deployment (current scale)
- No external dependencies (Redis) needed for this phase

### Dependency Addition
```
slowapi>=0.1.9
```

### Alternatives Considered
- **Redis + redis-py**: Distributed rate limiting — appropriate for Phase V multi-instance
- **Custom middleware**: More control but requires reimplementing well-solved problems
- **Nginx rate limiting**: Infrastructure-level, not in scope for this fix

---

## 7. React Error Boundaries

### Decision
Create a class-based `ErrorBoundary` component (React requires class components for error boundaries) with a notebook-aesthetic fallback UI. Place it in `src/components/ui/error-boundary.tsx`. Wrap page layouts in the root layout.

### Rationale
- React 18 still requires class components for `componentDidCatch`
- The `react-error-boundary` package provides a functional wrapper — evaluate if already installed
- Wrap at the layout level (not per-page) to catch all component errors

### Alternatives Considered
- **`react-error-boundary` npm package**: Clean but adds a dependency; React's built-in pattern is sufficient
- **Per-page error.tsx (Next.js App Router)**: Next.js provides `error.tsx` per segment — use this instead of a custom class component

---

## 8. UserContext / Auth Provider

### Decision
Create `src/contexts/user-context.tsx` — a client Context that calls `authAPI.me()` once on mount, stores `{user, isLoading, error}`, and exposes a `useUser()` hook. Add `UserProvider` to the root layout wrapping all protected pages.

### Current State
Each protected page independently calls `authAPI.me()` or reads from cookies. The tasks page uses server-side cookies but has the hardcoded fallback. Dashboard and habit pages are client components that fetch on mount.

### Rationale
- One fetch per app mount instead of one per page navigation
- Centralizes auth state for consistent behavior
- Compatible with existing httpOnly cookie auth (client-side fetch to `/api/auth/me`)

### Alternatives Considered
- **Server-side auth via middleware**: Better for SSR but complex to implement without breaking existing patterns
- **Next.js `use server` with cache**: Deferred — requires architectural refactoring

---

## 9. Input Validation Consistency (Backend)

### Decision
Add Pydantic `field_validator` on update schemas to validate `status`, `priority`, and `category` enum values. Add `description` max length validation on update.

### Current State
- `TaskUpdateRequest` schema does NOT validate status enum on PATCH
- `HabitUpdateRequest` schema does NOT validate category enum on PATCH
- `tasks.py:266` manually checks priority but not status

### Alternatives Considered
- **Database-level check constraints**: Already exist (migration 002) but DB errors return 500 not 400
- **Runtime isinstance check in route**: Less clean than schema validation

---

## 10. Search UI & Tag Autocomplete

### Decision
- Add a search `<input>` to `apps/web/src/app/tasks/page.tsx` (server component) that sets `?search=` URL param
- Add tag suggestions to `TaskForm.tsx` by fetching from `getTags()` on mount and filtering client-side on input
- Debounce search input (300ms) using `useTransition` or a simple `setTimeout` ref

### Current State
- Backend: `getTasks()` accepts `search` param and does ILIKE title/description search
- Backend: `getTags()` endpoint exists and returns unique user tags
- Frontend: Neither feature has UI

### Alternatives Considered
- **Server-side tag suggestions**: Overkill for autocomplete; all tags loaded once per form session
- **Dedicated search page**: Future enhancement; inline search sufficient for now

---

## 11. CORS Header Restriction

### Decision
Replace `allow_headers=["*"]` with explicit list: `["Content-Type", "Authorization", "X-Requested-With"]`.

### Rationale
Principle of least privilege. Wildcard headers allow any custom header, which could be exploited in certain CSRF configurations.

---

## 12. Timezone Standardization (Backend)

### Decision
Replace `datetime.now().astimezone().tzinfo` with `timezone.utc` in `streak_calculator.py`. Standardize all `datetime.now()` calls across backend to `datetime.now(timezone.utc)`.

### Current State (streak_calculator.py lines 56, 136)
```python
datetime.now().astimezone().tzinfo  # Local system timezone — non-deterministic in production
```

---

## 13. Password Confirmation Field (Frontend)

### Decision
Add a `confirmPassword` field to `RegisterForm.tsx` with client-side validation that checks `password === confirmPassword` before submission. No backend changes needed.

---

## 14. Debouncing & Optimistic Updates

### Decision
- **Debouncing**: Use `useEffect` + `setTimeout` ref pattern (no new library) for habits filter changes (300ms delay)
- **Optimistic updates**: For task complete/delete in `TaskCard.tsx`, use local state update immediately, then call API, rollback on failure

---

## 15. E2E Tests (Playwright)

### Decision
Install Playwright in `apps/web`. Write tests for:
1. Full registration → login → create task → complete task flow
2. Create habit → complete habit → verify streak increment
3. Landing page CTA links
4. 404 page and error boundary display

### Current State
Playwright skill exists in `.claude/skills/playwright-skill/` but no `playwright.config.ts` in `apps/web`.

---

## Summary: New Dependencies

| Layer | Package | Version | Purpose |
|-------|---------|---------|---------|
| Backend | `slowapi` | `>=0.1.9` | Rate limiting |
| Frontend | `@playwright/test` | `latest` | E2E testing |
| Frontend | None | — | Error boundary (native React) |
| Frontend | None | — | Debounce (setTimeout pattern) |
