import type { Page, ConsoleMessage } from '@playwright/test';

/**
 * Known benign console error patterns that can be safely ignored in E2E tests.
 *
 * These occur because:
 *   - Supabase/Google fonts/favicon are external resources not available in CI
 *   - net::ERR_* errors are expected when no real backend exists
 *
 * NEVER add generic patterns like 'TypeError' or 'ReferenceError' here.
 */
const BENIGN_PATTERNS = [
  'favicon',
  'Failed to load resource',
  'ERR_NAME_NOT_RESOLVED',
  'net::ERR',
  'supabase',
  'google',
  'fonts.g',
  'html2canvas',
  'manifest.webmanifest',
] as const;

function isBenignError(text: string): boolean {
  return BENIGN_PATTERNS.some((pattern) => text.includes(pattern));
}

/**
 * Collects critical console errors during page lifecycle.
 * Returns a mutable array; check it after navigation/interaction.
 */
export function collectCriticalErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error' && !isBenignError(msg.text())) {
      errors.push(msg.text());
    }
  });
  return errors;
}
