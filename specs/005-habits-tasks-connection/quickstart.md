# Quickstart: Habits ↔ Tasks Connection

**Feature**: 005-habits-tasks-connection
**Branch**: `005-habits-tasks-connection`

---

## Prerequisites

- Chunks 1-4 complete and working
- PostgreSQL database running (Neon or local)
- `DATABASE_URL` env var set
- Python 3.13+ with UV
- Node.js 20+ with npm/pnpm

---

## Implementation Order

### Phase 1: Backend Model + Migration

1. **Update RecurringSchedule model** (`apps/api/src/models/habit.py`)
   - Add `frequency: int = 1` field
   - Add `days_of_month: Optional[List[int]]` field
   - Keep `day_of_month` for backward compat
   - Update validator for new fields

2. **Add columns to Task model** (`apps/api/src/models/task.py`)
   - `generated_by_habit_id: Optional[UUID]` with FK to habits.id, ON DELETE SET NULL
   - `is_habit_task: bool = False`
   - Follow `sa_column=Column(...)` pattern per CLAUDE.md pitfall #1

3. **Create Alembic migration**
   ```bash
   cd apps/api
   alembic revision --autogenerate -m "add_habit_task_columns"
   alembic upgrade head
   ```

### Phase 2: Schedule Parser (Pure Logic)

4. **Create schedule parser** (`apps/api/src/services/schedule_parser.py`)
   - Pure function: `get_scheduled_dates(schedule, start_date, end_date, habit_created_at) -> list[date]`
   - Handle daily (frequency), weekly (days), monthly (days_of_month)
   - Respect `until` date
   - Convert day-of-week convention (spec 0=Sun → Python 0=Mon)

5. **Write unit tests** for schedule parser
   - Daily every day, every 2 days, every 3 days
   - Weekly Mon/Wed/Fri
   - Monthly 1st and 15th
   - Until date respected
   - Edge: until in past → empty list
   - Edge: monthly day 31 in February → skip

### Phase 3: Task Generation Service

6. **Create HabitTaskGenerationService** (`apps/api/src/services/habit_task_service.py`)
   - `generate_tasks_for_habit(habit_id, lookahead_days=7) -> GenerationResult`
   - `generate_tasks_for_all_habits(lookahead_days=7) -> list[GenerationResult]`
   - `regenerate_future_tasks(habit_id) -> GenerationResult`
   - Uses `TaskService.create_task()` for task creation (preserves events)
   - Idempotent: checks for existing (habit_id, due_date) before creating

7. **Write integration tests** for task generation
   - Creates correct number of tasks
   - Idempotent (running twice = same result)
   - Respects until date
   - Skips archived habits

### Phase 4: API Endpoints

8. **Add `is_habit_task` filter to task list** (`apps/api/src/routes/tasks.py`)
   - New query param on `GET /{user_id}/tasks`
   - Filter by `Task.is_habit_task`

9. **Add generated-tasks endpoint** (`apps/api/src/routes/habits.py`)
   - `GET /{user_id}/habits/{habit_id}/generated-tasks`

10. **Add manual trigger endpoint** (`apps/api/src/routes/habits.py`)
    - `POST /{user_id}/habits/{habit_id}/generate-tasks`

11. **Extend task completion for habit sync** (`apps/api/src/routes/tasks.py`)
    - Add `completion_type` query param to `PATCH /{user_id}/tasks/{id}/complete`
    - After marking task complete, check `generated_by_habit_id`
    - If present and habit exists, call habit completion logic
    - Return `habit_sync` in response

12. **Update TaskResponse schema** (`apps/api/src/routes/tasks.py`)
    - Add `is_habit_task` and `generated_by_habit_id` fields

### Phase 5: Habit Lifecycle Integration

13. **Hook task generation into habit creation** (`apps/api/src/services/habit_service.py`)
    - After `create_habit()` commits, call `generate_tasks_for_habit()`

14. **Hook regeneration into habit update** (`apps/api/src/services/habit_service.py`)
    - When `recurring_schedule` changes, call `regenerate_future_tasks()`

15. **Ensure ON DELETE SET NULL works** on habit deletion
    - The FK constraint handles this at DB level
    - Verify with integration test

### Phase 6: Background Job

16. **Add APScheduler** to requirements
    ```bash
    cd apps/api
    uv add apscheduler
    ```

17. **Configure scheduler in main.py**
    - Start on FastAPI startup event
    - Run `generate_tasks_for_all_habits()` daily at 00:01 UTC
    - Log job execution

### Phase 7: Frontend Updates

18. **Add `HabitTaskBadge` component** - Visual indicator on task cards
19. **Add `is_habit_task` filter toggle** to task list page
20. **Add `GeneratedTasks` section** to habit detail page
21. **Show completion type modal** when completing habit tasks
22. **Show streak update toast** after habit-task completion
23. **Update habit form** with recurring schedule explanation text

### Phase 8: Contract Tests

24. **API contract tests** for all new/modified endpoints
25. **Integration test**: Create habit → tasks generated → complete task → streak updates

---

## Key Files to Modify

| File | Change |
|------|--------|
| `apps/api/src/models/task.py` | Add `generated_by_habit_id`, `is_habit_task` columns |
| `apps/api/src/models/habit.py` | Evolve `RecurringSchedule` model |
| `apps/api/src/services/schedule_parser.py` | NEW: Pure schedule parsing |
| `apps/api/src/services/habit_task_service.py` | NEW: Task generation service |
| `apps/api/src/services/habit_service.py` | Hook generation into create/update |
| `apps/api/src/routes/tasks.py` | Extend completion, add filter, update schema |
| `apps/api/src/routes/habits.py` | Add generated-tasks, generate-tasks endpoints |
| `apps/api/src/main.py` | APScheduler setup |
| `apps/web/src/app/tasks/page.tsx` | Habit task filter toggle |
| `apps/web/src/components/tasks/TaskCard.tsx` | Habit task badge |
| `apps/web/src/app/habits/[id]/page.tsx` | Generated tasks section |

---

## Testing Commands

```bash
# Backend tests
cd apps/api
python -m pytest tests/unit/test_schedule_parser.py -v
python -m pytest tests/unit/test_habit_task_service.py -v
python -m pytest tests/integration/test_habit_task_routes.py -v
python -m pytest tests/contract/ -v

# Frontend (if applicable)
cd apps/web
npm test
```

---

## Environment Variables

No new environment variables required. The feature uses:
- `DATABASE_URL` (existing) — for task/habit queries
- `ENABLE_HABITS_MODULE` (existing) — feature flag

Optional:
- `HABIT_TASK_LOOKAHEAD_DAYS=7` — configurable lookahead (defaults to 7)
- `DISABLE_BACKGROUND_JOBS=false` — disable scheduler in test environments
