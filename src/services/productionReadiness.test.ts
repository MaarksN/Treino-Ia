import { describe, expect, it } from 'vitest';
import { buildProductionReadinessSummary } from './productionReadiness';

describe('productionReadiness', () => {
  it('keeps production as no-go while manual staging validations are pending', () => {
    const summary = buildProductionReadinessSummary({
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'anon',
      VITE_GEMINI_PROXY_URL: '/api/gemini-proxy',
      VITE_SENTRY_DSN: 'https://sentry.example',
      VITE_STAGING_APP_URL: 'https://staging.example.com',
    });

    expect(summary.verdict).toBe('no_go');
    expect(summary.passCount).toBe(5);
    expect(summary.blockedCount).toBe(0);
    expect(summary.manualCount).toBeGreaterThan(0);
  });

  it('marks missing public runtime variables as blocked without exposing secret values', () => {
    const summary = buildProductionReadinessSummary({});

    expect(summary.verdict).toBe('no_go');
    expect(summary.blockedCount).toBe(5);
    expect(summary.checks.find((check) => check.id === 'public-supabase-url')).toMatchObject({
      status: 'blocked',
      evidence: 'VITE_SUPABASE_URL ausente no runtime publico.',
    });
    expect(
      summary.checks.some((check) => check.evidence.includes('SUPABASE_SERVICE_ROLE_KEY=')),
    ).toBe(false);
  });
});
