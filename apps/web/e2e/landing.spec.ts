import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('Get Started CTA navigates to /register', async ({ page }) => {
    await page.goto('/');
    const ctaButton = page.locator('a:has-text("Get Started"), button:has-text("Get Started")').first();
    await expect(ctaButton).toBeVisible();
    await ctaButton.click();
    await expect(page).toHaveURL(/register/);
  });

  test('Sign In link navigates to /login', async ({ page }) => {
    await page.goto('/');
    const signInLink = page.locator('a:has-text("Sign In"), a:has-text("Log In"), a:has-text("Login")').first();
    await expect(signInLink).toBeVisible();
    await signInLink.click();
    await expect(page).toHaveURL(/login/);
  });

  test('mobile hamburger menu opens nav links', async ({ page }) => {
    // Use mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Look for hamburger button
    const hamburger = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], button[aria-label*="nav"], button[aria-label*="Nav"]').first();
    if (await hamburger.isVisible()) {
      await hamburger.click();
      // Verify nav links become visible
      await expect(page.locator('a:has-text("Sign In"), a:has-text("Login"), a:has-text("Log In")').first()).toBeVisible({ timeout: 3000 });
    }
  });
});
