# Feature Specification: Cozy Handwritten Notebook Design System

**Feature Branch**: `006-notebook-design-system`
**Created**: 2026-02-13
**Status**: Draft
**Input**: Phase 2 Chunk 6 - Frontend Polish: Transform the application into a warm, personal, handwritten notebook experience that makes habit tracking feel intimate and encouraging.

## Context & Scope

This is Chunk 6 of the 7-chunk Phase 2 delivery plan. Chunks 1-5 are complete with all functional features built (auth, tasks, habits, tracking, task generation). This chunk applies a cohesive visual design system with a cozy handwritten notebook aesthetic. **No new backend features** are introduced.

### Design Vision

Transform the application from its current clinical/generic appearance into a warm, personal, handwritten notebook experience. Think: bullet journal meets cozy coffee shop aesthetics. The goal is to make habit tracking feel intimate and encouraging, not corporate or sterile.

### Core Design Principles

1. **Warmth over sterility** - Cream paper, soft shadows, organic shapes
2. **Personal over digital** - Handwritten fonts, sketchy borders, imperfect alignment
3. **Encouraging over clinical** - Playful micro-interactions, friendly language, celebratory visuals
4. **Focused over cluttered** - Clean layouts with breathing room, notebook-inspired organization

### Out of Scope

- New backend features or API changes (all Chunks 1-5 functionality unchanged)
- Dark mode (defer to post-Phase V)
- Custom complex illustrations (only simple doodle-style icons/SVGs)
- 3D effects or heavy CSS animations that hurt performance
- Animation-heavy effects that degrade mobile experience
- Confetti or firework animations for streak milestones (deferred to post-Phase V; a simple inline text message is sufficient for this chunk)

### Assumptions

- Google Fonts (Caveat, Patrick Hand) will be loaded via `next/font/google` (self-hosted at build time, no CDN dependency)
- The existing TailwindCSS setup can be extended with custom theme tokens without major config changes
- SVG-based sketchy borders are achievable with reasonable file sizes using the `roughjs` / `roughnotation` library
- The existing component structure (TaskCard, HabitCard, Button, Input, Navbar, etc.) will be restyled in-place rather than replaced with entirely new components
- `prefers-reduced-motion` media query is sufficient for animation accessibility
- Inter font is already available or can be added alongside the handwritten fonts

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cozy Notebook First Impression (Priority: P1)

A new or returning user opens the application and immediately feels a warm, inviting notebook aesthetic instead of a generic web app. The cream paper background, handwritten headings, and soft shadows create an intimate journaling feel that encourages engagement.

**Why this priority**: First impressions determine whether users engage with the app or bounce. The notebook aesthetic is the core value proposition of this chunk and must land immediately on page load.

**Independent Test**: Can be fully tested by loading the dashboard page and visually confirming the notebook aesthetic is present (cream background, handwritten fonts on headings, soft card shadows). Delivers the "cozy welcome" feel.

**Acceptance Scenarios**:

1. **Given** a user loads the dashboard, **When** the page renders, **Then** the background is a warm cream color (not white or gray), headings use a handwritten font, and cards have soft drop shadows resembling paper lifted off a surface.
2. **Given** a user loads any page (tasks, habits, dashboard), **When** the page renders, **Then** the visual style is consistent with the notebook aesthetic (same color palette, same font families, same card styles).
3. **Given** a user is on a mobile device (<768px), **When** the page loads, **Then** the notebook aesthetic renders correctly with readable fonts and appropriately sized elements.

---

### User Story 2 - Readable Typography with Handwritten Charm (Priority: P1)

Users can read all content comfortably. Handwritten fonts are used for headings, labels, and buttons to create personality, while a clean sans-serif font is used for longer text (descriptions, timestamps) to maintain readability.

**Why this priority**: If handwritten fonts make the app hard to read, the entire design system fails. Typography readability is a non-negotiable foundation.

**Independent Test**: Can be tested by reading task descriptions, habit identity statements, form labels, and button text across all pages. All text must be legible at intended sizes on both mobile and desktop.

**Acceptance Scenarios**:

1. **Given** a task card with title and description, **When** the user reads it, **Then** the title uses a handwritten font (legible at 1.125rem+) and the description uses a clean sans-serif font (legible at 0.875rem+).
2. **Given** a form with labels and input fields, **When** the user interacts with it, **Then** labels use the handwritten font and placeholder/input text uses the sans-serif font for clarity.
3. **Given** any text on any page, **When** tested against WCAG AA contrast standards, **Then** all text/background combinations meet the minimum 4.5:1 contrast ratio.

---

### User Story 3 - Delightful Task & Habit Completion (Priority: P1)

When a user completes a task or habit, they see a satisfying visual animation (checkmark draws in, card highlights briefly) that makes the action feel rewarding and encourages continued use.

**Why this priority**: Completion animations directly implement the 4th Law (Make It Satisfying) from Atomic Habits. This is core to the product's behavior change mission.

**Independent Test**: Can be tested by clicking the complete button on a task card or habit checkbox. The checkmark animation and brief highlight should play smoothly without janky rendering.

**Acceptance Scenarios**:

1. **Given** an uncompleted task, **When** the user clicks "Complete", **Then** a checkmark animation draws in (stroke animation, ~0.3s) and the card background briefly flashes a mint/green highlight (~0.5s fade).
2. **Given** a habit completion checkbox, **When** the user clicks to complete, **Then** the checkbox visually transitions from empty to checked with a smooth ink-draw animation.
3. **Given** a user has `prefers-reduced-motion` enabled, **When** they complete a task or habit, **Then** animations are skipped and state changes happen instantly without motion.

---

### User Story 4 - Notebook-Styled Cards (Priority: P2)

Task cards look like sticky notes floating above the page background, and habit cards look like index cards with faint ruled lines. Both card types have hand-drawn-style borders that give them an organic, paper-like feel.

**Why this priority**: Cards are the primary UI surface users interact with. Transforming them from generic rectangles to notebook-style elements is the biggest visual impact after the base theme.

**Independent Test**: Can be tested by viewing the tasks list and habits list pages. Task cards should resemble sticky notes; habit cards should resemble index cards with distinctive visual treatments.

**Acceptance Scenarios**:

1. **Given** the tasks list page, **When** it displays task cards, **Then** each card has a slightly warm-tinted background, a subtle sketchy border, soft drop shadow, and generous padding.
2. **Given** the habits list page, **When** it displays habit cards, **Then** each card has a cream background with faint horizontal lines, a thicker sketchy border, and a colored top-edge accent line (resembling real index cards).
3. **Given** a desktop user hovering over a card, **When** the cursor enters the card area, **Then** the card lifts slightly (shadow grows) creating a "paper lifting off page" effect.

---

### User Story 5 - Notebook-Style Navigation (Priority: P2)

The navigation uses handwritten-style labels and visual cues that feel like notebook tabs or page markers, making the app feel like flipping through a personal journal rather than clicking through a web app.

**Why this priority**: Navigation is used on every page visit. Styling it consistently with the notebook theme ties the entire experience together.

**Independent Test**: Can be tested by navigating between dashboard, tasks, and habits pages. Navigation labels should use handwritten font, active page should be visually highlighted.

**Acceptance Scenarios**:

1. **Given** the top navigation bar, **When** it renders, **Then** navigation links use the handwritten font with an ink-style underline on hover.
2. **Given** the user is on the Tasks page, **When** the navigation renders, **Then** the Tasks link has a thicker underline and/or highlighted background indicating the active page.
3. **Given** a mobile user (<768px), **When** the bottom tab bar renders, **Then** tabs are styled as notebook page tabs with hand-drawn-style icons.

---

### User Story 6 - Notebook-Style Forms (Priority: P2)

Users creating or editing tasks and habits interact with forms that feel like writing in a notebook: inputs have underline-only borders (like writing on lined paper), labels use handwritten font, and focus states feel like pressing pen to paper.

**Why this priority**: Forms are critical interaction points for task/habit creation. Notebook-style forms reinforce the journaling metaphor during content creation.

**Independent Test**: Can be tested by navigating to the new task or new habit form and interacting with all input fields.

**Acceptance Scenarios**:

1. **Given** the create task form, **When** it renders, **Then** text inputs show only a bottom underline border (no box border), labels use handwritten font, and the overall form has a notebook-page feel.
2. **Given** an input field, **When** the user focuses it, **Then** the underline thickens and changes to a blue ink color, indicating the "pen is on the paper."
3. **Given** a form with validation errors, **When** errors display, **Then** they appear as friendly sticky-note-style messages with handwritten font, not as harsh red alert banners.

---

### User Story 7 - Friendly Empty & Loading States (Priority: P3)

When pages are loading or have no content, users see encouraging hand-drawn-style messages and doodles rather than blank screens or generic spinners.

**Why this priority**: Empty/loading states are less frequent but contribute to the overall polish and personality of the experience.

**Independent Test**: Can be tested by viewing a page with no tasks/habits (empty state) and by simulating slow network conditions (loading state).

**Acceptance Scenarios**:

1. **Given** a user with no tasks, **When** the tasks page loads, **Then** an encouraging message appears in handwritten font with a hand-drawn doodle illustration and a prominent CTA button to create their first task.
2. **Given** a page is loading data, **When** skeleton loading states display, **Then** they use the notebook aesthetic (cream-colored placeholder shapes instead of gray rectangles).
3. **Given** a user with no habits, **When** the habits page loads, **Then** an encouraging empty state appears with friendly copy like "Start your first habit!" and a hand-drawn notebook illustration.

---

### User Story 8 - Consistent Design Across All Pages (Priority: P3)

Every page in the application (dashboard, tasks list, task detail, task create/edit, habits list, habit detail, habit create/edit, login, register) uses the same notebook design tokens and component styles, creating a cohesive experience.

**Why this priority**: Consistency is what makes a design system feel professional rather than patchwork. Every page must participate in the notebook aesthetic.

**Independent Test**: Can be tested by navigating through every page in the application and visually confirming consistent use of colors, fonts, spacing, and component styles.

**Acceptance Scenarios**:

1. **Given** any two pages in the application, **When** compared side by side, **Then** they use the same color palette, font families, spacing scale, and component styles.
2. **Given** the login and register pages, **When** they render, **Then** they use the notebook aesthetic (cream background, handwritten headings, styled form inputs) consistent with the rest of the app.
3. **Given** toast notifications across any page, **When** they appear, **Then** they are styled as small sticky notes with sketchy borders and handwritten font, matching the notebook theme.

---

### Edge Cases

- What happens when handwritten fonts fail to load from Google Fonts? System falls back to a readable sans-serif stack (the sans-serif body font or system fonts).
- What happens when SVG sketchy borders don't render? Cards still display with standard CSS rounded borders as fallback.
- What happens on very slow connections where fonts load late? Content is readable with fallback fonts first, then fonts swap in without layout shift (using `font-display: swap`).
- What happens with very long identity statements or task titles? Text truncates gracefully with ellipsis; handwritten font doesn't break layout at any length.
- What happens with extremely small screens (<320px)? Layout remains single-column, fonts scale down proportionally, all content remains accessible.
- What happens when CSS animations are disabled by user preferences? All animations respect `prefers-reduced-motion: reduce` and states change instantly.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Design Tokens & Theme

- **FR-001**: System MUST define a notebook color palette as design tokens (CSS custom properties) including paper colors (cream, white, line, shadow), ink colors (dark, medium, light, red, blue, green), and highlight colors (yellow, pink, mint).
- **FR-002**: System MUST load handwritten fonts (Caveat for headings, Patrick Hand for labels/buttons) using `next/font/google`, which self-hosts fonts at build time — eliminating the Google Fonts CDN as a runtime dependency and preventing layout shift.
- **FR-003**: System MUST use a clean sans-serif font (Inter) for body text, descriptions, timestamps, and any text longer than a short label.
- **FR-004**: System MUST define a spacing scale based on 8px increments (4px, 8px, 16px, 24px, 32px, 48px) as design tokens.
- **FR-005**: System MUST extend the existing Tailwind configuration with the notebook theme colors, fonts, and spacing tokens.

#### Component Styling

- **FR-006**: Task cards MUST be styled as sticky notes with warm-tinted backgrounds, sketchy SVG borders, soft drop shadows, and generous padding.
- **FR-007**: Habit cards MUST be styled as index cards with cream backgrounds, faint horizontal ruled lines, thicker sketchy borders, and a colored top-edge accent line.
- **FR-008**: Buttons MUST use hand-drawn-style rounded rectangle borders with handwritten font text. Primary buttons use blue ink fill; secondary buttons use outlined style.
- **FR-009**: Form inputs MUST display only a bottom underline border (no box border) that thickens and turns blue on focus, resembling writing lines in a notebook.
- **FR-010**: Form labels MUST use the handwritten font positioned above the input field.
- **FR-011**: Textareas MUST have a full sketchy border with faint horizontal ruled lines visible inside.
- **FR-012**: Navigation MUST use handwritten font for labels with ink-underline hover effects and highlighted active states.

#### Animations & Micro-interactions

- **FR-013**: Task/habit completion MUST trigger a checkmark stroke-draw animation (~0.3s) and a brief card background highlight flash (~0.5s fade to mint/green).
- **FR-014**: Cards on desktop MUST lift slightly on hover (translateY -4px, shadow grows) to simulate paper lifting off the page.
- **FR-015**: Page content MUST appear with staggered fade-in animations on load (cards appear top-to-bottom with ~100ms delay between each).
- **FR-016**: All animations MUST be disabled when the user has `prefers-reduced-motion: reduce` enabled.
- **FR-029**: When a habit streak reaches a milestone (7, 21, or 30 days), the system MUST display a simple inline congratulatory text message in handwritten font (e.g., "Amazing — 7 day streak! 🔥") adjacent to the streak counter. No confetti or complex animation is required.

#### Layout & Responsiveness

- **FR-017**: Page backgrounds MUST use the cream paper color with optional subtle paper-grain texture (max 5% opacity, must not reduce text readability).
- **FR-018**: Content MUST be laid out in a responsive grid: 1 column on mobile (<768px), 2 columns on tablet (768px+), 3 columns on desktop (1024px+).
- **FR-019**: All interactive elements (buttons, checkboxes, links, form inputs) MUST maintain minimum 44x44px touch targets.
- **FR-020**: The maximum content width MUST be 1200px, centered on larger screens.

#### Loading, Empty, & Error States

- **FR-021**: Loading states MUST display notebook-themed skeleton placeholders (cream-colored shapes instead of gray rectangles).
- **FR-022**: Empty states MUST display an encouraging message in handwritten font with a friendly doodle illustration and a prominent call-to-action button.
- **FR-023**: Error/validation messages MUST appear as friendly sticky-note-style elements with handwritten font and a warm tone (not harsh red alert banners).
- **FR-024**: Toast notifications MUST be styled as small sticky notes with sketchy borders, using color-coded types (blue info, green success, yellow warning, red error).

#### Accessibility

- **FR-025**: All text/background color combinations MUST meet WCAG AA contrast ratio (minimum 4.5:1 for normal text, 3:1 for large text).
- **FR-026**: Focus indicators MUST be clearly visible on all interactive elements, using a sketchy border style that fits the notebook theme.
- **FR-027**: Keyboard navigation MUST work for all interactive elements (buttons, inputs, links, checkboxes) with logical tab order.
- **FR-028**: Sketchy SVG borders MUST be generated using the `roughjs` or `roughnotation` library (not raster images and not custom path generators) for consistent hand-drawn appearance, cross-browser reliability, and manageable bundle size.

### Key Entities

- **Design Token Set**: The complete collection of CSS custom properties (colors, fonts, spacing, shadows) that define the notebook visual language. Referenced by all components.
- **Sketchy Border Generator**: A utility that produces irregular SVG path data for hand-drawn-style borders, used across cards, buttons, and form elements.
- **Notebook Component Library**: The set of restyled React components (TaskCard, HabitCard, Button, Input, Toast, EmptyState, LoadingState, Navbar) that implement the design system.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users identify the app as having a "notebook" or "journal" aesthetic (not generic/corporate) within 3 seconds of first page load.
- **SC-002**: All body text is readable without squinting or zooming on mobile devices (16px base size minimum for body copy).
- **SC-003**: Task/habit completion triggers a visible, satisfying animation that completes in under 1 second total.
- **SC-004**: Every page in the application (minimum 10 distinct views: dashboard, tasks list, task detail, task create, task edit, habits list, habit detail, habit create, habit edit, login/register) uses the notebook design system consistently.
- **SC-005**: All interactive elements have minimum 44x44px touch targets, verified across all pages.
- **SC-006**: All text/background combinations pass WCAG AA contrast ratio (4.5:1 minimum).
- **SC-007**: Page load performance is not degraded by more than 500ms compared to current baseline (fonts, textures, and SVGs are optimized).
- **SC-008**: Animations are imperceptible when `prefers-reduced-motion: reduce` is enabled (no visible motion, state changes happen instantly).
- **SC-009**: The design system renders correctly on screens from 320px to 1920px wide without horizontal scrolling or broken layouts.
- **SC-010**: Empty states on tasks and habits pages display encouraging messages with notebook-themed illustrations rather than blank content areas.

---

## Clarifications

### Session 2026-02-13

- Q: What approach should be used to generate sketchy SVG borders? → A: Use `roughjs` / `roughnotation` library (battle-tested, natural variation, ~8–12kb gzipped).
- Q: How should Google Fonts (Caveat, Patrick Hand) be loaded? → A: Use `next/font/google` — self-hosted at build time, no CDN dependency, prevents layout shift.
- Q: Should streak milestone celebrations (7/21/30 days) be in scope for Chunk 6? → A: Minimal scope — simple inline congratulatory text message in handwritten font only; no confetti or complex animation (FR-029).

---

## Four Laws Mapping

This chunk primarily reinforces **Law 4: Make It Satisfying** and **Law 2: Make It Attractive**:

- **Law 2 (Attractive)**: The warm notebook aesthetic makes the app visually inviting, encouraging users to open it and engage with their habits. Identity statements displayed in beautiful handwritten typography reinforce the user's desired identity.
- **Law 4 (Satisfying)**: Completion animations (checkmark drawing, card highlight) provide immediate visual reward. Streak counters displayed in large handwritten numbers make progress feel personal and tangible. The overall aesthetic makes the experience of tracking habits feel like journaling rather than data entry.
