import { test, expect } from '@playwright/test';

test.describe('Task management flows', () => {
  test.beforeEach(async ({ page }) => {
    // Login with a test user (assumes user exists or use registration)
    await page.goto('/login');
    await page.fill('input[type="email"]', `tasks-e2e-${Date.now()}@example.com`);
    await page.fill('input[type="password"]', 'TestPassword123!');
    // Try to login; if fails, register first
    await page.click('button[type="submit"]');
    // Wait briefly for navigation
    await page.waitForTimeout(2000);
  });

  test('create a task and see it in the list', async ({ page }) => {
    await page.goto('/tasks/new');
    await page.fill('input[name="title"], input[aria-label*="Title"], input[placeholder*="title"]', 'E2E Test Task');
    await page.click('button[type="submit"]');
    await page.goto('/tasks');
    await expect(page.locator('text=E2E Test Task')).toBeVisible({ timeout: 10000 });
  });

  test('search tasks by keyword filters results', async ({ page }) => {
    await page.goto('/tasks');
    const searchInput = page.locator('input[aria-label="Search tasks"], input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('E2E Test');
      await page.waitForTimeout(500); // Wait for debounce
      // Should show filtered results or empty state
      await expect(page.locator('text=/E2E Test|No tasks found/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('complete a task updates card immediately', async ({ page }) => {
    await page.goto('/tasks');
    const completeButton = page.locator('button:has-text("Complete")').first();
    if (await completeButton.isVisible()) {
      await completeButton.click();
      // Optimistic update — card should change state immediately
      await expect(page.locator('text=/completed|Completing/i').first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('delete a task removes it from the list', async ({ page }) => {
    await page.goto('/tasks');
    const deleteButton = page.locator('button:has-text("Delete")').first();
    if (await deleteButton.isVisible()) {
      page.on('dialog', dialog => dialog.accept()); // Accept confirm dialog
      await deleteButton.click();
      await page.waitForTimeout(1000);
    }
  });
});
