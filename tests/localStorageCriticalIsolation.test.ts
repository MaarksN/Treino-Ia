import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadStreak, recordWorkoutForStreak } from '../src/utils/streakUtils';
import { evaluateAndUnlockBadges } from '../src/utils/badgeUtils';
import { syncChallengeProgress, updateChallenge } from '../src/utils/challengeUtils';

describe('critical localStorage isolation', () => {
  const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

  beforeEach(() => {
    setItemSpy.mockClear();
  });

  it('streak utils do not persist client-side source of truth', () => {
    const streak = loadStreak();
    const next = recordWorkoutForStreak(streak, '2026-05-13');
    expect(next.totalWorkouts).toBe(1);
    expect(setItemSpy).not.toHaveBeenCalled();
  });

  it('badges are derived in-memory and not persisted locally', () => {
    const unlocked = evaluateAndUnlockBadges(
      { currentStreak: 3, longestStreak: 3, lastWorkoutDate: '2026-05-13', totalWorkouts: 3, workoutDates: ['2026-05-11', '2026-05-12', '2026-05-13'] },
      [],
      0,
      0,
      0,
    );
    expect(unlocked.some(b => b.id === 'streak_3')).toBe(true);
    expect(setItemSpy).not.toHaveBeenCalled();
  });

  it('challenge updates are server-driven fallback and cannot be claimed locally', () => {
    const challenges = syncChallengeProgress(2, 0, 0);
    expect(challenges.length).toBeGreaterThan(0);
    expect(updateChallenge('any', 1)).toBeNull();
    expect(setItemSpy).not.toHaveBeenCalled();
  });
});
