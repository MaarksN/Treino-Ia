import { expect, test } from '@playwright/test';
import { collectCriticalErrors } from './helpers/console';

async function createLocalProfileAndPlan(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    try {
      if (!sessionStorage.getItem('__treino_e2e_bootstrapped')) {
        localStorage.clear();
        sessionStorage.clear();
        sessionStorage.setItem('__treino_e2e_bootstrapped', 'true');
      }
      localStorage.setItem('@TreinoApp:onboarding', 'true');
    } catch {}
  });

  await page.goto('/');
  await expect(page.getByText('INICIAR')).toBeVisible({ timeout: 10_000 });
  await page.getByPlaceholder('Ex: João da Silva').fill('Ciclo E2E');
  await page.getByPlaceholder('joao@example.com').fill('ciclo@treino.test');
  await page.getByRole('button', { name: /Cadastrar e continuar/i }).click();

  await expect(page.getByTestId('anamnesis-form')).toBeVisible({ timeout: 10_000 });
  await page.getByTestId('anamnesis-name').fill('Ciclo E2E');
  await page.getByTestId('anamnesis-days').fill('4');
  await page.getByTestId('anamnesis-duration').fill('45');
  await page.getByTestId('anamnesis-submit').click();

  await expect(page.getByTestId('start-workout-button')).toBeVisible({ timeout: 10_000 });
}

async function expectRegularUserCoreSurface(page: import('@playwright/test').Page) {
  for (const selector of [
    '#dashboard-overview',
    '#dashboard-plan',
    '#dashboard-history',
    '#dashboard-reports',
    '#dashboard-account',
  ]) {
    await expect(page.locator(selector)).toHaveCount(1, { timeout: 10_000 });
  }

  await expect(page.getByText(/Treino de hoje/i)).toBeVisible();
  await expect(page.getByText(/Plano atual/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /Começar treino/i }).first()).toBeVisible();
  await expect(page.getByText(/Ajuste simples da IA/i)).toBeVisible();

  await expect(page.getByRole('button', { name: /Importar ficha/i })).toHaveCount(0);
  await expect(page.locator('#dashboard-nutrition')).toHaveCount(0);
  await expect(page.locator('#dashboard-advanced-social')).toHaveCount(0);
  await expect(page.locator('#dashboard-gamification')).toHaveCount(0);
  await expect(page.locator('#dashboard-remote-gamified')).toHaveCount(0);
  await expect(page.locator('#dashboard-accessibility')).toHaveCount(0);

  await expect(page.getByText(/Nutrição beta/i)).toHaveCount(0);
  await expect(page.getByText(/Scan de refeição/i)).toHaveCount(0);
  await expect(page.getByText(/Social|Comunidade|Marketplace/i)).toHaveCount(0);
  await expect(page.getByText(/Premium UX|M[ií]dia|WebXR|Form check|Camera/i)).toHaveCount(0);
  await expect(page.getByText(/Integra[cç][oõ]es comerciais internas/i)).toHaveCount(0);
}

async function expectCoreRouteTarget(
  page: import('@playwright/test').Page,
  path: string,
  targetSelector: string,
  activeNavLabel: string,
) {
  await page.goto(path);
  const target = page.locator(targetSelector);
  await expect(target).toHaveCount(1, { timeout: 10_000 });
  await target.scrollIntoViewIfNeeded();
  await expect(target).toBeVisible();

  await expect
    .poll(
      async () =>
        page.evaluate((selector) => {
          const rect = document.querySelector(selector)?.getBoundingClientRect();
          return Boolean(rect && rect.top < window.innerHeight && rect.bottom > 0);
        }, targetSelector),
      { timeout: 5_000 },
    )
    .toBe(true);

  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          const activeButton = [...document.querySelectorAll('nav button')].find((button) =>
            button.className.includes('text-brand-neon'),
          );
          return activeButton?.textContent?.trim() ?? '';
        }),
      { timeout: 5_000 },
    )
    .toBe(activeNavLabel);
}

async function finishWorkoutWithOneSet(page: import('@playwright/test').Page) {
  await page.getByTestId('start-workout-button').click();
  await expect(page.getByText(/Modo treino ativo/i)).toBeVisible({ timeout: 10_000 });

  await expect(page.getByText(/Câmera|Camera|Form check|Nota em áudio|PiP/i)).toHaveCount(0);

  await page.getByTestId('set-weight-0-0').fill('50');
  await page.getByTestId('set-reps-0-0').fill('10');
  await page.getByTestId('set-rpe-0-0').fill('7');
  await page.getByTestId('set-completed-0-0').check();
  await page.getByTestId('exercise-completed-0').check();
  await page.getByTestId('finish-workout-button').click();

  await expect(page.getByTestId('pending-ai-recommendation-card')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/Sessões finalizadas/i)).toBeVisible();
}

test.describe('Workout value cycle', () => {
  test('core deep links land on the expected section after the plan exists', async ({ page }) => {
    const errors = collectCriticalErrors(page);

    await createLocalProfileAndPlan(page);

    await expectCoreRouteTarget(page, '/hoje', '#dashboard-overview', 'Inicio');
    await expectCoreRouteTarget(page, '/plano', '#dashboard-plan', 'Plano');
    await expectCoreRouteTarget(page, '/historico', '#dashboard-history', 'Historico');
    await expectCoreRouteTarget(page, '/conta', '#dashboard-account', 'Conta');
    await expectCoreRouteTarget(page, '/assinatura', '#dashboard-account', 'Conta');

    await page.goto('/nutricao');
    await expect(page.getByText(/Nutricao esta em beta/i)).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/hoje$/);

    expect(errors).toEqual([]);
  });

  test('user completes anamnesis, finishes a workout, sees history and accepts the pending AI suggestion', async ({ page }) => {
    const errors = collectCriticalErrors(page);

    await createLocalProfileAndPlan(page);
    await expectRegularUserCoreSurface(page);
    await finishWorkoutWithOneSet(page);

    await page.getByTestId('ai-recommendation-accept').click();
    await expect(page.getByTestId('pending-ai-recommendation-card')).not.toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Sugestao aceita e plano atualizado|Sugestao aplicada localmente/i)).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('user can reject the pending AI suggestion without applying the proposed plan', async ({ page }) => {
    const errors = collectCriticalErrors(page);

    await createLocalProfileAndPlan(page);
    await expectRegularUserCoreSurface(page);
    await finishWorkoutWithOneSet(page);

    await page.getByTestId('ai-recommendation-reject').click();
    await expect(page.getByTestId('pending-ai-recommendation-card')).not.toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Sugestao rejeitada/i)).toBeVisible();

    expect(errors).toEqual([]);
  });
});
