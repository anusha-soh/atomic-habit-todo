# Developer Quickstart: Habit Tracking & Streaks

**Feature**: 004-habit-tracking-streaks
**Date**: 2026-02-12
**For**: Backend + Frontend Developers

## Prerequisites

Ensure you have completed Phase 2 Chunk 3 (Habits CRUD) before starting this chunk.

**Required**:
- Node.js 20+ and npm
- Python 3.13+ and uv (Python package manager)
- PostgreSQL (Neon account or local instance)
- Git
- Claude Code CLI

**Recommended**:
- VS Code with Python + TypeScript extensions
- Database GUI tool (TablePlus, DBeaver, or pgAdmin)
- REST API client (Postman, Insomnia, or Thunder Client)

## Architecture Overview

```
Frontend (Next.js)               Backend (FastAPI)                Database (PostgreSQL)
┌──────────────────┐            ┌──────────────────┐           ┌──────────────────┐
│ CompletionCheck  │            │ POST /complete   │           │ habit_completions│
│ box.tsx          │───────────►│                  │──────────►│ (new table)      │
│                  │   API      │ Streak Calculator│           │                  │
│ StreakCounter    │   call     │ Service          │           │ habits           │
│ .tsx             │◄───────────│                  │◄──────────│ (extend fields)  │
│                  │  Response  │ Miss Detector    │           │                  │
│ SoundPlayer.ts   │            │ Background Job   │           └──────────────────┘
└──────────────────┘            └──────────────────┘
         │                               │
         │                               │
         ▼                               ▼
     sparkle.mp3                    Event Emitter
     (Web Audio API)                (HABIT_COMPLETED, etc.)
```

## Setup Instructions

### Step 1: Apply Database Migrations

```bash
cd apps/api

# Verify Alembic is configured
uv run alembic current

# Create migrations for habit_completions table and habit streak fields
uv run alembic revision --autogenerate -m "Add habit completions and streak tracking"

# Review the generated migration file
ls alembic/versions/

# Apply migrations
uv run alembic upgrade head

# Verify tables exist
psql $DATABASE_URL -c "\d habit_completions"
psql $DATABASE_URL -c "\d habits"
```

**Expected Output**:
- `habit_completions` table with columns: id, habit_id, user_id, completed_at, completion_type, created_at
- `habits` table with new columns: last_completed_at, consecutive_misses
- Indexes on habit_completions (habit_id, user_id, completed_at)
- Unique constraint on (habit_id, DATE(completed_at))

### Step 2: Install Dependencies

**Backend**:
```bash
cd apps/api

# Install dependencies (if not already installed)
uv sync

# Verify dependencies
uv pip list | grep apscheduler  # Background job scheduler
```

**Frontend**:
```bash
cd apps/web

# Install dependencies (if not already installed)
npm install

# Verify dependencies
npm list date-fns  # Timezone handling
```

### Step 3: Configure Environment Variables

**Backend** (`apps/api/.env`):
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/habits_db

# Background Jobs
MISS_DETECTION_SCHEDULE="0 1 * * *"  # Daily at 00:01 UTC (cron format)
ENABLE_MISS_DETECTION=true

# Sound Effects (optional, for local testing)
SOUND_EFFECT_URL=/sounds/sparkle.mp3
```

**Frontend** (`apps/web/.env.local`):
```bash
# API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Sound Effects
NEXT_PUBLIC_SOUND_VOLUME=0.5  # 50% volume
```

### Step 4: Start Development Servers

**Terminal 1 - Backend**:
```bash
cd apps/api
uv run uvicorn src.main:app --reload --port 8000

# Expected output:
# INFO:     Uvicorn running on http://0.0.0.0:8000
# INFO:     APScheduler started (background job scheduler)
```

**Terminal 2 - Frontend**:
```bash
cd apps/web
npm run dev

# Expected output:
# ready - started server on 0.0.0.0:3000
# event - compiled client and server successfully
```

**Terminal 3 - Watch Logs**:
```bash
# Monitor database activity
tail -f apps/api/logs/app.log

# Or monitor events
curl http://localhost:8000/api/events  # If events endpoint exists
```

## Testing the Feature

### Manual Testing Flow

**1. Create a Habit** (Prerequisites from Chunk 3):
```bash
curl -X POST http://localhost:8000/api/test-user-123/habits \
  -H "Content-Type: application/json" \
  -d '{
    "identity_statement": "I am a runner",
    "full_description": "Run 5km",
    "two_minute_version": "Put on running shoes",
    "category": "health",
    "recurring_schedule": {"type": "daily"}
  }'

# Note the habit_id from response (e.g., "abc-123")
```

**2. Complete the Habit**:
```bash
curl -X POST http://localhost:8000/api/test-user-123/habits/abc-123/complete \
  -H "Content-Type: application/json" \
  -d '{"completion_type": "full"}'

# Expected response:
# {
#   "habit_id": "abc-123",
#   "current_streak": 1,
#   "completion": {...},
#   "message": "Habit completed successfully"
# }
```

**3. Verify Streak**:
```bash
curl http://localhost:8000/api/test-user-123/habits/abc-123/streak

# Expected response:
# {
#   "habit_id": "abc-123",
#   "current_streak": 1,
#   "last_completed_at": "2026-01-10T07:30:00Z",
#   "consecutive_misses": 0
# }
```

**4. Test Duplicate Prevention**:
```bash
# Try to complete again on same day (should fail)
curl -X POST http://localhost:8000/api/test-user-123/habits/abc-123/complete \
  -H "Content-Type: application/json" \
  -d '{"completion_type": "full"}'

# Expected response: 409 Conflict
# {
#   "error": "Completion already exists for today"
# }
```

**5. Test Undo**:
```bash
# Get completion_id from step 2 response (e.g., "def-456")
curl -X DELETE http://localhost:8000/api/test-user-123/habits/abc-123/completions/def-456

# Expected response:
# {
#   "deleted": true,
#   "recalculated_streak": 0,
#   "message": "Completion undone and streak recalculated"
# }
```

### Frontend Testing (Browser)

**1. Navigate to Habits Page**:
```
http://localhost:3000/habits
```

**2. Mark Habit Complete**:
- Click checkbox on habit card
- Should hear sparkle sound
- Should see green checkmark animation
- Streak counter should increment

**3. Verify Mobile Responsiveness**:
- Open DevTools (F12)
- Toggle device toolbar (Ctrl+Shift+M)
- Test on mobile viewport (375×667 iPhone SE)
- Verify checkbox is 44×44px minimum

**4. Test Sound Effects**:
- Open browser console
- Mark habit complete
- Should see: "Playing sparkle sound" (if logging enabled)
- If sound fails: Should see visual feedback only (graceful degradation)

### Automated Testing

**Backend Tests**:
```bash
cd apps/api

# Run all tests
uv run pytest

# Run specific test categories
uv run pytest tests/contract/test_completion_contract.py  # OpenAPI schema tests
uv run pytest tests/integration/test_completion_flow.py   # End-to-end tests
uv run pytest tests/unit/test_streak_calculator.py        # Streak logic tests

# Run with coverage
uv run pytest --cov=src --cov-report=html
open htmlcov/index.html
```

**Frontend Tests**:
```bash
cd apps/web

# Run component tests
npm test

# Run E2E tests (if Playwright configured)
npx playwright test tests/habits/completion.spec.ts

# Run with UI
npx playwright test --ui
```

## Key Files to Understand

### Backend

**1. Streak Calculator** (`apps/api/src/services/streak_calculator.py`):
```python
def calculate_streak(completions: List[HabitCompletion], today: date) -> int:
    """
    Core streak calculation algorithm.
    O(n log n) complexity: Sort completions, iterate backward, count consecutive days.
    """
```

**2. Miss Detector** (`apps/api/src/services/miss_detector.py`):
```python
def detect_missed_habits():
    """
    Background job (runs daily at 00:01 UTC).
    Checks all habits for missed days, increments consecutive_misses,
    emits HABIT_MISS_DETECTED or HABIT_STREAK_RESET events.
    """
```

**3. Completion Endpoint** (`apps/api/src/routes/habits.py`):
```python
@router.post("/{user_id}/habits/{habit_id}/complete")
async def complete_habit(user_id: str, habit_id: str, request: CompleteHabitRequest):
    """
    Main completion endpoint.
    Steps: Check duplicate → Create completion → Calculate streak → Update habit → Emit event
    """
```

### Frontend

**1. Completion Checkbox** (`apps/web/src/components/habits/CompletionCheckbox.tsx`):
```tsx
export function CompletionCheckbox({ habit, onComplete }) {
  const handleClick = async () => {
    // 1. Play sound immediately (optimistic)
    await sparkleSound.play();

    // 2. Call API
    const response = await completeHabit(habit.id, 'full');

    // 3. Update UI with new streak
    onComplete(response.current_streak);
  };
}
```

**2. Sound Player** (`apps/web/src/lib/sound-player.ts`):
```typescript
class SoundPlayer {
  // Web Audio API wrapper with HTML5 audio fallback
  // Handles: init, play, volume control, error handling
}
```

**3. Streak Counter** (`apps/web/src/components/habits/StreakCounter.tsx`):
```tsx
export function StreakCounter({ streak }) {
  // Display: "🔥 5 days" with animation on update
}
```

## Common Issues & Solutions

### Issue: Sound doesn't play on mobile

**Cause**: Mobile browsers require user gesture before playing audio.

**Solution**:
```typescript
// Initialize audio context on first user interaction
useEffect(() => {
  const initAudio = async () => {
    await sparkleSound.init('/sounds/sparkle.mp3');
  };
  initAudio();
}, []);
```

### Issue: Duplicate completions created

**Cause**: Database unique constraint not applied or client-side race condition.

**Solution**:
1. Verify migration applied: `psql $DATABASE_URL -c "\d+ habit_completions"`
2. Check for unique constraint: `UNIQUE (habit_id, DATE(completed_at))`
3. Add client-side debouncing:
```tsx
const [isSubmitting, setIsSubmitting] = useState(false);

const handleComplete = async () => {
  if (isSubmitting) return; // Prevent double-click
  setIsSubmitting(true);
  try {
    await completeHabit(...);
  } finally {
    setIsSubmitting(false);
  }
};
```

### Issue: Streak not incrementing

**Cause**: `last_completed_at` not updated or streak calculation logic error.

**Debug Steps**:
1. Check database: `SELECT * FROM habits WHERE id = 'abc-123';`
2. Verify `last_completed_at` is yesterday (not today or older)
3. Run unit test: `pytest tests/unit/test_streak_calculator.py -v`
4. Check logs for streak calculation errors

**Solution**:
- Ensure `last_completed_at` updated atomically with completion creation
- Verify day delta calculation uses UTC day boundaries

### Issue: Background job not running

**Cause**: APScheduler not started or cron schedule misconfigured.

**Debug Steps**:
1. Check logs: `tail -f apps/api/logs/app.log | grep "detect_missed_habits"`
2. Verify scheduler started: Should see "APScheduler started" on app startup
3. Test manually: `uv run python -c "from src.services.miss_detector import detect_missed_habits; detect_missed_habits()"`

**Solution**:
```python
# apps/api/src/main.py
@app.on_event("startup")
async def startup_event():
    from src.services.miss_detector import start_scheduler
    start_scheduler()
    logger.info("Background scheduler started")
```

## Next Steps

After completing local development and testing:

1. **Run Full Test Suite**: `cd apps/api && pytest && cd ../web && npm test`
2. **Create Pull Request**: Follow `/sp.git.commit_pr` workflow
3. **Deploy to Staging**: Verify on staging environment before production
4. **Monitor Events**: Check HABIT_COMPLETED, HABIT_STREAK_RESET, HABIT_MISS_DETECTED events
5. **Performance Testing**: Verify completion endpoint < 500ms P95

## Resources

- [Spec Document](./spec.md) - User requirements and acceptance criteria
- [Plan Document](./plan.md) - Technical design and architecture
- [Data Model](./data-model.md) - Database schema and entity relationships
- [API Contracts](./contracts/) - OpenAPI 3.1 specs for all endpoints
- [Research](./research.md) - Technology decisions and algorithms

## Getting Help

- **Backend Issues**: Check `apps/api/logs/app.log`
- **Frontend Issues**: Check browser console (F12)
- **Database Issues**: Check PostgreSQL logs or query directly
- **Test Failures**: Run with verbose mode (`pytest -v` or `npm test -- --verbose`)

**Status**: ✅ Quickstart guide complete. Ready for development!
