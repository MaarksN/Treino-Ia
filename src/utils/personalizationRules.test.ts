import { describe, expect, it } from 'vitest';
import { computeDeterministicFlags, validateAvailableMinutes } from './personalizationRules';

describe('personalizationRules', () => {
  it('normaliza tempo disponível', () => {
    expect(validateAvailableMinutes(9)).toBe(15);
    expect(validateAvailableMinutes(240)).toBe(180);
  });

  it('detecta risco e deload por fadiga', () => {
    const flags = computeDeterministicFlags(
      { daysPerWeek: 5, goal: 'Hipertrofia', age: 30, gender: 'Masculino', height: 180, weight: 80, experienceLevel: 'Intermediário', injuries: '', equipment: '' },
      [],
      { timestamp: Date.now(), sleepHours: 5, sorenessLevel: 3, stressLevel: 4, energyLevel: 4 }
    );
    expect(flags.deloadNeeded).toBe(true);
    expect(flags.recommendedFrequency).toBeLessThanOrEqual(4);
  });
});
