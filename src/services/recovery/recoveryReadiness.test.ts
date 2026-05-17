import { describe, expect, it } from 'vitest';
import {
  buildRecoveryModeRecommendation,
  calculateAccumulatedRpeLoad,
  createPainCheckin,
  normalizePainCheckin,
  summarizeCaffeine,
  summarizePainCheckin,
  type CaffeineEntry,
} from './recoveryReadiness';
import { type WorkoutSession } from '../database';

const NOW = new Date('2026-05-17T12:00:00.000Z').getTime();

describe('recoveryReadiness', () => {
  it('normalizes pain regions to a safe 0-10 scale', () => {
    const checkin = normalizePainCheckin({
      date: '2026-05-17',
      regions: {
        neck: 12,
        shoulders: -1,
      } as never,
      notes: 'ok',
    });

    expect(checkin.regions.neck).toBe(10);
    expect(checkin.regions.shoulders).toBe(0);
    expect(checkin.regions.knees).toBe(0);
  });

  it('summarizes high pain without medical diagnosis', () => {
    const checkin = createPainCheckin('2026-05-17');
    checkin.regions.knees = 8;

    const summary = summarizePainCheckin(checkin);

    expect(summary.status).toBe('high');
    expect(summary.max).toBe(8);
    expect(summary.message).toContain('nao substitui');
  });

  it('estimates caffeine impact from total and late dose', () => {
    const summary = summarizeCaffeine([
      caffeine('c1', '2026-05-17', '08:00', 120),
      caffeine('c2', '2026-05-17', '17:30', 180),
    ], '2026-05-17');

    expect(summary.totalMg).toBe(300);
    expect(summary.lateMg).toBe(180);
    expect(summary.level).toBe('high');
  });

  it('calculates accumulated RPE load over the recent window', () => {
    const summary = calculateAccumulatedRpeLoad([
      session('s1', NOW - 1_000, 60, 8),
      session('s2', NOW - 2_000, 45, 6),
      session('old', NOW - 10 * 24 * 60 * 60 * 1000, 60, 10),
    ], NOW);

    expect(summary.sessionCount).toBe(2);
    expect(summary.totalLoad).toBe(750);
    expect(summary.level).toBe('moderate');
  });

  it('recommends day off for very high recent RPE load', () => {
    const recommendation = buildRecoveryModeRecommendation({
      history: [
        session('s1', NOW - 1_000, 90, 9),
        session('s2', NOW - 2_000, 90, 9),
      ],
      now: NOW,
    });

    expect(recommendation.mode).toBe('day_off');
    expect(recommendation.reasons).toContain('RPE acumulado muito alto');
  });

  it('falls back honestly when no local readiness inputs exist', () => {
    const recommendation = buildRecoveryModeRecommendation({
      history: [],
      caffeineEntries: [],
      now: NOW,
    });

    expect(recommendation.mode).toBe('insufficient_data');
  });
});

function caffeine(
  id: string,
  date: string,
  consumedAt: string,
  amountMg: number
): CaffeineEntry {
  return {
    id,
    date,
    consumedAt,
    amountMg,
    label: 'Cafe',
    createdAt: NOW,
  };
}

function session(id: string, completedAt: number, durationMinutes: number, rpe: number): WorkoutSession {
  return {
    id,
    planId: 'plan-1',
    dayId: 'day-1',
    dayName: 'A',
    focus: 'Forca',
    completedAt,
    durationMinutes,
    totalVolume: 1000,
    completedExercises: 1,
    totalExercises: 1,
    feedback: '',
    nextRecommendation: '',
    exercises: [{
      exerciseId: 'ex-1',
      name: 'Agachamento',
      targetSets: 3,
      targetReps: '8-10',
      targetRest: '90s',
      completed: true,
      sets: [
        { weight: 100, reps: 5, rpe },
        { weight: 100, reps: 5, rpe },
      ],
    }],
  };
}
