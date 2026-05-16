import { describe, expect, it } from 'vitest';
import { canApplyStreakFreeze, getLifestyleBadges } from './badgeRules';

describe('badge rules', () => {
  it('returns badges by thresholds', () => {
    expect(getLifestyleBadges({ hydrationStreakDays: 7, workoutsCompleted: 10, personalRecords: 1 })).toHaveLength(3);
  });

  it('validates streak freeze usage', () => {
    expect(canApplyStreakFreeze(5, 1, 1)).toBe(true);
    expect(canApplyStreakFreeze(0, 1, 1)).toBe(false);
  });
});
