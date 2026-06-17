import { expect, test } from '@playwright/test';

const pages = [
  { name: 'today-desktop', path: '/hoje', viewport: { width: 1440, height: 1200 } },
  { name: 'today-mobile', path: '/hoje', viewport: { width: 390, height: 844 } },
];

test.describe('Visual smoke screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('@TreinoApp:onboarding', 'true');
    });
  });

  for (const visualPage of pages) {
    test(`captures ${visualPage.name}`, async ({ page }, testInfo) => {
      await page.setViewportSize(visualPage.viewport);
      const response = await page.goto(visualPage.path);
      expect(response?.status()).toBe(200);

      const root = page.locator('#root');
      await expect(root).toBeVisible({ timeout: 10_000 });
      await page.waitForLoadState('networkidle');

      const screenshot = await page.screenshot({
        fullPage: true,
        animations: 'disabled',
      });

      expect(screenshot.length).toBeGreaterThan(10_000);
      await testInfo.attach(`${visualPage.name}.png`, {
        body: screenshot,
        contentType: 'image/png',
      });
    });
  }
});
