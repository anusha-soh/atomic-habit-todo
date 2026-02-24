import { test, expect } from '@playwright/test';

test.describe('Authentication flows', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  test('register new user and reach dashboard', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="email"], input[type="email"]', testEmail);
    await page.fill('input[name="password"], input[type="password"]', testPassword);
    // Fill confirm password if present
    const confirmField = page.locator('input[name="confirmPassword"], input[aria-label*="Confirm"]');
    if (await confirmField.isVisible()) {
      await confirmField.fill(testPassword);
    }
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  });

  test('login with valid credentials reaches dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', testEmail);
    await page.fill('input[name="password"], input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  });

  test('logout returns to landing page', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', testEmail);
    await page.fill('input[name="password"], input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });

    // Logout
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Log out"), a:has-text("Logout")');
    await logoutButton.click();
    await expect(page).toHaveURL(/\/$|\/login/, { timeout: 10000 });
  });

  test('login with wrong password shows error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', testEmail);
    await page.fill('input[name="password"], input[type="password"]', 'WrongPassword!');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=/error|invalid|incorrect/i')).toBeVisible({ timeout: 5000 });
  });
});
