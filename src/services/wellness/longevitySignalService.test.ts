import { describe, expect, it } from 'vitest';
import { calculateLongevitySignal, LONGEVITY_DISCLAIMER } from './longevitySignalService';
import { type WorkoutSession } from '../database';

const NOW = new Date('2026-05-17T12:00:00.000Z').getTime();

function createSession(daysAgo: number, volume: number, rpe?: number): WorkoutSession {
  return {
    id: `s-${daysAgo}`, planId: 'p1', dayId: 'd1', dayName: 'D1', focus: 'Full',
    completedAt: NOW - daysAgo * 86400000, durationMinutes: 45,
    totalVolume: volume, completedExercises: 4, totalExercises: 5,
    feedback: '', nextRecommendation: '', exercises: rpe
      ? [{
        exerciseId: 'e1',
        name: 'Agachamento',
        targetSets: 3,
        targetReps: '8',
        targetRest: '90s',
        completed: true,
        sets: [{ weight: 100, reps: 8, rpe }],
      }]
      : [],
  };
}

describe('longevitySignalService', () => {
  it('returns low signal for empty history', () => {
    const signal = calculateLongevitySignal({ history: [], now: NOW });
    expect(signal.consistencyScore).toBeLessThanOrEqual(50);
    expect(signal.factors).toHaveLength(5);
  });

  it('returns higher signal for consistent training', () => {
    const history = Array.from({ length: 12 }, (_, i) => createSession(i * 2, 1000 + i * 50));
    const signal = calculateLongevitySignal({ history, now: NOW });
    expect(signal.consistencyScore).toBeGreaterThan(30);
    expect(signal.factors.every(f => f.score >= 0 && f.score <= 100)).toBe(true);
  });

  it('uses sleep and hydration local data in the habit signal', () => {
    const signal = calculateLongevitySignal({
      history: [createSession(1, 1000, 7), createSession(3, 900, 7)],
      hydrationEntries: [{ date: '2026-05-17', amountMl: 2500 }],
      hydrationGoalMl: 2500,
      sleepEntries: [
        { date: '2026-05-16', durationMinutes: 430, quality: 4 },
        { date: '2026-05-17', durationMinutes: 420, quality: 5 },
      ],
      now: NOW,
    });

    expect(signal.factors.find(factor => factor.id === 'sleep')?.score).toBeGreaterThanOrEqual(80);
    expect(signal.factors.find(factor => factor.id === 'hydration')?.score).toBe(100);
  });

  it('penalizes excessive recent RPE without making a medical claim', () => {
    const balanced = calculateLongevitySignal({
      history: [createSession(1, 1000, 6), createSession(3, 900, 6)],
      now: NOW,
    });
    const excessive = calculateLongevitySignal({
      history: [createSession(1, 1000, 9), createSession(3, 900, 10)],
      now: NOW,
    });

    expect(excessive.factors.find(factor => factor.id === 'rpe_balance')?.score)
      .toBeLessThan(balanced.factors.find(factor => factor.id === 'rpe_balance')?.score ?? 0);
    expect(excessive.disclaimer).toContain('Não representa');
  });

  it('uses educational labels, not medical terms', () => {
    const signal = calculateLongevitySignal({ history: [], now: NOW });
    expect(signal.label).toContain('hábitos');
    expect(signal.label).not.toContain('idade');
  });

  it('has a disclaimer about no biological age', () => {
    expect(LONGEVITY_DISCLAIMER).toContain('Não representa idade biológica');
    expect(LONGEVITY_DISCLAIMER).toContain('profissionais de saúde');
  });
});
