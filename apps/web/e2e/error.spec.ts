import { test, expect } from '@playwright/test';

test.describe('Protected route redirects', () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // Ensure no auth cookies

  test('visit /tasks without auth redirects to /login', async ({ page }) => {
    await page.goto('/tasks');
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
  });

  test('visit /habits without auth redirects to /login', async ({ page }) => {
    await page.goto('/habits');
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
  });

  test('visit /dashboard without auth redirects to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
  });
});
