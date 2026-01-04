# Evolution of Todo: Atomic Habits Edition - Constitution

<!--
SYNC IMPACT REPORT
==================
Version Change: [UNVERSIONED] → 1.0.0
Rationale: Initial constitution ratification for hackathon project

Modified Principles: N/A (initial creation)
Added Sections:
  - Project Identity
  - Immutable Principles (12 principles)
  - Architectural Constraints
  - Atomic Habits Integration
  - Event-Driven Design
  - Modular Structure
  - Phase Evolution Strategy
  - Testing Requirements
  - Spec-Driven Workflow
  - Bonus Points Strategy
  - Submission Requirements
  - Anti-Patterns to Avoid
  - Governance

Removed Sections: N/A (initial creation)

Templates Requiring Updates:
  ✅ .specify/memory/constitution.md (this file)
  ⚠ .specify/templates/plan-template.md (verify constitution check alignment)
  ⚠ .specify/templates/spec-template.md (verify scope/requirements alignment)
  ⚠ .specify/templates/tasks-template.md (verify task categorization alignment)

Follow-up TODOs:
  - Validate template consistency after constitution creation
  - Create PHR for constitution creation
-->

## Project Identity

**Mission Statement**

To build a cloud-native, AI-powered habit builder that transforms todo management into a behavior change platform by systematically applying the Four Laws of Behavior Change from Atomic Habits across five progressive development phases.

**Core Philosophy**

We believe lasting behavior change happens through identity transformation, not willpower. By combining task management with Atomic Habits principles—making good habits obvious, attractive, easy, and satisfying—we create technology that reinforces who users want to become, not just what they want to do. This project demonstrates that spec-driven development can produce production-grade systems while maintaining architectural discipline across radical technology evolution.

---
### Task vs Habit Distinction

**Tasks** are one-time completions (outcome-focused):
- "Write project proposal"
- "Call dentist"
- Completion: Binary (done or not done)

**Habits** are recurring behaviors (identity-focused):
- "I am a person who exercises daily"
- "I am a person who reads before bed"
- Completion: Tracked over time (streaks, consistency)

**Relationship**: Tasks are managed by Core module. Habits are managed by Habits module. A completed task CAN suggest habit creation (event-driven):
```
TASK_COMPLETED (exercise-related task) → Habits Module suggests: "Turn this into a habit?"
```

**Success Criteria**

- **Phase I (Foundation)**: Console app with in-memory CRUD operations, full spec-driven development workflow established, zero manual code written
- **Phase II (Persistence)**: Multi-user web app deployed to production (Vercel + backend API), database persisting tasks, authentication working, event hooks emitting (no consumers yet)
- **Phase III (AI Layer)**: Conversational interface deployed, MCP server operational, OpenAI/Gemini integration working, natural language task creation functional
- **Phase IV (Containerization)**: Docker containers built, Helm charts created, Minikube deployment successful, kubectl-ai configured
- **Phase V (Cloud-Native)**: Kubernetes cluster deployed to cloud, Kafka event streaming operational, Dapr runtime integrated, CI/CD pipeline automated, production monitoring active
- **Post-Core (Habits Module)**: Four Laws fully implemented as optional feature module, identity-based habit tracking working, streak visualization operational, milestone celebrations triggering

**Target User**

Individuals committed to personal growth through incremental behavior change who value:
- Identity-driven habit formation over goal-oriented task completion
- Evidence-based behavior change techniques grounded in neuroscience
- Systems that reduce decision fatigue through intelligent defaults
- Progress visualization that reinforces positive self-image
- Technology that respects their data sovereignty and privacy

---

## Immutable Principles

### I. Spec-Driven Development is Mandatory

**Rule**: No code shall be written manually. All implementation emerges from specifications processed by Claude Code.

**Rationale**: Manual coding introduces inconsistencies, skips documentation, and bypasses architectural review. Spec-driven development ensures every line of code has passed through the constitution → spec → plan → tasks → implementation workflow, creating an auditable trail and preventing "cowboy coding" that violates architectural principles.

**Implementation**:
- Every feature MUST begin with a spec in `specs/<feature>/spec.md`
- Specs undergo user approval before planning
- Plans decompose into tasks with acceptance criteria
- Code generation happens only after task approval
- Manual edits trigger spec update requirement

### II. User Identity Drives Behavior

**Rule**: The system MUST frame all interactions using identity-based language ("I am a person who...") rather than outcome-based language ("I want to...").

**Rationale**: Research shows identity change precedes behavior change. When users identify as "a runner" rather than "someone trying to lose weight," they exhibit 2x higher adherence rates. Our system architecture reinforces identity at every touchpoint.

**Implementation**:
- User profiles include identity statements
- Task descriptions encourage identity framing
- UI copy uses "people like you who..." patterns
- Habit tracking celebrates identity milestones (21, 66, 100 day marks)
- Analytics highlight identity-congruent behaviors

### III. Modular Architecture with Feature Flags

**Rule**: Core functionality MUST work without any feature module. Feature modules MUST be independently toggleable without breaking the system.

**Rationale**: This enables progressive enhancement, phased rollouts, A/B testing, and graceful degradation. Users on slow connections or basic devices get core features; advanced users get richer experiences. Development teams can ship modules independently.

**Implementation**:
- Core module provides: user auth, task CRUD, database, event emitter
- Feature modules are optional: Habits, Analytics, Integrations, Voice, I18n
- Environment variables control feature activation (e.g., `ENABLE_HABITS_MODULE=true`)
- API endpoints return 404 for disabled features
- Frontend gracefully hides UI for disabled modules

### IV. Event-Driven Design from Phase II Onwards

**Rule**: All inter-module communication MUST occur via events. Core module emits events but never consumes them. Feature modules subscribe to events but never modify core tables directly.

**Rationale**: Event-driven architecture decouples modules, enabling independent scaling, asynchronous processing, and zero-downtime feature deployment. It prevents the "big ball of mud" anti-pattern where every module depends on every other.

**Implementation**:
- Phase II: Event hooks emit but no consumers (future-proofing)
- Phase III+: Feature modules subscribe to events
- Phase V: Kafka replaces in-memory event bus
- Event schema: `{ user_id, timestamp, event_type, payload }`
- Events are fire-and-forget (non-blocking)

### V. Every Feature Maps to the Four Laws

**Rule**: No habit-related feature shall be added unless it clearly implements one or more of the Four Laws of Behavior Change.

**Rationale**: This constitution exists to build a behavior change platform, not a generic todo app. Every feature must advance the mission. The Four Laws provide an objective filter against feature creep.

**Implementation**:
- Feature specs include "Four Laws Mapping" section
- Code reviews verify Law alignment
- Analytics track which Laws drive user success
- UI design prioritizes Laws in order: Obvious → Attractive → Easy → Satisfying

### VI. Database as Single Source of Truth

**Rule**: All services MUST be stateless. State persists exclusively in the database. No in-memory caches, session stores, or localStorage for critical data.

**Rationale**: Stateless services enable horizontal scaling, zero-downtime deployments, and simplified disaster recovery. Kubernetes can kill/restart pods without data loss. Load balancers can route requests anywhere.

**Implementation**:
- Backend services store nothing in memory beyond request lifecycle
- Frontend uses database-backed state (via API calls)
- React state is ephemeral UI state only
- Session tokens in httpOnly cookies, validated against database
- Cache invalidation happens at database level (triggers/events)

### VII. Mobile-First Responsive Design

**Rule**: All UI components MUST be designed for mobile screens first, then progressively enhanced for tablets and desktops.

**Rationale**: 73% of habit tracking occurs on mobile devices (morning routines, commute reflections, bedtime reviews). A desktop-first design creates clunky mobile experiences that reduce engagement.

**Implementation**:
- CSS breakpoints: mobile (default) → tablet (768px+) → desktop (1024px+)
- Touch targets minimum 44×44px
- Forms use mobile-optimized input types (`type="tel"`, `inputmode="numeric"`)
- Navigation uses bottom tab bar on mobile
- Critical actions accessible within thumb reach zone

### VIII. API-First Architecture

**Rule**: Backend APIs MUST be fully functional and documented before frontend development begins for any feature.

**Rationale**: API-first ensures frontend and backend teams work in parallel without blocking. It forces clear contract definitions, enables third-party integrations, and allows MCP servers to consume the same APIs as the web UI.

**Implementation**:
- OpenAPI 3.1 spec generated from FastAPI route decorators
- API docs auto-deployed to `/docs` endpoint
- Contract tests verify request/response schemas
- Frontend mocks API during development using OpenAPI spec
- MCP tools call same endpoints as web UI

### IX. Progressive Complexity Across Phases

**Rule**: No feature from Phase N+1 shall be built in Phase N. Each phase MUST be fully functional and deployable before proceeding.

**Rationale**: Skipping phases creates technical debt, untested assumptions, and architectural mismatch. A Phase I console app forces clarity on business logic before UI distracts. Phase II web app validates database schema before AI complicates it.

**Implementation**:
- Git tags mark phase completions (`phase-1-complete`, `phase-2-complete`, etc.)
- Phase gates require: deployed app, passing tests, user acceptance, spec archive
- Refactoring between phases documented in ADRs
- Each phase README includes "What's New" and "Migration Guide"

### X. Test Specs, Not Implementation

**Rule**: Tests MUST verify acceptance criteria from specs, not internal implementation details.

**Rationale**: Implementation-coupled tests break during refactoring even when behavior stays correct. Spec-based tests remain stable across architectural changes, enabling confident rewrites.

**Implementation**:
- Unit tests assert business rules from spec, not private method calls
- API tests verify OpenAPI contract, not database queries
- Integration tests exercise user journeys, not service boundaries
- Mocks used only for external dependencies (Stripe, OpenAI), never internal modules
- Test descriptions copy-paste acceptance criteria from spec

### XI. No Hardcoded Configuration

**Rule**: All environment-specific values (URLs, API keys, feature flags, timeouts) MUST be externalized to environment variables or configuration files.

**Rationale**: Hardcoded config prevents deploying the same artifact to dev/staging/prod, leaks secrets into version control, and requires code changes for operational tuning.

**Implementation**:
- `.env.example` documents all required variables
- `.env` never committed (in `.gitignore`)
- Docker images use build args for compile-time config, env vars for runtime config
- Kubernetes ConfigMaps for non-sensitive settings, Secrets for credentials
- Application crashes on startup if required env vars missing

### XII. Composition Over Inheritance

**Rule**: Code reuse MUST occur via composition (small functions/services) rather than inheritance hierarchies.

**Rationale**: Deep inheritance creates fragile coupling ("the fragile base class problem"). Composition enables mixing behaviors without predicting the future. Event-driven + microservices architectures favor composition.

**Implementation**:
- Prefer TypeScript/Python utility functions over class hierarchies
- React components use hooks (composition) over class inheritance
- Backend services implement interfaces via dependency injection
- Database models use mixins (SQLModel) rather than multi-level inheritance
- Shared logic extracted to libraries, not base classes

---

## Architectural Constraints

### Core Architecture Pattern

**Monorepo Structure (Phases II-V)**:
```
/
├── apps/
│   ├── web/              # Next.js 16+ frontend
│   ├── api/              # FastAPI backend
│   └── chatbot/          # Phase III conversational UI
├── packages/
│   ├── core/             # Shared types, utilities
│   ├── habits/           # Habits module (post-Phase V)
│   ├── analytics/        # Analytics module
│   └── voice/            # Voice commands module
├── infra/
│   ├── docker/           # Dockerfiles
│   ├── k8s/              # Kubernetes manifests
│   └── helm/             # Helm charts
└── specs/                # Feature specifications
```

**Modular Design**: Core module + feature modules with clear boundaries.

**Event Bus**: In-memory (Phases II-IV) → Kafka (Phase V).

**Stateless Services**: All backend services can be killed/restarted without data loss.

**Progressive Enhancement**: Core works on basic browsers; advanced features require modern capabilities.

### Technology Non-Negotiables

**Backend**:
- Python 3.13+ (required for performance improvements)
- UV for dependency management (faster than pip)
- FastAPI for REST APIs (OpenAPI auto-generation)
- SQLModel for ORM (Pydantic + SQLAlchemy integration)
- Neon Serverless PostgreSQL (auto-scaling, branching)

**Frontend**:
- Next.js 16+ with App Router (React Server Components)
- TypeScript 5.8+ (strict mode enabled)
- TailwindCSS 4+ (utility-first styling)
- Radix UI for accessible components

**Authentication**:
- Better Auth (modern auth library)
- JWT for stateless tokens
- httpOnly cookies for token storage

**Development Tools**:
- Claude Code for all code generation
- Spec-Kit Plus for SDD workflow
- Docker for containerization (Phases IV-V)
- Kubernetes + Helm for orchestration (Phases IV-V)

**Cloud Infrastructure (Phase V)**:
- Kubernetes cluster (Azure AKS, GCP GKE, or Oracle OKE)
- Kafka for event streaming
- Dapr for microservices runtime (state management, pub/sub, observability)

### Forbidden Patterns

**❌ No localStorage for Critical Data**:
- Use React state for ephemeral UI state
- Use database (via API) for persistent state
- localStorage only for non-critical preferences (theme, sidebar collapsed)

**❌ No Manual Code Writing**:
- All code generated from specs via Claude Code
- Manual edits require spec update + regeneration

**❌ No Tight Coupling Between Modules**:
- Modules communicate via events, never direct imports
- Core module never imports feature modules
- Feature modules import core types only

**❌ No Skipping Phases**:
- Phase N+1 work forbidden until Phase N deployed and tagged
- Backfilling earlier phases creates architectural debt

**❌ No Synchronous Event Handling**:
- Event handlers must be async and non-blocking
- Long-running tasks go to background jobs (Celery/Dapr)

**❌ No Database Schema Changes Without Migrations**:
- Alembic migrations required for all schema changes
- Migrations tested in dev environment before production
- Rollback plan documented for every migration

---

## Atomic Habits Integration

### 1st Law: Make It Obvious

**Principle**: Behavior change begins with awareness. The system surfaces cues that trigger desired habits.

**Implementation**:
- **Implementation Intentions**: Users specify "I will [BEHAVIOR] at [TIME] in [LOCATION]"
  - Example: "I will meditate at 7:00 AM in my bedroom"
  - Database stores: `habit_cue_time`, `habit_cue_location`
  - Push notifications at specified time
- **Habit Stacking**: Link new habits to existing ones
  - Example: "After I pour my morning coffee, I will write three gratitudes"
  - UI shows existing habits as anchor points
- **Visual Cues**: Dashboard highlights upcoming habits
  - Color-coded calendar shows scheduled vs completed
  - Widgets surface next habit due

**Database Schema**:
```sql
CREATE TABLE habit_cues (
  id UUID PRIMARY KEY,
  habit_id UUID REFERENCES habits(id),
  cue_type VARCHAR(20), -- 'time', 'location', 'stack'
  cue_time TIME,
  cue_location TEXT,
  anchor_habit_id UUID REFERENCES habits(id) -- for stacking
);
```

### 2nd Law: Make It Attractive

**Principle**: Dopamine drives motivation. We bundle habits with pleasurable activities and reinforce positive identity.

**Implementation**:
- **Identity-Based Language**:
  - Forms ask "What kind of person do you want to become?"
  - Habits phrased as "I am a person who..." not "I want to..."
  - Profile page shows identity statements prominently
- **Habit Bundling**: Pair necessary habits with enjoyable ones
  - Example: "I will listen to my favorite podcast ONLY while exercising"
  - Database links habits: `enjoyable_habit_id`
- **Progress Visualization**:
  - Heatmaps show consistency over time
  - Graphs display compound growth (1% better each day = 37x better in a year)
  - Milestones celebrated with animations

**Database Schema**:
```sql
CREATE TABLE user_identities (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  identity_statement TEXT, -- "I am a healthy person"
  created_at TIMESTAMPTZ
);

CREATE TABLE habit_bundles (
  necessary_habit_id UUID REFERENCES habits(id),
  enjoyable_habit_id UUID REFERENCES habits(id),
  PRIMARY KEY (necessary_habit_id, enjoyable_habit_id)
);
```

### 3rd Law: Make It Easy

**Principle**: Reduce friction for good habits, increase friction for bad ones. Start so small you can't say no.

**Implementation**:
- **2-Minute Rule**: Every habit must have a 2-minute starter version
  - Example: "Read 30 pages" → starter: "Read one page"
  - UI shows both full habit and 2-minute version
  - Users can log completion of either
- **Friction Reduction**:
  - One-tap habit logging (no forms)
  - Voice commands: "I completed my morning run"
  - Pre-filled times based on past behavior
- **Habit Difficulty Progression**:
  - Database tracks `difficulty_level` (1-5)
  - System suggests increasing difficulty after 21-day streak
  - Users can decline or accept progression

**Database Schema**:
```sql
CREATE TABLE habits (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  full_description TEXT,
  two_minute_version TEXT,
  difficulty_level INT CHECK (difficulty_level BETWEEN 1 AND 5),
  current_streak INT DEFAULT 0
);
```

### 4th Law: Make It Satisfying

**Principle**: What is immediately rewarded is repeated. What is immediately punished is avoided.

**Implementation**:
- **Habit Tracking Calendar**:
  - Visual grid showing completed days (green) vs missed (red)
  - Satisfying click to mark completion
  - "Don't break the chain" motivation
- **Never Miss Twice Rule**:
  - After one missed day, system sends encouragement: "Get back on track today"
  - Two missed days triggers different message: "The chain isn't broken, just bent"
- **Compound Growth Visualization**:
  - Graph showing 1% daily improvement compounding to 37x annual growth
  - Projections based on current streak
- **Milestone Celebrations**:
  - 21 days: "Habit forming!" (neural pathway creation)
  - 66 days: "Habit formed!" (average automaticity point)
  - 100 days: "Habit mastered!" (elite consistency)
  - Confetti animation + shareable achievement card

**Database Schema**:
```sql
CREATE TABLE habit_completions (
  id UUID PRIMARY KEY,
  habit_id UUID REFERENCES habits(id),
  completed_at TIMESTAMPTZ,
  completion_type VARCHAR(20) -- 'full', 'two_minute', 'voice'
);

CREATE TABLE milestones (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  habit_id UUID REFERENCES habits(id),
  milestone_type VARCHAR(20), -- '21_day', '66_day', '100_day'
  achieved_at TIMESTAMPTZ
);
```

---

## Event-Driven Design

### Core Events (Phase II+)

**TASK_CREATED**:
```json
{
  "event_type": "TASK_CREATED",
  "user_id": "uuid",
  "timestamp": "2025-12-31T10:30:00Z",
  "payload": {
    "task_id": "uuid",
    "title": "Write project proposal",
    "description": "...",
    "due_date": "2026-01-05"
  }
}
```

**TASK_UPDATED**:
```json
{
  "event_type": "TASK_UPDATED",
  "user_id": "uuid",
  "timestamp": "2025-12-31T11:00:00Z",
  "payload": {
    "task_id": "uuid",
    "changes": {
      "status": "in_progress",
      "priority": "high"
    }
  }
}
```

**TASK_COMPLETED**:
```json
{
  "event_type": "TASK_COMPLETED",
  "user_id": "uuid",
  "timestamp": "2025-12-31T15:45:00Z",
  "payload": {
    "task_id": "uuid",
    "completion_time": "2025-12-31T15:45:00Z"
  }
}
```

**TASK_DELETED**:
```json
{
  "event_type": "TASK_DELETED",
  "user_id": "uuid",
  "timestamp": "2025-12-31T16:00:00Z",
  "payload": {
    "task_id": "uuid"
  }
}
```

**USER_LOGGED_IN**:
```json
{
  "event_type": "USER_LOGGED_IN",
  "user_id": "uuid",
  "timestamp": "2025-12-31T09:00:00Z",
  "payload": {
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0..."
  }
}
```

### Habit Events (Post-Core, Habits Module)

**HABIT_CREATED**:
```json
{
  "event_type": "HABIT_CREATED",
  "user_id": "uuid",
  "timestamp": "2025-12-31T10:00:00Z",
  "payload": {
    "habit_id": "uuid",
    "full_description": "Run 5km",
    "two_minute_version": "Put on running shoes",
    "identity_statement": "I am a runner"
  }
}
```

**HABIT_COMPLETED**:
```json
{
  "event_type": "HABIT_COMPLETED",
  "user_id": "uuid",
  "timestamp": "2025-12-31T07:30:00Z",
  "payload": {
    "habit_id": "uuid",
    "completion_type": "full",
    "completion_method": "voice" // or 'click', 'api'
  }
}
```

**STREAK_UPDATED**:
```json
{
  "event_type": "STREAK_UPDATED",
  "user_id": "uuid",
  "timestamp": "2025-12-31T07:30:01Z",
  "payload": {
    "habit_id": "uuid",
    "previous_streak": 20,
    "current_streak": 21,
    "milestone_reached": "21_day"
  }
}
```

**MILESTONE_REACHED**:
```json
{
  "event_type": "MILESTONE_REACHED",
  "user_id": "uuid",
  "timestamp": "2025-12-31T07:30:02Z",
  "payload": {
    "habit_id": "uuid",
    "milestone_type": "21_day",
    "message": "Habit forming! Neural pathways are being created."
  }
}
```

**IDENTITY_SET**:
```json
{
  "event_type": "IDENTITY_SET",
  "user_id": "uuid",
  "timestamp": "2025-12-31T10:05:00Z",
  "payload": {
    "identity_statement": "I am a person who values health",
    "related_habits": ["habit_uuid_1", "habit_uuid_2"]
  }
}
```

### Event Contract Rules

1. **Schema Consistency**: All events MUST include `{ user_id, timestamp, event_type, payload }`
2. **Fire-and-Forget**: Events are asynchronous and non-blocking
3. **Subscription Model**: Modules subscribe to events they care about
4. **No Backchannel**: Event consumers cannot modify event producers directly
5. **Idempotency**: Event handlers must be idempotent (safe to replay)
6. **Ordering**: Events for same `user_id` + `habit_id` maintain order (Kafka partition key)

---

## Modular Structure

### Core Module (Required)

**Responsibilities**:
- User authentication (Better Auth + JWT)
- Task CRUD operations (create, read, update, delete)
- Database models (SQLModel schemas)
- Event emitter (publish events to bus)

**Database Tables**:
- `users` (id, email, password_hash, created_at)
- `tasks` (id, user_id, title, description, status, due_date)
- `sessions` (id, user_id, token, expires_at)

**API Endpoints**:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

**Events Emitted**:
- TASK_CREATED, TASK_UPDATED, TASK_COMPLETED, TASK_DELETED, USER_LOGGED_IN

### Feature Modules (Optional)

#### Habits Module (Post-Phase V)
**Responsibilities**: Implement Four Laws, habit tracking, streaks, milestones

**Database Tables**:
- `habits`, `habit_cues`, `habit_completions`, `user_identities`, `milestones`

**API Endpoints**:
- `POST /api/habits`
- `POST /api/habits/:id/complete`
- `GET /api/habits/:id/streak`

**Events Consumed**: TASK_COMPLETED (to suggest habit conversion)
**Events Emitted**: HABIT_CREATED, HABIT_COMPLETED, STREAK_UPDATED, MILESTONE_REACHED

#### Analytics Module
**Responsibilities**: Heatmaps, graphs, compound growth projections

**Database Tables**:
- `analytics_snapshots` (daily aggregates)

**API Endpoints**:
- `GET /api/analytics/heatmap`
- `GET /api/analytics/growth-projection`

**Events Consumed**: HABIT_COMPLETED, TASK_COMPLETED

#### Integrations Module
**Responsibilities**: Webhooks, calendar sync (Google Calendar, Outlook)

**Database Tables**:
- `webhooks`, `calendar_syncs`

**API Endpoints**:
- `POST /api/webhooks`
- `GET /api/integrations/calendar/auth`

**Events Consumed**: TASK_CREATED, HABIT_COMPLETED

#### Voice Module
**Responsibilities**: Speech-to-text, text-to-speech

**API Endpoints**:
- `POST /api/voice/transcribe`
- `POST /api/voice/synthesize`

**Events Consumed**: None (stateless service)

#### I18n Module (Urdu Support)
**Responsibilities**: Translations, RTL layout

**Database Tables**:
- `translations` (key, locale, value)

**API Endpoints**:
- `GET /api/i18n/:locale`

**Events Consumed**: None

### Module Independence Rules

1. **Core Works Standalone**: Disabling all feature modules still produces functional task app
2. **Event-Only Communication**: Feature modules subscribe to events, never import core code
3. **No Direct Table Modification**: Feature modules cannot `UPDATE users` or `UPDATE tasks`
4. **Separate Tables**: Each feature module owns its tables
5. **Feature Flags**: Environment variables control module activation
   ```bash
   ENABLE_HABITS_MODULE=true
   ENABLE_ANALYTICS_MODULE=false
   ENABLE_VOICE_MODULE=true
   ```
6. **Graceful Degradation**: Frontend hides UI for disabled modules

---

## Phase Evolution Strategy

### Phase I: Foundation (Console App)

**Objectives**:
- Learn spec-driven development workflow
- Establish CRUD business logic
- Zero external dependencies

**Technology**:
- Python 3.13+ with UV
- In-memory data structures (no database)
- Console I/O (no web framework)

**Deliverables**:
- Working console REPL
- Commands: `add`, `list`, `update`, `delete`, `exit`
- Passing unit tests
- Spec, plan, tasks documents

**Success Criteria**:
- Can add/list/update/delete tasks
- Data persists during session (lost on exit)
- No authentication (single-user)
- All code generated from specs

### Phase II: Persistence + Multi-user (Web App)

**Objectives**:
- Add database persistence
- Implement multi-user authentication
- Deploy to production
- Emit events (no consumers yet)

**Technology**:
- Monorepo structure (`apps/web`, `apps/api`)
- Next.js 16 frontend (Vercel deployment)
- FastAPI backend (Railway/Render deployment)
- Neon Serverless PostgreSQL
- Better Auth + JWT

**Deliverables**:
- Deployed web app (public URL)
- User registration/login working
- Tasks persisted to database
- Event hooks emitting (logged, not consumed)

**Success Criteria**:
- Multiple users can register and log in
- Each user sees only their tasks
- CRUD operations work via web UI
- Database migrations applied
- Event logs show TASK_CREATED, TASK_COMPLETED, etc.

### Phase III: AI Layer (Conversational Interface)

**Objectives**:
- Add natural language interface
- Integrate OpenAI/Gemini models
- Build MCP server with task tools

**Technology**:
- OpenAI ChatKit (conversational UI)
- MCP server (Model Context Protocol)
- OpenAI Agents SDK + Gemini integration
- FastAPI endpoints for MCP tools

**Deliverables**:
- Chatbot interface deployed
- MCP server operational
- Tools: `create_task`, `list_tasks`, `complete_task`, `search_tasks`
- Natural language parsing working

**Success Criteria**:
- Users can say "Remind me to call mom tomorrow at 3pm" → task created
- Chatbot maintains context across conversation
- MCP tools callable from chatbot
- Stateless chat (no conversation history in memory)

### Phase IV: Containerization (Local Kubernetes)

**Objectives**:
- Containerize frontend and backend
- Create Helm charts
- Deploy to local Minikube
- Use kubectl-ai and kagent

**Technology**:
- Docker (multi-stage builds)
- Kubernetes manifests
- Helm charts
- Minikube (local cluster)
- kubectl-ai (natural language kubectl commands)
- kagent (AI-powered cluster management)

**Deliverables**:
- Dockerfiles for `apps/web` and `apps/api`
- Helm chart in `infra/helm/`
- Minikube deployment instructions
- Health check endpoints

**Success Criteria**:
- `docker build` succeeds for both apps
- `helm install` deploys to Minikube
- Pods healthy and passing readiness probes
- Can access app via `minikube service`
- kubectl-ai can describe resources

### Phase V: Cloud + Event-Driven (Production)

**Objectives**:
- Deploy to cloud Kubernetes (Azure/GCP/Oracle)
- Replace in-memory events with Kafka
- Integrate Dapr runtime
- Add advanced features (recurring tasks, reminders)
- CI/CD pipeline

**Technology**:
- Azure AKS / GCP GKE / Oracle OKE
- Kafka for event streaming
- Dapr for microservices runtime
- GitHub Actions for CI/CD
- Prometheus + Grafana for monitoring

**Deliverables**:
- Cloud cluster deployed
- Kafka cluster operational
- Dapr sidecars injected
- Recurring tasks feature working
- CI/CD pipeline auto-deploying on merge to main

**Success Criteria**:
- App accessible via public cloud URL
- Kafka topics receiving events
- Feature modules consuming events via Dapr pub/sub
- Recurring tasks creating instances on schedule
- Monitoring dashboards showing metrics
- Zero-downtime deployments working

### Post-Core: Habits Module

**Objectives**:
- Implement Four Laws systematically
- Build identity-based habit tracking
- Add streak visualization and milestones

**Technology**:
- Same stack as Phase V
- New database tables for habits
- New Kafka topics for habit events

**Deliverables**:
- Habits CRUD API
- Four Laws features (cues, bundles, 2-minute rule, tracking calendar)
- Streak calculation engine
- Milestone celebration animations

**Success Criteria**:
- Users can create habits with implementation intentions
- Habit stacking suggests anchor habits
- 2-minute versions displayed and loggable
- Heatmap shows consistency
- Milestones trigger at 21, 66, 100 days
- Identity statements displayed on profile

### Incremental Habits Module Rollout

Build habits features in this order to maximize demo impact:

**Week 1 (Foundation)**:
- [ ] Identity statements (2nd Law: Make It Attractive)
- [ ] Habit CRUD with 2-minute versions (3rd Law: Make It Easy)
- [ ] Basic completion logging

**Week 2 (Tracking)**:
- [ ] Habit tracking calendar (4th Law: Make It Satisfying)
- [ ] Streak calculation
- [ ] "Never miss twice" alerts

**Week 3 (Advanced)**:
- [ ] Implementation intentions (1st Law: Make It Obvious)
- [ ] Habit stacking
- [ ] Milestone celebrations (21, 66, 100 days)

**Week 4 (Polish)**:
- [ ] Compound growth visualization
- [ ] Habit bundles (enjoyable + necessary)
- [ ] Heatmap analytics

---

## Testing Requirements

### Test Coverage Standards

**Unit Tests**:
- All business logic functions (pure functions)
- Database models (SQLModel validators)
- Event emitters and subscribers
- Utility functions

**API Tests (Phase II+)**:
- All REST endpoints (happy path + error cases)
- Authentication flows (register, login, token refresh)
- Authorization (users cannot access others' tasks)
- Input validation (malformed requests return 400)

**Integration Tests**:
- Event flows (TASK_COMPLETED → STREAK_UPDATED → MILESTONE_REACHED)
- Database transactions (rollback on error)
- MCP tool chains (Phase III+)

**Container Tests (Phase IV+)**:
- Health check endpoints return 200
- Containers start successfully
- Environment variables injected correctly

**End-to-End Tests**:
- User registration → task creation → task completion
- Habit creation → 21-day completion → milestone reached

**Habit Logic Tests**:
- Streak calculation (consecutive days, missing days)
- Milestone detection (21, 66, 100-day triggers)
- "Never miss twice" alert conditions
- Compound growth projections
- 2-minute rule scaling logic

**Four Laws Validation Tests**:
- Implementation intention parsing
- Habit stack anchor selection
- Identity statement reinforcement messaging
- Calendar heatmap rendering

### Testing Principles

1. **Test Specs, Not Implementation**: Tests verify acceptance criteria from spec, not internal method calls
2. **Tests Before Implementation**: TDD enforced (write tests → approve → red → green → refactor)
3. **No Manual Testing as Primary Verification**: Automated tests required for all features
4. **Integration Tests for Contracts**: When modules interact via events, test the contract
5. **Mock External Dependencies Only**: Mock OpenAI, Stripe, etc. Never mock internal modules

### Test Organization

```
tests/
├── unit/
│   ├── test_tasks.py
│   ├── test_habits.py
│   └── test_events.py
├── integration/
│   ├── test_task_completion_flow.py
│   └── test_milestone_flow.py
├── api/
│   ├── test_auth_endpoints.py
│   └── test_task_endpoints.py
└── e2e/
    └── test_user_journey.py
```

---

## Spec-Driven Workflow

### The Sacred Loop

```
CONSTITUTION (WHY)
    ↓
SPECIFY (WHAT) → specs/<feature>/spec.md
    ↓
PLAN (HOW) → specs/<feature>/plan.md
    ↓
TASKS (BREAKDOWN) → specs/<feature>/tasks.md
    ↓
IMPLEMENT (CODE) → Claude Code generates code
    ↓
VERIFY (TEST) → Automated tests pass
    ↓
[ITERATE OR COMPLETE]
```

### Spec Rules

1. **Specs Include Acceptance Criteria**: Every feature spec has testable success conditions
2. **No Code Without Task**: Every line of code traces back to a task in `tasks.md`
3. **Claude Code Reads Specs**: AI generates implementation from spec, not from manual instructions
4. **Iterate on Specs, Not Code**: If feature needs changes, update spec → regenerate code

### Workflow Example

**User Request**: "Add recurring tasks feature"

1. **Constitution Check**: Does this violate immutable principles? (No) Is this the right phase? (Phase V only)
2. **Specify**: Create `specs/recurring-tasks/spec.md` with acceptance criteria
3. **User Approval**: User reviews spec, requests changes, approves final version
4. **Plan**: Create `specs/recurring-tasks/plan.md` with architectural decisions
5. **Tasks**: Create `specs/recurring-tasks/tasks.md` breaking work into testable chunks
6. **Implement**: Claude Code reads tasks, generates code (database migrations, API endpoints, frontend UI)
7. **Verify**: Run tests, fix failures, deploy to staging
8. **Complete**: Tag `recurring-tasks-complete`, archive spec

---

## Bonus Points Strategy

### Reusable Intelligence (+200 points)

**Objective**: Extract reusable Claude Code skills and subagents during development.

**Requirements**:
- Minimum 3 skills
- Minimum 2 subagents
- Documentation in `REUSABLE_ARTIFACTS/`

**Skill Ideas**:
1. `/generate-migration` - Create Alembic migration from SQLModel changes
2. `/add-api-endpoint` - Scaffold FastAPI endpoint with OpenAPI docs
3. `/create-react-component` - Generate Next.js component with TypeScript types

**Subagent Ideas**:
1. **Database Design Agent**: Takes feature description → proposes SQLModel schemas
2. **Event Flow Agent**: Analyzes feature → suggests events to emit/consume

**Deliverables**:
- `REUSABLE_ARTIFACTS/skills/` - Skill definitions
- `REUSABLE_ARTIFACTS/subagents/` - Subagent prompts
- `REUSABLE_ARTIFACTS/README.md` - Usage documentation

### Cloud-Native Blueprints (+200 points)

**Objective**: Create reusable deployment blueprints.

**Blueprints Required**:
1. **Full-Stack Deployment**: Next.js + FastAPI + PostgreSQL on Vercel + Railway
2. **Kubernetes Deployment**: Helm chart template for any microservice
3. **Event-Driven Architecture**: Kafka + Dapr configuration template
4. **CI/CD Pipeline**: GitHub Actions workflow for test → build → deploy

**Deliverables**:
- `REUSABLE_ARTIFACTS/blueprints/full-stack/` - Step-by-step guide + config files
- `REUSABLE_ARTIFACTS/blueprints/kubernetes/` - Helm chart template
- `REUSABLE_ARTIFACTS/blueprints/event-driven/` - Kafka + Dapr setup
- `REUSABLE_ARTIFACTS/blueprints/cicd/` - GitHub Actions workflows

### Multi-Language Support (+100 points)

**Objective**: Add Urdu translations and RTL support.

**Requirements**:
- All UI strings translatable
- RTL layout for Urdu
- Language switcher in UI
- Chatbot understands Urdu and English

**Implementation**:
- `i18n` module with `translations` table
- Next.js internationalized routing (`/en/`, `/ur/`)
- CSS `dir="rtl"` support
- OpenAI/Gemini prompt engineering for Urdu comprehension

**Deliverables**:
- Urdu translations for all UI strings
- RTL stylesheet
- Chatbot demo video showing Urdu commands
- Language switcher in header

### Voice Commands (+200 points)

**Objective**: Enable hands-free habit logging.

**Requirements**:
- Web Speech API integration
- Voice-to-text for commands
- Text-to-speech for responses
- Natural language parsing

**Use Cases**:
- "I completed my morning run" → logs habit completion
- "What's my streak for meditation?" → TTS response: "21 days"
- "Add task: call dentist tomorrow at 2pm" → creates task

**Implementation**:
- `voice` module with transcription API
- Frontend uses `SpeechRecognition` API
- Backend parses transcriptions (OpenAI function calling)
- TTS responds with `SpeechSynthesis` API

**Deliverables**:
- Voice commands working in deployed app
- Demo video showing voice interaction
- Documentation of supported commands

---

## Submission Requirements

### Phase I
- [ ] Console app source code in Git repository
- [ ] `specs/phase-1/spec.md`, `plan.md`, `tasks.md`
- [ ] README with setup instructions
- [ ] Passing unit tests

### Phase II
- [ ] Deployed web app URL (Vercel frontend)
- [ ] Deployed API URL (Railway/Render backend)
- [ ] Database connection working (Neon)
- [ ] User registration/login functional
- [ ] Event logs showing emitted events
- [ ] `specs/phase-2/` documentation

### Phase III
- [ ] Deployed chatbot interface URL
- [ ] MCP server operational (public endpoint or demo video)
- [ ] Natural language task creation working
- [ ] `specs/phase-3/` documentation

### Phase IV
- [ ] Dockerfile for frontend and backend
- [ ] Helm chart in repository
- [ ] Minikube deployment instructions
- [ ] Screenshots of running pods
- [ ] `specs/phase-4/` documentation

### Phase V
- [ ] Cloud deployment URL (Azure/GCP/Oracle)
- [ ] Kafka cluster accessible
- [ ] Dapr integration demonstrated
- [ ] CI/CD pipeline auto-deploying
- [ ] Monitoring dashboard screenshots
- [ ] `specs/phase-5/` documentation

### Post-Core (Habits Module)
- [ ] Habits CRUD working in deployed app
- [ ] Four Laws features demonstrated (video or screenshots)
- [ ] Streak tracking functional
- [ ] Milestone celebrations triggering
- [ ] `specs/habits-module/` documentation

### Bonus Points
- [ ] Reusable Intelligence artifacts in `REUSABLE_ARTIFACTS/`
- [ ] Cloud-Native Blueprints documented
- [ ] Urdu translations deployed
- [ ] Voice commands working

---

## Anti-Patterns to Avoid

### Development Anti-Patterns

❌ **Writing Code Manually**
- **Problem**: Violates spec-driven development mandate
- **Detection**: Code in commits without corresponding task in `tasks.md`
- **Prevention**: All code generation via Claude Code

❌ **Skipping Test Writing**
- **Problem**: Untested code breaks in production
- **Detection**: Code coverage below 80%
- **Prevention**: TDD enforced (tests before implementation)

❌ **Tight Coupling Between Modules**
- **Problem**: Cannot deploy modules independently
- **Detection**: Feature module imports core module code
- **Prevention**: Event-driven communication only

❌ **Feature Creep Before Core Complete**
- **Problem**: Delays foundational work, creates technical debt
- **Detection**: Habit features in Phase I-V
- **Prevention**: Phase gates enforced

❌ **Premature Optimization**
- **Problem**: Wastes time on unproven bottlenecks
- **Detection**: Caching layers before load testing
- **Prevention**: Profile first, optimize second

### Architectural Anti-Patterns

❌ **Shared Mutable State Between Modules**
- **Problem**: Race conditions, impossible to debug
- **Detection**: Global variables, singleton services
- **Prevention**: Stateless services, database as source of truth

❌ **Synchronous Event Handling**
- **Problem**: Blocks core module, creates cascading failures
- **Detection**: Event handler with `await` in critical path
- **Prevention**: Async, fire-and-forget events

❌ **Database Schema Changes Without Migrations**
- **Problem**: Production database inconsistent with code
- **Detection**: SQLModel changes without Alembic migration
- **Prevention**: CI checks for migration file on schema changes

❌ **Hardcoded Configuration Values**
- **Problem**: Cannot deploy same code to dev/staging/prod
- **Detection**: API URLs, feature flags in source code
- **Prevention**: Environment variables for all config

❌ **Module Dependencies on Feature Modules**
- **Problem**: Core cannot work without optional modules
- **Detection**: Core imports Habits module
- **Prevention**: Core emits events, never consumes feature module events

### Project Management Anti-Patterns

❌ **Starting Phase III Before Phase II Works**
- **Problem**: Foundational issues compound, rework required
- **Detection**: Phase III code in repository, Phase II not deployed
- **Prevention**: Git tags for phase completion gates

❌ **Building Features Not in Spec**
- **Problem**: Scope creep, untested features
- **Detection**: Code without corresponding spec file
- **Prevention**: Spec-driven workflow enforced

❌ **Refactoring Without Spec Updates**
- **Problem**: Spec and code diverge
- **Detection**: Major code changes, spec unchanged
- **Prevention**: Spec amendment process

---

## Governance

### Amendment Process

1. **Proposal**: Raise proposed change in issue or discussion
2. **Impact Analysis**: Identify affected templates, specs, code
3. **Approval**: User (project owner) approves amendment
4. **Documentation**: Update constitution with version bump
5. **Migration Plan**: Document changes required in existing code
6. **Propagation**: Update templates, specs, runtime guidance files

### Version Bump Rules

- **MAJOR (X.0.0)**: Backward-incompatible principle removals or redefinitions
  - Example: Removing "Spec-Driven Development is Mandatory"
- **MINOR (1.X.0)**: New principle/section added or materially expanded
  - Example: Adding "Principle XIII: Security-First Design"
- **PATCH (1.0.X)**: Clarifications, wording, typo fixes
  - Example: Rephrasing a principle for clarity without changing meaning

### Compliance Review

All specifications, plans, and pull requests MUST verify compliance with this constitution. Reviewers ask:

1. Does this violate any Immutable Principle?
2. Does this introduce a Forbidden Pattern?
3. Does this skip a phase or build Phase N+1 features in Phase N?
4. Does this include manual code without spec justification?
5. Are tests written before implementation?

### Complexity Justification

Any architectural decision increasing system complexity MUST be justified with:

- **Problem Statement**: What breaks if we don't do this?
- **Alternatives Considered**: Simpler approaches evaluated
- **Tradeoffs**: Costs vs benefits
- **ADR**: Architectural Decision Record documenting reasoning

---

**Version**: 1.0.0
**Ratified**: 2025-12-31
**Last Amended**: 2025-12-31
