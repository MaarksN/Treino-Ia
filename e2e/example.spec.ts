import { expect, test } from '@playwright/test';

test('home page loads with expected title', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/treino|vite|react/i);
});
