# Quickstart: Local Development, Testing & Deployment

**Feature**: 009-deployment-cicd-pipeline | **Date**: 2026-02-24

## Prerequisites

- Node.js 20+ with pnpm
- Python 3.13+ with pip
- Docker Desktop (for integration tests and full-stack local dev)
- Git

## Running Unit Tests (No Docker Required)

### Backend Unit Tests

```bash
cd apps/api
pip install -e ".[dev]"
pytest tests/unit/ -v
```

Expected: All unit tests pass in < 5 seconds with zero network/database dependencies.

### Frontend Unit Tests

```bash
cd apps/web
pnpm install
pnpm test
```

Expected: All Vitest tests pass using jsdom environment.

## Running Integration Tests (Docker Required)

### 1. Start the test database

```bash
# From repo root
docker compose up test-db -d
```

This starts PostgreSQL 16 on port **5433** (not 5432, to avoid conflicts).

### 2. Run backend integration tests

```bash
cd apps/api
TEST_DATABASE_URL="postgresql://test:test@localhost:5433/test_db" pytest tests/integration/ -v
```

Expected: All integration tests pass in < 30 seconds.

### 3. Stop the test database

```bash
docker compose down test-db
```

## Running Full Local Stack

```bash
# From repo root — starts PostgreSQL + API server
docker compose up db api
```

- API: http://localhost:8000
- Database: localhost:5432

Then in a separate terminal:

```bash
cd apps/web
pnpm dev
```

- Frontend: http://localhost:3000

## Running E2E Tests Locally

```bash
# Ensure backend and frontend are running (see above), then:
cd apps/web
npx playwright install --with-deps
npx playwright test
```

## Environment Variables

| Variable | Required For | Example |
|----------|-------------|---------|
| `DATABASE_URL` | API server, integration tests | `postgresql://user:pass@localhost:5432/dbname` |
| `TEST_DATABASE_URL` | Integration tests (preferred) | `postgresql://test:test@localhost:5433/test_db` |
| `BETTER_AUTH_SECRET` | API server | `openssl rand -hex 32` output |
| `ALLOWED_ORIGINS` | API server | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Frontend | `http://localhost:8000` |

## CI Pipeline

The GitHub Actions pipeline (`.github/workflows/ci.yml`) runs automatically on every push. It includes:

1. **backend-unit-tests**: Python 3.13, no DB — `pytest tests/unit/ -v`
2. **backend-integration-tests**: Python 3.13 + PostgreSQL 16 service container — `pytest tests/integration/ -v`
3. **frontend-tests**: Node 20, pnpm — `pnpm --filter web test`
4. **frontend-build**: Node 20, pnpm — `pnpm --filter web build`
5. **e2e-tests**: Playwright (depends on all above passing)
6. **deploy-hf**: Auto-deploys to HF Spaces (main branch only, after all checks pass)

## Vercel Frontend Deployment

### Setup (one-time)

1. Go to [vercel.com](https://vercel.com) and import the GitHub repository
2. In Vercel project settings, set **Root Directory** to `apps/web`
3. Add environment variable: `NEXT_PUBLIC_API_URL` = your HF Spaces backend URL (e.g., `https://your-space.hf.space`)
4. Deploy — Vercel auto-detects Next.js and uses `vercel.json` for monorepo config

### Automatic deployments

- **Production**: Merges to `main` trigger auto-deploy
- **Preview**: Every PR gets a preview deployment URL

## Hugging Face Spaces Backend Deployment

### Setup (one-time)

1. Create a new HF Space (Docker SDK)
2. In HF Spaces **Secrets** UI, set:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `BETTER_AUTH_SECRET`: A secure random string (`openssl rand -hex 32`)
   - `ALLOWED_ORIGINS`: Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
3. In GitHub repo **Settings > Secrets and variables > Actions**, set:
   - `HF_TOKEN`: Your Hugging Face API token (with write access)
   - `HF_SPACE_ID`: Your HF Space ID (e.g., `username/space-name`)

### Automatic deployments

After CI passes on `main`, GitHub Actions auto-syncs `apps/api/` to HF Spaces via `git subtree push`.

### Rollback procedure

1. Revert the problematic commit on GitHub: `git revert <sha> && git push`
2. CI passes on the revert commit
3. Auto-sync pushes the previous working version to HF Spaces
4. HF Spaces rebuilds with the reverted code

GitHub is the single source of truth — never push directly to HF Spaces repo.
