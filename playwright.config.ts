import { defineConfig, devices } from '@playwright/test';

const webServerHost = process.env.CI ? '127.0.0.1' : 'localhost';
const webServerPort = 4173;
const webServerUrl = `http://${webServerHost}:${webServerPort}`;

/**
 * Playwright configuration — Controlled Technical Sprint 02.
 * Minimal smoke E2E: app loads, root renders, no critical console errors.
 * No OAuth, no Billing, no secrets required.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: webServerUrl,
    headless: true,
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npm run preview -- --host ${webServerHost} --port ${webServerPort}`,
    url: webServerUrl,
    reuseExistingServer: !process.env.CI,
    timeout: process.env.CI ? 120_000 : 60_000,
    env: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ?? 'https://example.supabase.co',
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY ?? 'ci-placeholder-anon-key',
      VITE_ENV: 'test',
    },
  },
});
