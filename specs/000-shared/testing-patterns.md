# Testing Architectural Patterns

## Backend (Pytest)
- **Database:** Use the `engine` fixture with `session` scope to minimize remote Neon connections.
- **Isolation:** Each test should create its own `user_id` using the `auth_user` fixture.
- **Security:** Always include tests for:
  - Unauthorized access (no token).
  - Cross-user access (User A trying to access User B's resource).
  - Input validation (XSS, SQLi).

### Pattern: Integration Test
```python
def test_get_habit_security(client, auth_headers, other_user_habit):
    # Try to access another user's habit
    response = client.get(f"/api/habits/{other_user_habit.id}", headers=auth_headers)
    assert response.status_code == 404  # Not Found, not 403, to prevent ID scanning
```

## Frontend (Vitest)
- **Mocking:** Use `vi.mock` for the `api.ts` module.
- **Async:** Use `screen.findByText` or `waitFor`.
- **Coverage:** Minimum 80% coverage required for all new features.

### Pattern: Component Test
```typescript
import { render, screen } from '@testing-library/react';
import { HabitCard } from './HabitCard';

test('renders habit name', () => {
  render(<HabitCard habit={mockHabit} />);
  expect(screen.getByText('Morning Run')).toBeInTheDocument();
});
```
