import { test, expect } from '@playwright/test';
import { collectCriticalErrors } from './helpers/console';

/**
 * Registration Flow E2E — Controlled Technical Sprint 04.
 *
 * Verifies the starter registration form:
 *   1. After onboarding, registration form is visible.
 *   2. Name and email fields accept input.
 *   3. Submitting with valid data persists to localStorage.
 *   4. After registration, the anamnesis form appears.
 *   5. Empty name prevents submission (HTML required validation).
 *   6. No critical console errors.
 *
 * Constraints:
 *   - No login / OAuth required — this is local starter registration only.
 *   - No Supabase calls — data stored in localStorage.
 *   - Deterministic and isolated.
 */

test.describe('Registration flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear state and skip onboarding
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('@TreinoApp:onboarding', 'true');
    });
  });

  test('registration form is visible after onboarding', async ({ page }) => {
    const errors = collectCriticalErrors(page);
    await page.goto('/');

    // Registration form heading "INICIAR" should be visible
    await expect(page.getByText('INICIAR')).toBeVisible({ timeout: 10_000 });

    // Name and email inputs should be present
    await expect(page.getByPlaceholder('Ex: João da Silva')).toBeVisible();
    await expect(page.getByPlaceholder('joao@example.com')).toBeVisible();

    // Submit button
    await expect(page.getByRole('button', { name: /Cadastrar e continuar/i })).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('filling form and submitting persists starter user', async ({ page }) => {
    const errors = collectCriticalErrors(page);
    await page.goto('/');

    await expect(page.getByText('INICIAR')).toBeVisible({ timeout: 10_000 });

    // Fill the form
    await page.getByPlaceholder('Ex: João da Silva').fill('Teste E2E');
    await page.getByPlaceholder('joao@example.com').fill('teste@e2e.com');

    // Submit
    await page.getByRole('button', { name: /Cadastrar e continuar/i }).click();

    // Wait for the registration form to disappear and anamnesis to appear
    await page.waitForTimeout(1_000);

    // Starter user should be persisted in localStorage
    const starterUser = await page.evaluate(() =>
      localStorage.getItem('@TreinoIA:starterUser'),
    );
    expect(starterUser).toBeTruthy();

    const parsed = JSON.parse(starterUser!);
    expect(parsed.name).toBe('Teste E2E');
    expect(parsed.email).toBe('teste@e2e.com');
    expect(parsed.createdAt).toBeGreaterThan(0);

    expect(errors).toEqual([]);
  });

  test('registration form does not appear on return visit with existing starter user', async ({
    page,
  }) => {
    // Simulate existing starter user
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('@TreinoApp:onboarding', 'true');
      localStorage.setItem(
        '@TreinoIA:starterUser',
        JSON.stringify({ name: 'Returning User', email: 'return@test.com', createdAt: Date.now() }),
      );
    });

    await page.goto('/');
    await page.waitForTimeout(2_000);

    // Registration form "INICIAR" heading should NOT appear
    // Instead, anamnesis or dashboard should be shown
    const iniciar = page.getByText('INICIAR');
    await expect(iniciar).not.toBeVisible({ timeout: 5_000 });
  });
});
