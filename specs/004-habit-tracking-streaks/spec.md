# Feature Specification: Habit Tracking & Streaks

**Feature Branch**: `004-habit-tracking-streaks`
**Created**: 2026-02-12
**Status**: Implemented
**Input**: User description: "Phase 2 Chunk 4: Habit Tracking & Streaks - Build habit completion tracking, streak calculation, never miss twice rule, and immediate feedback implementing the 4th Law of Atomic Habits (Make It Satisfying)"

## Context

This is Chunk 4 of the 7-chunk Phase 2 delivery plan. Chunks 1 (Core Infrastructure), 2 (Tasks), and 3 (Habits CRUD) are complete. This chunk adds the tracking and accountability layer that makes habit formation rewarding and sustainable, directly implementing the 4th Law of Atomic Habits: **Make It Satisfying**.

## User Scenarios & Testing

### User Story 1 - Mark Habit as Complete with Immediate Feedback (Priority: P1)

Users need instant positive reinforcement when completing a habit to build the satisfaction association that drives long-term behavior change. When a user marks a habit complete, they should experience immediate visual and auditory feedback that makes the action feel rewarding.

**Why this priority**: This is the core value proposition of the 4th Law of Atomic Habits. Without immediate satisfaction, users lose motivation. This is the foundation all other features build upon.

**Independent Test**: Can be fully tested by creating a habit, marking it complete, and observing the immediate feedback (sound + animation). Delivers immediate value by making habit completion feel rewarding.

**Acceptance Scenarios**:

1. **Given** a user has an active habit, **When** they tap the checkbox to mark it complete, **Then** a pleasant sound effect plays immediately and a green checkmark animation appears
2. **Given** a user marks a habit complete, **When** the action is recorded, **Then** the habit is marked as completed for today
3. **Given** a user has already completed a habit today, **When** they try to mark it complete again, **Then** the system confirms it's already completed without creating duplicate entries
4. **Given** a user completes a habit on a mobile device, **When** they tap the checkbox, **Then** the tap target is large enough (minimum 44×44 pixels) for easy thumb interaction

---

### User Story 2 - Choose Full or Two-Minute Completion (Priority: P1)

Users need flexibility to log either full habit completion or the simplified two-minute version, supporting the habit-building strategy where any completion (even minimal) is better than breaking the chain.

**Why this priority**: Supports the "never miss twice" philosophy by making it easy to maintain momentum even on difficult days. Critical for long-term habit sustainability.

**Independent Test**: Can be tested by marking a habit complete and choosing between "Full habit" or "2-minute version". Delivers value by reducing friction on low-motivation days.

**Acceptance Scenarios**:

1. **Given** a user is marking a habit complete, **When** they select the completion option, **Then** they can choose between "Full habit" and "2-minute version"
2. **Given** a user selects a completion type, **When** the completion is recorded, **Then** the system tracks which type was chosen for later analytics
3. **Given** a user is on a mobile device, **When** they choose completion type, **Then** the selection buttons are thumb-friendly (large touch targets, not tiny radio buttons)

---

### User Story 3 - View Current Streak Counter (Priority: P1)

Users need to see their current streak prominently displayed to visualize their progress and feel motivated to maintain momentum. The streak counter serves as both a progress indicator and a motivational tool.

**Why this priority**: Visible progress is a core component of making habits satisfying. Streak visualization turns abstract consistency into concrete achievement.

**Independent Test**: Can be tested by completing a habit on consecutive days and watching the streak counter increment. Delivers immediate value by visualizing progress.

**Acceptance Scenarios**:

1. **Given** a user has completed a habit on consecutive days, **When** they view their habit list, **Then** a streak counter shows next to the habit (e.g., "🔥 5 days")
2. **Given** a user completes a habit today, **When** the completion is recorded, **Then** the streak counter updates in real-time without requiring a page refresh
3. **Given** a user has not started a habit yet, **When** they view the habit, **Then** the streak shows as 0
4. **Given** a user completes a habit after a gap of 2+ days, **When** the completion is recorded, **Then** the streak resets to 1 (new streak begins)
5. **Given** a user is viewing the habit list, **When** the page loads, **Then** the streak counter is visible without scrolling

---

### User Story 4 - Hear Satisfying Sound Effect on Completion (Priority: P2)

Users experience enhanced satisfaction through pleasant auditory feedback that reinforces the completion behavior, making the action memorable and rewarding.

**Why this priority**: Sound amplifies the satisfaction response but is not essential for core functionality. Enhances user experience but system works without it.

**Independent Test**: Can be tested by completing a habit with sound enabled and verifying the sound plays. Delivers enhanced emotional satisfaction.

**Acceptance Scenarios**:

1. **Given** a user marks a habit complete, **When** they tap the checkbox, **Then** a soft, pleasant sound effect (sparkle/chime) plays immediately
2. **Given** a user is on a mobile device, **When** the sound effect plays, **Then** it works reliably across mobile browsers
3. **Given** the sound effect fails to load, **When** a user completes a habit, **Then** the visual feedback still appears and the completion is recorded successfully (graceful degradation)
4. **Given** a sound effect plays, **When** heard by the user, **Then** the volume is pleasant (not jarring or too loud)

---

### User Story 5 - Receive Notification After First Miss (Priority: P2)

Users receive a gentle reminder after missing a scheduled habit once, providing accountability without penalty. This implements the "never miss twice" principle by catching lapses early.

**Why this priority**: Early intervention prevents streak breaks. Not P1 because basic completion tracking works without notifications, but critical for long-term success.

**Independent Test**: Can be tested by missing a habit for one day and verifying the notification appears. Delivers value through accountability.

**Acceptance Scenarios**:

1. **Given** a user has a daily habit they completed yesterday, **When** they miss completing it today, **Then** they receive a notification the next day saying "Get back on track today! You missed [Habit Name] yesterday"
2. **Given** a user receives a missed habit notification, **When** they view it, **Then** the notification is non-intrusive (banner or toast, not blocking modal)
3. **Given** a user completes the missed habit, **When** the completion is recorded, **Then** the miss counter resets to 0
4. **Given** a user has multiple missed habits, **When** notifications are sent, **Then** each habit sends one notification (not multiple alerts per habit)

---

### User Story 6 - Streak Resets After Two Consecutive Misses (Priority: P2)

Users' streaks automatically reset after missing a habit twice in a row, implementing accountability while making it clear they can start fresh immediately. This prevents the "what the hell" effect where one break leads to complete abandonment.

**Why this priority**: Enforces the "never miss twice" rule which is critical for long-term habit sustainability. Not P1 because streak tracking works without this, but essential for the methodology.

**Independent Test**: Can be tested by missing a habit twice and verifying the streak resets and notification appears. Delivers value through structured accountability.

**Acceptance Scenarios**:

1. **Given** a user has missed a habit once (consecutive_misses = 1), **When** they miss it a second consecutive day, **Then** their streak resets to 0
2. **Given** a user's streak resets due to two consecutive misses, **When** the reset occurs, **Then** they receive a notification: "Your streak has reset to 0 for [Habit Name]. Start fresh today!"
3. **Given** a user's streak has reset, **When** they complete the habit again, **Then** a new streak begins at 1
4. **Given** a user was offline for a week, **When** the system detects multiple missed days, **Then** the streak resets immediately and only one notification is sent (not multiple)

---

### User Story 7 - View Completion History (Priority: P3)

Users can review their past completions to reflect on their progress, identify patterns, and feel accomplished by seeing their consistency over time.

**Why this priority**: Nice-to-have for reflection and analysis but not essential for daily habit tracking. Core functionality works without historical view.

**Independent Test**: Can be tested by completing habits over several days and viewing the history page. Delivers value through progress visualization.

**Acceptance Scenarios**:

1. **Given** a user has completed a habit multiple times, **When** they view the habit detail page, **Then** they see a list or calendar view of past completions
2. **Given** a user views their completion history, **When** the history loads, **Then** completions show the date and completion type (full or two-minute)
3. **Given** a user wants to see completions for a date range, **When** they filter the history, **Then** they can specify start and end dates

---

### User Story 8 - Undo Accidental Completion (Priority: P3)

Users can remove an accidental completion if they marked a habit complete by mistake, maintaining data accuracy.

**Why this priority**: Rare edge case. Most users won't need this frequently. Core functionality works fine without undo capability.

**Independent Test**: Can be tested by marking a habit complete and then removing the completion. Delivers value by correcting mistakes.

**Acceptance Scenarios**:

1. **Given** a user has marked a habit complete by accident, **When** they select "undo completion", **Then** the completion is removed
2. **Given** a completion is removed, **When** the system recalculates the streak, **Then** the streak is recalculated based on remaining completions
3. **Given** a user undoes a completion that affects their streak, **When** the undo occurs, **Then** the streak counter updates to reflect the new calculation

---

### Edge Cases

- **What happens when a user completes a habit at 11:59 PM and again at 12:01 AM?**
  These are two different days by UTC day boundaries. Both completions are valid, and the streak increments by 1 (not 2). Only one completion per day is recorded.

- **What happens when a user travels across timezones?**
  All completion timestamps are stored in UTC. Completions are accepted based on UTC day boundaries to ensure consistency. The user's local timezone is used for display purposes only.

- **What happens when a user undoes a completion that affects their streak?**
  The streak is recalculated from scratch based on the remaining completion history. If this creates complexity, the system may restrict undo functionality or clearly communicate that streak recalculation will occur.

- **What happens when a habit has a weekly recurring schedule (e.g., "3 times per week") and the user misses a day?**
  In this MVP, the "never miss twice" logic applies only to daily habits. Weekly and monthly habits use simplified logic, with advanced miss detection deferred to post-Phase V.

- **What happens when the sound effect fails to load or play?**
  The system fails silently (doesn't block the completion), shows visual feedback only, and logs the error for debugging. The user's habit completion is always recorded successfully.

- **What happens when the background job detects multiple missed days at once (e.g., user was offline for a week)?**
  This is treated as 2+ consecutive misses: streak resets immediately, and one notification is sent (not multiple notifications per missed day).

- **What happens when a user marks the same habit complete twice within the same day?**
  The system returns success but does not create a duplicate entry. Only one completion per habit per day is allowed. The streak does not double-count.

- **What happens when a user completes yesterday's habit then misses today's habit?**
  If yesterday's habit was completed successfully, missing today does NOT immediately break the streak—the first miss triggers a notification. The streak only resets after the SECOND consecutive miss.

## Requirements

### Functional Requirements

- **FR-001**: System MUST allow users to mark a habit as complete for the current day with a single tap/click
- **FR-002**: System MUST provide immediate visual feedback (animated green checkmark) when a habit is marked complete
- **FR-003**: System MUST provide immediate auditory feedback (pleasant sound effect) when a habit is marked complete
- **FR-004**: System MUST allow users to choose between "Full habit" or "2-minute version" completion types
- **FR-005**: System MUST prevent duplicate completions for the same habit on the same day (one completion per habit per day)
- **FR-006**: System MUST calculate and display the current streak for each habit
- **FR-007**: System MUST increment the streak when a habit is completed on consecutive days
- **FR-008**: System MUST reset the streak to 1 when a habit is completed after a gap of 2+ days
- **FR-009**: System MUST track consecutive misses for each habit
- **FR-010**: System MUST send a notification after the first missed day for a scheduled habit
- **FR-011**: System MUST reset the streak to 0 after two consecutive missed days
- **FR-012**: System MUST send a notification when a streak resets due to consecutive misses
- **FR-013**: System MUST reset the consecutive miss counter to 0 when a habit is completed
- **FR-014**: System MUST display completion history for each habit
- **FR-015**: System MUST allow users to filter completion history by date range
- **FR-016**: System MUST allow users to undo an accidental completion
- **FR-017**: System MUST recalculate streaks when a completion is removed
- **FR-018**: System MUST store all completion timestamps in UTC for consistency
- **FR-019**: System MUST display dates and times in the user's local timezone
- **FR-020**: System MUST ensure checkbox/tap targets are minimum 44×44 pixels for mobile accessibility
- **FR-021**: System MUST gracefully handle sound loading failures without blocking completion
- **FR-022**: System MUST run automated checks for missed habits daily
- **FR-023**: System MUST emit events for habit completion, streak reset, and miss detection
- **FR-024**: System MUST ensure smooth animations (60fps target) on mobile devices
- **FR-025**: System MUST make the streak counter prominently visible without scrolling

### Key Entities

- **Habit Completion**: Records when a user completed a habit, including the completion timestamp and type (full or two-minute version). One completion allowed per habit per day.

- **Streak Data**: Tracks the current consecutive completion streak for each habit, the last completion timestamp, and the count of consecutive misses. Used to calculate progress and trigger notifications.

- **Notification**: Alerts sent to users when they miss a scheduled habit (first miss) or when their streak resets (second consecutive miss). Non-intrusive banner or toast format.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can mark a habit complete with a single tap, receiving immediate feedback in under 500 milliseconds
- **SC-002**: Streak counters update in real-time when a habit is completed, visible to the user without page refresh
- **SC-003**: Sound effects play successfully on 95% of habit completions (accounting for device limitations and graceful degradation)
- **SC-004**: Notification delivery rate of 99%+ for missed habits detected by the system
- **SC-005**: Streak calculation accuracy of 100% (no false resets or incorrect increments)
- **SC-006**: Users can view their completion history within 2 seconds of navigating to the habit detail page
- **SC-007**: Zero duplicate completions recorded for the same habit on the same day
- **SC-008**: Mobile animations maintain 60fps performance across devices
- **SC-009**: Undo functionality successfully recalculates streaks with 100% accuracy
- **SC-010**: All completion, streak reset, and miss detection events are emitted with correct schema and timing

## Out of Scope

The following features are explicitly excluded from this chunk:

- Habit generating daily task instances (deferred to Chunk 5)
- Email/SMS/push notifications (in-app banners only in this chunk)
- Heatmap calendar visualization (deferred to Post-Phase V)
- Milestone celebrations for 21, 66, 100+ day streaks (deferred to Post-Phase V)
- Compound growth visualization (deferred to Post-Phase V)
- Streak recovery or grace periods (deferred to Post-Phase V)
- Advanced weekly/monthly habit miss logic (simplified to daily-only in MVP)
- Confetti animations for milestone streaks (deferred to Post-Phase V if too complex)

## Assumptions

- Users are motivated by visible progress and will engage more when streaks are displayed prominently
- A "never miss twice" rule is more effective than allowing unlimited misses before reset
- Immediate auditory + visual feedback significantly enhances the satisfaction response
- Tracking completion type (full vs two-minute) provides valuable data for future analytics
- Users prefer non-intrusive notifications (banners) over blocking modals
- UTC storage with local timezone display is sufficient for global users
- One completion per day per habit is the correct granularity (no multiple completions per day)
- Daily background checks or on-login checks are sufficient for miss detection (real-time not required)
- Sound effects failing gracefully is acceptable (don't block completion)
- The 4th Law of Atomic Habits (Make It Satisfying) is scientifically validated for behavior change

## Dependencies

- Habit CRUD functionality from Chunk 3 (habits must exist before they can be tracked)
- User authentication system from Chunk 1 (completions tied to user accounts)
- Event emission infrastructure from Chunk 1 (for HABIT_COMPLETED, HABIT_STREAK_RESET, HABIT_MISS_DETECTED events)
- Notification delivery system (in-app banner component)
- Timezone handling utilities for UTC storage and local display

## Constitution Alignment

This feature directly implements:

- **4th Law of Atomic Habits: Make It Satisfying** - The entire chunk is designed around this principle through immediate feedback, visible progress, and accountability
- **Event-driven architecture** - All major actions emit events (HABIT_COMPLETED, HABIT_STREAK_RESET, HABIT_MISS_DETECTED)
- **Mobile-first responsive design** - Touch-friendly checkboxes, smooth animations, visible streak counters
- **Test specs, not implementation** - Requirements focus on observable behavior, not technical details
- **No hardcoded configuration** - Sound file paths, notification messages, and thresholds are configurable
