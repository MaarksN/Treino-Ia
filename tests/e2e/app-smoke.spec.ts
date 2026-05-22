import { test, expect } from '@playwright/test';

/**
 * Smoke E2E — Controlled Technical Sprint 02.
 *
 * Verifies:
 *   1. App loads with HTTP 200.
 *   2. Page title is set (not empty).
 *   3. React root element (#root) is present and non-empty.
 *   4. No critical console errors (Error level) during load.
 *
 * Constraints:
 *   - No login / OAuth required.
 *   - No Billing / Stripe required.
 *   - No secrets required.
 *   - Uses Vite preview build (npm run build then npm run preview).
 */

test.describe('App smoke', () => {
  const criticalErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        // Filter out known benign browser errors (e.g. favicon, network blocked in CI)
        const text = msg.text();
        const benign =
          text.includes('favicon') ||
          text.includes('Failed to load resource') ||
          text.includes('ERR_NAME_NOT_RESOLVED') ||
          text.includes('net::ERR') ||
          text.includes('supabase') ||
          text.includes('google') ||
          text.includes('fonts.g');
        if (!benign) {
          criticalErrors.push(text);
        }
      }
    });
  });

  test('app loads with status 200', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('page title is set', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title.trim().length).toBeGreaterThan(0);
  });

  test('React root element renders', async ({ page }) => {
    await page.goto('/');
    // Wait for #root to contain at least one child element
    const root = page.locator('#root');
    await expect(root).toBeVisible({ timeout: 10_000 });
    const childCount = await root.locator('> *').count();
    expect(childCount).toBeGreaterThan(0);
  });

  test('no critical console errors on load', async ({ page }) => {
    criticalErrors.length = 0;
    await page.goto('/');
    // Allow the page 2 seconds to settle
    await page.waitForTimeout(2_000);
    expect(criticalErrors).toEqual([]);
  });
});
