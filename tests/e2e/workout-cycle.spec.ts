import { expect, test } from '@playwright/test';
import { collectCriticalErrors } from './helpers/console';

async function createLocalProfileAndPlan(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('@TreinoApp:onboarding', 'true');
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

async function finishWorkoutWithOneSet(page: import('@playwright/test').Page) {
  await page.getByTestId('start-workout-button').click();
  await expect(page.getByText(/Modo treino ativo/i)).toBeVisible({ timeout: 10_000 });

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
  test('user completes anamnesis, finishes a workout, sees history and accepts the pending AI suggestion', async ({ page }) => {
    const errors = collectCriticalErrors(page);

    await createLocalProfileAndPlan(page);
    await finishWorkoutWithOneSet(page);

    await page.getByTestId('ai-recommendation-accept').click();
    await expect(page.getByTestId('pending-ai-recommendation-card')).not.toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Sugestao aceita e plano atualizado|Sugestao aplicada localmente/i)).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('user can reject the pending AI suggestion without applying the proposed plan', async ({ page }) => {
    const errors = collectCriticalErrors(page);

    await createLocalProfileAndPlan(page);
    await finishWorkoutWithOneSet(page);

    await page.getByTestId('ai-recommendation-reject').click();
    await expect(page.getByTestId('pending-ai-recommendation-card')).not.toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Sugestao rejeitada/i)).toBeVisible();

    expect(errors).toEqual([]);
  });
});
