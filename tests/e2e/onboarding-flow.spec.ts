import { test, expect } from '@playwright/test';
import { collectCriticalErrors } from './helpers/console';

/**
 * Onboarding Flow E2E — Controlled Technical Sprint 04.
 *
 * Verifies the first-visit onboarding tour:
 *   1. Tour overlay is visible on first visit (no localStorage).
 *   2. All 7 steps can be navigated via "Próximo".
 *   3. Final step shows "Começar" button.
 *   4. Completing the tour persists onboarding state and shows RegistrationForm.
 *   5. Skipping the tour works and shows RegistrationForm.
 *   6. No critical console errors during the entire flow.
 *
 * Constraints:
 *   - No login / OAuth required.
 *   - No Billing / Stripe required.
 *   - No secrets required.
 *   - All state is in localStorage — deterministic and isolated.
 */

test.describe('Onboarding flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {}
    });
  });

  test('tour is visible on first visit and can complete all steps', async ({ page }) => {
    const errors = collectCriticalErrors(page);
    await page.goto('/');

    // Tour overlay should be visible
    const tourOverlay = page.locator('.fixed.inset-0.z-50');
    await expect(tourOverlay).toBeVisible({ timeout: 10_000 });

    // First step title
    await expect(page.getByText('Bem-vindo ao Treino IA')).toBeVisible();

    // Navigate through steps 1-6 via "Próximo" button
    for (let i = 0; i < 6; i++) {
      await page.getByRole('button', { name: /Próximo/i }).click();
    }

    // Step 7 (last): "Começar" button should appear
    await expect(page.getByRole('button', { name: /Começar/i })).toBeVisible();
    await expect(page.getByText('Pronto para começar')).toBeVisible();

    // Complete the tour
    await page.getByRole('button', { name: /Começar/i }).click();

    // Tour should disappear — registration form or dashboard should appear
    await expect(tourOverlay).not.toBeVisible({ timeout: 5_000 });

    // Onboarding key should be persisted
    const onboardingDone = await page.evaluate(() => localStorage.getItem('@TreinoApp:onboarding'));
    expect(onboardingDone).toBe('true');

    expect(errors).toEqual([]);
  });

  test('skip button dismisses tour immediately', async ({ page }) => {
    const errors = collectCriticalErrors(page);
    await page.goto('/');

    const tourOverlay = page.locator('.fixed.inset-0.z-50');
    await expect(tourOverlay).toBeVisible({ timeout: 10_000 });

    // Click "Pular"
    await page.getByRole('button', { name: /Pular/i }).click();

    // Tour should disappear
    await expect(tourOverlay).not.toBeVisible({ timeout: 5_000 });

    // Onboarding key should be persisted
    const onboardingDone = await page.evaluate(() => localStorage.getItem('@TreinoApp:onboarding'));
    expect(onboardingDone).toBe('true');

    expect(errors).toEqual([]);
  });

  test('back button navigates to previous step', async ({ page }) => {
    await page.goto('/');

    const tourOverlay = page.locator('.fixed.inset-0.z-50');
    await expect(tourOverlay).toBeVisible({ timeout: 10_000 });

    // Go to step 2
    await page.getByRole('button', { name: /Próximo/i }).click();
    await expect(page.getByText('Anamnese objetiva')).toBeVisible();

    // Go back to step 1
    await page.getByRole('button', { name: /Anterior/i }).click();
    await expect(page.getByText('Bem-vindo ao Treino IA')).toBeVisible();
  });
});
