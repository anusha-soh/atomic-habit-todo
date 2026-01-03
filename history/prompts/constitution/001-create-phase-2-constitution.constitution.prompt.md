---
id: 001
title: Create Phase 2 Constitution
stage: constitution
date: 2026-01-02
surface: agent
model: claude-sonnet-4-5
feature: none
branch: phase-2-fullstack
user: hackathon_participant
command: /sp.constitution
labels: ["phase-2", "atomic-habits", "constitution", "spec-driven-development"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
 - null
---

## Prompt

User requested review and creation of constitution for Phase 2 hackathon project. Key requirements gathered through Q&A:

**Project Overview:**
- Hackathon Phase 2: Full-stack web app (Next.js + FastAPI + Neon DB)
- Based on "Atomic Habits" book principles
- Two main entities: Tasks (one-time) and Habits (recurring, identity-driven)

**Phase 2 Scope Clarifications:**
1. **Tasks vs Habits**: Option B - Build full tasks AND habits MVP together in Phase 2
2. **Tasks Feature Set**: Basic + Intermediate + Due dates (9 total features: Add, Delete, Update, View, Mark Complete, Priorities, Tags, Search, Filter, Sort, Due Dates)
3. **Habits MVP Features**: Identity statement, full description, 2-minute version, habit stacking cue, motivation, category, recurring schedule (daily/weekly/monthly), streak tracking, miss tracking (notification on 1 miss, reset on 2nd miss), completion logging (checkbox + soft sound)
4. **Habits-Tasks Connection**: Habits are CONNECTED to tasks - a habit can generate daily task instances
5. **Modular Architecture**: Core module (auth, tasks, events) + Habits module (separate but integrated from Phase 2)
6. **Deployment**: Vercel (frontend) + Render (backend) + Neon PostgreSQL
7. **Event-Driven**: Emit events in Phase 2, minimal consumers (tasks ↔ habits connection)
8. **Identity vs Intentions**: Identity-based ("I am a person who...") - closer to book's core message
9. **Miss Logic**: 1 miss = notification "Get back on track", 2 consecutive misses = streak reset + notification
10. **Cues**: Habit stacking only for MVP ("After I [X], I will [Y]"), defer time/location triggers to post-Phase V
11. **Categories**: Predefined list + "other" option
12. **Recurring**: Daily/weekly/monthly with custom "until" date
13. **Completion UX**: Checkbox + soft sound effect (sparkle/chime)
14. **Scalability Strategy**: Build in chunks - constitution has full vision, specs will be chunked for incremental delivery

## Response snapshot

Created comprehensive constitution v1.0.0 with:

**12 Immutable Principles:**
1. Spec-Driven Development is Mandatory
2. User Identity Drives Behavior
3. Modular Architecture with Feature Flags
4. Event-Driven Design from Phase II Onwards
5. Every Habit Feature Maps to the Four Laws
6. Database as Single Source of Truth
7. Mobile-First Responsive Design
8. API-First Architecture
9. Progressive Complexity Across Phases
10. Test Specs, Not Implementation
11. No Hardcoded Configuration
12. Composition Over Inheritance

**Key Sections:**
- Project Identity & Mission
- Task vs Habit Distinction (with connection: habits generate task instances)
- Atomic Habits Integration (Four Laws with Phase 2 MVP implementations)
- Event-Driven Design (event schemas for tasks and habits)
- Modular Structure (Core + Habits modules with independence rules)
- Phase Evolution Strategy (detailed Phase 2 scope: 9 task features + 10 habit MVP features)
- Testing Requirements
- Spec-Driven Workflow with Chunked Delivery Strategy (7 chunks for Phase 2)
- Bonus Points Strategy
- Anti-Patterns to Avoid
- Governance

**Database Schemas Defined:**
- Tasks: id, user_id, title, description, status, priority, tags, due_date, completed, created_at, updated_at
- Habits: id, user_id, identity_statement, full_description, two_minute_version, habit_stacking_cue, motivation, category, recurring_schedule (JSONB), current_streak, last_completed_at, consecutive_misses, created_at, updated_at
- Habit Completions: id, habit_id, user_id, completed_at, completion_type (full/two_minute)

**Phase 2 Chunked Delivery Plan:**
1. Core Infrastructure (auth, DB, monorepo, events)
2. Tasks Full Feature Set (9 features)
3. Habits MVP (CRUD, identity, 2-min, stacking, categories)
4. Habit Tracking & Streaks (completion, streaks, miss logic, notifications)
5. Habits ↔ Tasks Connection (recurring schedule, task generation, events)
6. Frontend Polish (mobile-responsive, sounds, loading, errors)
7. Deployment (Vercel + Render + env config)

## Outcome

- ✅ Impact: Constitution v1.0.0 created, defines complete architectural vision for Phase 2-5, establishes Atomic Habits integration patterns, clarifies modular architecture with Core + Habits modules
- 🧪 Tests: Testing strategy defined (unit, API, integration, habit logic tests), TDD enforced
- 📁 Files: Created `.specify/memory/constitution.md` (980 lines), comprehensive Sync Impact Report included
- 🔁 Next prompts:
  - `/sp.specify` to create Phase 2 feature spec (will be chunked)
  - `/sp.plan` to generate implementation plan
  - `/sp.tasks` to break down into actionable tasks
- 🧠 Reflection: Constitution successfully captures both MVP scope (Phase 2) and future vision (post-Phase V enhancements). Clear separation between what ships now (habit stacking cues, streaks, basic tracking) vs later (implementation intentions, milestone celebrations, heatmaps). Modular architecture enables independent development of tasks and habits while maintaining connection via event-driven task generation.

## Evaluation notes (flywheel)

- Failure modes observed: None - comprehensive Q&A session resolved all ambiguities before constitution creation
- Graders run and results (PASS/FAIL): Manual review - PASS (all placeholders filled, version bump justified, database schemas defined, Four Laws mapped to MVP features)
- Prompt variant (if applicable): N/A (initial constitution creation)
- Next experiment (smallest change to try): Begin spec writing for Chunk 1 (Core Infrastructure) to validate constitution's architectural constraints in practice
