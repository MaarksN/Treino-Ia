import { test, expect } from '@playwright/test';
import { collectCriticalErrors } from './helpers/console';

/**
 * Navigation & Security E2E — Controlled Technical Sprint 04.
 *
 * Verifies:
 *   1. App responds to known routes (/, /hoje, /plano, /treino/ativo, /historico, /conta).
 *   2. Unknown routes are redirected to root.
 *   3. Page source does not contain leaked secrets or credentials.
 *   4. PWA meta tags are present (manifest, theme-color, apple meta).
 *   5. Critical HTML semantics: lang, charset, viewport are correct.
 *   6. No critical console errors.
 *
 * Constraints:
 *   - No login / OAuth required.
 *   - No Billing / Stripe required.
 *   - No secrets required.
 */

test.describe('Navigation & routing', () => {
  test.beforeEach(async ({ page }) => {
    // Skip onboarding for clean navigation tests
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('@TreinoApp:onboarding', 'true');
    });
  });

  test('root path loads successfully', async ({ page }) => {
    const errors = collectCriticalErrors(page);
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    // #root should have content
    const root = page.locator('#root');
    await expect(root).toBeVisible({ timeout: 10_000 });
    const childCount = await root.locator('> *').count();
    expect(childCount).toBeGreaterThan(0);

    expect(errors).toEqual([]);
  });

  test('core routes load directly', async ({ page }) => {
    for (const route of [
      '/hoje',
      '/plano',
      '/treino/ativo',
      '/historico',
      '/conta',
      '/assinatura',
    ]) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.locator('#root')).toBeVisible({ timeout: 10_000 });
    }
  });

  test('unknown path redirects to the canonical today route', async ({ page }) => {
    await page.goto('/some-unknown-path-xyz');

    // App should still render (unknown route is replaced)
    const root = page.locator('#root');
    await expect(root).toBeVisible({ timeout: 10_000 });

    // URL should be rewritten to the canonical today route
    await page.waitForTimeout(1_000);
    expect(new URL(page.url()).pathname).toBe('/hoje');
  });
});

test.describe('Security checks', () => {
  test('page source does not leak secrets or credentials', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2_000);

    const html = await page.content();
    const lower = html.toLowerCase();

    // No real API keys or tokens in rendered HTML
    expect(lower).not.toContain('sk_live_');
    expect(lower).not.toContain('sk_test_');
    expect(lower).not.toContain('whsec_');
    expect(lower).not.toContain('password');
    // The placeholder anon key is expected — but no real Supabase URL with real key
    expect(lower).not.toContain('eyj'); // JWT fragments should not appear in HTML source
  });

  test('no JavaScript errors of type ReferenceError or TypeError on load', async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', (error) => {
      jsErrors.push(`${error.name}: ${error.message}`);
    });

    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('@TreinoApp:onboarding', 'true');
    });
    await page.goto('/');
    await page.waitForTimeout(3_000);

    // Filter out known benign errors (Supabase client init with placeholder)
    const critical = jsErrors.filter(
      (e) => !e.includes('supabase') && !e.includes('Failed to fetch') && !e.includes('net::ERR'),
    );
    expect(critical).toEqual([]);
  });
});

test.describe('PWA & HTML semantics', () => {
  test('PWA meta tags are present', async ({ page }) => {
    await page.goto('/');

    // Manifest link
    const manifest = page.locator('link[rel="manifest"]');
    await expect(manifest).toHaveAttribute('href', '/manifest.webmanifest');

    // Theme color
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveAttribute('content', '#050A1F');

    // Apple mobile web app
    const appleMeta = page.locator('meta[name="apple-mobile-web-app-capable"]');
    await expect(appleMeta).toHaveAttribute('content', 'yes');

    // Apple title
    const appleTitle = page.locator('meta[name="apple-mobile-web-app-title"]');
    await expect(appleTitle).toHaveAttribute('content', 'TreinoApp');
  });

  test('HTML document has correct lang and charset', async ({ page }) => {
    await page.goto('/');

    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('pt-BR');

    const charset = page.locator('meta[charset]');
    await expect(charset).toHaveAttribute('charset', 'UTF-8');

    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', 'width=device-width, initial-scale=1.0');
  });
});
