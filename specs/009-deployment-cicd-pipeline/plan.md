# Implementation Plan: Deployment, CI/CD Pipeline & Test Infrastructure

**Branch**: `009-deployment-cicd-pipeline` | **Date**: 2026-02-24 | **Spec**: `specs/009-deployment-cicd-pipeline/spec.md`
**Input**: Feature specification from `/specs/009-deployment-cicd-pipeline/spec.md`

## Summary

Fix the backend test infrastructure so unit tests run without any database, add a Docker Compose file for local PostgreSQL integration testing, create a GitHub Actions CI/CD pipeline (unit + integration + frontend + E2E), configure Vercel deployment for the frontend, and automate backend deployment to Hugging Face Spaces via GitHub Actions sync.

## Technical Context

**Language/Version**: Python 3.13+ (backend), TypeScript 5.8+ / Next.js 16 (frontend)
**Primary Dependencies**: FastAPI, SQLModel, Alembic, psycopg2-binary, Vitest, Playwright, pnpm
**Storage**: Neon Serverless PostgreSQL (production), Docker PostgreSQL 16 (CI + local integration), in-memory mocks (unit tests)
**Testing**: pytest 8+ (backend), Vitest 1.2+ (frontend), Playwright 1.49+ (E2E)
**Target Platform**: Vercel (frontend), Hugging Face Spaces Docker (backend), GitHub Actions (CI)
**Project Type**: pnpm monorepo (`apps/web`, `apps/api`)
**Performance Goals**: Unit tests < 5s, integration tests < 30s, full CI < 15 min
**Constraints**: No production DB credentials in CI; HF Spaces port 7860; Vercel monorepo root detection
**Scale/Scope**: ~182 backend tests, ~24 frontend test files, 3 E2E critical flows

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | PASS | This plan follows spec → plan → tasks workflow |
| VI. Database as Single Source of Truth | PASS | No state changes; infra only |
| X. Test Specs Not Implementation | PASS | Test refactoring preserves spec-based assertions |
| XI. No Hardcoded Configuration | PASS | All secrets via env vars / GitHub Secrets / HF Secrets UI |
| Deployment (Phase II): Vercel + HF Spaces | PASS | Matches constitution §Deployment (Phase II) |
| No Skipping Phases | PASS | Phase II deployment infra; not Phase III+ |

**No violations. Gate passes.**

## Project Structure

### Documentation (this feature)

```text
specs/009-deployment-cicd-pipeline/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── quickstart.md        # Phase 1 output (local dev guide)
├── checklists/          # Existing
│   └── requirements.md
└── tasks.md             # Phase 2 output (via /sp.tasks)
```

### Source Code (new/modified files)

```text
.github/
└── workflows/
    └── ci.yml                       # NEW — GitHub Actions CI/CD pipeline

docker-compose.yml                    # NEW — local PostgreSQL + test services

vercel.json                           # NEW — Vercel monorepo config

apps/api/
├── pyproject.toml                    # MODIFIED — add apscheduler dep
├── tests/
│   ├── conftest.py                   # MODIFIED — split unit/integration DB handling
│   └── unit/
│       ├── test_task_model.py        # MODIFIED — mock DB instead of real session
│       ├── test_task_service.py      # MODIFIED — mock DB instead of real session
│       ├── test_habit_model.py       # MODIFIED — mock DB instead of real session
│       └── test_habit_service.py     # MODIFIED — mock DB instead of real session
└── src/
    └── (no changes expected)

apps/web/
└── (no changes expected — Vitest already works)
```

**Structure Decision**: Existing monorepo structure preserved. New files added at root level (docker-compose.yml, vercel.json, .github/workflows/ci.yml). Backend test infrastructure refactored in-place.

## Complexity Tracking

> No constitution violations detected. No complexity justification needed.

---

## Design Decisions

### D1: Backend Unit Test Strategy — Mock Database Layer

**Problem**: Unit tests in `tests/unit/` (task_model, task_service, habit_model, habit_service) currently depend on `session` fixture → `engine` fixture → real PostgreSQL. This makes them integration tests in disguise, taking ~60s due to remote Neon DB round-trips.

**Decision**: Refactor unit tests to use `unittest.mock.MagicMock` for database sessions. Unit tests should test business logic (validation, calculations, event emission) without touching any database.

**Alternatives Considered**:
- **SQLite in-memory**: Rejected — PostgreSQL ARRAY and JSONB columns are incompatible with SQLite; would require schema changes or conditional types
- **testcontainers-python**: Rejected for unit tests — still spins up Docker, adds ~5s startup latency; appropriate for integration tests only
- **pytest-postgresql**: Rejected — requires PostgreSQL installed locally; Docker Compose is simpler and more portable

**Rationale**: Mocking is the fastest path (0ms DB overhead) and correctly reflects what "unit test" means — testing logic in isolation. Tests that need real DB queries belong in `tests/integration/`.

### D2: conftest.py Restructuring

**Problem**: The session-scoped `engine` fixture calls `pytest.skip()` when no `DATABASE_URL` is set. Because it's session-scoped, this skips ALL tests, including unit tests that should run without a DB.

**Decision**: Split fixtures into two tiers:
1. **Root `conftest.py`** — provides only non-DB fixtures (mock_event_emitter, event_emitter, user_id, etc.) and a `session` fixture that is NOT autouse and requires `DATABASE_URL`
2. **`tests/integration/conftest.py`** — provides DB-dependent fixtures; skips gracefully per-test (not per-session) using `pytest.importorskip` or individual `pytest.skip()`
3. Unit tests never request `session` or `engine` — they use mocks

**Key change**: The `engine` fixture scope changes from `session` to `module` or moves to integration-only conftest, and the skip behavior becomes per-test rather than per-session.

### D3: Docker Compose for Local Development

**Decision**: Create `docker-compose.yml` at repo root with services:
- `test-db`: PostgreSQL 16 on port 5433 (avoids conflicts with local PostgreSQL on 5432)
- `db`: PostgreSQL 16 on port 5432 (for full local dev)
- `api`: Optional — builds from `apps/api/Dockerfile` with hot reload

**Rationale**: Developers can `docker compose up test-db` for integration tests or `docker compose up` for full stack. Port 5433 for test-db prevents collisions.

### D4: GitHub Actions CI Pipeline Architecture

**Decision**: Single workflow file `.github/workflows/ci.yml` with these jobs:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  backend-    │     │  frontend-   │     │  frontend-   │
│  unit-tests  │     │  tests       │     │  build       │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
┌──────┴───────┐            │                    │
│  backend-    │            │                    │
│  integration │            │                    │
└──────┬───────┘            │                    │
       │                    │                    │
       └────────────┬───────┘────────────────────┘
                    │
             ┌──────┴───────┐
             │   e2e-tests  │
             └──────┬───────┘
                    │
             ┌──────┴───────┐
             │  deploy-hf   │ (only on main, after CI passes)
             └──────────────┘
```

**Jobs**:
1. **backend-unit-tests**: Python 3.13, `pip install .[dev]`, `pytest tests/unit/ -v` — no DB, no Docker
2. **backend-integration-tests**: Python 3.13, PostgreSQL 16 service container, `pytest tests/integration/ -v`
3. **frontend-tests**: Node 20, pnpm, `pnpm --filter web test`
4. **frontend-build**: Node 20, pnpm, `pnpm --filter web build`
5. **e2e-tests**: Depends on all above; spins up backend + frontend, runs Playwright
6. **deploy-hf**: Only on `main` branch, after all tests pass; syncs `apps/api/` to HF Spaces git repo

**Trigger**: Push to any branch + pull_request to `main`.

### D5: Vercel Configuration

**Decision**: Add `vercel.json` at repository root:
```json
{
  "buildCommand": "cd apps/web && pnpm install && pnpm build",
  "outputDirectory": "apps/web/.next",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

**Rationale**: Vercel auto-detects Next.js but needs explicit root directory guidance for monorepo. Environment variable `NEXT_PUBLIC_API_URL` is set in Vercel dashboard (not committed).

### D6: HF Spaces Deployment via GitHub Actions

**Decision**: Use `git subtree push` pattern in GitHub Actions to sync `apps/api/` directory to a separate HF Spaces git repository.

**Mechanism**:
1. GitHub Actions job runs only on `main` branch after CI passes
2. Checks out the repo
3. Uses `git subtree split --prefix=apps/api` to extract the api subdirectory
4. Force-pushes the subtree to `https://huggingface.co/spaces/{user}/{space}.git` using `HF_TOKEN` secret

**Secrets Required** (stored in GitHub repo settings):
- `HF_TOKEN`: Hugging Face API token with write access to the Space

**Rationale**: This keeps GitHub as the single source of truth. No manual HF pushes needed. Rollback = revert commit on GitHub → CI auto-syncs previous version.

### D7: Test Database Cleanup — Add Habits Tables

**Problem**: Current `session_fixture` cleanup only `DELETE FROM tasks` and `DELETE FROM users`. Missing `habits` and `habit_completions` tables.

**Decision**: Add cleanup for all application tables in the correct foreign-key order:
```python
session.execute(text("DELETE FROM habit_completions"))
session.execute(text("DELETE FROM habits"))
session.execute(text("DELETE FROM tasks"))
session.execute(text("DELETE FROM users"))
```

### D8: Missing `apscheduler` Dependency

**Problem**: `src/main.py` imports `apscheduler` but it's not in `pyproject.toml`. The import is wrapped in `try/except ImportError` so the app starts but the scheduler doesn't run.

**Decision**: Add `apscheduler>=3.10.0` to `pyproject.toml` dependencies.

---

## Risk Analysis

1. **E2E tests flaky in CI**: Playwright tests may be timing-sensitive in containerized CI environments. Mitigation: Use `--retries=2` flag and increase timeouts for CI.

2. **HF Spaces git subtree push complexity**: `git subtree split` can be slow on large repos. Mitigation: Use shallow clone depth and cache git objects.

3. **PostgreSQL service container startup race**: Backend integration tests may start before PostgreSQL is ready. Mitigation: Use `options: --health-cmd pg_isready` in GitHub Actions service definition.

---

## Follow-ups

- Configure branch protection rules on `main` (manual GitHub settings step)
- Set `NEXT_PUBLIC_API_URL` in Vercel project dashboard
- Set `HF_TOKEN` in GitHub repository secrets
- Set `DATABASE_URL`, `BETTER_AUTH_SECRET`, `ALLOWED_ORIGINS` as HF Spaces secrets
