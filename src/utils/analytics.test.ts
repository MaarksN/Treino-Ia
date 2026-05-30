import { beforeEach, describe, expect, it, vi } from 'vitest';
import { trackDay7Return, trackEventOnce } from './analytics';

describe('analytics beta funnel helpers', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('tracks once-only funnel events a single time', () => {
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    expect(trackEventOnce('first_plan_created', { source: 'test' })).toBe(true);
    expect(trackEventOnce('first_plan_created', { source: 'test' })).toBe(false);

    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('@TreinoApp:analytics-once')).toContain('first_plan_created');
  });

  it('detects seven day return only after the activation window', () => {
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const activatedAt = Date.UTC(2026, 4, 1);

    expect(
      trackDay7Return(activatedAt, { source: 'dashboard' }, activatedAt + 6 * 24 * 60 * 60 * 1000),
    ).toBe(false);
    expect(
      trackDay7Return(activatedAt, { source: 'dashboard' }, activatedAt + 8 * 24 * 60 * 60 * 1000),
    ).toBe(true);
    expect(
      trackDay7Return(activatedAt, { source: 'dashboard' }, activatedAt + 9 * 24 * 60 * 60 * 1000),
    ).toBe(false);

    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy.mock.calls[0]?.[0]).toContain('day_7_return_detected');
  });
});
