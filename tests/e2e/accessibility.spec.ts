import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Accessibility smoke', () => {
  test('first dashboard surface has no critical axe violations', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('@TreinoApp:onboarding', 'true');
    });

    await page.goto('/');
    await expect(page.locator('#root')).toBeVisible({ timeout: 10_000 });

    const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
    const criticalViolations = results.violations.filter(
      (violation) => violation.impact === 'critical',
    );

    expect(criticalViolations).toEqual([]);
  });
});
