# Backend API - Phase 2 Core Infrastructure

FastAPI backend for Atomic Habits todo application with authentication, database persistence, and event logging.

## Tech Stack

- **Framework**: FastAPI + Uvicorn
- **ORM**: SQLModel (Pydantic + SQLAlchemy)
- **Database**: Neon Serverless PostgreSQL
- **Migrations**: Alembic
- **Authentication**: Better Auth + JWT (httpOnly cookies)
- **Events**: File-based JSON logging

## Prerequisites

- Python 3.13+
- PostgreSQL database (Neon recommended)
- UV package manager (optional but recommended)

## Environment Variables

Create a `.env` file in `apps/api/` directory:

```bash
# Database connection string (Neon Serverless PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Authentication secret for JWT signing (generate with: openssl rand -hex 32)
BETTER_AUTH_SECRET=your-secret-here-generate-with-openssl-rand-hex-32

# CORS allowed origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000

# Optional
LOG_LEVEL=info
JWT_EXPIRATION_DAYS=7
```

### Getting DATABASE_URL

1. Sign up at [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string from the dashboard
4. Paste it as `DATABASE_URL` in your `.env` file

### Generating BETTER_AUTH_SECRET

```bash
openssl rand -hex 32
```

Copy the output and set it as `BETTER_AUTH_SECRET` in your `.env` file.

## Installation

```bash
cd apps/api

# Install dependencies with UV (recommended)
uv pip install -e .

# Or with pip
pip install -e .

# Install development dependencies
uv pip install -e ".[dev]"
```

## Database Migrations

### Run migrations

```bash
# Apply all migrations to database
alembic upgrade head

# Check current migration version
alembic current

# View migration history
alembic history
```

### Rollback migrations

```bash
# Rollback one migration
alembic downgrade -1

# Rollback to base (WARNING: drops all tables)
alembic downgrade base
```

### Create new migration

```bash
# Auto-generate migration from model changes
alembic revision --autogenerate -m "Description of changes"

# Manually create empty migration
alembic revision -m "Description of changes"
```

## Running the Server

### Development mode (auto-reload)

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs (Swagger): http://localhost:8000/docs
- Alternative docs (ReDoc): http://localhost:8000/redoc

### Production mode

```bash
uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Testing

### Run all tests

```bash
pytest
```

### Run with coverage

```bash
pytest --cov=src --cov-report=term-missing
```

### Run specific test file

```bash
pytest tests/unit/test_auth_service.py -v
```

## 🛠️ Utility Scripts

### Database Verification

Verify database connection and list all tables in the public schema:

```bash
python scripts/verify_database.py
```

### Event Log Viewer

Parse and display event logs with optional filtering:

```bash
# View all events for today
python scripts/view_events.py

# Filter by event type
python scripts/view_events.py --type USER_REGISTERED

# View events for a specific date
python scripts/view_events.py --date 2026-01-03
```

## Testing Event Emitter

Run the event emitter test script:

```bash
python test_event_emitter.py
```

This will:
1. Emit a test event
2. Verify log file creation in `logs/` directory
3. Display the emitted event

## Project Structure

```
apps/api/
├── src/
│   ├── models/           # SQLModel database models
│   │   ├── user.py       # User entity
│   │   └── session.py    # Session entity
│   ├── routes/           # API endpoints
│   │   └── auth.py       # Authentication routes
│   ├── services/         # Business logic
│   │   ├── auth_service.py    # Authentication service
│   │   └── event_emitter.py   # Event logging
│   ├── middleware/       # FastAPI middleware
│   │   └── auth.py       # JWT validation
│   ├── config.py         # Environment variable validation
│   └── main.py           # FastAPI app entry point
├── alembic/              # Database migrations
│   ├── versions/         # Migration files
│   └── env.py            # Alembic environment
├── tests/                # Test suite
├── logs/                 # Event logs (gitignored)
├── pyproject.toml        # Python dependencies
├── alembic.ini           # Alembic configuration
└── README.md             # This file
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/logout` - Logout (invalidate session)
- `GET /api/auth/me` - Get current user profile

### Health Checks

- `GET /` - Basic health check
- `GET /health` - Detailed health check with database status

## Event Logging

All authentication events are logged to `logs/events-YYYY-MM-DD.jsonl`:

- `USER_REGISTERED` - New user account created
- `USER_LOGGED_IN` - User successfully authenticated
- `USER_LOGGED_OUT` - User logged out

View events:

```bash
# View all events for today
cat logs/events-$(date +%Y-%m-%d).jsonl | jq

# Tail live events
tail -f logs/events-*.jsonl
```

## Troubleshooting

### Database connection failed

- Verify `DATABASE_URL` is correct in `.env`
- Check Neon dashboard for connection string
- Ensure database is running

### Migration errors

```bash
# Reset database (WARNING: deletes all data)
alembic downgrade base
alembic upgrade head
```

### Missing environment variables

```bash
# Application will fail with clear error message
# Check .env file exists in apps/api/ directory
# See .env.example for required variables
```

## Next Steps

After setup:

1. ✅ Run migrations: `alembic upgrade head`
2. ✅ Test event emitter: `python test_event_emitter.py`
3. ✅ Start server: `uvicorn src.main:app --reload`
4. ✅ Open docs: http://localhost:8000/docs
5. ⏭️ Proceed to implement authentication endpoints (User Story 2)
