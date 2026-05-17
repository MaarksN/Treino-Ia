import { describe, expect, it } from 'vitest';
import {
  buildSleepStrengthInsight,
  calculateSleepStrengthCorrelation,
  createSleepStrengthPairs,
} from './sleepStrengthCorrelation';
import { type WorkoutSession } from '../database';

describe('sleep-strength correlation', () => {
  it('calculates simple correlation', () => {
    const correlation = calculateSleepStrengthCorrelation([
      { sleepHours: 5, strengthScore: 70 },
      { sleepHours: 6, strengthScore: 75 },
      { sleepHours: 8, strengthScore: 90 },
    ]);
    expect(correlation).toBeGreaterThan(0);
  });

  it('creates pairs only when sleep and strength are available on the same date', () => {
    const pairs = createSleepStrengthPairs([
      { date: '2026-05-01', sleepHours: 7, updatedAt: 1 },
      { date: '2026-05-02', sleepHours: 0, updatedAt: 1 },
    ], [
      createSession('s1', '2026-05-01', 1000),
      createSession('s2', '2026-05-02', 1200),
      createSession('s3', '2026-05-03', 900),
    ]);

    expect(pairs).toHaveLength(1);
    expect(pairs[0]).toMatchObject({ date: '2026-05-01', sleepHours: 7, strengthScore: 1000 });
  });

  it('returns honest fallback with fewer than three paired samples', () => {
    const insight = buildSleepStrengthInsight([
      { date: '2026-05-01', sleepHours: 7, updatedAt: 1 },
    ], [
      createSession('s1', '2026-05-01', 1000),
    ]);

    expect(insight.status).toBe('insufficient_data');
    expect(insight.sampleCount).toBe(1);
  });

  it('labels a positive trend when local samples support it', () => {
    const insight = buildSleepStrengthInsight([
      { date: '2026-05-01', sleepHours: 5, updatedAt: 1 },
      { date: '2026-05-02', sleepHours: 6, updatedAt: 1 },
      { date: '2026-05-03', sleepHours: 8, updatedAt: 1 },
    ], [
      createSession('s1', '2026-05-01', 700),
      createSession('s2', '2026-05-02', 800),
      createSession('s3', '2026-05-03', 1000),
    ]);

    expect(insight.status).toBe('positive');
    expect(insight.correlation).toBeGreaterThan(0.35);
  });
});

function createSession(id: string, date: string, totalVolume: number): WorkoutSession {
  return {
    id,
    planId: 'plan-1',
    dayId: 'day-1',
    dayName: 'A',
    focus: 'Forca',
    completedAt: new Date(`${date}T12:00:00.000Z`).getTime(),
    durationMinutes: 60,
    totalVolume,
    completedExercises: 1,
    totalExercises: 1,
    feedback: '',
    nextRecommendation: '',
    exercises: [{
      exerciseId: 'ex-1',
      name: 'Supino',
      targetSets: 3,
      targetReps: '8-10',
      targetRest: '90s',
      completed: true,
      sets: [{ weight: totalVolume / 10, reps: 10, rpe: 8 }],
    }],
  };
}
