---
id: 001
title: Research Implementation Requirements for Habits MVP
stage: spec
date: 2026-02-10
surface: agent
model: claude-sonnet-4-5-20250929
feature: 003-habits-mvp
branch: 003-habits-mvp
user: developer
command: research
labels: ["research", "database", "schema", "jsonb", "sqlmodel", "best-practices", "habits-mvp"]
links:
  spec: specs/003-habits-mvp/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-habits-mvp/research.md
tests:
  - null
---

## Prompt

Research and consolidate implementation requirements for the Habits MVP feature based on the feature spec at C:\my-drive\spec-kit\hackathon_2_phases\phase-2-webapp\specs\003-habits-mvp\spec.md

Your task is to create a comprehensive research document that addresses all technical unknowns and provides implementation guidance. Focus on:

1. **Database Schema Design**:
   - Design the `habits` table schema with all required fields from the spec
   - Design the `habit_completions` table for tracking completion history
   - Determine proper foreign key relationships and indexes
   - Research best practices for storing recurring schedules (JSONB format)
   - Address the habit stacking anchor relationship (foreign key vs text)

2. **Recurring Schedule Design**:
   - Research JSON schema for daily/weekly/monthly recurring patterns
   - Design structure for weekly schedules with specific days
   - Design "until date" field for schedule expiration
   - Consider timezone handling for recurring schedules

3. **Habit Stacking Implementation**:
   - Research foreign key approach for linking habits (anchor relationship)
   - Design cascade behavior for when anchor habit is deleted
   - Plan validation to prevent circular dependencies

4. **Status and Archiving**:
   - Design Active/Archived status enum
   - Plan filtering logic to exclude archived habits from default views

5. **Category Management**:
   - Research predefined categories (Health & Fitness, Productivity, Mindfulness, etc.)
   - Design "Other" category handling
   - Consider future extensibility for custom categories

6. **API Contract Design**:
   - Standard REST endpoints for CRUD operations
   - Request/response schemas for habit creation
   - Validation rules for required fields
   - Error response formats

7. **Event Schema**:
   - Design event payloads for HABIT_CREATED, HABIT_UPDATED, HABIT_DELETED
   - Follow existing event patterns from the tasks module

8. **Best Practices**:
   - SQLModel field definition patterns (review pitfall: no mixing Field() params with sa_column)
   - Import path conventions (src. prefix requirement)
   - Validation strategies for identity statements and 2-minute versions

Output a research.md file at C:\my-drive\spec-kit\hackathon_2_phases\phase-2-webapp\specs\003-habits-mvp\research.md that addresses all these topics with concrete recommendations and code examples.

## Response snapshot

I conducted comprehensive research on all technical aspects of the Habits MVP implementation and created a detailed research document at `specs/003-habits-mvp/research.md`.

**Key Research Findings:**

1. **Database Schema**:
   - Designed `habits` table with JSONB for recurring schedules
   - Foreign key with `ON DELETE SET NULL` for habit stacking anchor relationships
   - Proper indexes including GIN index for JSONB queries
   - Validation constraints for required fields

2. **Recurring Schedule**:
   - JSONB schema supporting daily/weekly/monthly patterns
   - Weekly schedules use array of days (0=Sunday, 6=Saturday)
   - Optional "until" field for schedule expiration (ISO 8601 date)
   - UTC storage with application-layer timezone conversion

3. **Habit Stacking**:
   - Foreign key approach prevents linking to non-existent habits
   - `ON DELETE SET NULL` preserves stacking cue text when anchor deleted
   - Validation logic to prevent circular dependencies
   - Warning system for dependent habits before deletion

4. **Categories**:
   - 8 predefined categories: Health & Fitness, Productivity, Mindfulness, Learning, Social, Finance, Creative, Other
   - Based on 2026 habit tracking industry standards
   - Simple VARCHAR enum for Phase 2 (extensible to user-custom in future)

5. **Critical Pitfalls Documented**:
   - SQLModel Field() + sa_column conflicts (all attributes must go inside Column())
   - Import path requirements (src. prefix mandatory)
   - PostgreSQL JSONB/ARRAY compatibility (SQLite won't work)

6. **API Design**:
   - REST endpoints following existing tasks module patterns
   - Comprehensive request/response schemas with Pydantic validation
   - Error handling for circular dependencies and validation failures

7. **Events**:
   - HABIT_CREATED, HABIT_UPDATED, HABIT_DELETED, HABIT_ARCHIVED, HABIT_RESTORED
   - Follows existing EventEmitter file-based logging pattern

**External Research Sources Consulted:**
- PostgreSQL JSONB best practices (AWS, postgres-rrule extension)
- SQLModel pitfalls (GitHub issues #314, #464)
- 2026 habit tracking category standards (Reclaim, industry apps)

The research document includes complete code examples, SQL schemas, validation logic, and testing strategies ready for the planning phase.

## Outcome

- ✅ Impact: Created comprehensive 600+ line research document covering all technical requirements for Habits MVP implementation
- 🧪 Tests: N/A (research phase, no tests created)
- 📁 Files: specs/003-habits-mvp/research.md (created)
- 🔁 Next prompts: Create architectural plan (specs/003-habits-mvp/plan.md) based on research findings
- 🧠 Reflection: Research successfully consolidated database schema design, JSONB patterns, SQLModel best practices, and API contracts. All critical pitfalls from constitution documented with solutions. Ready for planning phase.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A (research output)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Proceed to planning phase with validated technical decisions
