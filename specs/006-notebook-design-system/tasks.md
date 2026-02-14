# Tasks: Cozy Handwritten Notebook Design System

**Input**: Design documents from `/specs/006-notebook-design-system/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. This is a frontend-only feature (zero backend changes).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `apps/web/src/` (Next.js App Router)
- **Components**: `apps/web/src/components/`
- **Pages**: `apps/web/src/app/`
- **Config**: `apps/web/` (root-level config files)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and prepare the project for the design system work.

- [x] T001 Install `roughjs` dependency in `apps/web/package.json`
- [x] T002 Verify `roughjs` imports correctly and tree-shakes (run `npm run build` in `apps/web/`)

---

## Phase 2: Foundational (Design Tokens, Fonts, Tailwind)

**Purpose**: Establish the visual foundation — CSS custom properties, fonts, and Tailwind extension. ALL user stories depend on this phase.

**Covers**: FR-001, FR-002, FR-003, FR-004, FR-005

- [x] T003 Define notebook color palette as CSS custom properties (paper, ink, highlight, shadow tokens) in `apps/web/src/app/globals.css`
- [x] T004 Define spacing scale tokens (4px, 8px, 16px, 24px, 32px, 48px) as CSS custom properties in `apps/web/src/app/globals.css`
- [x] T005 Define CSS keyframe animations (draw-checkmark, highlight-flash, fade-in-up) with `prefers-reduced-motion` guards in `apps/web/src/app/globals.css`
- [x] T006 Remove dark mode media query block from `apps/web/src/app/globals.css` (dark mode is out of scope)
- [x] T007 Load Caveat, Patrick Hand, and Inter fonts via `next/font/google` and expose as CSS variables (--font-caveat, --font-patrick-hand, --font-inter) in `apps/web/src/app/layout.tsx`
- [x] T008 Update body classes to use notebook background (cream paper) and Inter as default body font in `apps/web/src/app/layout.tsx`
- [x] T009 Extend Tailwind config with notebook theme — colors (notebook-paper, notebook-ink-*, notebook-highlight-*), fontFamily (caveat, patrick-hand, inter), spacing tokens, shadow utilities, and animation utilities in `apps/web/tailwind.config.ts`
- [x] T010 Verify foundation renders correctly: cream background visible, fonts loading without layout shift, Tailwind notebook utilities available (run `npm run build`)

**Checkpoint**: Foundation ready — cream background, fonts loaded, Tailwind notebook utilities available. All user story work can now begin.

---

## Phase 3: User Story 1 — Cozy Notebook First Impression (Priority: P1)

**Goal**: User opens the app and immediately sees warm, inviting notebook aesthetic — cream background, handwritten headings, soft card shadows.

**Independent Test**: Load the dashboard page. Confirm cream background, handwritten font on headings, soft shadows on cards. Consistent across tasks and habits pages. Renders correctly on mobile (<768px).

### Implementation for User Story 1

- [x] T011 [US1] Create SketchyBorder component (roughjs SVG wrapper with ResizeObserver, seed prop for stable rendering, CSS fallback) in `apps/web/src/components/ui/sketchy-border.tsx`
- [x] T012 [US1] Restyle dashboard page with notebook aesthetic — cream background, handwritten heading (font-caveat), soft card shadows, max-w content container in `apps/web/src/app/dashboard/page.tsx`
- [x] T013 [US1] Restyle tasks list page with notebook heading, cream background, notebook-shadow cards in `apps/web/src/app/tasks/page.tsx`
- [x] T014 [US1] Restyle habits list page with notebook heading, cream background, notebook-shadow cards in `apps/web/src/app/habits/page.tsx`
- [x] T015 [US1] Update root layout max content width to 1200px centered on larger screens (FR-020) in `apps/web/src/app/layout.tsx`

**Checkpoint**: US1 complete — app immediately looks like a notebook on dashboard, tasks, and habits list pages.

---

## Phase 4: User Story 2 — Readable Typography with Handwritten Charm (Priority: P1)

**Goal**: Handwritten fonts on headings/labels/buttons for personality; clean sans-serif (Inter) for body text/descriptions for readability. All text passes WCAG AA contrast.

**Independent Test**: Read task cards, habit identity statements, form labels, button text across all pages. All text legible at intended sizes on mobile and desktop. Contrast ratios verified ≥4.5:1.

### Implementation for User Story 2

- [x] T016 [P] [US2] Restyle Button component — handwritten font (font-patrick-hand), notebook ink-blue primary, outlined secondary, sketchy focus indicator in `apps/web/src/components/ui/button.tsx`
- [x] T017 [P] [US2] Restyle Label component — handwritten font (font-patrick-hand), notebook-ink-medium color in `apps/web/src/components/ui/label.tsx`
- [x] T018 [P] [US2] Restyle Navbar — handwritten font labels (font-patrick-hand), logo in font-caveat, cream background, ink-underline hover, active state thick underline in `apps/web/src/components/Navbar.tsx`
- [x] T019 [P] [US2] Restyle LogoutButton with notebook typography and ink colors in `apps/web/src/components/LogoutButton.tsx`
- [x] T020 [P] [US2] Restyle LoginForm — handwritten heading, notebook typography, ink colors in `apps/web/src/components/LoginForm.tsx`
- [x] T021 [P] [US2] Restyle RegisterForm — handwritten heading, notebook typography, ink colors in `apps/web/src/components/RegisterForm.tsx`
- [x] T022 [US2] Verify WCAG AA contrast ratios for all notebook ink/paper color combinations (minimum 4.5:1 normal text, 3:1 large text)

**Checkpoint**: US2 complete — all text is readable. Headings/labels use handwritten fonts. Body text uses Inter. All contrast ratios pass WCAG AA.

---

## Phase 5: User Story 3 — Delightful Task & Habit Completion (Priority: P1)

**Goal**: Completing tasks/habits triggers satisfying checkmark animation + card highlight flash. Respects prefers-reduced-motion.

**Independent Test**: Click complete on a task card or habit checkbox. Checkmark draws in (~0.3s), card flashes mint highlight (~0.5s). Enable reduced-motion — state changes instantly, no animation.

**Covers**: FR-013, FR-016

### Implementation for User Story 3

- [x] T023 [US3] Create CheckmarkAnimation component — SVG checkmark with stroke-dasharray draw animation (~0.3s), card highlight flash (~0.5s fade to mint), reduced-motion instant fallback in `apps/web/src/components/ui/checkmark-animation.tsx`
- [x] T024 [US3] Integrate CheckmarkAnimation into CompletionCheckbox — trigger checkmark draw + card highlight on habit completion in `apps/web/src/components/habits/CompletionCheckbox.tsx`
- [x] T025 [US3] Add completion animation to TaskCard — trigger checkmark draw + background highlight flash when task is completed in `apps/web/src/components/tasks/TaskCard.tsx`

**Checkpoint**: US3 complete — completing tasks and habits triggers satisfying visual feedback. Animations disabled for reduced-motion users.

---

## Phase 6: User Story 4 — Notebook-Styled Cards (Priority: P2)

**Goal**: Task cards look like sticky notes; habit cards look like index cards with ruled lines. Both have sketchy borders and hover lift effect.

**Independent Test**: View tasks list — cards resemble sticky notes (warm background, sketchy border, soft shadow). View habits list — cards resemble index cards (cream, ruled lines, top accent). Hover on desktop — cards lift with growing shadow.

**Covers**: FR-006, FR-007, FR-014

### Implementation for User Story 4

- [x] T026 [US4] Restyle TaskCard as sticky note — warm-tinted background (notebook-highlight-yellow), SketchyBorder wrapper, notebook-shadow, generous padding, hover lift (translateY -4px + shadow grow) in `apps/web/src/components/tasks/TaskCard.tsx`
- [x] T027 [P] [US4] Restyle PriorityBadge with ink-colored variants (ink-red for high, ink-medium for medium, ink-blue for low), handwritten font in `apps/web/src/components/tasks/PriorityBadge.tsx`
- [x] T028 [P] [US4] Restyle DueDateBadge with notebook ink colors, warm tones for overdue state in `apps/web/src/components/tasks/DueDateBadge.tsx`
- [x] T029 [P] [US4] Restyle HabitTaskBadge with notebook ink colors in `apps/web/src/components/tasks/HabitTaskBadge.tsx`
- [x] T030 [US4] Restyle HabitCard as index card — cream background (notebook-paper-alt), faint horizontal ruled lines (repeating-linear-gradient), SketchyBorder with thicker stroke, colored top-edge accent by category, hover lift in `apps/web/src/components/habits/HabitCard.tsx`
- [x] T031 [P] [US4] Restyle CategoryFilter buttons with notebook ink colors and handwritten font in `apps/web/src/components/habits/CategoryFilter.tsx`
- [x] T032 [P] [US4] Restyle StatusFilter with notebook colors and typography in `apps/web/src/components/habits/StatusFilter.tsx`

**Checkpoint**: US4 complete — task cards are sticky notes, habit cards are index cards. Both lift on hover. All badges use ink colors.

---

## Phase 7: User Story 5 — Notebook-Style Navigation (Priority: P2)

**Goal**: Navigation uses handwritten labels and notebook tab styling. Active page has ink underline. Mobile bottom nav styled as notebook tabs.

**Independent Test**: Navigate between dashboard, tasks, habits. Links use handwritten font. Active page has thick ink underline. Mobile bottom nav shows cream tabs with hand-drawn icons.

**Covers**: FR-012

### Implementation for User Story 5

- [x] T033 [US5] Enhance Navbar with ink-underline hover animation (width grows from center), active state thick ink-blue underline (3px), mobile bottom nav cream background with tab-style appearance in `apps/web/src/components/Navbar.tsx`

**Checkpoint**: US5 complete — navigation feels like notebook tabs throughout the app.

---

## Phase 8: User Story 6 — Notebook-Style Forms (Priority: P2)

**Goal**: Form inputs have underline-only borders. Labels use handwritten font. Focus turns blue like pen on paper. Validation errors are friendly sticky-note style.

**Independent Test**: Navigate to new task or new habit form. Inputs show bottom underline only. Focus thickens and turns blue. Validation errors are warm and friendly (not red banners).

**Covers**: FR-009, FR-010, FR-011

### Implementation for User Story 6

- [x] T034 [US6] Restyle Input component — remove box border, add bottom-underline-only (border-b-2), transparent background, focus turns blue and thickens (3px), placeholder in ink-light in `apps/web/src/components/ui/input.tsx`
- [x] T035 [US6] Restyle TaskForm — notebook-page feel (cream container, ruled-line background for textareas), friendly validation errors (sticky-note style, warm background, handwritten font), character counters in ink-light in `apps/web/src/components/tasks/TaskForm.tsx`
- [x] T036 [US6] Restyle HabitForm — notebook-page feel, underline inputs, handwritten labels, friendly validation, day-picker with ink colors, schedule section with notebook styling in `apps/web/src/components/habits/HabitForm.tsx`
- [x] T037 [US6] Restyle TaskFilters — notebook aesthetic for filter inputs, select elements, active filter badges with ink colors in `apps/web/src/components/tasks/TaskFilters.tsx`
- [x] T038 [P] [US6] Restyle Pagination component with notebook colors and typography in `apps/web/src/components/tasks/Pagination.tsx`

**Checkpoint**: US6 complete — all forms feel like writing in a notebook. Validation is warm and friendly.

---

## Phase 9: User Story 7 — Friendly Empty & Loading States (Priority: P3)

**Goal**: Empty pages show encouraging handwritten messages with doodles and CTAs. Loading states use cream-colored skeleton placeholders. Errors are friendly.

**Independent Test**: View tasks page with no tasks — encouraging message appears with doodle and CTA. Simulate slow loading — cream-colored skeletons render. Trigger error — friendly sticky-note message appears.

**Covers**: FR-021, FR-022, FR-023, FR-024

### Implementation for User Story 7

- [x] T039 [US7] Restyle tasks EmptyState — encouraging handwritten message, simple inline SVG doodle (notebook/pencil), prominent notebook-styled CTA button in `apps/web/src/components/tasks/EmptyState.tsx`
- [x] T040 [P] [US7] Create NotebookSkeleton component — cream-colored placeholder shapes (not gray), subtle pulse animation on warm tones, card-shaped variants (sticky-note, index-card) in `apps/web/src/components/ui/notebook-skeleton.tsx`
- [x] T041 [US7] Update TaskSkeleton to use NotebookSkeleton with cream colors and sticky-note shapes in `apps/web/src/components/tasks/TaskSkeleton.tsx`
- [x] T042 [US7] Restyle toast notifications as sticky notes — SketchyBorder, handwritten font, color-coded (blue info, green success, yellow warning, red error), slight rotation for organic feel in `apps/web/src/lib/toast-context.tsx`
- [x] T043 [P] [US7] Restyle NotificationBanner with notebook warm tones and handwritten font in `apps/web/src/components/notifications/NotificationBanner.tsx`
- [x] T044 [P] [US7] Restyle CompletionTypeModal with notebook aesthetic — cream background, handwritten headings, ink-colored options in `apps/web/src/components/habits/CompletionTypeModal.tsx`

**Checkpoint**: US7 complete — empty states are encouraging, loading is warm, errors are friendly, toasts are sticky notes.

---

## Phase 10: User Story 8 — Consistent Design Across All Pages (Priority: P3)

**Goal**: Every page uses the same notebook design tokens and component styles. No page breaks the aesthetic.

**Independent Test**: Navigate through all 12 pages (dashboard, tasks list/detail/new/edit, habits list/detail/new/edit, login, register, root). All pages use consistent cream backgrounds, handwritten headings, inter body text, notebook-styled components.

**Covers**: FR-017, FR-018, FR-019, FR-020, FR-029 (milestone text)

### Implementation for User Story 8

- [x] T045 [P] [US8] Restyle login page with notebook aesthetic — cream background, handwritten heading, notebook-styled form in `apps/web/src/app/login/page.tsx`
- [x] T046 [P] [US8] Restyle register page with notebook aesthetic — cream background, handwritten heading, notebook-styled form in `apps/web/src/app/register/page.tsx`
- [x] T047 [P] [US8] Restyle root landing page with notebook aesthetic in `apps/web/src/app/page.tsx`
- [x] T048 [P] [US8] Restyle task detail page with notebook aesthetic — cream background, handwritten heading, notebook-styled content in `apps/web/src/app/tasks/[id]/page.tsx`
- [x] T049 [P] [US8] Restyle task new page with notebook aesthetic in `apps/web/src/app/tasks/new/page.tsx`
- [x] T050 [P] [US8] Restyle task edit page with notebook aesthetic in `apps/web/src/app/tasks/[id]/edit/page.tsx`
- [x] T051 [P] [US8] Restyle habit detail page with notebook aesthetic — handwritten heading, completion history styled, streak counter prominent in `apps/web/src/app/habits/[id]/page.tsx`
- [x] T052 [P] [US8] Restyle habit new page with notebook aesthetic in `apps/web/src/app/habits/new/page.tsx`
- [x] T053 [P] [US8] Restyle habit edit page with notebook aesthetic in `apps/web/src/app/habits/[id]/edit/page.tsx`
- [x] T054 [P] [US8] Restyle CompletionHistory with notebook colors, ink typography in `apps/web/src/components/habits/CompletionHistory.tsx`
- [x] T055 [P] [US8] Restyle GeneratedTasksList with notebook colors, ink typography in `apps/web/src/components/habits/GeneratedTasksList.tsx`
- [x] T056 [US8] Add streak milestone inline text (FR-029) — display "Amazing — 7 day streak!", "Incredible — 21 day streak!", "Unstoppable — 30 day streak!" in handwritten font adjacent to streak counter in `apps/web/src/components/habits/StreakCounter.tsx`
- [x] T057 [US8] Add staggered fade-in-up animation to card lists on tasks page, habits page, and dashboard (100ms delay between cards, respects prefers-reduced-motion) in `apps/web/src/app/tasks/page.tsx`, `apps/web/src/app/habits/page.tsx`, `apps/web/src/app/dashboard/page.tsx`

**Checkpoint**: US8 complete — every page in the application uses the notebook design system consistently.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, accessibility audit, performance verification.

- [x] T058 Verify all interactive elements maintain minimum 44×44px touch targets across all pages (FR-019)
- [x] T059 Verify all text/background combinations pass WCAG AA contrast ratio (FR-025) — test every notebook-ink variant on notebook-paper backgrounds
- [x] T060 Verify all focus indicators are visible with sketchy border style on all interactive elements (FR-026)
- [x] T061 Verify keyboard navigation works for all interactive elements with logical tab order (FR-027)
- [x] T062 Verify all animations disabled when `prefers-reduced-motion: reduce` is enabled (FR-016)
- [x] T063 Verify responsive rendering at 320px, 768px, 1024px, 1920px — no horizontal scrolling, no broken layouts (SC-009)
- [x] T064 Run `npm run build` and verify no TypeScript errors, no increased bundle size beyond budget (<500ms load impact)
- [x] T065 Walk through all 12 pages end-to-end and verify SC-001 through SC-010 pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — creates SketchyBorder used by US4, US7
- **US2 (Phase 4)**: Depends on Phase 2 only — can run in parallel with US1
- **US3 (Phase 5)**: Depends on Phase 2 only — can run in parallel with US1, US2
- **US4 (Phase 6)**: Depends on Phase 2 + SketchyBorder from US1 (T011)
- **US5 (Phase 7)**: Depends on Phase 2 + US2 (Navbar typography from T018)
- **US6 (Phase 8)**: Depends on Phase 2 + US2 (Input/Label restyled in T016-T017)
- **US7 (Phase 9)**: Depends on Phase 2 + SketchyBorder from US1 (T011) for toast styling
- **US8 (Phase 10)**: Depends on all previous user stories (consistency pass)
- **Polish (Phase 11)**: Depends on all user stories complete

### User Story Dependencies

```
Phase 2 (Foundation) ─── BLOCKS ALL ───┐
                                        │
          ┌─────────────────────────────┤
          │                             │
     US1 (Phase 3)                US2 (Phase 4)          US3 (Phase 5)
     SketchyBorder +              Typography +            Completion
     Page aesthetics              Button/Label/Nav        Animations
          │                             │
          ├──────────────┐              │
          │              │              │
     US4 (Phase 6)   US7 (Phase 9)  US5 (Phase 7)    US6 (Phase 8)
     Cards           Empty/Toast     Nav enhance       Forms
          │              │              │                │
          └──────────────┴──────────────┴────────────────┘
                                        │
                                  US8 (Phase 10)
                                  Page consistency
                                        │
                                  Polish (Phase 11)
                                  Final validation
```

### Within Each User Story

- Components that modify different files can run in parallel [P]
- Components that modify the same file must run sequentially
- Page-level tasks depend on component tasks being complete

### Parallel Opportunities

**Phase 2 (Foundation)**: T003, T004, T005 can run in parallel (all modify globals.css sections but different areas)
**US2**: T016, T017, T018, T019, T020, T021 — all modify different files, fully parallel
**US4**: T027, T028, T029, T031, T032 — all modify different files, fully parallel
**US7**: T040, T043, T044 — all modify different files, fully parallel
**US8**: T045–T055 — all modify different pages/components, fully parallel

---

## Parallel Example: User Story 4 (Cards)

```
# All badge restyling can run in parallel (different files):
Task T027: Restyle PriorityBadge in components/tasks/PriorityBadge.tsx
Task T028: Restyle DueDateBadge in components/tasks/DueDateBadge.tsx
Task T029: Restyle HabitTaskBadge in components/tasks/HabitTaskBadge.tsx
Task T031: Restyle CategoryFilter in components/habits/CategoryFilter.tsx
Task T032: Restyle StatusFilter in components/habits/StatusFilter.tsx

# Then cards (after badges are ready, since cards contain badges):
Task T026: Restyle TaskCard (sticky note) — depends on SketchyBorder (T011)
Task T030: Restyle HabitCard (index card) — depends on SketchyBorder (T011)
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundation (T003-T010)
3. Complete Phase 3: US1 — First Impression (T011-T015)
4. **STOP and VALIDATE**: App looks like a notebook on dashboard/tasks/habits pages
5. Complete Phase 4: US2 — Typography (T016-T022)
6. Complete Phase 5: US3 — Completion Animations (T023-T025)
7. **MVP DONE**: Core notebook aesthetic + readable typography + satisfying animations

### Incremental Delivery

1. Foundation → App has cream background and fonts (immediate visual change)
2. Add US1 → Notebook first impression on all list pages
3. Add US2 → All text uses correct fonts and passes contrast
4. Add US3 → Completion feels satisfying (Law 4 reinforced)
5. Add US4 → Cards transformed to sticky notes / index cards
6. Add US5+US6 → Navigation and forms match aesthetic
7. Add US7 → Empty/loading states have personality
8. Add US8 → Every page consistent
9. Polish → Accessibility and performance verified

Each increment adds visible value without breaking previous work.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No backend changes in this entire feature — all work is in `apps/web/`
- roughjs is the only new dependency
- All animations must respect `prefers-reduced-motion: reduce`
- All colors must pass WCAG AA (4.5:1 contrast minimum)
- Total: **65 tasks** across 11 phases (8 user stories + setup + foundation + polish)
