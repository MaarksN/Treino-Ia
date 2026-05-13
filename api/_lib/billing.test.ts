import { describe, expect, it } from 'vitest';
import { getEntitlementsForPlan, isPaidStatus, normalizeBillingPlan } from './billing';

describe('billing normalization', () => {
  it('keeps free plan as default', () => {
    expect(normalizeBillingPlan(undefined, undefined)).toEqual({ planId: 'free', interval: 'month' });
  });

  it('maps legacy premium ids to pro plan', () => {
    expect(normalizeBillingPlan('premium_monthly', 'month')).toEqual({ planId: 'pro', interval: 'month' });
    expect(normalizeBillingPlan('premium_yearly', 'year')).toEqual({ planId: 'pro', interval: 'year' });
  });

  it('flags paid statuses correctly', () => {
    expect(isPaidStatus('active')).toBe(true);
    expect(isPaidStatus('trialing')).toBe(true);
    expect(isPaidStatus('canceled')).toBe(false);
  });

  it('returns free entitlements for unknown fallback access', () => {
    expect(getEntitlementsForPlan('free')).toContain('workouts.basic');
    expect(getEntitlementsForPlan('pro')).toContain('ai.unlimited');
  });
});
