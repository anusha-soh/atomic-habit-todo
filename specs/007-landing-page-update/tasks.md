# Tasks: Landing Page Modernization (TDD Approach)

**Feature Branch**: `007-landing-page-update`
**Plan**: `specs/007-landing-page-update/plan.md`

## Phase 1: Setup

- [X] T001 Install `roughjs`, `vitest`, and `@testing-library/react` in `apps/web/package.json`
- [X] T002 Configure `next/font/google` for `Caveat` and `Patrick Hand` in `apps/web/src/app/layout.tsx`
- [X] T003 [P] Set up Tailwind CSS v4 design tokens in `apps/web/src/styles/globals.css`
- [X] T004 Create `(marketing)` route group layout in `apps/web/src/app/(marketing)/layout.tsx`

## Phase 2: Foundational Components (TDD)

- [X] T005 [P] Create unit tests for `RoughBorder` in `apps/web/src/components/ui/rough-border.test.tsx` (verify SVG generation)
- [X] T006 [P] Implement `RoughBorder` utility component in `apps/web/src/components/ui/rough-border.tsx`
- [X] T007 [P] Create unit tests for `StickyNote` in `apps/web/src/components/ui/sticky-note.test.tsx` (verify children rendering and border application)
- [X] T008 [P] Implement `StickyNote` wrapper component in `apps/web/src/components/ui/sticky-note.tsx`
- [X] T009 [P] Create unit tests for notebook-themed `Button` variants in `apps/web/src/components/ui/button.test.tsx`
- [X] T010 [P] Create notebook-themed variants for shadcn `Button` in `apps/web/src/components/ui/button.tsx`

## Phase 3: User Story 1 - Warm Welcome & Brand Identity (P1)

**Story Goal**: Visitors feel a warm, personal connection via the hero section's notebook aesthetic.
**Independent Test**: Load `/` and verify hero section has cream background, handwritten headline, and soft shadows.

- [X] T011 [US1] Create component tests for Hero section in `apps/web/src/components/marketing/hero.test.tsx` (verify headline font and background color)
- [X] T012 [US1] Create Hero section component in `apps/web/src/components/marketing/hero.tsx`
- [X] T013 [US1] Integrate Hero section into landing page in `apps/web/src/app/(marketing)/page.tsx`

## Phase 4: User Story 2 - Feature Discovery via "Sticky Notes" (P1)

**Story Goal**: Features are presented as approachable "sticky note" cards with sketchy borders.
**Independent Test**: Navigate to Features section and verify 3 distinct sticky-note cards stack vertically on mobile.

- [X] T014 [P] [US2] Create unit tests for Feature Card in `apps/web/src/components/marketing/feature-card.test.tsx`
- [X] T015 [P] [US2] Create Feature Card component in `apps/web/src/components/marketing/feature-card.tsx`
- [X] T016 [US2] Implement Features section grid in `apps/web/src/components/marketing/features.tsx`
- [X] T017 [US2] Add Features section to landing page in `apps/web/src/app/(marketing)/page.tsx`

## Phase 5: User Story 3 - Seamless Navigation and CTA (P2)

**Story Goal**: Easy navigation with notebook-style tabs and a visible "blue ink" CTA.
**Independent Test**: Scroll down and verify Nav bar transitions to semi-transparent cream with shadow.

- [X] T018 [US3] Create tests for `NotebookNav` in `apps/web/src/components/marketing/notebook-nav.test.tsx` (verify scroll state behavior)
- [X] T019 [US3] Implement `NotebookNav` component with scroll state in `apps/web/src/components/marketing/notebook-nav.tsx`
- [X] T020 [US3] Create Final CTA section in `apps/web/src/components/marketing/final-cta.tsx`
- [X] T021 [US3] Update Navigation and CTA in `apps/web/src/app/(marketing)/page.tsx`

## Phase 6: User Story 4 - Social Proof & Encouragement (P3)

**Story Goal**: Display 3 friendly handwritten testimonials to build trust.
**Independent Test**: Verify 3 testimonials appear with `Patrick Hand` font and doodle avatars.

- [X] T022 [US4] Create tests for Testimonials section in `apps/web/src/components/marketing/testimonials.test.tsx`
- [X] T023 [US4] Implement Testimonials section component in `apps/web/src/components/marketing/testimonials.tsx`
- [X] T024 [US4] Add Testimonials section to landing page in `apps/web/src/app/(marketing)/page.tsx`

## Phase 7: Polish, E2E & Cross-Cutting Concerns

- [X] T025 Implement Notebook-themed Footer in `apps/web/src/components/marketing/footer.tsx`
- [ ] T026 Create Playwright E2E tests for the landing page in `apps/web/tests/e2e/landing-page.spec.ts` (verify full scroll sequence and responsive layout)
- [ ] T027 Conduct responsive audit and fix layout shifts in `apps/web/src/app/(marketing)/page.tsx`
- [ ] T028 [P] Run accessibility audit and ensure WCAG AA compliance (4.5:1 contrast) across all sections
- [ ] T029 [P] Perform performance profiling and optimize for SC-004 (FCP < 1.2s)

## Implementation Strategy

1. **MVP First**: Complete Phase 1-3 to have a functional, branded hero section.
2. **TDD Loop**: For every component, write the test first, see it fail, then implement to make it pass.
3. **Component Reuse**: Use `StickyNote` and `RoughBorder` consistently across Features and Testimonials.
4. **Styling**: Leverage Tailwind v4 CSS variables for theme consistency.

## Dependencies

- Phase 1 must complete before all other phases.
- Phase 2 must complete before User Story phases.
- User Stories can be implemented in parallel if components from Phase 2 are ready.
- Polish phase (Phase 7) is the final step, including E2E and performance optimization.

## Parallel Execution Examples

- **UI Development**: T005-T010 (Tests and Implementation) can be done in parallel for different components.
- **Section Styling**: T015 (Feature Card) and T019 (Nav) can be worked on independently.
