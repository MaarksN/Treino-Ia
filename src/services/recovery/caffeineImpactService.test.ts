import { beforeEach, describe, expect, it } from 'vitest';
import { estimateCaffeineImpact, saveCaffeineEntry } from './caffeineImpactService';

describe('caffeineImpactService', () => {
  beforeEach(() => localStorage.clear());
  it('sanitizes and stores entries', () => {
    const entries = saveCaffeineEntry(9999, new Date('2026-01-01T09:00:00Z').getTime());
    expect(entries[0].mg).toBe(1000);
  });
  it('alerts near sleep', () => {
    const result = estimateCaffeineImpact([{ mg: 150, loggedAt: new Date('2026-01-01T20:00:00Z').getTime() }], 23);
    expect(result.message).toContain('próxima do sono');
  });
});
