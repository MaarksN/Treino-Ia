import { expect, test, type Page } from '@playwright/test';
import { createSafeMusicEmbed } from '../../src/services/media/musicEmbedService';

const onboardingKey = '@TreinoApp:onboarding';

async function bypassOnboarding(page: Page) {
  await page.addInitScript(key => {
    window.localStorage.setItem(key, 'true');
  }, onboardingKey);
}

test.describe('security smoke', () => {
  test.beforeEach(async ({ page }) => {
    await bypassOnboarding(page);
  });

  test('does not reflect hostile URL input as executable markup', async ({ page }) => {
    await page.goto('/?embed=%3Cscript%3Ewindow.__e2eInjected%3Dtrue%3C%2Fscript%3E#%3Cimg%20src=x%20onerror%3Dwindow.__e2eInjected%3Dtrue%3E');

    await expect(page.locator('#root')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();

    const injected = await page.evaluate(() => Boolean((window as Window & { __e2eInjected?: boolean }).__e2eInjected));
    const pageHtml = await page.content();

    expect(injected).toBe(false);
    expect(pageHtml).not.toContain('window.__e2eInjected');
    await expect(page.locator('script', { hasText: '__e2eInjected' })).toHaveCount(0);
  });

  test('rejects raw music embed HTML at the UI service boundary', () => {
    const result = createSafeMusicEmbed('<iframe src="https://www.youtube.com/embed/abc123XYZ"></iframe><script>alert(1)</script>');

    expect(result.ok).toBe(false);
    expect(result.embed).toBeUndefined();
    expect(result.error).toContain('HTML');
  });
});
