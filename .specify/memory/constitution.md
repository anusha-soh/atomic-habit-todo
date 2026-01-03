# Evolution of Todo: Atomic Habits Edition - Constitution

<!--
SYNC IMPACT REPORT
==================
Version Change: [TEMPLATE] → 1.0.0
Rationale: Initial constitution ratification for hackathon Phase 2 project

Modified Principles: N/A (initial creation from template)
Added Sections:
  - Project Identity & Mission
  - 12 Immutable Principles
  - Architectural Constraints
  - Atomic Habits Integration (Four Laws)
  - Event-Driven Design
  - Modular Structure (Core + Habits modules)
  - Phase Evolution Strategy
  - Testing Requirements
  - Spec-Driven Workflow
  - Phase 2 Scope Definition
  - Bonus Points Strategy
  - Submission Requirements
  - Anti-Patterns to Avoid
  - Governance

Removed Sections: Generic template placeholders

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

To build a cloud-native, AI-powered habit builder that transforms todo management into a behavior change platform by systematically applying the Four Laws of Behavior Change from Atomic Habits, delivered incrementally across five progressive development phases.

**Core Philosophy**

We believe lasting behavior change happens through identity transformation, not willpower. By combining task management with Atomic Habits principles—making good habits obvious, attractive, easy, and satisfying—we create technology that reinforces who users want to become, not just what they want to do. This project demonstrates that spec-driven development can produce production-grade systems while maintaining architectural discipline across radical technology evolution.

---

### Task vs Habit Distinction

**Tasks** are one-time completions (outcome-focused):
- "Write project proposal"
- "Call dentist"
- Completion: Binary (done or not done)
- Attributes: title, description, priority (high/medium/low), tags, deadline, status

**Habits** are recurring behaviors (identity-focused):
- "I am a person who exercises daily"
- "I am a person who reads before bed"
- Completion: Tracked over time (streaks, consistency, never miss twice rule)
- Attributes: identity statement, 2-minute version, habit stacking cue, category, recurring schedule

**Relationship**: Habits are CONNECTED to tasks. A habit can generate daily task instances.
```
HABIT: "I am a person who runs daily"
  → Generates TASK: "Run 5km" (or 2-min version: "Put on running shoes")
  → User completes task → Habit streak updates → Events emitted
```

**Success Criteria**

- **Phase I (Foundation)**: Console app with in-memory CRUD operations, full spec-driven development workflow established, zero manual code written
- **Phase II (Persistence)**: Multi-user web app deployed to production (Vercel + Render), database persisting tasks AND habits (MVP), authentication working, event hooks emitting
- **Phase III (AI Layer)**: Conversational interface deployed, MCP server operational, OpenAI/Gemini integration working, natural language task and habit creation functional
- **Phase IV (Containerization)**: Docker containers built, Helm charts created, Minikube deployment successful, kubectl-ai configured
- **Phase V (Cloud-Native)**: Kubernetes cluster deployed to cloud, Kafka event streaming operational, Dapr runtime integrated, CI/CD pipeline automated, production monitoring active
- **Post-Phase V (Habits Enhancement)**: Full Four Laws implementation (implementation intentions, milestone celebrations, heatmap analytics, habit bundles)

**Target User**

Individuals committed to personal growth through incremental behavior change who value:
- Identity-driven habit formation over goal-oriented task completion
- Evidence-based behavior change techniques grounded in neuroscience (Atomic Habits framework)
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

**Rule**: The system MUST frame habit interactions using identity-based language ("I am a person who...") rather than outcome-based language ("I want to...").

**Rationale**: Research shows identity change precedes behavior change. When users identify as "a runner" rather than "someone trying to lose weight," they exhibit 2x higher adherence rates. Our system architecture reinforces identity at every touchpoint.

**Implementation**:
- Habit creation forms require identity statements
- Habits phrased as "I am a person who..." not "I want to..."
- UI copy uses "people like you who..." patterns
- Habit tracking celebrates identity milestones (21, 66, 100 day marks)
- Profile displays identity statements prominently

### III. Modular Architecture with Feature Flags

**Rule**: Core functionality (auth, tasks, events) MUST work without any feature module. Feature modules (Habits, Analytics, Voice) MUST be independently toggleable without breaking the system.

**Rationale**: This enables progressive enhancement, phased rollouts, A/B testing, and graceful degradation. Users on slow connections or basic devices get core features; advanced users get richer experiences. Development teams can ship modules independently.

**Implementation**:
- Core module provides: user auth, task CRUD, database, event emitter
- Habits module is separate but integrated from Phase 2 onwards
- Environment variables control feature activation (e.g., `ENABLE_HABITS_MODULE=true`)
- API endpoints return 404 for disabled features
- Frontend gracefully hides UI for disabled modules

### IV. Event-Driven Design from Phase II Onwards

**Rule**: All inter-module communication MUST occur via events. Core module emits events but never consumes them. Feature modules subscribe to events but never modify core tables directly.

**Rationale**: Event-driven architecture decouples modules, enabling independent scaling, asynchronous processing, and zero-downtime feature deployment. It prevents the "big ball of mud" anti-pattern where every module depends on every other.

**Implementation**:
- Phase II: Event hooks emit but minimal consumers (tasks ↔ habits connection)
- Phase III+: Feature modules subscribe to events
- Phase V: Kafka replaces in-memory event bus
- Event schema: `{ user_id, timestamp, event_type, payload }`
- Events are fire-and-forget (non-blocking)

### V. Every Habit Feature Maps to the Four Laws

**Rule**: No habit-related feature shall be added unless it clearly implements one or more of the Four Laws of Behavior Change from Atomic Habits.

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
│   ├── habits/           # Habits module (Phase II+)
│   ├── analytics/        # Analytics module (future)
│   └── voice/            # Voice commands module (bonus)
├── infra/
│   ├── docker/           # Dockerfiles
│   ├── k8s/              # Kubernetes manifests
│   └── helm/             # Helm charts
└── specs/                # Feature specifications
```

**Modular Design**: Core module (auth, tasks, events) + Habits module (Phase 2+) with clear boundaries.

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

**Deployment (Phase II)**:
- Frontend: Vercel
- Backend: Render
- Database: Neon Serverless PostgreSQL

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
- Core module never imports Habits module
- Habits module imports core types only

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

**Phase 2 MVP Implementation**:
- **Habit Stacking**: Link new habits to existing ones
  - Example: "After I pour my morning coffee, I will meditate for 1 minute"
  - UI shows existing habits as anchor points for stacking
  - Database stores: `habit_stacking_cue` (text field)

**Future Enhancements (Post-Phase V)**:
- Implementation Intentions: "I will [BEHAVIOR] at [TIME] in [LOCATION]"
- Visual Cues: Dashboard highlights upcoming habits
- Location-based reminders

**Database Schema (Phase 2)**:
```sql
CREATE TABLE habits (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  identity_statement TEXT NOT NULL,  -- "I am a person who..."
  full_description TEXT,
  two_minute_version TEXT NOT NULL,
  habit_stacking_cue TEXT,  -- "After I [ANCHOR HABIT], I will [THIS HABIT]"
  category VARCHAR(50),  -- predefined + "other"
  recurring_schedule JSONB,  -- {type: 'daily'|'weekly'|'monthly', until: 'date'}
  current_streak INT DEFAULT 0,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### 2nd Law: Make It Attractive

**Principle**: Dopamine drives motivation. We reinforce positive identity.

**Phase 2 MVP Implementation**:
- **Identity-Based Language**:
  - Forms ask "What kind of person do you want to become?"
  - Habits phrased as "I am a person who..." (required field)
  - Profile page shows identity statements prominently
- **Motivation Field**:
  - Text field: "Why do you want this habit?" (e.g., "I want to be healthier for my kids")
  - Displayed on habit detail view
- **Streak Visualization**:
  - Simple streak counter displayed on habit cards
  - Green checkmark animation + soft sound (sparkle/chime) on completion

**Future Enhancements (Post-Phase V)**:
- Habit Bundling: Pair necessary habits with enjoyable ones
- Progress heatmaps (like GitHub contribution graph)
- Compound growth visualization (1% daily = 37x yearly)
- Milestone celebrations (21, 66, 100 days)

**Database Schema (Phase 2)**:
```sql
ALTER TABLE habits ADD COLUMN motivation TEXT;
```

### 3rd Law: Make It Easy

**Principle**: Reduce friction for good habits. Start so small you can't say no.

**Phase 2 MVP Implementation**:
- **2-Minute Rule**: Every habit MUST have a 2-minute starter version
  - Example: "Read 30 pages" → starter: "Read one page"
  - Both full habit and 2-minute version stored in database
  - Users can log completion of either version
- **Friction Reduction**:
  - One-tap habit logging (checkbox, no forms)
  - Soft sound effect on completion (sparkle/chime)
  - Pre-populated habit suggestions based on category

**Future Enhancements (Post-Phase V)**:
- Voice commands: "I completed my morning run"
- Habit difficulty progression (auto-suggest harder versions after 21 days)
- Smart scheduling based on past completion times

### 4th Law: Make It Satisfying

**Principle**: What is immediately rewarded is repeated. What is immediately punished is avoided.

**Phase 2 MVP Implementation**:
- **Habit Completion Logging**:
  - Checkbox click to mark completion
  - Soft sound effect (sparkle/chime) plays immediately
  - Streak counter updates in real-time
- **Never Miss Twice Rule**:
  - After 1 missed day → Notification: "Get back on track today!"
  - After 2 consecutive missed days → Streak resets to 0 + Notification: "Your streak has reset. Start fresh today!"
  - Database tracks `last_completed_at` and `consecutive_misses`

**Future Enhancements (Post-Phase V)**:
- Tracking calendar heatmap (visual grid of completed days)
- Milestone celebrations with animations (21, 66, 100 days)
- Compound growth projections
- Shareable achievement cards

**Database Schema (Phase 2)**:
```sql
CREATE TABLE habit_completions (
  id UUID PRIMARY KEY,
  habit_id UUID REFERENCES habits(id),
  user_id UUID REFERENCES users(id),
  completed_at TIMESTAMPTZ,
  completion_type VARCHAR(20)  -- 'full' or 'two_minute'
);

ALTER TABLE habits ADD COLUMN last_completed_at TIMESTAMPTZ;
ALTER TABLE habits ADD COLUMN consecutive_misses INT DEFAULT 0;
```

---

## Event-Driven Design

### Core Events (Phase II+)

**TASK_CREATED**:
```json
{
  "event_type": "TASK_CREATED",
  "user_id": "uuid",
  "timestamp": "2026-01-02T10:30:00Z",
  "payload": {
    "task_id": "uuid",
    "title": "Write project proposal",
    "description": "...",
    "priority": "high",
    "due_date": "2026-01-10"
  }
}
```

**TASK_COMPLETED**:
```json
{
  "event_type": "TASK_COMPLETED",
  "user_id": "uuid",
  "timestamp": "2026-01-02T15:45:00Z",
  "payload": {
    "task_id": "uuid",
    "completion_time": "2026-01-02T15:45:00Z"
  }
}
```

### Habit Events (Phase II+)

**HABIT_CREATED**:
```json
{
  "event_type": "HABIT_CREATED",
  "user_id": "uuid",
  "timestamp": "2026-01-02T10:00:00Z",
  "payload": {
    "habit_id": "uuid",
    "identity_statement": "I am a runner",
    "full_description": "Run 5km",
    "two_minute_version": "Put on running shoes"
  }
}
```

**HABIT_COMPLETED**:
```json
{
  "event_type": "HABIT_COMPLETED",
  "user_id": "uuid",
  "timestamp": "2026-01-02T07:30:00Z",
  "payload": {
    "habit_id": "uuid",
    "completion_type": "full",  // or 'two_minute'
    "new_streak": 5
  }
}
```

**HABIT_STREAK_RESET**:
```json
{
  "event_type": "HABIT_STREAK_RESET",
  "user_id": "uuid",
  "timestamp": "2026-01-02T08:00:00Z",
  "payload": {
    "habit_id": "uuid",
    "previous_streak": 10,
    "reason": "missed_twice"
  }
}
```

**HABIT_GENERATES_TASK** (Connection between habits and tasks):
```json
{
  "event_type": "HABIT_GENERATES_TASK",
  "user_id": "uuid",
  "timestamp": "2026-01-02T00:00:00Z",
  "payload": {
    "habit_id": "uuid",
    "task_id": "uuid",
    "task_title": "Run 5km (from habit: I am a runner)"
  }
}
```

### Event Contract Rules

1. **Schema Consistency**: All events MUST include `{ user_id, timestamp, event_type, payload }`
2. **Fire-and-Forget**: Events are asynchronous and non-blocking
3. **Subscription Model**: Modules subscribe to events they care about
4. **No Backchannel**: Event consumers cannot modify event producers directly
5. **Idempotency**: Event handlers must be idempotent (safe to replay)
6. **Ordering**: Events for same `user_id` + `habit_id` maintain order (Kafka partition key in Phase V)

---

## Modular Structure

### Core Module (Required)

**Responsibilities**:
- User authentication (Better Auth + JWT)
- Task CRUD operations (create, read, update, delete, priorities, tags, search, filter, sort, due dates)
- Database models (SQLModel schemas)
- Event emitter (publish events to bus)

**Database Tables**:
- `users` (id, email, password_hash, created_at)
- `tasks` (id, user_id, title, description, status, priority, tags, due_date, completed, created_at, updated_at)
- `sessions` (id, user_id, token, expires_at)

**API Endpoints**:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/{user_id}/tasks` (with query params: priority, tags, search, sort)
- `POST /api/{user_id}/tasks`
- `PATCH /api/{user_id}/tasks/{id}`
- `DELETE /api/{user_id}/tasks/{id}`
- `PATCH /api/{user_id}/tasks/{id}/complete`

**Events Emitted**:
- TASK_CREATED, TASK_UPDATED, TASK_COMPLETED, TASK_DELETED, USER_LOGGED_IN

### Habits Module (Phase 2+)

**Responsibilities**:
- Habit CRUD operations
- Habit completion logging
- Streak tracking and "never miss twice" logic
- Generate daily task instances from habits

**Database Tables**:
- `habits` (id, user_id, identity_statement, full_description, two_minute_version, habit_stacking_cue, motivation, category, recurring_schedule, current_streak, last_completed_at, consecutive_misses)
- `habit_completions` (id, habit_id, user_id, completed_at, completion_type)

**API Endpoints**:
- `POST /api/{user_id}/habits`
- `GET /api/{user_id}/habits`
- `GET /api/{user_id}/habits/{id}`
- `PATCH /api/{user_id}/habits/{id}`
- `DELETE /api/{user_id}/habits/{id}`
- `POST /api/{user_id}/habits/{id}/complete` (logs completion, updates streak)

**Events Consumed**: None in Phase 2 (future: TASK_COMPLETED to suggest habit conversion)

**Events Emitted**: HABIT_CREATED, HABIT_COMPLETED, HABIT_STREAK_RESET, HABIT_GENERATES_TASK

### Module Independence Rules

1. **Core Works Standalone**: Disabling Habits module still produces functional task app
2. **Event-Only Communication**: Habits module subscribes to events, never imports core code directly
3. **No Direct Table Modification**: Habits module cannot `UPDATE tasks` table directly
4. **Separate Tables**: Each module owns its tables
5. **Feature Flags**: Environment variable controls module activation:
   ```bash
   ENABLE_HABITS_MODULE=true  # Default for Phase 2+
   ```
6. **Graceful Degradation**: Frontend hides habits UI if module disabled

---

## Phase Evolution Strategy

### Phase I: Foundation (Console App) - COMPLETED

**Objectives**: Learn spec-driven development workflow, establish CRUD business logic

**Deliverables**: Working console REPL with add/list/update/delete/mark complete

### Phase II: Persistence + Multi-user + Habits MVP (Web App) - CURRENT

**Objectives**:
- Add database persistence
- Implement multi-user authentication
- Deploy to production (Vercel + Render)
- Build FULL tasks feature set (Basic + Intermediate + Due dates)
- Build Habits MVP module

**Tasks Feature Set (Phase 2)**:
- ✅ Add Task
- ✅ Delete Task
- ✅ Update Task
- ✅ View Task List
- ✅ Mark as Complete
- ✅ Priorities (High/Medium/Low)
- ✅ Tags/Categories
- ✅ Search & Filter
- ✅ Sort Tasks
- ✅ Due Dates & Deadlines

**Habits MVP Feature Set (Phase 2)**:
- ✅ Identity statement ("I am a person who...")
- ✅ Full description + 2-minute version
- ✅ Habit stacking cue ("After I [X], I will [Y]")
- ✅ Motivation field
- ✅ Category (predefined + "other")
- ✅ Recurring schedule (daily/weekly/monthly + until date)
- ✅ Habit completion logging (checkbox + soft sound)
- ✅ Streak tracking
- ✅ Never miss twice rule (1 miss = notification, 2 miss = reset + notification)
- ✅ Habit generates daily task instances

**Technology**:
- Monorepo structure (`apps/web`, `apps/api`)
- Next.js 16 frontend (Vercel deployment)
- FastAPI backend (Render deployment)
- Neon Serverless PostgreSQL
- Better Auth + JWT

**Success Criteria**:
- Multiple users can register and log in
- Each user sees only their tasks and habits
- Task CRUD with all 9 features working
- Habit CRUD with MVP features working
- Habits generate task instances based on recurring schedule
- Streaks update correctly on completion
- Miss tracking and notifications functional
- Database migrations applied
- Event logs show all events

### Phase III: AI Layer (Conversational Interface)

**Objectives**: Add natural language interface for tasks and habits management

**Technology**: OpenAI ChatKit, MCP server, OpenAI Agents SDK + Gemini

### Phase IV: Containerization (Local Kubernetes)

**Objectives**: Containerize and deploy to local Minikube

**Technology**: Docker, Kubernetes, Helm, kubectl-ai, kagent

### Phase V: Cloud + Event-Driven (Production)

**Objectives**: Deploy to cloud, replace in-memory events with Kafka, integrate Dapr

**Technology**: Azure AKS / GCP GKE / Oracle OKE, Kafka, Dapr, GitHub Actions

### Post-Phase V: Habits Enhancement

**Objectives**: Complete Four Laws implementation

**Features**:
- Implementation intentions (time/location triggers)
- Habit bundles (necessary + enjoyable)
- Tracking calendar heatmap
- Milestone celebrations (21, 66, 100 days)
- Compound growth visualization
- Habit difficulty progression

---

## Testing Requirements

### Test Coverage Standards

**Unit Tests**:
- All business logic functions (pure functions)
- Database models (SQLModel validators)
- Event emitters and subscribers
- Utility functions (streak calculation, miss tracking)

**API Tests (Phase II+)**:
- All REST endpoints (happy path + error cases)
- Authentication flows (register, login, token refresh)
- Authorization (users cannot access others' tasks/habits)
- Input validation (malformed requests return 400)

**Integration Tests**:
- Event flows (HABIT_COMPLETED → Streak update → HABIT_STREAK_RESET)
- Database transactions (rollback on error)
- Habit → Task generation flow

**Habit Logic Tests**:
- Streak calculation (consecutive days, missing days)
- Never miss twice logic (1 miss notification, 2 miss reset)
- Task generation from habit recurring schedule
- 2-minute version vs full completion tracking

**Testing Principles**:
1. **Test Specs, Not Implementation**: Tests verify acceptance criteria from spec
2. **Tests Before Implementation**: TDD enforced (write tests → red → green → refactor)
3. **Mock External Dependencies Only**: Mock OpenAI, Stripe, etc. Never mock internal modules

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

### Chunked Delivery Strategy

**Phase 2 will be built in chunks**:

**Chunk 1: Core Infrastructure**
- User auth (Better Auth + JWT)
- Database setup (Neon + Alembic migrations)
- Monorepo structure
- Event emitter skeleton

**Chunk 2: Tasks Full Feature Set**
- Task CRUD (Basic 5 features)
- Priorities, tags, search, filter, sort (Intermediate 4 features)
- Due dates (Advanced 1 feature)
- Task events emitted

**Chunk 3: Habits MVP**
- Habit CRUD
- Identity statements + 2-minute versions
- Habit stacking cues
- Categories

**Chunk 4: Habit Tracking & Streaks**
- Completion logging (checkbox + sound)
- Streak calculation
- Never miss twice logic
- Notifications

**Chunk 5: Habits ↔ Tasks Connection**
- Recurring schedule parser
- Daily task generation from habits
- Event integration (HABIT_GENERATES_TASK)

**Chunk 6: Frontend Polish**
- Mobile-responsive UI
- Sound effects
- Loading states
- Error handling

**Chunk 7: Deployment**
- Vercel frontend deployment
- Render backend deployment
- Environment configuration
- Production testing

### Spec Rules

1. **Specs Include Acceptance Criteria**: Every feature spec has testable success conditions
2. **No Code Without Task**: Every line of code traces back to a task in `tasks.md`
3. **Claude Code Reads Specs**: AI generates implementation from spec, not from manual instructions
4. **Iterate on Specs, Not Code**: If feature needs changes, update spec → regenerate code

---

## Bonus Points Strategy

### Reusable Intelligence (+200 points)

**Objective**: Extract reusable Claude Code skills and subagents during development.

**Deliverables**:
- `REUSABLE_ARTIFACTS/skills/` - Skill definitions
- `REUSABLE_ARTIFACTS/subagents/` - Subagent prompts
- `REUSABLE_ARTIFACTS/README.md` - Usage documentation

### Cloud-Native Blueprints (+200 points)

**Objective**: Create reusable deployment blueprints.

**Deliverables**:
- Full-Stack Deployment guide (Next.js + FastAPI + PostgreSQL on Vercel + Render)
- Kubernetes Helm chart template
- Event-Driven Architecture guide (Kafka + Dapr)
- CI/CD Pipeline template (GitHub Actions)

### Multi-Language Support (+100 points)

**Objective**: Add Urdu translations and RTL support.

**Requirements**: All UI strings translatable, RTL layout, language switcher, chatbot understands Urdu

### Voice Commands (+200 points)

**Objective**: Enable hands-free habit logging.

**Requirements**: Web Speech API, voice-to-text, text-to-speech, natural language parsing

---

## Submission Requirements

### Phase II Deliverables

- [ ] Deployed web app URL (Vercel frontend)
- [ ] Deployed API URL (Render backend)
- [ ] Database connection working (Neon)
- [ ] User registration/login functional
- [ ] Task CRUD with all 9 features working (Basic + Intermediate + Due dates)
- [ ] Habit CRUD with MVP features working
- [ ] Habit completion logging functional
- [ ] Streak tracking working
- [ ] Never miss twice notifications working
- [ ] Habits generate task instances
- [ ] Event logs showing all events
- [ ] `specs/phase-2/` documentation (spec.md, plan.md, tasks.md)
- [ ] Demo video (max 90 seconds)
- [ ] GitHub repository with all source code

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

❌ **Feature Creep Before Phase Complete**
- **Problem**: Delays foundational work, creates technical debt
- **Detection**: Post-Phase V habits features in Phase 2
- **Prevention**: Stick to defined Phase 2 scope (MVP only)

❌ **Tight Coupling Between Modules**
- **Problem**: Cannot deploy modules independently
- **Detection**: Habits module imports Core module code directly
- **Prevention**: Event-driven communication only

❌ **Hardcoded Configuration Values**
- **Problem**: Cannot deploy same code to dev/staging/prod
- **Detection**: API URLs, feature flags in source code
- **Prevention**: Environment variables for all config

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
6. Does this habit feature map to one of the Four Laws?

### Complexity Justification

Any architectural decision increasing system complexity MUST be justified with:

- **Problem Statement**: What breaks if we don't do this?
- **Alternatives Considered**: Simpler approaches evaluated
- **Tradeoffs**: Costs vs benefits
- **ADR**: Architectural Decision Record documenting reasoning

---

**Version**: 1.0.0
**Ratified**: 2026-01-02
**Last Amended**: 2026-01-02
