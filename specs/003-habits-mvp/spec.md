# Feature Specification: Phase 2 Chunk 3: Habits MVP

**Feature Branch**: `003-habits-mvp`  
**Created**: 2026-02-09  
**Status**: Draft  
**Input**: User description: "Write a comprehensive specification for Phase 2 Chunk 3: Habits MVP. This is Chunk 3 of 7-chunk Phase 2 delivery plan. Build habit management system with Atomic Habits Four Laws integration: Identity statement, 2-minute version, habit stacking cue, motivation, category, and recurring schedule."

## User Scenarios & Testing *(mandatory)*

...

## Clarifications

### Session 2026-02-09

- Q: Should habits include a status field to allow for "Archiving" or "Deactivating" without permanent deletion? → A: Include a `status` field (Active/Archived) to allow deactivation without deletion.
- Q: For weekly habits, should the user specify the exact days of the week or just a frequency count? → A: Exact days (e.g., select specific days of the week).
- Q: How strictly should the system enforce the "I am a person who..." prefix in identity statements? → A: UI Suggestion: Pre-fill the prefix in the input field but allow the user to modify or remove it.
- Q: Can a user only stack a new habit on an existing "Habit" entity, or can they enter custom anchor text? → A: Habit Only: Must select from an existing habit already in the database.
- Q: Should the system proactively warn the user if they are about to delete a habit that serves as an anchor for other habits? → A: Warn the user: Display a list of dependent habits that will lose their anchor link.

### User Story 1 - Create Identity-Driven Habit (Priority: P1)

As a user committed to personal growth, I want to create a new habit starting with an identity statement so that I focus on who I am becoming rather than just what I am doing.

**Why this priority**: Core philosophy of the system. Identity transformation is the primary driver of lasting behavior change.

**Independent Test**: Can be tested by navigating to the "New Habit" page, entering an identity statement starting with "I am a person who...", and successfully saving the habit.

**Acceptance Scenarios**:

1. **Given** I am on the "New Habit" form, **When** I enter "I am a person who exercises daily" and fill other required fields, **Then** the habit is saved and I am redirected to the habit list.
2. **Given** the habit creation form, **When** I leave the identity statement empty, **Then** the system prevents submission and displays a validation error.

---

### User Story 2 - Implement the 2-Minute Rule (Priority: P1)

As a user who wants to reduce friction, I want to define a "2-minute version" for every habit so that I can start small even on days when I lack motivation.

**Why this priority**: Implements Law 3: Make It Easy. Essential for overcoming the initial resistance to starting a new behavior.

**Independent Test**: Can be tested by ensuring the habit creation form requires a 2-minute version and displays it on the habit detail page.

**Acceptance Scenarios**:

1. **Given** I am creating a habit, **When** I provide a 2-minute version (e.g., "Put on running shoes"), **Then** it is successfully stored alongside my full habit description.
2. **Given** the habit creation form, **When** I leave the 2-minute version field empty, **Then** the system prevents submission (it is a mandatory field).

---

### User Story 3 - Habit Stacking (Priority: P2)

As a user looking for triggers, I want to link my new habit to an existing one using a stacking cue so that I have a clear prompt for when to perform the action.

**Why this priority**: Implements Law 1: Make It Obvious. Linking new habits to existing ones creates a structural cue for the brain.

**Independent Test**: Can be tested by selecting an existing habit from a dropdown as an "anchor" and saving the new habit with the generated cue.

**Acceptance Scenarios**:

1. **Given** I have existing habits, **When** I create a new habit and select an existing habit as an anchor, **Then** the system records the stacking cue and links it to that habit entity.
2. **Given** I have no existing habits, **When** I am on the habit stacking field, **Then** the system indicates that no anchor habits are available to stack upon.

---

### User Story 4 - Categorized Habit List (Priority: P2)

As a user with multiple areas of improvement, I want to view my habits organized by category so that I can track my progress across different life domains.

**Why this priority**: Improves usability and provides a clearer overview of the user's personal growth system.

**Independent Test**: Can be tested by creating habits in different categories (Health, Productivity) and verifying they are grouped/labeled correctly on the habits list page.

**Acceptance Scenarios**:

1. **Given** I have several habits, **When** I view the habit list page, **Then** habits are displayed with their assigned categories prominently shown.
2. **Given** the habit list, **When** I filter by a specific category (e.g., "Health & Fitness"), **Then** only habits in that category are displayed.

---

## Edge Cases

- **Duplicate Identity Statements**: What happens if a user tries to create two habits with the identical identity statement? (Expectation: Allow it, but perhaps warn the user that they already have a similar focus).
- **Circular Stacking**: What happens if Habit A is stacked on Habit B, and the user tries to edit Habit B to stack it on Habit A? (Expectation: Prevent circular dependencies or handle them gracefully as a chain).
- **Deep Nesting**: What happens to a stack if the "anchor" habit is deleted? (Expectation: The system MUST warn the user about dependent habits before deletion; if confirmed, the stacking cue for dependent habits remains as text but the link to the anchor entity is removed).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow users to create, read, update, and delete (CRUD) habits.
- **FR-002**: The system MUST require an "Identity Statement" for every habit; the UI SHOULD pre-fill/suggest the "I am a person who..." prefix to guide the user.
- **FR-003**: The system MUST require a "2-Minute Version" for every habit to implement the "Make It Easy" principle.
- **FR-004**: The system MUST support "Habit Stacking" cues, allowing users to link a new habit to an existing anchor habit entity from the database.
- **FR-005**: The system MUST allow users to assign habits to predefined categories (Health, Productivity, etc.) or a custom "Other" category.
- **FR-006**: The system MUST support flexible recurring schedules (daily, weekly with specific days, monthly) stored as structured data.
- **FR-007**: The system MUST emit events (`HABIT_CREATED`, `HABIT_UPDATED`, `HABIT_DELETED`) for all CRUD operations.
- **FR-008**: The system MUST isolate habits by user; users MUST NOT be able to access or modify habits belonging to others.
- **FR-009**: The system MUST support archiving habits via a `status` field (Active/Archived) to preserve historical data.

### Key Entities

- **Habit**: The central entity representing a recurring behavior and identity focus.
  - Attributes: `identity_statement`, `full_description`, `two_minute_version`, `habit_stacking_cue`, `motivation`, `category`, `recurring_schedule`, `status` (Active/Archived).
- **Category**: A label used to group habits (e.g., Health & Fitness, Mindfulness).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully create a habit with all required Atomic Habits fields (Identity, 2-Min Version) in under 60 seconds.
- **SC-002**: 100% of habits in the database have a non-empty identity statement and 2-minute version.
- **SC-003**: The habit list page loads and renders categorized habits in under 500ms for a user with up to 20 habits.
- **SC-004**: All habit CRUD operations trigger the corresponding event on the event bus with the correct schema.

### Atomic Habits Mapping

| Principle | Feature Implementation |
|-----------|------------------------|
| **Law 1: Make It Obvious** | Habit Stacking Cue (Anchoring to existing behaviors) |
| **Law 2: Make It Attractive** | Motivation field & Identity Statements |
| **Law 3: Make It Easy** | Mandatory 2-Minute Version |
| **Law 4: Make It Satisfying** | *Deferred to Chunk 4 (Streaks & Completion)* |

## Assumptions & Dependencies

- **User Context**: Assumes a user is authenticated and their ID is available for scoping data.
- **Persistence**: Assumes a relational database is available to store the habit data and schedule JSON.
- **Event Bus**: Assumes an internal event emitter is implemented to handle habit lifecycle events.