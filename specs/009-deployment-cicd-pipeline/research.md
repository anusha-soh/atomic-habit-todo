# Research: Deployment, CI/CD Pipeline & Test Infrastructure

**Feature**: 009-deployment-cicd-pipeline | **Date**: 2026-02-24

## R1: Backend Unit Tests Without Database

**Question**: How to run pytest unit tests without PostgreSQL when models use ARRAY/JSONB columns?

**Decision**: Mock the database session layer entirely for unit tests. Unit tests should not instantiate SQLModel objects that hit the DB — they should test business logic functions (validation, streak calculation, event emission) using mocks.

**Rationale**: SQLite cannot handle PostgreSQL-specific types (ARRAY, JSONB). Running a real PostgreSQL for unit tests defeats the purpose (fast, zero-infrastructure feedback). Mocking the session is the standard Python testing approach for service-layer unit tests.

**Alternatives Considered**:
- SQLite in-memory: Fails on ARRAY/JSONB columns
- testcontainers-python: Adds Docker startup latency (~5s), overkill for unit tests
- DuckDB: Doesn't support all PostgreSQL types either
- Conditional column types (ARRAY on PG, JSON text on SQLite): Adds complexity to models, violates "smallest viable diff"

## R2: conftest.py Session-Scoped Skip Behavior

**Question**: Why does `pytest.skip()` in a session-scoped fixture skip all tests?

**Decision**: Restructure fixtures so `engine`/`session` are only available to integration tests via `tests/integration/conftest.py`. Root `conftest.py` provides only mock-based and non-DB fixtures.

**Rationale**: `pytest.skip()` in a session-scoped fixture raises `Skipped` exception which propagates to skip the entire session. This is pytest's intentional behavior — if a session-scoped resource can't be created, all dependent tests skip. The fix is to not make unit tests depend on this fixture.

**Key Finding**: The `ensure_test_user_exists` fixture has `autouse=False` (despite the spec mentioning `autouse=True`), so it's not the cause of forced DB connections. The real cause is unit test files directly requesting `session` fixture.

## R3: GitHub Actions PostgreSQL Service Container

**Question**: Best practice for PostgreSQL in GitHub Actions CI?

**Decision**: Use GitHub Actions `services` block with `postgres:16` image.

```yaml
services:
  postgres:
    image: postgres:16
    env:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: test_db
    ports:
      - 5432:5432
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

**Rationale**: Service containers are the GitHub Actions native approach. They start before the job steps, have health checks, and are automatically cleaned up. No Docker Compose needed in CI.

**Key Finding**: `DATABASE_URL` in CI should be: `postgresql://test:test@localhost:5432/test_db`

## R4: Vercel Monorepo Configuration

**Question**: How does Vercel handle monorepo builds with Next.js in a subdirectory?

**Decision**: Use `vercel.json` at repository root with explicit `buildCommand` and `outputDirectory`.

**Rationale**: Vercel's monorepo support requires either: (a) configuring the root directory in the Vercel dashboard, or (b) using `vercel.json` at the repo root. Option (b) is version-controlled and shareable. The `installCommand` ensures pnpm workspace dependencies are resolved.

**Key Finding**: Vercel auto-detects `pnpm-lock.yaml` and uses pnpm. The `framework: "nextjs"` hint helps Vercel apply Next.js-specific optimizations. Root directory can also be set in Vercel dashboard UI as `apps/web`.

## R5: HF Spaces Auto-Deployment via GitHub Actions

**Question**: How to auto-sync a subdirectory to Hugging Face Spaces git repo?

**Decision**: Use `git subtree split` + force push to HF Spaces git remote.

**Mechanism**:
```bash
# Extract apps/api as a standalone commit tree
git subtree split --prefix=apps/api -b hf-deploy

# Push to HF Spaces
git push https://user:$HF_TOKEN@huggingface.co/spaces/user/space.git hf-deploy:main --force
```

**Alternatives Considered**:
- HF Hub Python library: More complex, requires Python in CI, designed for model uploads not code syncs
- rsync + git add/commit/push: More steps, requires separate checkout of HF repo
- GitHub to HF Spaces webhook: Doesn't exist natively

**Rationale**: `git subtree split` is a single command that creates a clean commit tree from a subdirectory. Force push is acceptable because HF Spaces repo is a deployment target (not a development repo).

## R6: Playwright E2E in CI

**Question**: How to run Playwright tests in GitHub Actions with both backend and frontend running?

**Decision**: Use background processes to start both servers, then run Playwright.

**Mechanism**:
```yaml
- name: Start backend
  run: |
    cd apps/api
    uvicorn src.main:app --host 0.0.0.0 --port 8000 &
  env:
    DATABASE_URL: postgresql://test:test@localhost:5432/test_db

- name: Start frontend
  run: |
    cd apps/web
    pnpm build && pnpm start &
  env:
    NEXT_PUBLIC_API_URL: http://localhost:8000

- name: Run E2E tests
  run: cd apps/web && npx playwright test
```

**Key Finding**: Playwright needs `npx playwright install --with-deps` in CI to download browser binaries. The `--with-deps` flag installs system-level dependencies (libgbm, libnss3, etc.) needed by Chromium.

## R7: Docker Compose Local Development

**Question**: What services should docker-compose.yml provide?

**Decision**: Three services with `test-db` independently startable:

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `db` | postgres:16 | 5432 | Full local development |
| `test-db` | postgres:16 | 5433 | Integration test runner |
| `api` | build from Dockerfile | 8000→7860 | Optional local API |

**Rationale**: Separate `test-db` on port 5433 avoids conflicts with a local PostgreSQL or the `db` service. Developers can `docker compose up test-db` to run only what integration tests need.

## R8: Missing apscheduler Dependency

**Question**: Is `apscheduler` actually used or can the import be removed?

**Finding**: `src/main.py` imports `BackgroundScheduler` from `apscheduler.schedulers.background` inside a `try/except ImportError` block. It's used for the daily habit-to-task generation scheduler. Without it, the app starts but habits won't auto-generate tasks.

**Decision**: Add `apscheduler>=3.10.0` to `pyproject.toml` dependencies (not dev deps — it's needed at runtime).
