# Research: Habit Tracking & Streaks

**Feature**: 004-habit-tracking-streaks
**Date**: 2026-02-12
**Researcher**: Claude Code (Planning Phase)

## Executive Summary

This document consolidates research findings for implementing habit completion tracking, streak calculation, "never miss twice" logic, and immediate feedback (sound + animations). All research questions from [plan.md](./plan.md) have been resolved with concrete recommendations.

**Key Decisions**:
- **Streak Algorithm**: O(n) linear scan with day delta comparison
- **Sound Effects**: Web Audio API with HTML5 `<audio>` fallback
- **Background Jobs**: APScheduler (in-process) for Phase 2, scalable to Celery/Dapr later
- **Notifications**: Database polling with React Query for Phase 2
- **Timezones**: PostgreSQL TIMESTAMPTZ (UTC storage) + date-fns (local display)

## 1. Streak Calculation Algorithm

### Question
What's the most efficient algorithm for calculating consecutive-day streaks given a set of completion timestamps?

### Research Findings

**Algorithm Comparison**:

| Approach | Complexity | Pros | Cons |
|----------|------------|------|------|
| Sort + Linear Scan | O(n log n) | Simple, works in-memory | Requires sorting full history |
| Database Window Functions | O(n) | Leverages database, efficient | Complex SQL, database-dependent |
| Hash Set (Dates) | O(n) | Fast lookups | Requires loading all dates |

**Recommended Algorithm**: **Sort + Linear Scan**

### Rationale
- **Simplicity**: Easy to implement and test in Python/TypeScript
- **Performance**: For 100 completions, O(n log n) is negligible (<1ms)
- **Portability**: Works in backend (streak calculation) and frontend (validation)
- **Testability**: Pure function with no database dependency

### Implementation Pseudocode

```python
def calculate_streak(completions: List[HabitCompletion], today: date) -> int:
    """
    Calculate current streak from list of completions.

    Logic:
    - Sort completions by completed_at DESC (newest first)
    - Start from most recent completion
    - Count consecutive days backward
    - Stop when gap > 1 day found

    Time Complexity: O(n log n) due to sort
    Space Complexity: O(n) for sorted list
    """
    if not completions:
        return 0

    # Sort by completion date (newest first)
    sorted_completions = sorted(completions, key=lambda c: c.completed_at, reverse=True)

    # Get most recent completion date
    current_date = sorted_completions[0].completed_at.date()

    # If most recent is not today or yesterday, streak is 0
    if (today - current_date).days > 1:
        return 0

    streak = 1

    for i in range(1, len(sorted_completions)):
        prev_date = sorted_completions[i].completed_at.date()
        day_gap = (current_date - prev_date).days

        if day_gap == 1:
            # Consecutive day
            streak += 1
            current_date = prev_date
        elif day_gap == 0:
            # Same day (duplicate, should be prevented by unique constraint)
            continue
        else:
            # Gap > 1 day, streak broken
            break

    return streak
```

**Alternative Considered: Database Window Functions**

```sql
WITH daily_completions AS (
    SELECT
        habit_id,
        DATE(completed_at) as completion_date,
        ROW_NUMBER() OVER (PARTITION BY habit_id ORDER BY DATE(completed_at)) as rn
    FROM habit_completions
    WHERE habit_id = :habit_id
),
streak_groups AS (
    SELECT
        habit_id,
        completion_date,
        completion_date - (rn * INTERVAL '1 day') as streak_group
    FROM daily_completions
)
SELECT
    COUNT(*) as streak
FROM streak_groups
WHERE streak_group = (SELECT streak_group FROM streak_groups ORDER BY completion_date DESC LIMIT 1);
```

**Why Rejected**: More complex, harder to test, database-specific. Phase 2 prioritizes simplicity.

### Performance Analysis

For typical user (100 habits × 30 day history = 3000 completions):
- Sort: 3000 log(3000) ≈ 30,000 operations
- Scan: 30 comparisons (one month streak)
- **Total: <1ms on modern hardware**

### References
- [Leetcode: Longest Consecutive Sequence](https://leetcode.com/problems/longest-consecutive-sequence/)
- PostgreSQL Window Functions: https://www.postgresql.org/docs/current/tutorial-window.html

---

## 2. Web Audio API Best Practices

### Question
How to reliably play sound effects across desktop and mobile browsers?

### Research Findings

**Technology Comparison**:

| Technology | Desktop Support | Mobile Support | Latency | Complexity |
|-----------|----------------|----------------|---------|------------|
| Web Audio API | Excellent | Good (requires gesture) | <50ms | Medium |
| HTML5 `<audio>` | Excellent | Good (requires gesture) | 100-200ms | Low |
| Howler.js Library | Excellent | Good | <50ms | Low (abstraction) |

**Recommended Approach**: **Web Audio API with HTML5 `<audio>` Fallback**

### Rationale
- **Low Latency**: Web Audio API provides <50ms playback start
- **Reliability**: HTML5 `<audio>` works everywhere as fallback
- **Mobile Compatible**: Both respect user gesture requirements
- **No Dependencies**: No third-party libraries (Howler.js deferred to post-Phase V)

### Implementation Strategy

```typescript
// apps/web/src/lib/sound-player.ts

class SoundPlayer {
  private audioContext: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private fallbackAudio: HTMLAudioElement | null = null;

  async init(soundUrl: string): Promise<void> {
    try {
      // Try Web Audio API first
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const response = await fetch(soundUrl);
      const arrayBuffer = await response.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      // Fallback to HTML5 audio
      console.warn('Web Audio API failed, using HTML5 audio fallback', error);
      this.fallbackAudio = new Audio(soundUrl);
      this.fallbackAudio.volume = 0.5; // 50% volume
    }
  }

  async play(): Promise<void> {
    try {
      if (this.audioContext && this.audioBuffer) {
        // Web Audio API path
        const source = this.audioContext.createBufferSource();
        source.buffer = this.audioBuffer;

        // Apply volume (50%)
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0.5;

        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        source.start(0);
      } else if (this.fallbackAudio) {
        // HTML5 audio fallback
        this.fallbackAudio.currentTime = 0; // Reset to start
        await this.fallbackAudio.play();
      }
    } catch (error) {
      // Graceful degradation: fail silently
      console.error('Sound playback failed:', error);
    }
  }
}

export const sparkleSound = new SoundPlayer();

// Initialize on app load (after user gesture)
export async function initSounds() {
  await sparkleSound.init('/sounds/sparkle.mp3');
}
```

### Mobile Considerations

**User Gesture Requirement**:
- iOS Safari and Chrome require user interaction before playing sounds
- Solution: Initialize audio context on first button click/tap
- Implementation: Call `initSounds()` when user opens habits page

```tsx
// apps/web/src/components/habits/HabitList.tsx

useEffect(() => {
  // Initialize sounds on component mount (user has navigated to page = gesture)
  initSounds().catch(console.error);
}, []);
```

**Autoplay Policies**:
- Chrome Desktop: No restrictions for short sounds after gesture
- Chrome Mobile: Requires gesture, respects volume settings
- Safari iOS: Requires gesture, may mute if silent mode enabled

**Testing**:
- Test on iOS Safari, Chrome Android, Desktop browsers
- Verify sound plays after first tap (not before)
- Verify graceful degradation if sound fails

### Sound File Requirements

**Format**: MP3 (universal support)
**Duration**: <1 second
**File Size**: <50KB
**Sample Rate**: 44.1kHz
**Bit Rate**: 128kbps

**Recommendation**: Use sparkle.mp3 or chime.mp3 from free sound libraries (e.g., Freesound.org with CC0 license)

### References
- [MDN: Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Google: Autoplay Policy](https://developer.chrome.com/blog/autoplay/)
- [Apple: iOS Sound Best Practices](https://developer.apple.com/documentation/webkit/delivering_video_content_for_safari)

---

## 3. Background Job Implementation

### Question
What's the best pattern for daily miss detection in FastAPI?

### Research Findings

**Option Comparison**:

| Approach | Complexity | Scalability | Phase 2 Fit | Phase V Upgrade Path |
|----------|------------|-------------|-------------|---------------------|
| System Cron | Low | Limited | Good | Replace with Dapr |
| APScheduler (in-process) | Low | Medium | **Best** | Replace with Celery/Dapr |
| Celery (external worker) | High | High | Overkill | Already production-ready |
| Dapr Bindings | Medium | High | N/A (Phase V) | Native |

**Recommended Approach**: **APScheduler (In-Process)**

### Rationale
- **Simplicity**: Single-process, no external dependencies
- **Phase 2 Fit**: Render's single-instance deployment supports this
- **Upgrade Path**: Easy migration to Celery (Phase V) or Dapr (Phase V+)
- **Testing**: Can be tested without external job queue

### Implementation

```python
# apps/api/src/services/miss_detector.py

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime, timedelta
from sqlmodel import Session, select
from src.models.habit import Habit
from src.models.habit_completion import HabitCompletion
from src.events.habit_events import emit_habit_miss_detected, emit_habit_streak_reset

scheduler = BackgroundScheduler()

def detect_missed_habits():
    """
    Daily job to detect missed habits and update consecutive_misses.

    Logic:
    1. For each active habit (not deleted)
    2. Check if yesterday was a scheduled day (based on recurring_schedule)
    3. If yes and no completion exists for yesterday:
       - Increment consecutive_misses
       - If consecutive_misses == 1: Emit HABIT_MISS_DETECTED
       - If consecutive_misses >= 2: Reset streak, emit HABIT_STREAK_RESET
    4. If habit was completed today: Reset consecutive_misses to 0
    """
    with Session(engine) as session:
        # Get all active habits
        habits = session.exec(select(Habit).where(Habit.deleted == False)).all()

        yesterday = (datetime.utcnow() - timedelta(days=1)).date()
        today = datetime.utcnow().date()

        for habit in habits:
            # Check if yesterday was a scheduled day
            if not is_scheduled_day(habit.recurring_schedule, yesterday):
                continue

            # Check if completion exists for yesterday
            completion_yesterday = session.exec(
                select(HabitCompletion)
                .where(HabitCompletion.habit_id == habit.id)
                .where(HabitCompletion.completed_at >= yesterday)
                .where(HabitCompletion.completed_at < today)
            ).first()

            if completion_yesterday:
                # Habit was completed yesterday, reset consecutive_misses
                habit.consecutive_misses = 0
                session.add(habit)
                continue

            # Habit was missed yesterday
            habit.consecutive_misses += 1

            if habit.consecutive_misses == 1:
                # First miss: send notification
                emit_habit_miss_detected(habit.user_id, habit.id, habit.consecutive_misses)
            elif habit.consecutive_misses >= 2:
                # Second consecutive miss: reset streak
                previous_streak = habit.current_streak
                habit.current_streak = 0
                habit.consecutive_misses = 0  # Reset after streak reset
                emit_habit_streak_reset(habit.user_id, habit.id, previous_streak)

            session.add(habit)

        session.commit()

# Schedule daily at 00:01 UTC
scheduler.add_job(
    detect_missed_habits,
    trigger=CronTrigger(hour=0, minute=1, timezone='UTC'),
    id='detect_missed_habits',
    replace_existing=True
)

def start_scheduler():
    """Start the scheduler when FastAPI app starts."""
    scheduler.start()

def shutdown_scheduler():
    """Shutdown the scheduler when FastAPI app stops."""
    scheduler.shutdown()
```

### Integration with FastAPI

```python
# apps/api/src/main.py

from fastapi import FastAPI
from src.services.miss_detector import start_scheduler, shutdown_scheduler

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    start_scheduler()

@app.on_event("shutdown")
async def shutdown_event():
    shutdown_scheduler()
```

### Testing Strategy

```python
# apps/api/tests/unit/test_miss_detector.py

def test_detect_missed_habits_first_miss(session, sample_habit):
    """Test that first miss increments consecutive_misses and emits event."""
    # Given: habit with no completions yesterday
    # When: detect_missed_habits() runs
    # Then: consecutive_misses = 1, HABIT_MISS_DETECTED emitted

def test_detect_missed_habits_second_miss(session, sample_habit):
    """Test that second consecutive miss resets streak and emits event."""
    # Given: habit with consecutive_misses = 1
    # When: detect_missed_habits() runs
    # Then: current_streak = 0, consecutive_misses = 0, HABIT_STREAK_RESET emitted

def test_detect_missed_habits_completion_resets_counter(session, sample_habit):
    """Test that completion after miss resets consecutive_misses."""
    # Given: habit with consecutive_misses = 1, completed today
    # When: detect_missed_habits() runs
    # Then: consecutive_misses = 0
```

### Phase V Upgrade Path

**Migration to Celery** (when needed):
1. Install Celery: `pip install celery[redis]`
2. Create Celery app: `celery_app = Celery('tasks', broker='redis://localhost:6379/0')`
3. Convert function to task: `@celery_app.task def detect_missed_habits(): ...`
4. Replace APScheduler with Celery Beat for scheduling
5. Deploy separate worker process

**Migration to Dapr** (Phase V+):
1. Use Dapr Cron Binding: `dapr run --app-id habits-api --components-path ./dapr-components`
2. Define cron binding in `dapr-components/cron.yaml`
3. Expose HTTP endpoint for Dapr to call
4. No code changes to business logic

### References
- [APScheduler Documentation](https://apscheduler.readthedocs.io/en/stable/)
- [FastAPI Background Tasks](https://fastapi.tiangolo.com/tutorial/background-tasks/)
- [Celery Documentation](https://docs.celeryproject.org/)

---

## 4. Notification System

### Question
How to implement in-app banner notifications without email/SMS?

### Research Findings

**Architecture Options**:

| Approach | Real-time | Complexity | Phase 2 Fit | Infrastructure |
|----------|-----------|------------|-------------|----------------|
| Database Polling (React Query) | No (30s delay) | Low | **Best** | None |
| Server-Sent Events (SSE) | Yes | Medium | Good | HTTP/2 required |
| WebSockets | Yes | High | Overkill | Separate WS server |
| Push API (Service Workers) | Yes | High | Out of scope | Push service required |

**Recommended Approach**: **Database Polling with React Query**

### Rationale
- **Simplicity**: No additional infrastructure (uses existing API)
- **Reliability**: Polling is fault-tolerant (no connection drops)
- **Phase 2 Fit**: 30-second delay acceptable for non-critical notifications
- **Upgrade Path**: Easy switch to SSE/WebSockets in Phase V

### Implementation

**Backend: Notifications API**

```python
# apps/api/src/routes/notifications.py

from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from src.models.notification import Notification

router = APIRouter()

@router.get("/{user_id}/notifications")
async def get_notifications(
    user_id: str,
    unread_only: bool = True,
    session: Session = Depends(get_session)
):
    """
    Get in-app notifications for user.

    Query params:
    - unread_only: If true, only return unread notifications (default: true)

    Returns list of notifications with:
    - id, type (miss_detected, streak_reset, milestone), message, created_at, read
    """
    query = select(Notification).where(Notification.user_id == user_id)

    if unread_only:
        query = query.where(Notification.read == False)

    notifications = session.exec(query.order_by(Notification.created_at.desc())).all()

    return {"notifications": notifications}

@router.patch("/{user_id}/notifications/{id}/read")
async def mark_notification_read(
    user_id: str,
    id: str,
    session: Session = Depends(get_session)
):
    """Mark notification as read."""
    notification = session.get(Notification, id)
    if notification and notification.user_id == user_id:
        notification.read = True
        session.add(notification)
        session.commit()
        return {"success": True}
    return {"success": False, "error": "Notification not found"}
```

**Frontend: React Query Polling**

```tsx
// apps/web/src/hooks/useNotifications.ts

import { useQuery } from '@tanstack/react-query';
import { getNotifications } from '@/lib/api';

export function useNotifications(userId: string) {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => getNotifications(userId, true), // unread_only=true
    refetchInterval: 30000, // Poll every 30 seconds
    enabled: !!userId,
  });
}
```

**Frontend: Notification Banner Component**

```tsx
// apps/web/src/components/notifications/NotificationBanner.tsx

import { useNotifications } from '@/hooks/useNotifications';
import { markNotificationRead } from '@/lib/api';

export function NotificationBanner({ userId }: { userId: string }) {
  const { data, refetch } = useNotifications(userId);

  const notifications = data?.notifications || [];

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg max-w-md"
        >
          <div className="flex items-start justify-between">
            <p className="text-sm text-yellow-800">{notification.message}</p>
            <button
              onClick={async () => {
                await markNotificationRead(userId, notification.id);
                refetch();
              }}
              className="ml-4 text-yellow-600 hover:text-yellow-800"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Database Schema

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,  -- 'miss_detected', 'streak_reset', 'milestone'
  message TEXT NOT NULL,
  habit_id UUID REFERENCES habits(id) ON DELETE SET NULL,  -- Optional habit reference
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;
```

### Notification Creation

```python
# apps/api/src/services/notification_service.py

from src.models.notification import Notification
from sqlmodel import Session

def create_miss_notification(session: Session, user_id: str, habit_id: str, habit_name: str):
    """Create notification for first missed day."""
    notification = Notification(
        user_id=user_id,
        habit_id=habit_id,
        type="miss_detected",
        message=f"🔔 Get back on track today! You missed {habit_name} yesterday."
    )
    session.add(notification)
    session.commit()

def create_streak_reset_notification(session: Session, user_id: str, habit_id: str, habit_name: str):
    """Create notification for streak reset (2 consecutive misses)."""
    notification = Notification(
        user_id=user_id,
        habit_id=habit_id,
        type="streak_reset",
        message=f"⚠️ Your streak has reset to 0 for {habit_name}. Start fresh today!"
    )
    session.add(notification)
    session.commit()
```

### Phase V Upgrade Path

**Migration to Server-Sent Events (SSE)**:
1. Add SSE endpoint: `@router.get("/{user_id}/notifications/stream")`
2. Use `sse-starlette` library for FastAPI
3. Frontend: Replace polling with `EventSource` API
4. Benefit: Real-time notifications, reduced server load

### References
- [React Query: Polling](https://tanstack.com/query/v4/docs/guides/window-focus-refetching)
- [FastAPI SSE Example](https://github.com/sysid/sse-starlette)
- [MDN: Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

---

## 5. UTC vs Local Timezone Handling

### Question
Best practices for storing UTC and displaying local times?

### Research Findings

**Principle**: **Store in UTC, Display in User's Local Timezone**

### Backend Strategy

**PostgreSQL TIMESTAMPTZ**:
- Always use `TIMESTAMPTZ` (not `TIMESTAMP`)
- PostgreSQL stores internally in UTC
- Converts to session timezone on retrieval
- FastAPI/SQLModel: Use Python `datetime.datetime` (timezone-aware)

```python
# apps/api/src/models/habit_completion.py

from datetime import datetime
from sqlmodel import Field, SQLModel

class HabitCompletion(SQLModel, table=True):
    __tablename__ = "habit_completions"

    id: str = Field(primary_key=True)
    habit_id: str = Field(foreign_key="habits.id")
    user_id: str = Field(foreign_key="users.id")
    completed_at: datetime  # TIMESTAMPTZ in PostgreSQL, stored as UTC
    completion_type: str
    created_at: datetime = Field(default_factory=lambda: datetime.utcnow())
```

**API Response Format**: ISO 8601 with Z suffix (UTC)

```json
{
  "completed_at": "2026-01-10T07:30:00Z"  // Always UTC in API
}
```

### Frontend Strategy

**date-fns for Timezone Conversion**:

```typescript
// apps/web/src/lib/date-utils.ts

import { format, parseISO } from 'date-fns';
import { formatInTimeZone, zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

/**
 * Parse UTC timestamp from API and convert to user's local timezone.
 */
export function parseUTCToLocal(utcTimestamp: string): Date {
  return parseISO(utcTimestamp); // Parses "2026-01-10T07:30:00Z" as UTC
}

/**
 * Format timestamp in user's local timezone.
 */
export function formatLocalDate(utcTimestamp: string, formatString: string = 'PPpp'): string {
  const date = parseUTCToLocal(utcTimestamp);
  return format(date, formatString); // Automatically converts to local
}

/**
 * Get current day in user's local timezone (for "completed today" check).
 */
export function getLocalToday(): Date {
  return new Date(); // JavaScript Date is always in local timezone
}

/**
 * Convert local date/time to UTC for API submission.
 */
export function localToUTC(localDate: Date): string {
  return localDate.toISOString(); // Returns UTC string with Z suffix
}
```

**Usage in Components**:

```tsx
// apps/web/src/components/habits/CompletionHistory.tsx

import { formatLocalDate } from '@/lib/date-utils';

export function CompletionHistory({ completions }: { completions: HabitCompletion[] }) {
  return (
    <ul>
      {completions.map((completion) => (
        <li key={completion.id}>
          {formatLocalDate(completion.completed_at, 'PPpp')}
          {' - '}
          {completion.completion_type}
        </li>
      ))}
    </ul>
  );
}
```

### Day Boundary Handling

**Problem**: User completes habit at 11:59 PM local, then again at 12:01 AM local (same session). Are these the same day or different days?

**Solution**: Use UTC day boundaries for consistency.

```python
# Backend: Check if completion exists for same UTC day

from datetime import datetime, timezone

def is_duplicate_completion(session: Session, habit_id: str, completion_time: datetime) -> bool:
    """
    Check if completion already exists for same UTC day.

    Day boundaries are based on UTC, not user's local timezone.
    Example: 2026-01-10 00:00 UTC to 2026-01-10 23:59 UTC is one day.
    """
    utc_day_start = completion_time.replace(hour=0, minute=0, second=0, microsecond=0)
    utc_day_end = utc_day_start.replace(hour=23, minute=59, second=59)

    existing = session.exec(
        select(HabitCompletion)
        .where(HabitCompletion.habit_id == habit_id)
        .where(HabitCompletion.completed_at >= utc_day_start)
        .where(HabitCompletion.completed_at <= utc_day_end)
    ).first()

    return existing is not None
```

### Edge Case: Timezone Travel

**Scenario**: User in New York (UTC-5) completes habit at 10 PM EST (3 AM UTC next day). User travels to London (UTC+0) and sees habit marked as completed "tomorrow" in their app.

**Mitigation**: Accept this edge case. UTC day boundaries are consistent and predictable. Most users don't travel across timezones daily.

**Future Enhancement** (Post-Phase V): Store user's timezone preference, use that for day boundary calculations.

### Testing Strategy

```typescript
// Frontend tests

describe('date-utils', () => {
  it('parses UTC timestamp to local Date', () => {
    const utc = '2026-01-10T07:30:00Z';
    const local = parseUTCToLocal(utc);
    expect(local.toISOString()).toBe(utc);
  });

  it('formats timestamp in local timezone', () => {
    // Mock user in UTC-5 (New York)
    const utc = '2026-01-10T07:30:00Z';
    const formatted = formatLocalDate(utc, 'PPpp');
    // Depends on system timezone, but should show local time
    expect(formatted).toContain('Jan 10, 2026');
  });
});
```

### References
- [PostgreSQL TIMESTAMPTZ](https://www.postgresql.org/docs/current/datatype-datetime.html)
- [date-fns-tz Documentation](https://github.com/marnusw/date-fns-tz)
- [ISO 8601 Standard](https://en.wikipedia.org/wiki/ISO_8601)

---

## Summary

All research questions resolved. Key decisions documented for:
1. Streak calculation (O(n log n) sort + scan)
2. Sound effects (Web Audio API + fallback)
3. Background jobs (APScheduler in-process)
4. Notifications (React Query polling)
5. Timezones (UTC storage, local display)

**Status**: ✅ Research complete. Proceed to Phase 1 (Design & Contracts).
