# Quickstart Guide: Phase 2 Core Infrastructure

**Feature**: Phase 2 Core Infrastructure
**Branch**: `001-phase2-chunk1`
**Date**: 2026-01-03

## Overview

This quickstart guide provides step-by-step instructions for setting up and running the Phase 2 Core Infrastructure locally. By the end of this guide, you will have:

- ✅ Monorepo structure created (apps/web, apps/api, packages/core)
- ✅ Backend running with database migrations applied
- ✅ Frontend running and connected to backend
- ✅ User registration and login working
- ✅ Event logs capturing authentication events

---

## Prerequisites

Ensure you have the following installed:

- **Node.js**: 20+ ([Download](https://nodejs.org/))
- **Python**: 3.13+ ([Download](https://www.python.org/downloads/))
- **pnpm**: Latest version (`npm install -g pnpm`)
- **UV**: Python package manager ([Install instructions](https://github.com/astral-sh/uv))
- **PostgreSQL**: Neon account or local PostgreSQL 15+ ([Neon Signup](https://neon.tech/))

---

## Step 1: Clone Repository and Install Dependencies

```bash
# Clone repository (or initialize if starting from scratch)
cd phase-2-webapp

# Install all workspace dependencies
pnpm install

# Install backend dependencies (Python)
cd apps/api
uv pip install -r requirements.txt
cd ../..
```

---

## Step 2: Configure Environment Variables

### Create Backend Environment File

```bash
cd apps/api
cp .env.example .env
```

Edit `apps/api/.env`:

```bash
# Database connection (Neon or local PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Authentication secret (generate with: openssl rand -hex 32)
BETTER_AUTH_SECRET=your-secret-here-generate-with-openssl-rand-hex-32

# CORS allowed origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000
```

### Create Frontend Environment File

```bash
cd apps/web
cp .env.example .env.local
```

Edit `apps/web/.env.local`:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Step 3: Run Database Migrations

```bash
cd apps/api

# Generate migration (if not already created)
alembic revision --autogenerate -m "Create users and sessions tables"

# Apply migrations to database
alembic upgrade head

# Verify tables created
# Connect to database and run:
# SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
# Expected output: users, sessions, alembic_version
```

**Troubleshooting**:
- If `DATABASE_URL` is incorrect, you'll see: `sqlalchemy.exc.OperationalError: could not connect to server`
  - **Fix**: Verify Neon connection string or local PostgreSQL credentials
- If migration fails with `relation already exists`, run: `alembic downgrade base && alembic upgrade head`

---

## Step 4: Start Backend (FastAPI)

```bash
cd apps/api

# Start development server (auto-reload enabled)
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Expected output:
# INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
# INFO:     Started reloader process [PID] using WatchFiles
```

**Verify Backend**:
- Open browser: `http://localhost:8000/docs`
- You should see FastAPI Swagger UI with 4 endpoints:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`

---

## Step 5: Start Frontend (Next.js)

```bash
# Open new terminal
cd apps/web

# Start development server
pnpm dev

# Expected output:
# ▲ Next.js 16.0.0
# - Local:        http://localhost:3000
# - Network:      http://192.168.x.x:3000
```

**Verify Frontend**:
- Open browser: `http://localhost:3000`
- You should see the landing page or login page

---

## Step 6: Test Authentication Flow

### 6.1 Register New User

**Via Frontend**:
1. Navigate to `http://localhost:3000/register`
2. Enter email: `test@example.com`
3. Enter password: `password123` (minimum 8 characters)
4. Click "Register"
5. You should be redirected to `/dashboard` with user email displayed

**Via API (cURL)**:
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}' \
  -c cookies.txt

# Expected response (201 Created):
# {
#   "user": {
#     "id": "550e8400-e29b-41d4-a716-446655440000",
#     "email": "test@example.com",
#     "created_at": "2026-01-03T10:00:00Z"
#   }
# }
```

### 6.2 Login Existing User

**Via Frontend**:
1. Navigate to `http://localhost:3000/login`
2. Enter email: `test@example.com`
3. Enter password: `password123`
4. Click "Login"
5. You should be redirected to `/dashboard`

**Via API (cURL)**:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}' \
  -c cookies.txt

# Expected response (200 OK):
# {
#   "user": { ... },
#   "session": {
#     "id": "660f9511-f3ac-52e5-b827-557766551111",
#     "expires_at": "2026-01-10T10:00:00Z"
#   }
# }
```

### 6.3 Get Current User

```bash
curl -X GET http://localhost:8000/api/auth/me \
  -b cookies.txt

# Expected response (200 OK):
# {
#   "user": {
#     "id": "550e8400-e29b-41d4-a716-446655440000",
#     "email": "test@example.com",
#     "created_at": "2026-01-03T10:00:00Z"
#   }
# }
```

### 6.4 Logout

```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -b cookies.txt

# Expected response (200 OK):
# {
#   "message": "Logout successful"
# }

# Verify session invalidated:
curl -X GET http://localhost:8000/api/auth/me -b cookies.txt
# Expected response (401 Unauthorized):
# {
#   "error": "Unauthorized"
# }
```

---

## Step 7: Verify Event Logs

```bash
# Check event logs directory
ls logs/

# Expected output: events-2026-01-03.jsonl

# View event logs (newline-delimited JSON)
cat logs/events-2026-01-03.jsonl | jq

# Expected events:
# {"event_type": "USER_REGISTERED", "user_id": "...", "timestamp": "...", "payload": {...}}
# {"event_type": "USER_LOGGED_IN", "user_id": "...", "timestamp": "...", "payload": {...}}
# {"event_type": "USER_LOGGED_OUT", "user_id": "...", "timestamp": "...", "payload": {...}}
```

---

## Step 8: Run Tests

### Backend Tests

```bash
cd apps/api

# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=term

# Expected output:
# ====== test session starts ======
# collected 15 items
#
# tests/unit/test_auth_service.py ........
# tests/integration/test_auth_api.py .......
#
# ====== 15 passed in 2.34s ======
```

### Frontend Tests

```bash
cd apps/web

# Run all tests
pnpm test

# Expected output:
# PASS src/components/LoginForm.test.tsx
# PASS src/components/RegisterForm.test.tsx
#
# Test Suites: 2 passed, 2 total
# Tests:       8 passed, 8 total
```

---

## Common Issues and Solutions

### Issue 1: Database Connection Failed

**Error**: `sqlalchemy.exc.OperationalError: could not connect to server`

**Solution**:
1. Verify `DATABASE_URL` in `apps/api/.env` is correct
2. Check Neon dashboard for correct connection string
3. If using local PostgreSQL, ensure service is running: `pg_ctl status`

### Issue 2: CORS Error on Frontend

**Error**: `Access to fetch at 'http://localhost:8000/api/auth/register' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solution**:
1. Verify `ALLOWED_ORIGINS=http://localhost:3000` in `apps/api/.env`
2. Restart backend server after changing environment variables
3. Check browser console for actual origin (ensure it's `http://localhost:3000`)

### Issue 3: JWT Token Not Working

**Error**: `401 Unauthorized` when calling `/api/auth/me`

**Solution**:
1. Verify `BETTER_AUTH_SECRET` is set in `apps/api/.env`
2. Check that cookies are being set (inspect browser DevTools → Application → Cookies)
3. Ensure `httpOnly` and `SameSite=Strict` are configured correctly
4. If testing with cURL, use `-c cookies.txt` to save cookies and `-b cookies.txt` to send them

### Issue 4: Migration Fails with "relation already exists"

**Error**: `alembic.util.exc.CommandError: Target database is not up to date`

**Solution**:
```bash
# Drop all tables and rerun migrations (WARNING: deletes all data)
alembic downgrade base
alembic upgrade head
```

### Issue 5: Frontend Can't Connect to Backend

**Error**: `TypeError: Failed to fetch`

**Solution**:
1. Verify backend is running: `curl http://localhost:8000/docs`
2. Check `NEXT_PUBLIC_API_URL=http://localhost:8000` in `apps/web/.env.local`
3. Restart Next.js dev server after changing environment variables

---

## Next Steps

After completing this quickstart:

1. ✅ **Verify All Acceptance Criteria**: Run through User Stories 1-4 from spec.md
2. ✅ **Explore API Docs**: Open `http://localhost:8000/docs` and test endpoints interactively
3. ✅ **Inspect Database**: Connect to Neon and verify `users` and `sessions` tables
4. ✅ **Review Event Logs**: Inspect `logs/events-YYYY-MM-DD.jsonl` for authentication events
5. ⏭️ **Ready for Chunk 2**: Proceed to tasks full feature set (priorities, tags, search, filter, sort, due dates)

---

## Architecture Overview

```
┌─────────────────────┐
│   Browser (React)   │
│   localhost:3000    │
└──────────┬──────────┘
           │ HTTP (fetch)
           │ + JWT in httpOnly cookie
           ▼
┌─────────────────────┐
│  FastAPI Backend    │
│   localhost:8000    │
├─────────────────────┤
│ Routes: /api/auth/* │
│ Middleware: CORS,   │
│             JWT     │
│ Services: Auth,     │
│           Events    │
└──────────┬──────────┘
           │
           ├─────────────────┐
           │                 │
           ▼                 ▼
┌─────────────────┐   ┌──────────────┐
│ Neon PostgreSQL │   │ Event Logs   │
│   (Database)    │   │ logs/*.jsonl │
├─────────────────┤   └──────────────┘
│ Tables:         │
│ - users         │
│ - sessions      │
└─────────────────┘
```

---

## Useful Commands Reference

```bash
# Monorepo management
pnpm install                    # Install all dependencies
pnpm --filter web dev           # Run frontend dev server
pnpm --filter api dev           # Run backend dev server (if configured)
pnpm -r build                   # Build all apps
pnpm -r test                    # Test all apps

# Backend (Python/FastAPI)
cd apps/api
uvicorn src.main:app --reload   # Start dev server
alembic upgrade head            # Apply migrations
alembic downgrade -1            # Rollback one migration
pytest --cov=src                # Run tests with coverage

# Frontend (Next.js)
cd apps/web
pnpm dev                        # Start dev server
pnpm build                      # Build for production
pnpm test                       # Run tests

# Event logs
cat logs/events-*.jsonl | jq    # View all events (formatted)
tail -f logs/events-*.jsonl     # Tail live events
```

---

## Support

If you encounter issues not covered in this guide:

1. Check the [spec.md](./spec.md) for detailed functional requirements
2. Review [data-model.md](./data-model.md) for database schema
3. Inspect [contracts/auth-api.openapi.yaml](./contracts/auth-api.openapi.yaml) for API contract
4. Review [research.md](./research.md) for technology decisions and patterns

---

**Congratulations!** You now have Phase 2 Core Infrastructure running locally. Proceed to `/sp.tasks` to generate implementation tasks.
