---
id: 008
title: US4 Card Styling Restyling
stage: green
date: 2026-02-14
surface: agent
model: claude-opus-4-6
feature: 006-notebook-design-system
branch: 006-notebook-design-system
user: notebook-frontend-styler
command: implement US4 card styling tasks
labels: ["notebook-design", "cards", "sticky-notes", "index-cards", "badges", "filters"]
links:
  spec: specs/006-notebook-design-system/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - apps/web/src/components/tasks/PriorityBadge.tsx
  - apps/web/src/components/tasks/DueDateBadge.tsx
  - apps/web/src/components/tasks/HabitTaskBadge.tsx
  - apps/web/src/components/tasks/TaskCard.tsx
  - apps/web/src/components/habits/HabitCard.tsx
  - apps/web/src/components/habits/CategoryFilter.tsx
  - apps/web/src/components/habits/StatusFilter.tsx
  - specs/006-notebook-design-system/tasks.md
tests:
  - none (visual styling changes only)
---

## Prompt

Implement US4 card styling tasks (T026-T032). Restyle PriorityBadge, DueDateBadge, HabitTaskBadge with notebook ink colors and handwritten fonts. Restyle TaskCard as sticky note with warm yellow background, notebook shadows, and hover lift. Restyle HabitCard as index card with ruled lines background, category accent top bar, and notebook typography. Restyle CategoryFilter and StatusFilter with notebook ink colors and patrick-hand font.

## Response snapshot

Implemented all 7 US4 tasks:
- T027: PriorityBadge - ink-red/high, highlight-yellow/medium, ink-blue/low with font-patrick-hand
- T028: DueDateBadge - notebook ink-red for overdue, paper-alt for normal, font-patrick-hand
- T029: HabitTaskBadge - ink-blue/10 background with font-patrick-hand
- T026: TaskCard - sticky note style with highlight-yellow bg, notebook shadows, hover lift, caveat font title, notebook status colors
- T030: HabitCard - index card with ruled lines (repeating-linear-gradient), category accent top bar (1px colored div), notebook typography throughout, removed decorative corner accent
- T031: CategoryFilter - patrick-hand font, ink-blue active, paper-white inactive with notebook-line border
- T032: StatusFilter - patrick-hand font, ink-blue active, notebook-line borders

## Outcome

- Impact: All task and habit cards now use notebook design system tokens consistently
- Tests: No automated tests (visual styling only)
- Files: 7 component files modified, tasks.md updated with checkmarks
- Next prompts: US5 navigation styling, US6 form styling, US8 page consistency
- Reflection: Batch editing of related badge components was efficient since they share similar patterns

## Evaluation notes (flywheel)

- Failure modes observed: TaskCard had been previously modified (action buttons already restyled) requiring re-read before editing
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
