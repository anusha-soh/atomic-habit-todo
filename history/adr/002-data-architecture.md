# ADR-002: Data Architecture and Persistence Strategy

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2026-01-03
- **Feature:** 001-phase2-chunk1 (Phase 2 Core Infrastructure)
- **Context:** Phase 2 requires persistent storage for multi-user data (users, sessions, tasks, habits). The database must support concurrent connections, ACID transactions, and efficient querying. Schema evolution must be version-controlled and reversible. The ORM must integrate with FastAPI for automatic OpenAPI schema generation. The solution must support future horizontal scaling while keeping development velocity high.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security? YES - Foundation for all persistence, affects scalability
     2) Alternatives: Multiple viable options considered with tradeoffs? YES - Neon vs Supabase/PlanetScale, SQLModel vs raw SQL
     3) Scope: Cross-cutting concern (not an isolated detail)? YES - Every feature depends on database
-->

## Decision

We adopt an **integrated data architecture** consisting of:

- **Database:** Neon Serverless PostgreSQL (cloud-hosted, auto-scaling)
- **Migration Tool:** Alembic (version-controlled schema changes, rollback support)
- **ORM:** SQLModel (combines Pydantic validation + SQLAlchemy ORM)
- **Connection Management:** UV for dependency management, SQLAlchemy connection pooling
- **Schema Strategy:**
  - UUID primary keys (not auto-increment integers)
  - TIMESTAMPTZ for all timestamps (timezone-aware)
  - Foreign key constraints with CASCADE delete
  - Indexes on lookup columns (email, user_id, token, is_active)
- **Migration Workflow:**
  - Alembic auto-generates migrations from SQLModel changes
  - Manual review before applying
  - Rollback capability for disaster recovery

## Consequences

### Positive

1. **Serverless Scalability:**
   - Neon auto-scales based on load (scales to zero when inactive)
   - Connection pooling built-in (no manual pgBouncer setup)
   - Database branching for dev/staging/prod isolation

2. **Type Safety:**
   - SQLModel provides Python type hints (catches errors at development time)
   - Pydantic validation ensures data integrity before database writes
   - FastAPI auto-generates OpenAPI schemas from SQLModel models

3. **Developer Productivity:**
   - Alembic auto-generates migrations (no manual SQL for schema changes)
   - SQLModel reduces boilerplate (single model definition for DB + API)
   - UV package manager is 10-100x faster than pip

4. **PostgreSQL Features:**
   - JSONB support for flexible schemas (habit recurring_schedule, task metadata)
   - Full-text search (future: search tasks/habits by content)
   - Strong ACID guarantees (concurrent user operations safe)

5. **Cost Efficiency:**
   - Neon free tier: 3 projects, 0.5GB storage, generous compute hours
   - Scales to zero when inactive (no idle charges)
   - Pay-as-you-grow pricing

6. **Migration Safety:**
   - Alembic tracks applied migrations (alembic_version table)
   - Rollback support (alembic downgrade -1)
   - Version-controlled migrations in Git

### Negative

1. **Vendor Lock-In:**
   - Neon-specific features (database branching, scale-to-zero)
   - Migration to another PostgreSQL host requires configuration changes
   - Mitigated by PostgreSQL compatibility (can migrate to RDS, Cloud SQL, self-hosted)

2. **Learning Curve:**
   - Team must learn SQLModel (hybrid Pydantic + SQLAlchemy)
   - Alembic migration workflow adds complexity vs raw SQL
   - UV package manager is new (less mature than pip)

3. **Migration Discipline Required:**
   - Schema changes MUST go through Alembic (no direct database edits)
   - Forgotten migrations break production deployments
   - Requires code review for migration files

4. **Serverless Limitations:**
   - Cold start latency (first query after idle period: 1-2 seconds)
   - Connection limits on free tier (may need upgrade for high concurrency)
   - Mitigated by connection pooling and auto-scaling

5. **UUID Overhead:**
   - 128-bit UUIDs vs 64-bit integers (16 bytes vs 8 bytes per ID)
   - Slightly slower joins compared to integer IDs
   - Trade-off accepted for distributed system benefits (globally unique, no collisions)

## Alternatives Considered

### Alternative 1: Supabase (PostgreSQL + Real-time + Auth)
- **Components:**
  - Managed PostgreSQL database
  - Real-time subscriptions (WebSockets)
  - Built-in authentication
  - Auto-generated REST API

- **Why Rejected:**
  - **JavaScript-First:** Primarily designed for JavaScript/TypeScript (Python SDK less mature)
  - **Opinionated Auth:** Conflicts with Better Auth decision (ADR-001)
  - **Vendor Lock-In:** Supabase-specific features (real-time, auto-generated API) hard to migrate
  - **Overkill:** Real-time features not needed in Phase 2
  - **Neon Provides Pure PostgreSQL:** Better Python tooling, no auth/API coupling

### Alternative 2: PlanetScale (Serverless MySQL)
- **Components:**
  - Serverless MySQL database
  - Database branching (like Git for databases)
  - Schema migration via PlanetScale CLI

- **Why Rejected:**
  - **MySQL Limitations:** Weaker JSON support compared to PostgreSQL JSONB
  - **No Full-Text Search:** PostgreSQL has built-in full-text search (needed for future phases)
  - **Foreign Key Constraints:** PlanetScale discourages foreign keys (schema integrity risk)
  - **Migration Tooling:** Custom CLI vs industry-standard Alembic
  - **PostgreSQL Ecosystem:** Better Python ORMs (SQLModel, SQLAlchemy) for PostgreSQL

### Alternative 3: Raw SQL (No ORM)
- **Components:**
  - Direct SQL queries (psycopg2/asyncpg)
  - Manual schema management (SQL migration files)
  - No ORM abstraction

- **Why Rejected:**
  - **Type Safety Lost:** No Python type hints, runtime errors instead of compile-time
  - **Boilerplate:** Manual SQL for every CRUD operation (100+ lines vs 10 with SQLModel)
  - **OpenAPI Integration:** Cannot auto-generate FastAPI schemas from raw SQL
  - **Maintenance Burden:** Schema changes require manual SQL updates across codebase
  - **SQLModel Provides Best of Both Worlds:** Type safety + ORM convenience, can drop down to raw SQL when needed

## References

- Feature Spec: [specs/001-phase2-chunk1/spec.md](../../specs/001-phase2-chunk1/spec.md) (FR-012 to FR-020: Database requirements)
- Implementation Plan: [specs/001-phase2-chunk1/plan.md](../../specs/001-phase2-chunk1/plan.md) (Technical Context: Storage)
- Research: [specs/001-phase2-chunk1/research.md](../../specs/001-phase2-chunk1/research.md) (Section 2: Database)
- Data Model: [specs/001-phase2-chunk1/data-model.md](../../specs/001-phase2-chunk1/data-model.md) (Complete schema)
- Related ADRs: ADR-001 (Sessions table supports authentication strategy)
- Evaluator Evidence: Post-design constitution check (plan.md) - Principle VI (Database as single source of truth) PASS
