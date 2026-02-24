# Quickstart: Production Hardening

**Feature**: 008-production-hardening
**Branch**: 007-landing-page-update (no new branch)

## What This Fixes

35 issues in 4 phases — run `/sp.tasks` to generate the full task breakdown.

## Phase Overview

| Phase | Focus | Files Changed | Tests |
|-------|-------|--------------|-------|
| 1 | Critical Fixes | 5 files | 4 new unit tests |
| 2 | Reliability & Security | 10 files | 8 new unit/integration tests |
| 3 | Feature Completeness | 6 files | 6 new unit tests |
| 4 | QA & E2E | 5 new test files | 20+ E2E scenarios |

## Quick Reference: What Changed & Where

### Backend Changes

| Fix | File | Line | Change |
|-----|------|------|--------|
| Habit sync error | `apps/api/src/routes/tasks.py` | 406-408 | `except Exception as e: logger.warning(...)` |
| Real health check | `apps/api/src/main.py` | 108-115 | `SELECT 1` query |
| Rate limiting | `apps/api/src/main.py` | 82+ | `slowapi` middleware |
| Rate limits on auth | `apps/api/src/routes/auth.py` | login/register | `@limiter.limit(...)` |
| EventEmitter logging | `apps/api/src/services/event_emitter.py` | 76 | `logger.warning()` |
| CORS headers | `apps/api/src/main.py` | 92 | `allow_headers=[specific list]` |
| Enum validation | `apps/api/src/routes/tasks.py` | 266 | Use Pydantic enum type |
| Enum validation | `apps/api/src/routes/habits.py` | 111 | Use Pydantic enum type |
| Timezone fix | `apps/api/src/services/streak_calculator.py` | 56, 136 | `timezone.utc` |

### Frontend Changes

| Fix | File | Change |
|-----|------|--------|
| API base URL | `apps/web/src/lib/api.ts` | Export `API_BASE` constant |
| API base URL | `apps/web/src/lib/tasks-api.ts` | Import `API_BASE` from api.ts |
| API base URL | `apps/web/src/lib/habits-api.ts` | Import `API_BASE` from api.ts |
| Remove test-user-id | `apps/web/src/app/tasks/page.tsx` | `redirect('/login')` when no session |
| Protect routes | `apps/web/src/middleware.ts` | Add `/tasks/:path*`, `/habits/:path*` to matcher |
| UserContext | `apps/web/src/contexts/user-context.tsx` | NEW file |
| Layout providers | `apps/web/src/app/layout.tsx` | Add `<UserProvider>` |
| Error boundaries | `apps/web/src/app/*/error.tsx` | 4 new error.tsx files |
| Loading states | `apps/web/src/app/habits/loading.tsx` | NEW file |
| Search UI | `apps/web/src/app/tasks/page.tsx` | Search input + URL param |
| Tag autocomplete | `apps/web/src/components/tasks/TaskForm.tsx` | getTags() + dropdown |
| Filter debounce | `apps/web/src/app/habits/page.tsx` | 300ms setTimeout |
| Optimistic updates | `apps/web/src/components/tasks/TaskCard.tsx` | Local state first |
| Password confirm | `apps/web/src/components/RegisterForm.tsx` | confirmPassword field |

### New Files

| File | Purpose |
|------|---------|
| `apps/web/src/contexts/user-context.tsx` | Shared auth state |
| `apps/web/src/app/error.tsx` | Root error boundary |
| `apps/web/src/app/tasks/error.tsx` | Tasks error boundary |
| `apps/web/src/app/habits/error.tsx` | Habits error boundary |
| `apps/web/src/app/dashboard/error.tsx` | Dashboard error boundary |
| `apps/web/src/app/habits/loading.tsx` | Habits loading skeleton |
| `apps/web/playwright.config.ts` | Playwright configuration |
| `apps/web/e2e/auth.spec.ts` | Auth E2E tests |
| `apps/web/e2e/tasks.spec.ts` | Tasks E2E tests |
| `apps/web/e2e/habits.spec.ts` | Habits E2E tests |
| `apps/web/e2e/landing.spec.ts` | Landing page E2E tests |

## Running Tests

```bash
# Backend unit + integration tests
cd apps/api && pytest

# Frontend unit tests
cd apps/web && pnpm test

# E2E tests (requires dev server running)
cd apps/web && pnpm exec playwright test

# Run both dev servers
pnpm dev
```

## Installing New Dependency (Rate Limiting)

```bash
# Backend — add to pyproject.toml
cd apps/api
uv add slowapi

# Frontend — Playwright
cd apps/web
pnpm add -D @playwright/test
npx playwright install chromium
```

## Acceptance Verification

After all phases complete, run this checklist:

```bash
# 1. Habit sync error handling
curl -X PATCH http://localhost:8000/api/{user_id}/tasks/{task_id}/complete \
  -H "Cookie: auth_token=<token>"
# Expect: habit_sync.synced present in response

# 2. Real health check
curl http://localhost:8000/health
# Expect: {"status":"healthy","database":"connected","version":"1.0.0","uptime_seconds":N}

# 3. Rate limiting
for i in {1..12}; do curl -X POST http://localhost:8000/api/auth/login -d '{"email":"x","password":"wrong"}'; done
# Expect: 429 after 10 attempts

# 4. Protected routes
curl http://localhost:3000/tasks
# Expect: redirect to /login

# 5. E2E tests
cd apps/web && pnpm exec playwright test --reporter=line
# Expect: all green
```
