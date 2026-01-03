# Feature Specification: Phase 2 Core Infrastructure

**Feature Branch**: `001-phase2-chunk1`
**Created**: 2026-01-03
**Status**: Draft
**Input**: User description: "read create clear specification for phase 2, chunk 1."

## Clarifications

### Session 2026-01-03

- Q: Session Storage Strategy - How should JWT tokens and sessions be managed? → A: Store JWT in httpOnly cookies + track active sessions in database (enables server-side invalidation, best security)
- Q: Event Log Storage Location - Where should event logs be stored in Phase 2? → A: File-based logging (structured JSON lines in logs/ directory, persistent, rotatable)
- Q: Password Strength Requirements - What password validation rules should be enforced? → A: Minimum 8 characters only (aligns with NIST guidelines, no composition rules)
- Q: Package Manager for Monorepo - Which package manager should be used for the monorepo? → A: pnpm (fast, efficient, workspace-native)
- Q: Frontend Deployment Environment Variable - What environment variable should store the backend API URL? → A: NEXT_PUBLIC_API_URL - Backend API base URL

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Sets Up Project Foundation (Priority: P1)

As a developer starting Phase 2, I need to establish the core infrastructure (authentication, database, monorepo structure, and event system) so that I can build the full-stack web application on a solid, scalable foundation that supports multi-user functionality and event-driven architecture.

**Why this priority**: This is the foundation upon which all other Phase 2 features will be built. Without authentication, database, and proper project structure, no other features can function. This represents the minimal viable infrastructure.

**Independent Test**: Can be fully tested by verifying: (1) a user can register and log in successfully, (2) database migrations run without errors, (3) the monorepo structure is created with proper separation of concerns, and (4) events can be emitted and logged. Success means the infrastructure is ready for feature development.

**Acceptance Scenarios**:

1. **Given** a new user visits the registration page, **When** they provide valid email and password, **Then** their account is created in the database with a hashed password and they receive a JWT token
2. **Given** a registered user enters correct credentials, **When** they log in, **Then** they receive a valid JWT token that authenticates API requests
3. **Given** the database connection string is configured, **When** migrations are run, **Then** all required tables (users, sessions) are created successfully
4. **Given** the monorepo structure is set up, **When** a developer navigates the project, **Then** they see clear separation between frontend (apps/web), backend (apps/api), and shared packages
5. **Given** a user action triggers an event, **When** the event emitter is called, **Then** the event is logged with proper schema (user_id, timestamp, event_type, payload)

---

### User Story 2 - User Registration Journey (Priority: P1)

As a new user, I want to create an account with my email and password so that I can access the todo application and have my data isolated from other users.

**Why this priority**: User registration is the entry point for all users. Without this, the application cannot support multiple users, which is a core Phase 2 requirement.

**Independent Test**: Can be tested by attempting to register with various email/password combinations, verifying validation rules, and confirming that duplicate emails are rejected.

**Acceptance Scenarios**:

1. **Given** I am on the registration page, **When** I enter a valid email (format: user@domain.com) and password (minimum 8 characters), **Then** my account is created and I am automatically logged in
2. **Given** I attempt to register with an email already in use, **When** I submit the form, **Then** I receive an error message "Email already registered"
3. **Given** I enter an invalid email format, **When** I submit the registration form, **Then** I receive a validation error before submission
4. **Given** I enter a password shorter than 8 characters, **When** I submit the form, **Then** I receive an error "Password must be at least 8 characters"

---

### User Story 3 - User Login Journey (Priority: P1)

As a returning user, I want to log in with my credentials so that I can access my personal tasks and habits.

**Why this priority**: Login is essential for returning users to access their data. This completes the authentication cycle (register + login).

**Independent Test**: Can be tested by creating a user account, logging out, and logging back in with correct and incorrect credentials.

**Acceptance Scenarios**:

1. **Given** I am a registered user, **When** I enter correct email and password, **Then** I receive a JWT token and am redirected to the dashboard
2. **Given** I enter an incorrect password, **When** I submit the login form, **Then** I receive an error "Invalid email or password"
3. **Given** I enter an email that doesn't exist, **When** I submit the login form, **Then** I receive an error "Invalid email or password" (same message for security)
4. **Given** I am logged in, **When** my JWT token expires, **Then** I am prompted to log in again

---

### User Story 4 - User Logout Journey (Priority: P1)

As a logged-in user, I want to log out of my account so that my session is terminated and my data is protected on shared devices.

**Why this priority**: Logout is essential for security, especially on shared or public devices. Without proper logout, users cannot safely terminate their sessions.

**Independent Test**: Can be tested by logging in, clicking logout, and verifying that the JWT token is invalidated and subsequent API requests are rejected.

**Acceptance Scenarios**:

1. **Given** I am logged in and viewing the dashboard, **When** I click the logout button, **Then** my session is terminated and I am redirected to the login page
2. **Given** I have logged out, **When** I attempt to access a protected route with my old JWT token, **Then** I receive a 401 Unauthorized response
3. **Given** I have logged out, **When** I navigate to /dashboard directly, **Then** I am redirected to /login page
4. **Given** I log out from one device, **When** I attempt to use the same session on another device, **Then** the session is invalid and requires re-authentication

---

### User Story 5 - Developer Database Operations (Priority: P1)

As a developer, I need to run database migrations and connect to the Neon Serverless PostgreSQL database so that the application has persistent storage for users, tasks, and habits.

**Why this priority**: Database persistence is a core Phase 2 requirement. Without this, the application cannot move beyond in-memory storage from Phase 1.

**Independent Test**: Can be tested by running migration commands, verifying table creation in the database, and performing CRUD operations on the users table.

**Acceptance Scenarios**:

1. **Given** the DATABASE_URL environment variable is set, **When** I run the migration command, **Then** all tables (users, sessions) are created in the Neon database
2. **Given** a migration has been applied, **When** I check the database schema, **Then** I see all expected columns with correct data types and constraints
3. **Given** I need to rollback a migration, **When** I run the rollback command, **Then** the database reverts to the previous schema state
4. **Given** the application is running, **When** a user registers, **Then** their data is persisted to the database and survives application restarts

---

### User Story 6 - Developer Event System Setup (Priority: P2)

As a developer, I need a working event emitter skeleton so that core modules can publish events (like USER_REGISTERED, USER_LOGGED_IN) that will later be consumed by feature modules in subsequent chunks.

**Why this priority**: While not immediately consumed, the event system is foundational for the event-driven architecture required in later chunks and phases. Setting it up now ensures modules can start emitting events from the beginning.

**Independent Test**: Can be tested by emitting test events, verifying they are logged with correct schema, and confirming no errors occur when events are published.

**Acceptance Scenarios**:

1. **Given** a user registers successfully, **When** the registration completes, **Then** a USER_REGISTERED event is emitted with schema: {user_id, timestamp, event_type, payload}
2. **Given** a user logs in successfully, **When** authentication completes, **Then** a USER_LOGGED_IN event is emitted
3. **Given** an event is emitted, **When** the event reaches the logger, **Then** it is recorded with all required fields (user_id, timestamp, event_type, payload)
4. **Given** no event consumers are registered, **When** events are emitted, **Then** the application continues to function normally (fire-and-forget behavior)

---

### Edge Cases

- What happens when the database connection is lost during a user registration?
  - The registration should fail gracefully with an error message, and the user should be prompted to retry. No partial user records should be created.

- What happens when a user tries to register with a password containing only special characters?
  - The password should be accepted as long as it meets the minimum length requirement (8 characters). Character composition rules are intentionally flexible for security best practices.

- What happens when environment variables (DATABASE_URL, BETTER_AUTH_SECRET) are missing?
  - The application should fail to start with a clear error message indicating which environment variable is missing. This prevents silent failures in production.

- What happens when JWT token is tampered with?
  - The authentication middleware should reject the token and return a 401 Unauthorized response. The user should be redirected to the login page.

- What happens when two users register with the same email simultaneously?
  - Database unique constraints should prevent duplicate emails. One request will succeed, the other will receive an error message "Email already registered."

- What happens when Alembic migrations are run on an already-migrated database?
  - Alembic should detect the current migration state and skip already-applied migrations, only applying new ones.

- What happens when a user tries to logout with an already-invalidated token?
  - The logout endpoint should return success (idempotent operation) since the desired state (logged out) is already achieved.

- What happens when CORS is misconfigured and frontend cannot reach backend?
  - Browser will block the request with a CORS error. The application should fail fast in development with clear error messages indicating CORS misconfiguration.

- What happens when a user accesses the application from a mobile device with a small screen?
  - All UI elements should be responsive and usable, with touch targets sized appropriately (minimum 44×44px) and forms optimized for mobile input.

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Authorization**

- **FR-001**: System MUST provide user registration endpoint accepting email and password
- **FR-002**: System MUST validate email format (standard email regex pattern) before account creation
- **FR-003**: System MUST enforce password minimum length of 8 characters with NO composition rules (no required uppercase, lowercase, numbers, or special characters per NIST SP 800-63B guidelines)
- **FR-004**: System MUST hash passwords using bcrypt (or Better Auth default) before storing in database
- **FR-005**: System MUST reject registration attempts with duplicate email addresses
- **FR-006**: System MUST provide login endpoint accepting email and password credentials
- **FR-007**: System MUST issue JWT tokens upon successful authentication with expiration time of 7 days (configurable)
- **FR-008**: System MUST store JWT tokens in httpOnly cookies (not localStorage) to prevent XSS attacks
- **FR-009**: System MUST validate JWT tokens on protected API endpoints and reject invalid/expired tokens with 401 status
- **FR-010**: System MUST include user_id claim in JWT payload for user identification
- **FR-011**: System MUST use Better Auth library for authentication implementation

**Database Infrastructure**

- **FR-012**: System MUST connect to Neon Serverless PostgreSQL database using connection string from DATABASE_URL environment variable
- **FR-013**: System MUST use Alembic for database migration management
- **FR-014**: System MUST create users table with columns: id (UUID primary key), email (unique, not null), password_hash (not null), created_at (timestamp with timezone), updated_at (timestamp with timezone)
- **FR-015**: System MUST create sessions table with columns: id (UUID primary key), user_id (UUID foreign key to users), token (text), expires_at (timestamp with timezone), created_at (timestamp with timezone), is_active (boolean, default true)
- **FR-016**: System MUST track active sessions in database to enable server-side invalidation on logout
- **FR-017**: System MUST support migration rollback for disaster recovery
- **FR-018**: System MUST use SQLModel as ORM for type-safe database operations
- **FR-019**: Database schema MUST enforce unique constraint on users.email column
- **FR-020**: Database MUST use UUID type for all primary keys (not auto-increment integers)

**Monorepo Structure**

- **FR-021**: Project MUST use monorepo structure with clear separation: apps/web (frontend), apps/api (backend), packages/ (shared code)
- **FR-022**: Frontend (apps/web) MUST be Next.js 16+ application with App Router
- **FR-023**: Backend (apps/api) MUST be FastAPI Python application
- **FR-024**: Shared types and utilities MUST be placed in packages/core directory
- **FR-025**: Each app (web, api) MUST have its own package.json / pyproject.toml for dependencies
- **FR-026**: Project MUST use pnpm as package manager with pnpm-workspace.yaml for workspace configuration
- **FR-027**: Root package.json MUST define workspace packages and shared scripts

**Event System**

- **FR-028**: System MUST provide event emitter module capable of publishing events
- **FR-029**: All events MUST follow schema: {user_id: UUID, timestamp: ISO8601, event_type: string, payload: object}
- **FR-030**: System MUST emit USER_REGISTERED event when new user account is created
- **FR-031**: System MUST emit USER_LOGGED_IN event when user successfully authenticates
- **FR-032**: System MUST emit USER_LOGGED_OUT event when user logs out
- **FR-033**: Event emitter MUST be fire-and-forget (non-blocking, asynchronous)
- **FR-034**: Event emitter MUST write all events to structured JSON log files in logs/ directory (one event per line, newline-delimited JSON)
- **FR-035**: Event log files MUST be rotatable (daily rotation recommended, e.g., events-2026-01-03.jsonl)
- **FR-036**: Event log format MUST include: timestamp, user_id, event_type, payload, and log_level fields for debugging
- **FR-037**: Event subscribers MUST NOT be required for event emission to succeed (no event consumers in Chunk 1)

**Configuration Management**

- **FR-038**: System MUST fail to start if required environment variables are missing (DATABASE_URL, BETTER_AUTH_SECRET for backend; NEXT_PUBLIC_API_URL for frontend)
- **FR-039**: System MUST load environment variables from .env file in development
- **FR-040**: Frontend MUST use NEXT_PUBLIC_API_URL environment variable to configure backend API base URL (e.g., http://localhost:8000 in dev, https://api.example.com in prod)
- **FR-041**: System MUST provide .env.example file documenting all required environment variables
- **FR-042**: System MUST NOT commit .env file to version control (.gitignore entry required)
- **FR-043**: System MUST support different configurations for development, staging, and production environments
- **FR-044**: logs/ directory MUST be added to .gitignore (event logs are local development artifacts)

**API Endpoints (Chunk 1 Scope)**

- **FR-045**: System MUST provide POST /api/auth/register endpoint
- **FR-046**: System MUST provide POST /api/auth/login endpoint
- **FR-047**: System MUST provide GET /api/auth/me endpoint to retrieve current user information (requires valid JWT)
- **FR-048**: System MUST return appropriate HTTP status codes (201 for created, 200 for success, 400 for validation errors, 401 for unauthorized, 409 for conflicts, 500 for server errors)
- **FR-049**: System MUST provide POST /api/auth/logout endpoint to invalidate current session
- **FR-050**: Logout endpoint MUST mark session as inactive (is_active=false) in database and clear httpOnly cookie

**CORS Configuration**

- **FR-051**: Backend MUST allow CORS requests from frontend domain
- **FR-052**: CORS configuration MUST be environment-specific (localhost:3000 in development, Vercel domain in production)
- **FR-053**: CORS MUST allow credentials (cookies, authorization headers)
- **FR-054**: CORS MUST specify allowed methods (GET, POST, PATCH, DELETE, OPTIONS)

**Frontend Pages & Routes**

- **FR-055**: Frontend MUST provide /register page with email and password input fields
- **FR-056**: Frontend MUST provide /login page with email and password input fields
- **FR-057**: Frontend MUST provide /dashboard protected route (redirects to /login if unauthenticated)
- **FR-058**: Frontend MUST display authenticated user's email address on dashboard
- **FR-059**: Frontend MUST redirect unauthenticated users from protected routes to /login page
- **FR-060**: Frontend MUST redirect authenticated users from /login and /register pages to /dashboard

**Mobile-First Responsive Design**

- **FR-061**: All UI components MUST be mobile-responsive with breakpoints: mobile (default), tablet (768px+), desktop (1024px+)
- **FR-062**: Touch targets on authentication forms MUST be minimum 44×44px for accessibility
- **FR-063**: Forms MUST be usable with thumb reach on mobile devices (critical actions within bottom 60% of screen)
- **FR-064**: Text inputs MUST use appropriate mobile input types (type="email" for email fields)

### Key Entities *(include if feature involves data)*

- **User**: Represents an authenticated user of the system
  - Attributes: id (UUID), email (unique), password_hash, created_at, updated_at
  - Relationships: One user can have many tasks and habits (defined in later chunks)
  - Constraints: Email must be unique, password must be hashed before storage

- **Session**: Represents an authentication session with database tracking for server-side invalidation
  - Attributes: id (UUID), user_id (foreign key to User), token (JWT string), expires_at (timestamp), created_at (timestamp), is_active (boolean, default true)
  - Relationships: Belongs to one User
  - Lifecycle: Created on login, marked inactive (is_active=false) on logout, expired when expires_at < current time
  - Storage: JWT stored in httpOnly cookie on client, session record tracked in database

- **Event**: Represents a system event (not persisted to database in Chunk 1, only logged)
  - Attributes: user_id, timestamp, event_type (enum: USER_REGISTERED, USER_LOGGED_IN, USER_LOGGED_OUT), payload (JSON)
  - Purpose: Enables event-driven architecture for future modules

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can complete registration (email + password) in under 30 seconds
- **SC-002**: Registration form validates email and password in real-time (instant feedback) without server round-trip
- **SC-003**: A registered user can log in and receive a valid JWT token within 2 seconds
- **SC-004**: JWT tokens remain valid for 7 days without requiring re-authentication
- **SC-005**: Database migrations complete successfully in under 10 seconds
- **SC-006**: The monorepo structure is organized such that a developer can locate frontend code, backend code, and shared packages within 5 seconds
- **SC-007**: Event logs capture 100% of authentication events (USER_REGISTERED, USER_LOGGED_IN, USER_LOGGED_OUT) with complete schema
- **SC-008**: The application fails fast (within 5 seconds) with a clear error message if required environment variables are missing
- **SC-009**: The database enforces unique email constraint and prevents duplicate registrations 100% of the time
- **SC-010**: Protected API endpoints reject invalid or missing JWT tokens with 401 status 100% of the time
- **SC-011**: Passwords are hashed before database storage in 100% of cases (no plaintext passwords)
- **SC-012**: The system supports concurrent user registrations without race conditions or data corruption
- **SC-013**: A logged-in user can complete logout in under 2 seconds and session is immediately invalidated
- **SC-014**: Frontend successfully makes authenticated API requests from both localhost (development) and Vercel domain (production) without CORS errors
- **SC-015**: All authentication forms (register, login) are fully usable on mobile devices with screen widths as small as 320px
- **SC-016**: Touch targets on mobile authentication forms are minimum 44×44px, allowing easy interaction on touchscreens
- **SC-017**: Unauthenticated users attempting to access /dashboard are redirected to /login within 500ms

### Assumptions

- **A-001**: Developers have access to a Neon Serverless PostgreSQL database instance
- **A-002**: The development environment has Node.js 20+ and Python 3.13+ installed
- **A-003**: The development environment has pnpm installed (npm install -g pnpm)
- **A-004**: Better Auth library supports the required JWT and session management features
- **A-005**: The application will be deployed to Vercel (frontend) and Render (backend) in later chunks
- **A-006**: Event consumers (subscribers) will be added in Chunk 3 (Habits module) and beyond
- **A-007**: The event system uses file-based logging in Phase 2-4, migrating to Kafka in Phase 5
- **A-008**: HTTPS is enforced in production environments for secure JWT transmission
- **A-009**: The database supports concurrent connections for horizontal scaling in future phases
