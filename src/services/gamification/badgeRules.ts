export interface LifestyleBadgeInput {
  hydrationStreakDays: number;
  workoutsCompleted: number;
  personalRecords: number;
}

export function getLifestyleBadges(input: LifestyleBadgeInput): string[] {
  const badges: string[] = [];
  if (input.hydrationStreakDays >= 7) badges.push('hydration_week_warrior');
  if (input.workoutsCompleted >= 10) badges.push('ten_workouts_milestone');
  if (input.personalRecords >= 1) badges.push('first_pr_unlocked');
  return badges;
}

export function canApplyStreakFreeze(currentStreak: number, freezeTokens: number, missedDays: number): boolean {
  return currentStreak > 0 && freezeTokens > 0 && missedDays === 1;
}
