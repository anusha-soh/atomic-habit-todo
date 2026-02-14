# Component Inventory — Current State & Target

Complete inventory of all frontend components and their notebook design system status.

## UI Components (apps/web/src/components/ui/)

| Component | File | Current Style | Notebook Target |
|---|---|---|---|
| Button | `button.tsx` | Blue-600, rounded-md, CVA variants | Patrick Hand font, ink-blue fill, sketchy focus |
| Input | `input.tsx` | Gray border box, rounded-md | Underline-only, transparent bg, blue focus |
| Label | `label.tsx` | text-sm font-medium | Patrick Hand, ink-medium |
| SketchyBorder | `sketchy-border.tsx` | NEW | roughjs SVG wrapper |
| CheckmarkAnimation | `checkmark-animation.tsx` | NEW | SVG stroke-draw + highlight flash |
| NotebookSkeleton | `notebook-skeleton.tsx` | NEW | Cream skeleton placeholders |

## Task Components (apps/web/src/components/tasks/)

| Component | File | Current Style | Notebook Target |
|---|---|---|---|
| TaskCard | `TaskCard.tsx` | White bg, gray border, blue accents | Sticky note (yellow bg, sketchy border, soft shadow) |
| TaskForm | `TaskForm.tsx` | Standard inputs, gray validation | Notebook page, underline inputs, friendly errors |
| TaskFilters | `TaskFilters.tsx` | Gray borders, blue focus rings | Notebook ink colors, warm tones |
| TaskSkeleton | `TaskSkeleton.tsx` | Gray rectangles | Cream notebook-skeleton shapes |
| EmptyState | `EmptyState.tsx` | Gray dashed border, generic | Encouraging message, SVG doodle, notebook CTA |
| PriorityBadge | `PriorityBadge.tsx` | Red/yellow/blue-100 badges | Ink-colored (ink-red/ink-medium/ink-blue) |
| DueDateBadge | `DueDateBadge.tsx` | Red for overdue, gray normal | Ink-red overdue, warm tones |
| HabitTaskBadge | `HabitTaskBadge.tsx` | Standard badge | Ink-colored notebook badge |
| Pagination | `Pagination.tsx` | Standard | Notebook colors and typography |

## Habit Components (apps/web/src/components/habits/)

| Component | File | Current Style | Notebook Target |
|---|---|---|---|
| HabitCard | `HabitCard.tsx` | White bg, category colors | Index card (cream, ruled lines, top accent, sketchy border) |
| HabitForm | `HabitForm.tsx` | Standard, blue-50 sections | Notebook page, underline inputs, ink colors |
| CompletionCheckbox | `CompletionCheckbox.tsx` | Green/white circle, animate-scale-in | CheckmarkAnimation integration |
| CompletionHistory | `CompletionHistory.tsx` | Standard | Notebook colors, ink typography |
| CompletionTypeModal | `CompletionTypeModal.tsx` | Standard modal | Cream bg, handwritten heading, ink options |
| StreakCounter | `StreakCounter.tsx` | Orange text, fire emoji | + milestone text at 7/21/30 days |
| CategoryFilter | `CategoryFilter.tsx` | Blue active, gray inactive | Ink colors, handwritten font |
| StatusFilter | `StatusFilter.tsx` | White/gray segmented | Notebook warm tones |
| GeneratedTasksList | `GeneratedTasksList.tsx` | Standard | Notebook colors, ink typography |

## Layout Components

| Component | File | Current Style | Notebook Target |
|---|---|---|---|
| Navbar | `Navbar.tsx` | White bg, blue active, gray links | Cream bg, Caveat logo, Patrick Hand links, ink underline |
| LogoutButton | `LogoutButton.tsx` | Standard | Notebook typography, ink colors |
| LoginForm | `LoginForm.tsx` | Standard | Handwritten heading, notebook form |
| RegisterForm | `RegisterForm.tsx` | Standard | Handwritten heading, notebook form |

## Notification Components

| Component | File | Current Style | Notebook Target |
|---|---|---|---|
| NotificationBanner | `NotificationBanner.tsx` | Amber/blue, emoji icons | Warm notebook tones, handwritten font |
| Toast (context) | `toast-context.tsx` | Standard | Sticky note appearance, sketchy border |

## Pages (apps/web/src/app/)

| Page | File | Current Style | Notebook Target |
|---|---|---|---|
| Root | `page.tsx` | Minimal | Notebook landing |
| Dashboard | `dashboard/page.tsx` | Gray-50 bg, basic cards | Cream bg, Caveat heading, notebook cards |
| Tasks List | `tasks/page.tsx` | max-w-4xl, white content | Cream bg, notebook heading, sticky note cards |
| Task Detail | `tasks/[id]/page.tsx` | Standard | Notebook aesthetic |
| Task New | `tasks/new/page.tsx` | Standard form page | Notebook form page |
| Task Edit | `tasks/[id]/edit/page.tsx` | Standard form page | Notebook form page |
| Habits List | `habits/page.tsx` | max-w-7xl, responsive grid | Cream bg, notebook heading, index cards |
| Habit Detail | `habits/[id]/page.tsx` | Standard | Notebook aesthetic, prominent streak |
| Habit New | `habits/new/page.tsx` | Standard form page | Notebook form page |
| Habit Edit | `habits/[id]/edit/page.tsx` | Standard form page | Notebook form page |
| Login | `login/page.tsx` | Standard | Notebook auth page |
| Register | `register/page.tsx` | Standard | Notebook auth page |

## Utility Files

| File | Purpose | Notebook Impact |
|---|---|---|
| `lib/utils.ts` | `cn()` class merger | No change needed |
| `lib/toast-context.tsx` | Toast provider | Restyle toast rendering |
| `lib/api.ts` | API client | No change |
| `lib/habits-api.ts` | Habits API | No change |
| `lib/tasks-api.ts` | Tasks API | No change |
| `lib/auth-api.ts` | Auth API | No change |
| `lib/date-utils.ts` | Date formatting | No change |
| `lib/sound-player.ts` | Completion sounds | No change |

## Config Files

| File | Purpose | Notebook Impact |
|---|---|---|
| `tailwind.config.ts` | Tailwind config | Add all notebook theme tokens |
| `globals.css` | Global styles | Add CSS custom properties, keyframes |
| `layout.tsx` | Root layout | Load fonts, apply body classes |
| `package.json` | Dependencies | Add roughjs |
