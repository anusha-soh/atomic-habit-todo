# Tasks: Habit Tracking & Streaks

**Feature**: 004-habit-tracking-streaks
**Branch**: `004-habit-tracking-streaks`
**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)

## Overview

This document breaks down the Habit Tracking & Streaks feature into actionable tasks organized by user story. Each user story represents an independently deliverable increment that can be tested and validated separately.

**Total User Stories**: 8 (3 P1, 3 P2, 2 P3)
**Suggested MVP**: User Story 1-3 (P1 stories) for minimum viable completion tracking with streaks

## Task Format Legend

```
- [ ] [TaskID] [P?] [Story?] Description with file path
```

- **TaskID**: Sequential number (T001, T002, ...)
- **[P]**: Parallelizable task (different files, no blocking dependencies)
- **[Story]**: User story label (US1, US2, etc.) - only in story phases
- **Description**: Clear action with exact file path

## Implementation Strategy

**MVP-First Approach**: Implement P1 user stories (US1-US3) first for core completion tracking and streak visualization. Then add P2 stories (US4-US6) for enhanced feedback and accountability. Finally, P3 stories (US7-US8) for supplementary features.

**Parallel Execution**: Tasks marked [P] can be executed in parallel within the same phase. Tasks without [P] must wait for preceding tasks in their phase.

## Task Count Summary

- **Phase 1 (Setup)**: 4 tasks
- **Phase 2 (Foundational)**: 3 tasks
- **Phase 3 (US1 - Mark Complete + Feedback)**: 9 tasks
- **Phase 4 (US2 - Choose Completion Type)**: 3 tasks
- **Phase 5 (US3 - View Streak Counter)**: 5 tasks
- **Phase 6 (US4 - Sound Effects)**: 4 tasks
- **Phase 7 (US5 - First Miss Notification)**: 5 tasks
- **Phase 8 (US6 - Streak Reset)**: 3 tasks
- **Phase 9 (US7 - Completion History)**: 4 tasks
- **Phase 10 (US8 - Undo Completion)**: 3 tasks
- **Phase 11 (Polish)**: 4 tasks

**Total Tasks**: 47

---

## Phase 1: Setup & Database Migrations

**Goal**: Prepare database schema and project structure for habit completion tracking.

**Dependencies**: None (starts immediately)

**Tasks**:

- [X] T001 Create Alembic migration for habit_completions table in apps/api/alembic/versions/
- [X] T002 Create Alembic migration for habits table extensions (last_completed_at, consecutive_misses) in apps/api/alembic/versions/
- [X] T003 Apply migrations to development database (run alembic upgrade head)
- [X] T004 Verify database schema and constraints (habit_completions unique constraint, habits new columns)

**Acceptance**: Database has habit_completions table with unique constraint (one per habit per day), habits table has last_completed_at and consecutive_misses columns

---

## Phase 2: Foundational Models & Services

**Goal**: Create core data models and foundational services that multiple user stories depend on.

**Dependencies**: Phase 1 complete

**Blocking Prerequisites** (must complete before user stories):

- [X] T005 [P] Create HabitCompletion SQLModel in apps/api/src/models/habit_completion.py
- [X] T006 [P] Extend Habit SQLModel with streak fields in apps/api/src/models/habit.py
- [X] T007 Create streak calculation utility function in apps/api/src/services/streak_calculator.py

**Acceptance**: Models created and importable, streak calculation function exists (even if not yet used)

---

## Phase 3: User Story 1 - Mark Habit as Complete with Immediate Feedback (P1)

**Story Goal**: Users can mark a habit complete and receive instant visual feedback with streak tracking.

**Why P1**: Core value proposition - without completion tracking, the feature has no purpose.

**Independent Test**: Create a habit → Mark complete → Verify completion recorded, streak = 1, visual feedback appears

**Dependencies**: Phase 2 complete

**Tasks**:

### Backend - Completion Endpoint

- [X] T008 [P] [US1] Create Pydantic request/response schemas in apps/api/src/schemas/habit_schemas.py (CompleteHabitRequest, CompleteHabitResponse)
- [X] T009 [US1] Implement POST /api/{user_id}/habits/{habit_id}/complete endpoint in apps/api/src/routes/habits.py
- [X] T010 [US1] Add duplicate completion check (409 Conflict if already completed today) in completion endpoint
- [X] T011 [US1] Implement streak calculation logic in completion endpoint (call streak_calculator service)
- [X] T012 [US1] Update habit.last_completed_at and habit.consecutive_misses in completion endpoint

### Backend - Events

- [X] T013 [P] [US1] Implement HABIT_COMPLETED event emission in apps/api/src/events/habit_events.py

### Frontend - Completion UI

- [X] T014 [P] [US1] Create CompletionCheckbox component in apps/web/src/components/habits/CompletionCheckbox.tsx
- [X] T015 [US1] Add completion API client function in apps/web/src/lib/habits-api.ts
- [X] T016 [US1] Implement green checkmark animation in CompletionCheckbox (CSS or Framer Motion)

**Acceptance**: Users can mark habit complete via checkbox, completion is recorded, streak increments correctly, duplicate completions are rejected with 409, green checkmark animation plays

**Parallel Opportunities**: T008, T013, T014 can run in parallel (different files, no dependencies)

---

## Phase 4: User Story 2 - Choose Full or Two-Minute Completion (P1)

**Story Goal**: Users can choose between full habit or 2-minute version when completing.

**Why P1**: Critical for "never miss twice" philosophy - removes excuses by offering minimal version.

**Independent Test**: Mark habit complete → Choose completion type → Verify completion_type recorded correctly

**Dependencies**: Phase 3 complete (completion endpoint exists)

**Tasks**:

- [X] T017 [P] [US2] Create CompletionTypeModal component in apps/web/src/components/habits/CompletionTypeModal.tsx
- [X] T018 [US2] Add completion_type field handling in POST /complete endpoint (update request schema)
- [X] T019 [US2] Wire CompletionTypeModal to CompletionCheckbox (show modal before API call)

**Acceptance**: Users see modal with "Full habit" and "2-minute version" buttons, selection is sent to API, completion_type is stored in database

**Parallel Opportunities**: T017 can run in parallel with T018 (frontend vs backend)

---

## Phase 5: User Story 3 - View Current Streak Counter (P1)

**Story Goal**: Users see their current streak prominently displayed next to each habit.

**Why P1**: Visible progress is core to making habits satisfying - turns consistency into achievement.

**Independent Test**: Complete habit on consecutive days → Verify streak counter increments → Verify streak resets after gap

**Dependencies**: Phase 3 complete (streak calculation logic exists)

**Tasks**:

### Backend - Streak Endpoint

- [X] T020 [P] [US3] Create GET /api/{user_id}/habits/{habit_id}/streak endpoint in apps/api/src/routes/habits.py
- [X] T021 [P] [US3] Create StreakInfoResponse schema in apps/api/src/schemas/habit_schemas.py

### Frontend - Streak Display

- [X] T022 [P] [US3] Create StreakCounter component in apps/web/src/components/habits/StreakCounter.tsx
- [X] T023 [US3] Add streak API client function in apps/web/src/lib/habits-api.ts
- [X] T024 [US3] Integrate StreakCounter into habit list/card (update existing habit components)

**Acceptance**: Streak counter displays "🔥 X days" next to each habit, updates in real-time after completion, shows 0 for new habits

**Parallel Opportunities**: T020, T021, T022 can run in parallel (backend vs frontend, different files)

---

## Phase 6: User Story 4 - Hear Satisfying Sound Effect on Completion (P2)

**Story Goal**: Users hear a pleasant sound effect when they complete a habit.

**Why P2**: Amplifies satisfaction but not essential - system works without sound.

**Independent Test**: Mark habit complete → Verify sound plays → Verify graceful degradation if sound fails

**Dependencies**: Phase 3 complete (completion checkbox exists)

**Tasks**:

- [X] T025 [P] [US4] Create sound-player utility in apps/web/src/lib/sound-player.ts (Web Audio API + HTML5 fallback)
- [X] T026 [P] [US4] Add sparkle.mp3 sound file to apps/web/public/sounds/
- [X] T027 [US4] Integrate sound player into CompletionCheckbox (call on checkbox click)
- [X] T028 [US4] Add graceful degradation (catch errors, continue without sound)

**Acceptance**: Sound plays immediately on completion, works on desktop browsers, works on mobile (after user gesture), fails silently if unsupported

**Parallel Opportunities**: T025, T026 can run in parallel (implementation vs asset)

---

## Phase 7: User Story 5 - Receive Notification After First Miss (P2)

**Story Goal**: Users receive a gentle reminder after missing a scheduled habit once.

**Why P2**: Early intervention prevents streak breaks - implements "never miss twice" principle.

**Independent Test**: Create daily habit → Complete yesterday → Don't complete today → Verify notification appears tomorrow

**Dependencies**: Phase 2 complete (models exist)

**Tasks**:

### Backend - Miss Detection

- [X] T029 [P] [US5] Create notification_service.py in apps/api/src/services/ (create_miss_notification function)
- [X] T030 [P] [US5] Create miss_detector.py in apps/api/src/services/ (detect_missed_habits background job)
- [X] T031 [US5] Implement first miss detection logic (increment consecutive_misses, emit HABIT_MISS_DETECTED)
- [X] T032 [US5] Start APScheduler on app startup in apps/api/src/main.py (daily at 00:01 UTC)

### Frontend - Notification Display

- [X] T033 [P] [US5] Create NotificationBanner component in apps/web/src/components/notifications/NotificationBanner.tsx

**Acceptance**: Background job runs daily, first miss increments consecutive_misses to 1, notification created with "Get back on track today!" message, notification banner displays on frontend

**Parallel Opportunities**: T029, T030, T033 can run in parallel (different services and frontend)

---

## Phase 8: User Story 6 - Streak Resets After Two Consecutive Misses (P2)

**Story Goal**: Streaks automatically reset after missing a habit twice in a row.

**Why P2**: Enforces accountability while preventing abandonment - core to "never miss twice" methodology.

**Independent Test**: Miss habit twice consecutively → Verify streak resets to 0 → Verify notification sent

**Dependencies**: Phase 7 complete (miss detector exists)

**Tasks**:

- [X] T034 [US6] Implement second consecutive miss logic in miss_detector.py (reset streak, emit HABIT_STREAK_RESET)
- [X] T035 [P] [US6] Implement create_streak_reset_notification function in notification_service.py
- [X] T036 [US6] Test bulk offline period handling (week+ gap triggers immediate reset)

**Acceptance**: Second consecutive miss resets current_streak to 0, resets consecutive_misses to 0, notification created with "Your streak has reset" message, bulk gaps handled correctly

**Parallel Opportunities**: T035 can run in parallel with T034 (different function, same file or split files)

---

## Phase 9: User Story 7 - View Completion History (P3)

**Story Goal**: Users can review their past completions to reflect on progress.

**Why P3**: Nice-to-have for reflection - core functionality works without historical view.

**Independent Test**: Complete habits over several days → View history page → Verify all completions shown with dates and types

**Dependencies**: Phase 3 complete (completions exist)

**Tasks**:

- [X] T037 [P] [US7] Create GET /api/{user_id}/habits/{habit_id}/completions endpoint in apps/api/src/routes/habits.py
- [X] T038 [P] [US7] Create GetCompletionsResponse schema in apps/api/src/schemas/habit_schemas.py
- [X] T039 [P] [US7] Create CompletionHistory component in apps/web/src/components/habits/CompletionHistory.tsx
- [X] T040 [US7] Integrate CompletionHistory into habit detail page at apps/web/src/app/habits/[id]/page.tsx

**Acceptance**: GET /completions endpoint returns completion list with date range filtering, history component displays completions in list or calendar format, shows completion_type for each entry

**Parallel Opportunities**: T037, T038, T039 can run in parallel (backend vs schemas vs frontend)

---

## Phase 10: User Story 8 - Undo Accidental Completion (P3)

**Story Goal**: Users can remove an accidental completion.

**Why P3**: Rare edge case - most users won't need this frequently.

**Independent Test**: Mark habit complete → Undo → Verify completion deleted → Verify streak recalculated

**Dependencies**: Phase 3 complete (completions exist), Phase 5 complete (streak calculation exists)

**Tasks**:

- [X] T041 [P] [US8] Create DELETE /api/{user_id}/habits/{habit_id}/completions/{completion_id} endpoint in apps/api/src/routes/habits.py
- [X] T042 [US8] Implement streak recalculation logic in DELETE endpoint (call streak_calculator with remaining completions)
- [X] T043 [P] [US8] Add "Undo" button to CompletionHistory component (calls DELETE endpoint)

**Acceptance**: DELETE endpoint removes completion, recalculates streak from remaining completions, updates habit.last_completed_at, frontend shows undo button with confirmation

**Parallel Opportunities**: T041, T043 can run in parallel (backend vs frontend)

---

## Phase 11: Polish & Cross-Cutting Concerns

**Goal**: Mobile responsiveness, error handling, configuration, and final integration.

**Dependencies**: All user story phases complete

**Tasks**:

- [X] T044 [P] Add environment variables for sound path, notification messages, miss detection schedule in apps/api/.env.example and apps/web/.env.local.example
- [X] T045 [P] Verify mobile responsiveness (44×44px tap targets, 60fps animations, thumb-friendly buttons)
- [X] T046 [P] Add error handling and loading states to all frontend components
- [X] T047 Run end-to-end integration test (complete habit → verify streak → miss day → verify notification → undo → verify recalculation)

**Acceptance**: All configuration externalized, mobile experience smooth, errors handled gracefully, end-to-end flow works correctly

**Parallel Opportunities**: T044, T045, T046 can run in parallel (different concerns)

---

## Dependencies & Execution Order

### Critical Path (Must Complete Sequentially)

1. **Phase 1** (Setup) → **Phase 2** (Foundational) → Must complete before any user stories
2. **Phase 3** (US1) → Blocks **Phase 4** (US2), **Phase 5** (US3), **Phase 6** (US4)
3. **Phase 7** (US5) → Blocks **Phase 8** (US6)

### Independent Story Branches (Can Execute in Parallel)

- **US1 → US2 → US3 → US6** (Completion + Streak + Type Choice branch)
- **US1 → US4** (Sound effects branch - independent)
- **US1 → US7** (History branch - independent)
- **US1 + US5 → US8** (Undo requires completion and streak logic)

### Suggested Execution Phases

**Sprint 1 (MVP)**: Phases 1-5 (Setup + US1 + US2 + US3) = Core completion tracking with streaks
**Sprint 2 (Enhanced)**: Phases 6-8 (US4 + US5 + US6) = Sound effects + accountability
**Sprint 3 (Complete)**: Phases 9-11 (US7 + US8 + Polish) = History + undo + finalization

---

## Parallel Execution Examples

### Phase 3 (US1) Parallelization

**Can run simultaneously**:
- T008 (Backend schemas) + T014 (Frontend checkbox component) + T013 (Event emission)

**Must run sequentially**:
- T009 → T010 → T011 → T012 (Endpoint implementation is sequential)
- T014 → T015 → T016 (Frontend wiring is sequential)

### Phase 5 (US3) Parallelization

**Can run simultaneously**:
- T020 (Backend endpoint) + T021 (Backend schema) + T022 (Frontend component)

**Must run sequentially**:
- T023 → T024 (API client then integration)

### Phase 7 (US5) Parallelization

**Can run simultaneously**:
- T029 (Notification service) + T030 (Miss detector) + T033 (Frontend banner)

**Must run sequentially**:
- T030 → T031 → T032 (Miss detector implementation is sequential)

---

## Testing Strategy

**Note**: This feature does NOT require TDD or test-first development per the spec. Tests can be added post-implementation if desired, but are not blocking for task completion.

**Recommended Test Coverage** (optional):
- Unit tests: Streak calculation logic (test_streak_calculator.py)
- Unit tests: Miss detection logic (test_miss_detector.py)
- Contract tests: API endpoint schemas (test_completion_contract.py)
- Integration tests: Full completion flow (test_completion_flow.py)
- Component tests: Frontend components (CompletionCheckbox.test.tsx)

**Manual Testing Checklist** (required):
- [ ] Complete habit → Verify completion recorded
- [ ] Complete habit on consecutive days → Verify streak increments
- [ ] Try to complete same habit twice today → Verify 409 error
- [ ] Choose completion type → Verify type recorded
- [ ] View streak counter → Verify displays correctly
- [ ] Test sound effect → Verify plays on desktop and mobile
- [ ] Miss habit once → Verify notification appears
- [ ] Miss habit twice → Verify streak resets
- [ ] View completion history → Verify all completions shown
- [ ] Undo completion → Verify deleted and streak recalculated
- [ ] Test mobile responsiveness → Verify 44×44px tap targets, smooth animations

---

## Implementation Notes

### Task Execution Format

Each task should be completed by:
1. Reading the spec.md for acceptance criteria
2. Reading the plan.md for technical approach
3. Reading the data-model.md and contracts/ for implementation details
4. Implementing the task (creating files, writing code)
5. Verifying the task meets acceptance criteria

### File Creation Order

**Backend**:
1. Models (T005, T006) - SQLModel definitions
2. Schemas (T008, T021, T038) - Pydantic request/response
3. Services (T007, T029, T030) - Business logic
4. Routes (T009, T020, T037, T041) - API endpoints
5. Events (T013) - Event emission

**Frontend**:
1. Utilities (T025) - Sound player, API clients
2. Components (T014, T017, T022, T033, T039) - React components
3. Pages (T024, T040) - Next.js pages
4. Assets (T026) - Sound files

### Configuration Files

Create `.env.example` files with these variables:
```bash
# Backend (apps/api/.env.example)
DATABASE_URL=postgresql://user:pass@localhost/habits_db
MISS_DETECTION_SCHEDULE="0 1 * * *"  # Daily at 00:01 UTC
ENABLE_MISS_DETECTION=true
SOUND_EFFECT_URL=/sounds/sparkle.mp3

# Frontend (apps/web/.env.local.example)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SOUND_VOLUME=0.5
```

---

**Status**: Tasks ready for implementation. Run `/sp.implement` to begin execution.
