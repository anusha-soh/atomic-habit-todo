# Atomic Habits - Phase 2 Core Infrastructure

Multi-user todo and habits tracking application built with FastAPI, Next.js 16, and PostgreSQL.

## 🎯 Phase 2 Features

- ✅ **User Authentication**: Registration, login, logout with JWT tokens
- ✅ **Database Persistence**: Neon Serverless PostgreSQL with Alembic migrations
- ✅ **Monorepo Structure**: pnpm workspaces for backend, frontend, and shared packages
- ✅ **Event System**: File-based event logging for audit trail
- ✅ **Mobile-First UI**: Responsive design with 44×44px touch targets

## 📁 Project Structure

```
phase-2-webapp/
├── apps/
│   ├── api/              # FastAPI backend (Python 3.13+)
│   │   ├── src/          # Source code
│   │   ├── alembic/      # Database migrations
│   │   ├── scripts/      # Verification and utility scripts
│   │   ├── tests/        # Test suite
│   │   └── README.md     # Backend setup guide
│   │
│   └── web/              # Next.js 16 frontend (TypeScript)
│       ├── src/          # Source code
│       ├── public/       # Static assets
│       └── README.md     # Frontend setup guide
│
├── packages/
│   └── core/             # Shared TypeScript types and constants
│
├── specs/                # Feature specifications
│   └── 001-phase2-chunk1/
│       ├── spec.md       # Requirements
│       ├── plan.md       # Architecture
│       ├── tasks.md      # Implementation tasks
│       └── ...
│
├── logs/                 # Event logs (gitignored)
├── .env.example          # Environment variables template
├── pnpm-workspace.yaml   # pnpm workspace configuration
└── package.json          # Root package.json with scripts
```

## 🏗️ Architecture

```mermaid
graph TD
    User([User]) <--> Web[Next.js Web App]
    Web <--> API[FastAPI Admin API]
    API <--> DB[(Neon PostgreSQL)]
    API --> Logs[(File-based Logs)]
    API <--> Auth[Better Auth]

    subgraph "Monorepo Packages"
        Core[packages/core]
    end

    Web -.-> Core
    API -.-> Core
```

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 20+
- **Python**: 3.13+
- **pnpm**: 8+ (`npm install -g pnpm`)
- **PostgreSQL**: Neon account or local PostgreSQL

### 1. Clone and Install Dependencies

```bash
# Navigate to project root
cd phase-2-webapp

# Install all workspace dependencies
pnpm install

# Install backend Python dependencies
cd apps/api
pip install -e .
cd ../..
```

### 2. Configure Environment Variables

**Backend** (`apps/api/.env`):

```bash
# Copy example file
cp .env.example apps/api/.env

# Edit apps/api/.env:
DATABASE_URL=postgresql://user:password@host:5432/dbname
BETTER_AUTH_SECRET=$(openssl rand -hex 32)
ALLOWED_ORIGINS=http://localhost:3000
```

**Frontend** (`apps/web/.env.local`):

```bash
# Create file apps/web/.env.local:
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run Database Migrations

```bash
cd apps/api
alembic upgrade head
cd ../..
```

### 4. Start Development Servers

**Option A: Start both (recommended)**
```bash
# From repository root
pnpm dev
```

**Option B: Start separately**
```bash
# Terminal 1: Backend
pnpm dev:api

# Terminal 2: Frontend
pnpm dev:web
```

### 5. Verify Setup

- **Backend API**: http://localhost:8000/docs
- **Frontend App**: http://localhost:3000

## 📚 Detailed Setup Guides

- **Backend Setup**: [apps/api/README.md](apps/api/README.md)
- **Frontend Setup**: [apps/web/README.md](apps/web/README.md)

## 🧪 Testing

### Test Event Emitter

```bash
cd apps/api
python test_event_emitter.py
```

### Run Backend Tests

```bash
cd apps/api
pytest --cov=src
```

### Run Frontend Tests

```bash
cd apps/web
pnpm test
```

## 📖 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Available Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/logout` - Logout (invalidate session)
- `GET /api/auth/me` - Get current user profile

## 🎨 Tech Stack

### Backend
- **Framework**: FastAPI
- **ORM**: SQLModel (Pydantic + SQLAlchemy)
- **Database**: Neon Serverless PostgreSQL
- **Migrations**: Alembic
- **Authentication**: Better Auth + JWT (httpOnly cookies)
- **Events**: File-based JSON logging

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + TailwindCSS 4 + Radix UI
- **State**: React hooks
- **API Client**: Custom fetch wrapper

### Shared
- **Types**: TypeScript (shared between frontend and backend types)
- **Workspace**: pnpm monorepo

## 🔐 Security

- ✅ Passwords hashed with bcrypt before storage
- ✅ JWT tokens stored in httpOnly cookies (XSS protection)
- ✅ CORS configured for frontend domain
- ✅ Environment variables for secrets (not committed)
- ✅ Session tracking in database (server-side invalidation)

## 📊 Event Logging

All authentication events are logged to `logs/events-YYYY-MM-DD.jsonl`:

```bash
# View events
cat logs/events-$(date +%Y-%m-%d).jsonl | jq

# Tail live events
tail -f logs/events-*.jsonl
```

Event types:
- `USER_REGISTERED` - New user account created
- `USER_LOGGED_IN` - User successfully authenticated
- `USER_LOGGED_OUT` - User logged out

## 🛠️ Development Scripts

From repository root:

```bash
# Start both backend and frontend
pnpm dev

# Start backend only
pnpm dev:api

# Start frontend only
pnpm dev:web

# Build all apps
pnpm build

# Run all tests
pnpm test

# Lint all code
pnpm lint
```

## 📝 Implementation Progress

**Phase 1: Setup** ✅ Complete
- [x] Monorepo structure
- [x] pnpm workspace
- [x] Environment variables

**Phase 2: Foundational** ✅ Complete
- [x] FastAPI backend with SQLModel + Alembic
- [x] Next.js frontend with TailwindCSS + Radix UI
- [x] Shared TypeScript types
- [x] Event emitter service

**Phase 3: User Story 1 - Infrastructure** ✅ Complete
- [x] Database migration files created
- [x] Event emitter test script
- [x] README files for setup

**Phase 4-6: User Stories 2-4** ✅ Complete
- [x] User registration journey
- [x] User login journey
- [x] User logout journey

## 🐛 Troubleshooting

### Database Connection Failed

```bash
# Check DATABASE_URL in apps/api/.env
# Verify Neon connection string from dashboard
```

### CORS Errors

```bash
# Ensure apps/api/.env has:
ALLOWED_ORIGINS=http://localhost:3000

# Restart backend server
```

### Port Already in Use

```bash
# Kill processes on ports
npx kill-port 8000 3000

# Or use different ports
uvicorn src.main:app --reload --port 8001
pnpm dev:web -- -p 3001
```

## 🎯 Next Steps

After setup is complete:

1. ✅ Verify both servers are running
2. ✅ Check http://localhost:8000/docs (backend)
3. ✅ Check http://localhost:3000 (frontend)
4. ⏭️ Implement User Registration (User Story 2)
5. ⏭️ Implement User Login (User Story 3)
6. ⏭️ Implement User Logout (User Story 4)

## 📄 License

Internal project - See company license

## 🤝 Contributing

This project follows spec-driven development. All features must have:
1. Specification (specs/###-feature/spec.md)
2. Implementation plan (specs/###-feature/plan.md)
3. Tasks breakdown (specs/###-feature/tasks.md)

## 📞 Support

For issues or questions:
- Check [Backend README](apps/api/README.md)
- Check [Frontend README](apps/web/README.md)
- Review [Specification](specs/001-phase2-chunk1/spec.md)
