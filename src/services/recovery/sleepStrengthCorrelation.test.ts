import { describe, expect, it } from 'vitest';
import { calculateSleepStrengthCorrelation } from './sleepStrengthCorrelation';

describe('sleep-strength correlation', () => {
  it('returns 0 when insufficient', () => {
    expect(calculateSleepStrengthCorrelation([{ sleepHours: 5, strengthScore: 70 }])).toBe(0);
  });
  it('calculates correlation', () => {
    const correlation = calculateSleepStrengthCorrelation([{ sleepHours: 5, strengthScore: 70 },{ sleepHours: 6, strengthScore: 75 },{ sleepHours: 8, strengthScore: 90 }]);
    expect(correlation).toBeGreaterThan(0);
  });
});
