---
id: 012
title: Implement Task Search and Discovery (US7 T039–T041)
stage: green
date: 2026-02-23
surface: agent
model: claude-sonnet-4-6
feature: 007-landing-page-update
branch: 007-landing-page-update
user: HP
command: implement T039 T040 T041
labels: ["tasks","search","autocomplete","US7","SearchInput","TaskForm","TaskFilters"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - apps/web/src/components/tasks/SearchInput.tsx (created)
  - apps/web/src/app/tasks/page.tsx (modified)
  - apps/web/src/components/tasks/TaskForm.tsx (modified)
tests:
  - none (no test files created per instructions)
---

## Prompt

You are implementing Phase 9 (US7 — Task Search & Discovery) for the Atomic Habits notebook app.

## T039: Create `apps/web/src/components/tasks/SearchInput.tsx`
Create a 'use client' component with debounced URL-synced search using useRouter/useSearchParams. 300ms debounce writes ?search= to the URL; clears it on empty input. Syncs on mount from searchParams.

## T040: Update `apps/web/src/app/tasks/page.tsx`
1. Import SearchInput from @/components/tasks/SearchInput
2. Insert <SearchInput /> between the header div and <TaskFilters>
3. Update empty state: if filters.search is set, show "No tasks found for '{filters.search}'" message; otherwise show <EmptyState hasFilters={hasFilters} />

## T041: Add tag autocomplete to `apps/web/src/components/tasks/TaskForm.tsx`
1. Import getTags from @/lib/tasks-api; add useEffect to imports
2. Add tagSuggestions, filteredSuggestions, showSuggestions, tagInput state variables
3. Fetch tags on mount via getTags(userId)
4. Add handleTagInputChange (filters suggestions) and handleSelectSuggestion (appends to comma-separated tags string)
5. Keep existing tags text input for direct editing; add a second input below it for autocomplete search with a dropdown listbox (absolute positioned, z-10)

## Response snapshot

Created 1 file and modified 2 files:

**T039 — SearchInput.tsx (created)**
- `'use client'` component at `apps/web/src/components/tasks/SearchInput.tsx`
- Uses `useSearchParams` to initialize and sync value from URL `?search=` param
- 300ms debounced `router.push('/tasks?...')` on input change
- Clears `search` param from URL when input is emptied
- Uses notebook design system classes throughout

**T040 — tasks/page.tsx (modified)**
- Added `import { SearchInput } from '@/components/tasks/SearchInput'`
- Inserted `<SearchInput />` between header `</div>` and `<TaskFilters>`
- Updated empty state: nested ternary — `filters.search` → custom "No tasks found for '...'" block; otherwise → `<EmptyState hasFilters={hasFilters} />`

**T041 — TaskForm.tsx (modified)**
- Added `useEffect` to imports; added `getTags` to tasks-api import
- Added four state variables: `tagSuggestions`, `filteredSuggestions`, `showSuggestions`, `tagInput`
- `useEffect` fetches tags on mount (silently ignores errors)
- `handleTagInputChange`: filters suggestions excluding already-added tags; shows/hides dropdown
- `handleSelectSuggestion`: appends tag to comma-separated `tags` string; clears input and hides dropdown
- Tags section: kept existing comma-edit input + added new autocomplete input below in `relative` div
- Dropdown is a `<ul role="listbox">` with `absolute z-10` positioning (always-visible conditional, no Tailwind ternary quirk)
- `onBlur` delay of 150ms ensures click-on-suggestion fires before dropdown hides

## Outcome

- Impact: US7 Task Search & Discovery implemented — search bar on tasks page, URL-driven debounced filtering, search-specific empty state, and tag autocomplete in TaskForm
- Tests: none created per explicit instruction
- Files: 1 created, 2 modified
- Next prompts: wire up backend /tags endpoint if not yet live; add keyboard navigation to autocomplete dropdown
- Reflection: Kept existing comma-separated tags string as source of truth; autocomplete appends to it cleanly. Avoided Tailwind ternary CSS-scan quirk by using static conditional rendering (showSuggestions && ...) rather than dynamic class names.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): none run
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): add keyboard (ArrowUp/ArrowDown/Enter/Escape) navigation to the autocomplete dropdown
