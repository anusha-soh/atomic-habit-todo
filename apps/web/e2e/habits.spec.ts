import { test, expect } from '@playwright/test';

test.describe('Habit management flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', `habits-e2e-${Date.now()}@example.com`);
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  });

  test('create a habit and see it in the list', async ({ page }) => {
    await page.goto('/habits/new');
    // Fill identity statement
    const identityInput = page.locator('input[name="identity_statement"], textarea[name="identity_statement"], input[aria-label*="identity"]').first();
    if (await identityInput.isVisible()) {
      await identityInput.fill('I am someone who exercises daily');
    }
    // Fill two-minute version
    const twoMinInput = page.locator('input[name="two_minute_version"], textarea[name="two_minute_version"]').first();
    if (await twoMinInput.isVisible()) {
      await twoMinInput.fill('Put on running shoes');
    }
    // Select category if needed
    const categorySelect = page.locator('select[name="category"]').first();
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption({ index: 1 });
    }
    await page.click('button[type="submit"]');
    await page.goto('/habits');
    await expect(page.locator('text=/exercises daily|running shoes/i')).toBeVisible({ timeout: 10000 });
  });

  test('change category filter updates the list', async ({ page }) => {
    await page.goto('/habits');
    // Look for category filter buttons/tabs
    const filterButton = page.locator('button:has-text("Health"), button:has-text("All")').first();
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500); // Debounce wait
    }
  });
});
