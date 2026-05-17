import { describe, it, expect } from 'vitest';
import { generateRecoverySuggestion } from './recoverySuggestionsService';

describe('Recovery Suggestions Service', () => {
  it('should suggest rest for high exhaustion', () => {
    const suggestion = generateRecoverySuggestion({ rpe: 9, muscleSoreness: 5, exhaustionLevel: 'high' });
    expect(suggestion.type).toBe('rest');
    expect(suggestion.disclaimer).toContain('não uma recomendação médica');
  });

  it('should suggest active recovery for high muscle soreness', () => {
    const suggestion = generateRecoverySuggestion({ rpe: 5, muscleSoreness: 8, exhaustionLevel: 'moderate' });
    expect(suggestion.type).toBe('active_recovery');
  });

  it('should suggest cold exposure for moderate-high RPE', () => {
    const suggestion = generateRecoverySuggestion({ rpe: 7, muscleSoreness: 4, exhaustionLevel: 'moderate' });
    expect(suggestion.type).toBe('cold_exposure');
  });

  it('should suggest heat exposure for low RPE', () => {
    const suggestion = generateRecoverySuggestion({ rpe: 4, muscleSoreness: 3, exhaustionLevel: 'low' });
    expect(suggestion.type).toBe('heat_exposure');
  });
});
