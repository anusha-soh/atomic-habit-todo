# ADR-006: Habits Data Model Architecture

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2026-02-10
- **Feature:** 003-habits-mvp (Phase 2 Chunk 3: Habits MVP)
- **Context:** The Habits MVP feature introduces a new data model implementing the Atomic Habits Four Laws framework. The design must support identity-driven habit creation, 2-minute versions (Law 3), habit stacking cues (Law 1), flexible recurring schedules (daily/weekly/monthly), and archiving without deletion. Key challenges include storing variable schedule patterns efficiently, enabling habit stacking while preventing circular dependencies, balancing simplicity (fixed categories for MVP) with future extensibility (custom categories post-Phase V), and providing graceful degradation when anchor habits are deleted.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security? YES - Foundational schema for habits feature, affects future habit tracking/streaks/analytics
     2) Alternatives: Multiple viable options considered with tradeoffs? YES - JSONB vs separate tables, foreign key strategies, custom vs fixed categories
     3) Scope: Cross-cutting concern (not an isolated detail)? YES - Affects backend models, API contracts, frontend forms, future features (Chunk 4)
-->

## Decision

We adopt an **integrated habits data model** consisting of four key architectural decisions:

### 1. JSONB for Recurring Schedules
- **Storage:** PostgreSQL JSONB column (`recurring_schedule`) storing structured schedule data
- **Schema:** `{type: "daily"|"weekly"|"monthly", until?: "YYYY-MM-DD", days?: [0-6], day_of_month?: 1-31}`
- **Validation:** Pydantic RecurringSchedule model validates type-specific rules
- **Indexing:** GIN index on `recurring_schedule` for efficient queries

### 2. Foreign Key for Habit Stacking
- **Relationship:** `anchor_habit_id UUID REFERENCES habits(id) ON DELETE SET NULL`
- **Cascade Behavior:** When anchor deleted, dependent habits retain `habit_stacking_cue` text but `anchor_habit_id` becomes NULL
- **Validation:** Circular dependency prevention algorithm (recursive traversal to detect A → B → A cycles)
- **User Warning:** API detects dependencies before deletion and warns user with list of affected habits

### 3. Fixed Predefined Categories (Phase 2)
- **Categories:** VARCHAR(50) enum: Health & Fitness, Productivity, Mindfulness, Learning, Social, Finance, Creative, Other
- **Validation:** Pydantic validator ensures category is in predefined list
- **No Custom Categories:** Users cannot create custom categories in Phase 2
- **Future Migration Path:** Post-Phase V, add `habit_categories` table with `is_predefined` flag

### 4. Two-State Status Enum (Active/Archived)
- **Status Values:** `active` (default) or `archived`
- **Default Filtering:** List views exclude archived habits unless `?include_archived=true`
- **Archive vs Delete:**
  - Archive: Soft delete, preserves data, reversible (status change)
  - Delete: Hard delete, cascades to `habit_completions`, warns about stacking dependencies

## Consequences

### Positive

1. **JSONB Schedule Flexibility:**
   - Supports daily, weekly (specific days), monthly schedules without schema changes
   - Future schedule types (e.g., "every 2 weeks", "quarterly") don't require migrations
   - Queryable: `WHERE recurring_schedule->>'type' = 'daily'`
   - Type-safe validation via Pydantic RecurringSchedule model

2. **Habit Stacking Integrity:**
   - Foreign key prevents linking to non-existent habits (referential integrity)
   - Graceful degradation: Deleting anchor doesn't cascade delete dependent habits
   - Queryable dependencies: `SELECT * FROM habits WHERE anchor_habit_id = ?`
   - Circular dependency prevention protects data consistency

3. **Category Simplicity:**
   - No additional tables (simple VARCHAR validation)
   - Pre-populated dropdowns provide consistent categorization
   - Meets Phase 2 MVP requirements without over-engineering
   - Clear migration path to custom categories documented

4. **Archive Preserves History:**
   - Users can pause habits without losing data
   - Archived habits maintain completion history (for Chunk 4 streaks)
   - Reversible (restore to active)
   - Default filtering keeps UI clean (archived habits hidden)

5. **Consistency with Existing Patterns:**
   - Follows established Task model patterns (UUID PKs, TIMESTAMPTZ, validators)
   - Leverages existing PostgreSQL infrastructure (Neon, Alembic migrations)
   - Aligns with constitutional principles (stateless services, database as source of truth)

6. **Event-Driven Integration:**
   - Extends existing EventEmitter pattern (ADR-004)
   - New event types: HABIT_CREATED, HABIT_UPDATED, HABIT_DELETED, HABIT_ARCHIVED, HABIT_RESTORED
   - Fire-and-forget emission (non-blocking)

### Negative

1. **PostgreSQL Dependency:**
   - JSONB requires PostgreSQL (no SQLite support for tests)
   - Teams must set `TEST_DATABASE_URL` to PostgreSQL instance
   - Mitigated by documentation in quickstart.md and conftest.py checks

2. **JSONB Learning Curve:**
   - Engineers must understand JSONB querying (`->`, `->>`, `@>` operators)
   - GIN index configuration more complex than B-tree
   - Mitigated by code examples in research.md and data-model.md

3. **Circular Dependency Validation Complexity:**
   - Requires recursive algorithm to detect cycles
   - Additional validation logic in HabitService (not pure database constraint)
   - Performance: O(n) traversal where n = stack depth (typically < 5)
   - Mitigated by comprehensive tests and algorithm documentation

4. **Fixed Categories Limitation:**
   - Users cannot create custom categories in Phase 2
   - "Other" category becomes catch-all
   - Mitigated by predefined categories covering 90% of use cases, future extensibility planned

5. **Migration Risk (Habit Stacking):**
   - ON DELETE SET NULL creates orphaned stacking cues (text without link)
   - UI must handle NULL `anchor_habit_id` gracefully
   - Mitigated by user warning before deletion, frontend displays cue text even without link

6. **Archive State Management:**
   - Archived habits excluded by default (query must explicitly include)
   - Risk: Forgetting to filter leads to UX confusion
   - Mitigated by consistent API defaults (`status=active` filter in all list endpoints)

## Alternatives Considered

### Alternative 1: Separate Schedules Table
- **Components:**
  - `habit_schedules` table with columns: `type`, `daily_until`, `weekly_days`, `monthly_day`, etc.
  - One-to-one relationship with `habits` table
  - Type-specific columns (e.g., `weekly_days` ARRAY, `monthly_day` INTEGER)

- **Why Rejected:**
  - **Schema Bloat:** Many nullable columns (daily_until, weekly_days, monthly_day all NULL except for one type)
  - **Complex JOINs:** Every habit query requires JOIN to schedules table
  - **Harder to Validate:** Type-specific validation spread across multiple columns
  - **Migration Overhead:** Adding new schedule types requires schema migration
  - **JSONB Superior:** Single column, flexible schema, efficient GIN indexing

### Alternative 2: Enum + Separate Fields for Schedules
- **Components:**
  - `schedule_type` VARCHAR enum (daily, weekly, monthly)
  - `schedule_daily_until` DATE (nullable)
  - `schedule_weekly_days` ARRAY (nullable)
  - `schedule_monthly_day` INTEGER (nullable)

- **Why Rejected:**
  - **Harder to Extend:** New schedule types require schema migration
  - **Validation Complexity:** Must ensure type-field consistency (e.g., if type=weekly, weekly_days NOT NULL)
  - **Query Complexity:** Filtering by schedule requires checking multiple columns
  - **JSONB Better:** Single column, type-safe validation via Pydantic

### Alternative 3: String Serialization (JSON Text)
- **Components:**
  - `recurring_schedule` TEXT column
  - Store JSON string: `'{"type":"daily","until":"2026-12-31"}'`
  - Parse in application layer

- **Why Rejected:**
  - **No Query Support:** Cannot filter by schedule type without full table scan
  - **No Type Safety:** Database treats as opaque string (no validation)
  - **No Indexing:** TEXT column cannot use GIN index efficiently
  - **JSONB Better:** Native JSON support, queryable, indexable, type-safe

### Alternative 4: ON DELETE CASCADE for Habit Stacking
- **Components:**
  - `anchor_habit_id UUID REFERENCES habits(id) ON DELETE CASCADE`
  - Deleting anchor habit deletes all dependent habits

- **Why Rejected:**
  - **Data Loss:** Users lose dependent habits they want to keep
  - **Unexpected Behavior:** Deleting one habit cascades to many (confusing UX)
  - **No Recovery:** Cannot undo cascade deletion
  - **SET NULL Better:** Preserves dependent habits, retains cue text, user-friendly

### Alternative 5: ON DELETE RESTRICT for Habit Stacking
- **Components:**
  - `anchor_habit_id UUID REFERENCES habits(id) ON DELETE RESTRICT`
  - Prevents deleting anchor habit if dependencies exist

- **Why Rejected:**
  - **Blocks Deletion:** User cannot delete anchor even if they want to
  - **Requires Manual Cleanup:** User must unlink all dependents first (tedious)
  - **Poor UX:** Error message doesn't guide user on how to proceed
  - **SET NULL Better:** Warns user, allows deletion after confirmation, graceful degradation

### Alternative 6: Custom User-Defined Categories (Phase 2)
- **Components:**
  - `habit_categories` table (id, user_id, name, is_predefined)
  - Foreign key: `category_id UUID REFERENCES habit_categories(id)`
  - Predefined categories seeded at user registration

- **Why Rejected:**
  - **Over-Engineering:** Phase 2 MVP doesn't require custom categories
  - **Additional Complexity:** Extra table, migrations, API endpoints (create/list/delete categories)
  - **Development Velocity:** Slows Phase 2 implementation
  - **Deferred to Post-Phase V:** Fixed categories now, custom later when user demand proven

### Alternative 7: Three-State Status (Active/Paused/Archived)
- **Components:**
  - `status` enum: active, paused, archived
  - Paused: Temporarily inactive, can be resumed
  - Archived: Long-term inactive

- **Why Rejected:**
  - **Unclear Distinction:** Difference between "paused" and "archived" ambiguous
  - **UX Complexity:** Users confused about when to pause vs archive
  - **Two States Sufficient:** Active (tracking) vs Archived (not tracking) covers all use cases
  - **Simplicity Better:** Two states easier to understand, implement, test

## References

- Feature Spec: [specs/003-habits-mvp/spec.md](../../specs/003-habits-mvp/spec.md) - User stories US1-US4, functional requirements FR-001 to FR-009
- Implementation Plan: [specs/003-habits-mvp/plan.md](../../specs/003-habits-mvp/plan.md) - Key Architectural Decisions sections 1-5
- Research: [specs/003-habits-mvp/research.md](../../specs/003-habits-mvp/research.md) - Sections 1-5 (Database schema, recurring schedule, habit stacking, status, categories)
- Data Model: [specs/003-habits-mvp/data-model.md](../../specs/003-habits-mvp/data-model.md) - Complete schema specification, SQLModel implementation
- API Contract: [specs/003-habits-mvp/contracts/habits-api.yaml](../../specs/003-habits-mvp/contracts/habits-api.yaml) - OpenAPI spec with RecurringSchedule schema
- Constitution: [.specify/memory/constitution.md](../../.specify/memory/constitution.md) - Principle VI (Database as Source of Truth), Atomic Habits Integration section
- Related ADRs:
  - ADR-002: Data Architecture (PostgreSQL, SQLModel, Alembic) - foundational decisions
  - ADR-004: Event System Design (EventEmitter pattern) - habit events extend this pattern
- External References:
  - [PostgreSQL JSONB Best Practices | AWS](https://aws.amazon.com/blogs/database/postgresql-as-a-json-database-advanced-patterns-and-best-practices/)
  - [SQLModel Issue #314](https://github.com/fastapi/sqlmodel/issues/314) - sa_column parameter conflicts (pitfall avoided)
  - [Atomic Habits Book](https://jamesclear.com/atomic-habits) - Four Laws framework

---

**Evaluator Evidence:**
- Constitution Check (plan.md): All 12 principles PASS ✅
- Significance Test: Impact ✅, Alternatives ✅, Scope ✅
- Migration Path: Custom categories documented in data-model.md for Post-Phase V
- Performance: GIN index on JSONB, circular dependency validation O(n) where n < 5
