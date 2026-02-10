# Frontend Architectural Patterns

## Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + Lucide Icons
- **Auth:** Better-Auth (Cookie-based via `lib/api.ts`)
- **Date Handling:** `date-fns`

## API Integration
NEVER use raw `fetch` for internal APIs. Use the centralized client in `@/lib/api`.

### Pattern: API Call
```typescript
import { habitsAPI } from '@/lib/api';

const fetchHabits = async () => {
  try {
    const data = await habitsAPI.list();
    setHabits(data);
  } catch (err) {
    showToast(err.message, 'error');
  }
};
```

## Hydration & UI Components
- **Hydration Safety:** Use `suppressHydrationWarning` on `<html>` and a `mounted` state for dynamic dates/locale strings.
- **Mobile-First:** Minimum 44x44px touch targets. Use `.touch-target` utility.
- **Loading States:** Use the `Skeleton` pattern for all data-fetching pages.

### Pattern: Hydration-Safe Date
```typescript
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

const dateStr = mounted ? format(date, 'PPP') : '';
```

## File Structure
- `apps/web/src/app/`: Routes and Pages.
- `apps/web/src/components/`: Reusable UI components.
- `apps/web/src/lib/`: API clients, utilities, and contexts.
- `apps/web/tests/unit/`: Vitest test files (1:1 mapping with components/pages).
