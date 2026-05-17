import { describe, it, expect } from 'vitest';
import { getCurrentWeeklyChallenge, calculateLocalChallengeProgress, WeeklyChallenge } from '../../src/pages/Dashboard/services/socialContent/weeklyChallengeService';
import { WorkoutSession } from '../../src/services/database';

describe('weeklyChallengeService', () => {
  it('returns a valid challenge', () => {
    const challenge = getCurrentWeeklyChallenge();
    expect(challenge).toBeDefined();
    expect(challenge.title).toBeTruthy();
    expect(challenge.target).toBeGreaterThan(0);
  });

  it('calculates w1 (workouts) progress correctly', () => {
    const challenge: WeeklyChallenge = { id: 'w1', title: 'w1', description: '', target: 3, unit: 'x' };
    const history: WorkoutSession[] = [
      { id: '1', completedAt: Date.now(), totalVolume: 1000 } as any,
      { id: '2', completedAt: Date.now(), totalVolume: 2000 } as any
    ];

    expect(calculateLocalChallengeProgress(challenge, history)).toBe(2);
    expect(calculateLocalChallengeProgress(challenge, [])).toBe(0);
  });

  it('calculates w2 (volume) progress correctly', () => {
    const challenge: WeeklyChallenge = { id: 'w2', title: 'w2', description: '', target: 10000, unit: 'x' };
    const history: WorkoutSession[] = [
      { id: '1', completedAt: Date.now(), totalVolume: 1500 } as any,
      { id: '2', completedAt: Date.now(), totalVolume: 2000 } as any
    ];

    expect(calculateLocalChallengeProgress(challenge, history)).toBe(3500);
  });
});
