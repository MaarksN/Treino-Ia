import { describe, it, expect } from 'vitest';
import { assessChronotype, getTimeBasedSuggestion } from './chronobiologyService';

describe('Chronobiology Service', () => {
  it('should identify morning lark', () => {
    const profile = assessChronotype(6);
    expect(profile.chronotype).toBe('morning_lark');
    expect(profile.optimalWorkoutWindow).toBe('06:00 - 10:00');
  });

  it('should identify night owl', () => {
    const profile = assessChronotype(10);
    expect(profile.chronotype).toBe('night_owl');
  });

  it('should identify intermediate', () => {
    const profile = assessChronotype(8);
    expect(profile.chronotype).toBe('intermediate');
  });

  it('should give warning for night owl training early', () => {
    const profile = assessChronotype(10);
    const suggestion = getTimeBasedSuggestion(profile, 7);
    expect(suggestion).toContain('desafiador para seu cronotipo');
  });

  it('should give warning for morning lark training late', () => {
    const profile = assessChronotype(6);
    const suggestion = getTimeBasedSuggestion(profile, 20);
    expect(suggestion).toContain('afetar seu sono');
  });

  it('should return null if training in optimal window', () => {
    const profile = assessChronotype(8); // intermediate
    const suggestion = getTimeBasedSuggestion(profile, 14);
    expect(suggestion).toBeNull();
  });
});
