# Research: Phase 2 Core Infrastructure

**Feature**: Phase 2 Core Infrastructure
**Branch**: `001-phase2-chunk1`
**Date**: 2026-01-03

## Overview

This document consolidates research findings for the Phase 2 Core Infrastructure implementation. All technical unknowns from the Technical Context have been resolved through the spec clarification process. This research focuses on best practices and implementation patterns for the chosen technology stack.

---

## 1. Authentication: Better Auth + JWT

### Decision
Use **Better Auth** library with **JWT tokens** stored in **httpOnly cookies** for authentication.

### Rationale
1. **Better Auth**: Modern authentication library designed for Next.js and other frameworks
   - Built-in JWT support
   - Session management with database tracking
   - CSRF protection
   - Email/password authentication out of the box

2. **httpOnly Cookies over localStorage**:
   - Prevents XSS attacks (JavaScript cannot access httpOnly cookies)
   - Automatic cookie transmission with requests (no manual header management)
   - Secure flag for HTTPS-only transmission in production
   - SameSite=Strict prevents CSRF attacks

3. **Database-Backed Sessions**:
   - Enables server-side session invalidation (required for logout)
   - Track active sessions per user
   - Audit trail for security analysis

### Alternatives Considered
- **Auth0/Clerk**: Third-party auth services
  - **Rejected**: Adds external dependency and cost. Better Auth provides equivalent security with self-hosting.
- **localStorage for JWT**:
  - **Rejected**: Vulnerable to XSS attacks. httpOnly cookies provide better security.
- **Session-only (no JWT)**:
  - **Rejected**: Requires server-side state for every request. JWT enables stateless validation with database fallback for invalidation.

### Implementation Pattern
```python
# Backend (FastAPI)
from better_auth import BetterAuth
from fastapi import FastAPI, Response, Request

auth = BetterAuth(
    database_url=os.getenv("DATABASE_URL"),
    secret=os.getenv("BETTER_AUTH_SECRET"),
    cookie_name="auth_token",
    cookie_httponly=True,
    cookie_secure=True,  # HTTPS only in production
    cookie_samesite="strict"
)

@app.post("/api/auth/register")
async def register(email: str, password: str, response: Response):
    user = await auth.create_user(email, password)
    token = auth.create_jwt(user.id, expires_in_days=7)
    response.set_cookie(key="auth_token", value=token, httponly=True)
    return {"user": user}
```

---

## 2. Database: Neon Serverless PostgreSQL + Alembic Migrations

### Decision
Use **Neon Serverless PostgreSQL** for database with **Alembic** for schema migrations and **SQLModel** as ORM.

### Rationale
1. **Neon Serverless PostgreSQL**:
   - Auto-scaling (scales to zero when inactive)
   - Database branching (dev/staging/prod isolation)
   - Generous free tier (3 projects, 0.5GB storage)
   - Connection pooling built-in
   - Compatible with standard PostgreSQL tools

2. **Alembic for Migrations**:
   - Industry standard for SQLAlchemy-based apps
   - Version-controlled schema changes
   - Rollback support for disaster recovery
   - Auto-generates migrations from model changes

3. **SQLModel as ORM**:
   - Combines Pydantic (validation) + SQLAlchemy (ORM)
   - Type-safe database operations
   - FastAPI native integration
   - Automatic OpenAPI schema generation from models

### Alternatives Considered
- **Supabase**:
  - **Rejected**: Primarily designed for JavaScript/TypeScript ecosystems. Neon provides better Python tooling.
- **PlanetScale**:
  - **Rejected**: MySQL-based. PostgreSQL offers better JSON support and full-text search (needed in future phases).
- **Raw SQL (no ORM)**:
  - **Rejected**: Loses type safety and requires manual schema management.

### Implementation Pattern
```python
# models/user.py
from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True, nullable=False)
    password_hash: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

```bash
# Alembic migration workflow
alembic revision --autogenerate -m "Create users and sessions tables"
alembic upgrade head  # Apply migrations
alembic downgrade -1  # Rollback one migration
```

---

## 3. Monorepo: pnpm Workspaces

### Decision
Use **pnpm workspaces** for monorepo management with structure: `apps/web`, `apps/api`, `packages/core`.

### Rationale
1. **pnpm over npm/yarn**:
   - **Faster**: Symlinks packages instead of copying (3x faster installs)
   - **Efficient**: Shared content-addressable store (saves disk space)
   - **Strict**: Prevents phantom dependencies (only declared deps are accessible)
   - **Workspace-native**: Built-in monorepo support, no third-party tools needed

2. **Workspace Structure**:
   - **apps/web**: Next.js frontend (independent deployment to Vercel)
   - **apps/api**: FastAPI backend (independent deployment to Render)
   - **packages/core**: Shared TypeScript types (used by both apps)

3. **Benefits**:
   - Single `pnpm install` for entire monorepo
   - Shared dev dependencies (TypeScript, ESLint) at root
   - Cross-app type safety via shared packages
   - Simplified CI/CD (single repository)

### Alternatives Considered
- **npm workspaces**:
  - **Rejected**: Slower, less efficient disk usage, weaker phantom dependency prevention.
- **Yarn workspaces**:
  - **Rejected**: pnpm is faster and more efficient. Yarn 2+ (Berry) has complex migration path.
- **Turborepo/Nx**:
  - **Rejected**: Adds complexity for caching/orchestration. Not needed for Phase 2 scale (2 apps). Can add in Phase 4+ if build times grow.

### Implementation Pattern
```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

```json
// package.json (root)
{
  "name": "atomic-habits-monorepo",
  "private": true,
  "scripts": {
    "dev:web": "pnpm --filter web dev",
    "dev:api": "pnpm --filter api dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test"
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "eslint": "^9.0.0"
  }
}
```

---

## 4. Event System: File-Based JSON Logging

### Decision
Use **file-based event logging** (newline-delimited JSON in `logs/` directory) with **daily rotation**.

### Rationale
1. **File-Based Logging for Phase 2-4**:
   - Simple implementation (no external dependencies)
   - Persistent (survives app restarts)
   - Debuggable (inspect logs with `cat`, `jq`, `grep`)
   - Rotatable (daily rotation prevents unbounded growth)

2. **Migration Path to Kafka (Phase 5)**:
   - Event schema remains consistent across phases
   - Consumers can switch from file-tailing to Kafka consumers
   - Fire-and-forget pattern stays the same

3. **JSON Lines (JSONL) Format**:
   - One event per line (easy to stream and parse)
   - No multi-line JSON (avoids parsing complexity)
   - Compatible with log aggregation tools (Splunk, ELK stack)

### Alternatives Considered
- **In-Memory Event Bus (EventEmitter)**:
  - **Rejected**: Events lost on app restart. Not suitable for audit trail.
- **Database Event Table**:
  - **Rejected**: Adds write overhead to critical paths. File append is faster.
- **Redis Pub/Sub**:
  - **Rejected**: Adds infrastructure complexity for Phase 2. File-based is simpler. Kafka in Phase 5 provides better guarantees.

### Implementation Pattern
```python
# services/event_emitter.py
import json
from datetime import datetime
from pathlib import Path
from uuid import UUID

class EventEmitter:
    def __init__(self, log_dir: Path = Path("logs")):
        self.log_dir = log_dir
        self.log_dir.mkdir(exist_ok=True)

    def emit(self, event_type: str, user_id: UUID, payload: dict):
        """Fire-and-forget event emission"""
        event = {
            "event_type": event_type,
            "user_id": str(user_id),
            "timestamp": datetime.utcnow().isoformat(),
            "payload": payload
        }

        # Daily rotation: events-2026-01-03.jsonl
        log_file = self.log_dir / f"events-{datetime.utcnow().date()}.jsonl"

        with open(log_file, "a") as f:
            f.write(json.dumps(event) + "\n")

# Usage
emitter = EventEmitter()
emitter.emit("USER_REGISTERED", user_id=user.id, payload={"email": user.email})
```

---

## 5. Frontend: Next.js 16 App Router + TailwindCSS 4

### Decision
Use **Next.js 16 with App Router** for frontend, **TailwindCSS 4** for styling, and **Radix UI** for accessible components.

### Rationale
1. **Next.js 16 App Router**:
   - React Server Components (RSC) for improved performance
   - Built-in routing with file-system convention
   - Automatic code splitting
   - Vercel deployment optimization (zero-config)

2. **TailwindCSS 4**:
   - Utility-first CSS (rapid prototyping)
   - Mobile-first responsive design (default breakpoints)
   - Purge unused styles (small production bundles)
   - No runtime overhead (compile-time CSS generation)

3. **Radix UI**:
   - Unstyled, accessible component primitives
   - Keyboard navigation built-in
   - ARIA attributes automatically managed
   - Composable (align with Principle XII: Composition over Inheritance)

### Alternatives Considered
- **Pages Router (Next.js)**:
  - **Rejected**: App Router is the future. RSC provides better performance.
- **Remix**:
  - **Rejected**: Less mature deployment ecosystem compared to Vercel + Next.js.
- **Styled Components / Emotion**:
  - **Rejected**: Runtime CSS-in-JS adds overhead. TailwindCSS is compile-time.
- **Material UI / Chakra UI**:
  - **Rejected**: Opinionated styling. Radix UI provides primitives that align with custom design system.

### Implementation Pattern
```tsx
// app/register/page.tsx (App Router)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form className="w-full max-w-sm space-y-4">
        <Input type="email" placeholder="Email" className="h-11 touch-target" />
        <Input type="password" placeholder="Password" className="h-11 touch-target" />
        <Button type="submit" className="w-full h-11 touch-target">
          Register
        </Button>
      </form>
    </div>
  );
}
```

```css
/* Touch target utility (44×44px minimum) */
@layer utilities {
  .touch-target {
    @apply min-h-[44px] min-w-[44px];
  }
}
```

---

## 6. CORS Configuration for Frontend ↔ Backend Communication

### Decision
Use **environment-specific CORS** configuration allowing credentials (cookies).

### Rationale
1. **Development**: Allow `http://localhost:3000` (Next.js dev server)
2. **Production**: Allow Vercel frontend domain (e.g., `https://app.example.com`)
3. **Credentials**: `credentials: true` enables httpOnly cookie transmission
4. **Methods**: Allow `GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`

### Implementation Pattern
```python
# main.py (FastAPI)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# Environment-specific CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # ["http://localhost:3000"] in dev
    allow_credentials=True,          # Enable cookies
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

---

## 7. Environment Variables Strategy

### Decision
Use **environment variables** for all configuration with `.env.example` template.

### Required Variables

**Backend (apps/api/.env)**:
- `DATABASE_URL`: Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET`: JWT signing secret (generate with `openssl rand -hex 32`)
- `ALLOWED_ORIGINS`: Comma-separated frontend domains (e.g., `http://localhost:3000,https://app.example.com`)

**Frontend (apps/web/.env.local)**:
- `NEXT_PUBLIC_API_URL`: Backend API base URL (e.g., `http://localhost:8000` in dev, `https://api.example.com` in prod)

### Implementation Pattern
```bash
# .env.example (root)
# Backend
DATABASE_URL=postgresql://user:password@host:5432/dbname
BETTER_AUTH_SECRET=your-secret-here-generate-with-openssl-rand-hex-32
ALLOWED_ORIGINS=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```python
# Backend environment validation (main.py)
import os

required_vars = ["DATABASE_URL", "BETTER_AUTH_SECRET", "ALLOWED_ORIGINS"]
missing = [var for var in required_vars if not os.getenv(var)]

if missing:
    raise RuntimeError(f"Missing required environment variables: {', '.join(missing)}")
```

---

## 8. Password Hashing: bcrypt

### Decision
Use **bcrypt** for password hashing (via Better Auth default).

### Rationale
1. **Adaptive Cost**: Configurable work factor (increases over time as hardware improves)
2. **Salt Included**: Automatic per-password salt (prevents rainbow table attacks)
3. **Industry Standard**: OWASP recommended, widely audited
4. **Better Auth Default**: No configuration needed

### Alternatives Considered
- **SHA-256**:
  - **Rejected**: Not designed for password hashing (too fast, no adaptive cost).
- **Argon2**:
  - **Considered**: Winner of Password Hashing Competition. Better Auth may support in future. bcrypt is sufficient for Phase 2.

### Implementation Pattern
```python
# Better Auth handles hashing automatically
from better_auth import BetterAuth

auth = BetterAuth(...)
user = await auth.create_user(email, password)  # Password hashed before storage
```

---

## 9. Mobile-First Responsive Design

### Decision
Design for **mobile-first** with breakpoints: mobile (default), tablet (768px+), desktop (1024px+).

### Rationale
1. **Mobile Usage**: 73% of habit tracking occurs on mobile devices
2. **Progressive Enhancement**: Start with essential mobile experience, add desktop features
3. **Touch Targets**: 44×44px minimum for accessibility (Apple HIG, Material Design guidelines)
4. **Thumb Zone**: Critical actions in bottom 60% of screen

### TailwindCSS Breakpoints
- `sm`: 640px (large phones, landscape)
- `md`: 768px (tablets)
- `lg`: 1024px (small desktops)
- `xl`: 1280px (large desktops)

### Implementation Pattern
```tsx
// Mobile-first button (full width on mobile, auto width on desktop)
<Button className="w-full lg:w-auto">Register</Button>

// Touch target utility
<button className="min-h-[44px] min-w-[44px] px-4">Login</button>
```

---

## 10. Testing Strategy

### Decision
Use **pytest** for backend, **Jest + React Testing Library** for frontend, and **contract tests** for API validation.

### Test Layers

**Unit Tests**:
- Business logic (authentication, validation)
- Database models (SQLModel validators)
- Event emitter

**API Tests**:
- All endpoints (happy path + error cases)
- Authentication flows (register, login, logout)
- Authorization (users cannot access others' data)

**Contract Tests**:
- OpenAPI schema validation
- Request/response format verification

**Integration Tests**:
- Event flows (USER_REGISTERED → event logged)
- Database transactions (rollback on error)

### Implementation Pattern
```python
# tests/unit/test_auth_service.py
import pytest
from src.services.auth_service import AuthService

def test_register_creates_user(db_session):
    auth = AuthService(db_session)
    user = auth.register("test@example.com", "password123")

    assert user.email == "test@example.com"
    assert user.password_hash != "password123"  # Password hashed
```

```python
# tests/contract/test_openapi.py
from fastapi.testclient import TestClient
from src.main import app

def test_register_matches_openapi_schema():
    client = TestClient(app)
    response = client.post("/api/auth/register", json={
        "email": "test@example.com",
        "password": "password123"
    })

    assert response.status_code == 201
    assert "user" in response.json()
    assert "id" in response.json()["user"]
```

---

## Summary

All technical decisions are finalized with clear rationale and implementation patterns. No "NEEDS CLARIFICATION" items remain. The research supports:

1. **Authentication**: Better Auth + JWT in httpOnly cookies + database-backed sessions
2. **Database**: Neon PostgreSQL + Alembic migrations + SQLModel ORM
3. **Monorepo**: pnpm workspaces (apps/web, apps/api, packages/core)
4. **Events**: File-based JSON logging with daily rotation
5. **Frontend**: Next.js 16 App Router + TailwindCSS 4 + Radix UI
6. **Security**: bcrypt password hashing, environment variables, CORS configuration
7. **Design**: Mobile-first responsive with 44×44px touch targets
8. **Testing**: pytest (backend), Jest (frontend), contract tests (OpenAPI)

This research informs the data model, API contracts, and implementation tasks in subsequent planning phases.
