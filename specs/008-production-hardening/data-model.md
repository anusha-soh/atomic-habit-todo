# Data Model: Production Hardening

**Feature**: 008-production-hardening
**Phase**: 1 — Design
**Date**: 2026-02-21

---

## No Schema Changes Required

All hardening fixes work with the existing database schema. The 5 migrations already applied remain unchanged.

---

## New Frontend State Entities

### UserContext (Frontend Only)

Shared React context that replaces per-page `authAPI.me()` calls.

```typescript
interface UserContextValue {
  user: User | null        // null while loading or unauthenticated
  isLoading: boolean       // true during initial auth check
  error: string | null     // error message if auth check failed
  refetch: () => Promise<void>  // manual refresh after login
}
```

**Source of truth**: `/api/auth/me` response, cached in React context
**Lifetime**: App mount → unmount (lost on page refresh — acceptable; re-fetched on mount)

---

## Modified API Response Shapes

### PATCH `/{user_id}/tasks/{task_id}/complete` — Enhanced Response

The existing `habit_sync` field in the response is extended to carry error detail:

```typescript
// Current (inferred from route code)
interface CompleteTaskResponse {
  task: Task
  habit_sync: {
    synced: boolean
    habit_id?: string
    new_streak?: number
  }
}

// After fix — same shape, populated on failure
interface CompleteTaskResponse {
  task: Task
  habit_sync: {
    synced: boolean          // false on failure
    habit_id?: string
    new_streak?: number
    error?: string           // NEW: human-readable error on sync failure
  }
}
```

**No breaking change** — `error` field is optional and additive.

---

## New Response Shape: Health Endpoint

```typescript
// GET /health
interface HealthResponse {
  status: 'healthy' | 'unhealthy'
  database: 'connected' | 'disconnected'
  version: string    // "1.0.0"
  uptime_seconds: number
}
```

**HTTP status**: 200 when healthy, 503 when unhealthy.

---

## New Frontend Component State

### ErrorBoundary (uses Next.js `error.tsx` pattern)

```typescript
// Per-route error.tsx — no custom class component needed
// Next.js App Router handles this natively
interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void    // retry callback
}
```

### TaskFilters (Extended — Search Field)

```typescript
// Extends existing filter state in tasks/page.tsx
interface TaskFilters {
  status?: string
  priority?: string
  tags?: string[]
  search?: string     // NEW: keyword search
  page?: number
  limit?: number
}
```

**URL param**: `?search=keyword` — server component reads via `searchParams`

### TagAutocomplete (New UI element in TaskForm)

```typescript
interface TagInputState {
  inputValue: string       // current typed text
  suggestions: string[]    // from getTags() API
  selectedTags: string[]   // confirmed tags
}
```

---

## Validation Rules (Backend Schema Changes)

### TaskUpdateRequest — Add Missing Validations

```python
class TaskUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = Field(None, max_length=5000)  # enforce on update too
    status: Optional[TaskStatus] = None      # Pydantic enum — already validates on create
    priority: Optional[TaskPriority] = None  # already validates
    # ... rest unchanged
```

**Change**: `description` on update now has `max_length=5000` (currently unconstrained).
`status` and `priority` using Pydantic enum types already auto-validates — verify schema uses the enum type, not raw `str`.

### HabitUpdateRequest — Category Enum Validation

```python
class HabitUpdateRequest(BaseModel):
    category: Optional[HabitCategory] = None  # use enum type, not Optional[str]
    # ... rest unchanged
```

---

## Rate Limiter Configuration

```python
# In-memory, per-IP limits using slowapi
RATE_LIMITS = {
    "login": "10/minute",
    "register": "5/5minute",
}
```

No database storage. Resets on server restart (acceptable for current single-instance deployment).

---

## Existing Entities (Unchanged)

| Entity | Table | Changes |
|--------|-------|---------|
| User | `users` | None |
| Session | `sessions` | None |
| Task | `tasks` | None |
| Habit | `habits` | None |
| HabitCompletion | `habit_completions` | None |
