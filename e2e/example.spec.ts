import { expect, test } from '@playwright/test';

test('home page loads with expected title', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('#root')).toBeVisible();
  await expect(page).toHaveTitle(/treino inteligente/i);
});
