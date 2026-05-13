import { Badge, StreakData, WorkoutHistoryEntry } from '../types';

export const ALL_BADGES: Badge[] = [
  { id: 'first_workout', name: 'Primeiro treino', description: 'Complete seu primeiro treino', emoji: '💧', category: 'consistency', unlocked: false },
  { id: 'streak_3', name: 'Trio invicto', description: '3 treinos consecutivos', emoji: '🔥', category: 'consistency', unlocked: false },
  { id: 'streak_7', name: 'Semana perfeita', description: '7 dias consecutivos', emoji: '⚡', category: 'consistency', unlocked: false },
  { id: 'streak_30', name: 'Mês de ferro', description: '30 dias consecutivos', emoji: '🏆', category: 'consistency', unlocked: false },
  { id: 'streak_100', name: 'Centurião', description: '100 dias consecutivos', emoji: '💎', category: 'consistency', unlocked: false },
  { id: 'total_10', name: 'Dez fortes', description: '10 treinos totais', emoji: '💪', category: 'consistency', unlocked: false },
  { id: 'total_50', name: 'Cinquentão', description: '50 treinos totais', emoji: '🎖️', category: 'consistency', unlocked: false },
  { id: 'total_100', name: 'Centenário', description: '100 treinos totais', emoji: '🏛️', category: 'consistency', unlocked: false },
];

export function loadBadges(): Badge[] {
  return ALL_BADGES.map(b => ({ ...b }));
}

export function evaluateAndUnlockBadges(
  streak: StreakData,
  _history: WorkoutHistoryEntry[],
  _checkinCount: number,
  _prCount: number,
  _mealCount: number,
): Badge[] {
  const unlocked = new Set<string>();
  if (streak.totalWorkouts >= 1) unlocked.add('first_workout');
  if (streak.currentStreak >= 3) unlocked.add('streak_3');
  if (streak.currentStreak >= 7) unlocked.add('streak_7');
  if (streak.currentStreak >= 30) unlocked.add('streak_30');
  if (streak.currentStreak >= 100) unlocked.add('streak_100');
  if (streak.totalWorkouts >= 10) unlocked.add('total_10');
  if (streak.totalWorkouts >= 50) unlocked.add('total_50');
  if (streak.totalWorkouts >= 100) unlocked.add('total_100');

  return ALL_BADGES.filter(b => unlocked.has(b.id)).map(b => ({ ...b, unlocked: true, unlockedAt: Date.now() }));
}
