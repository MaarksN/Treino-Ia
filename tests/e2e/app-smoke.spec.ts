import { expect, test, type Page } from '@playwright/test';

const onboardingKey = '@TreinoApp:onboarding';

async function bypassOnboarding(page: Page) {
  await page.addInitScript(key => {
    window.localStorage.setItem(key, 'true');
  }, onboardingKey);
}

test.describe('app smoke', () => {
  test.beforeEach(async ({ page }) => {
    await bypassOnboarding(page);
  });

  test('loads the app shell without a blank screen', async ({ page }) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];

    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });

    await page.goto('/');

    await expect(page.locator('#root')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading', { name: /treino\s+inteligente/i })).toBeVisible();
    await expect(page.getByText(/plataforma inteligente/i)).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/unhandled runtime error|referenceerror|typeerror/i);

    expect(pageErrors).toEqual([]);
    expect(consoleErrors.filter(message => !message.includes('Failed to load resource'))).toEqual([]);
  });

  test('renders the known dashboard route', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading', { name: /treino\s+inteligente/i })).toBeVisible();
  });
});
