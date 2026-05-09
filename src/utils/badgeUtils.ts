import { Badge, StreakData, WorkoutHistoryEntry } from '../types';

const BADGE_KEY = '@TreinoApp:badges';

export const ALL_BADGES: Badge[] = [
  { id: 'first_workout', name: 'Primeiro treino', description: 'Complete seu primeiro treino', emoji: '💧', category: 'consistency', unlocked: false },
  { id: 'streak_3', name: 'Trio invicto', description: '3 treinos consecutivos', emoji: '🔥', category: 'consistency', unlocked: false },
  { id: 'streak_7', name: 'Semana perfeita', description: '7 dias consecutivos', emoji: '⚡', category: 'consistency', unlocked: false },
  { id: 'streak_30', name: 'Mês de ferro', description: '30 dias consecutivos', emoji: '🏆', category: 'consistency', unlocked: false },
  { id: 'streak_100', name: 'Centurião', description: '100 dias consecutivos', emoji: '💎', category: 'consistency', unlocked: false },
  { id: 'total_10', name: 'Dez fortes', description: '10 treinos totais', emoji: '💪', category: 'consistency', unlocked: false },
  { id: 'total_50', name: 'Cinquentão', description: '50 treinos totais', emoji: '🎖️', category: 'consistency', unlocked: false },
  { id: 'total_100', name: 'Centenário', description: '100 treinos totais', emoji: '🏛️', category: 'consistency', unlocked: false },
  { id: 'volume_1t', name: 'Uma tonelada', description: 'Levante 1.000kg em um treino', emoji: '🏋️', category: 'volume', unlocked: false },
  { id: 'volume_10t', name: 'Dez toneladas', description: 'Volume total de 10.000kg', emoji: '🚂', category: 'volume', unlocked: false },
  { id: 'volume_100t', name: 'Centenário de ferro', description: 'Volume total de 100.000kg', emoji: '🌋', category: 'volume', unlocked: false },
  { id: 'first_pr', name: 'Primeiro PR', description: 'Bata seu primeiro recorde pessoal', emoji: '🥇', category: 'pr', unlocked: false },
  { id: 'pr_5', name: 'Recordista', description: '5 PRs batidos', emoji: '🏅', category: 'pr', unlocked: false },
  { id: 'pr_20', name: 'Máquina de recordes', description: '20 PRs batidos', emoji: '🤖', category: 'pr', unlocked: false },
  { id: 'nutrition_first', name: 'Consciência nutricional', description: 'Registre sua primeira refeição', emoji: '🥗', category: 'nutrition', unlocked: false },
  { id: 'nutrition_week', name: 'Semana nutritiva', description: 'Registre refeições por 7 dias', emoji: '📊', category: 'nutrition', unlocked: false },
  { id: 'checkin_first', name: 'Primeiro check-in', description: 'Complete seu primeiro check-in diário', emoji: '✅', category: 'recovery', unlocked: false },
  { id: 'checkin_30', name: 'Mestre do check-in', description: '30 check-ins completos', emoji: '🧘', category: 'recovery', unlocked: false },
  { id: 'early_bird', name: 'Madrugador', description: 'Complete um treino antes das 7h', emoji: '🌅', category: 'special', unlocked: false },
  { id: 'night_shift', name: 'Turno da noite', description: 'Complete um treino depois das 22h', emoji: '🌙', category: 'special', unlocked: false },
  { id: 'comeback', name: 'Retorno épico', description: 'Volte a treinar após 14 dias parado', emoji: '🔁', category: 'special', unlocked: false },
];

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function loadBadges(): Badge[] {
  const saved = safeRead<Badge[]>(BADGE_KEY, []);
  if (!saved.length) return ALL_BADGES;

  return ALL_BADGES.map(badge => {
    const found = saved.find(item => item.id === badge.id);
    return found ? { ...badge, unlocked: found.unlocked, unlockedAt: found.unlockedAt } : badge;
  });
}

export function unlockBadge(id: string): Badge | null {
  const badges = loadBadges();
  const index = badges.findIndex(badge => badge.id === id && !badge.unlocked);
  if (index === -1) return null;

  badges[index] = { ...badges[index], unlocked: true, unlockedAt: Date.now() };
  localStorage.setItem(BADGE_KEY, JSON.stringify(badges));
  return badges[index];
}

export function evaluateAndUnlockBadges(
  streak: StreakData,
  history: WorkoutHistoryEntry[],
  checkinCount: number,
  prCount: number,
  mealCount: number
): Badge[] {
  const newlyUnlocked: Badge[] = [];
  const tryUnlock = (id: string) => {
    const badge = unlockBadge(id);
    if (badge) newlyUnlocked.push(badge);
  };

  if (streak.totalWorkouts >= 1) tryUnlock('first_workout');
  if (streak.currentStreak >= 3) tryUnlock('streak_3');
  if (streak.currentStreak >= 7) tryUnlock('streak_7');
  if (streak.currentStreak >= 30) tryUnlock('streak_30');
  if (streak.currentStreak >= 100) tryUnlock('streak_100');
  if (streak.totalWorkouts >= 10) tryUnlock('total_10');
  if (streak.totalWorkouts >= 50) tryUnlock('total_50');
  if (streak.totalWorkouts >= 100) tryUnlock('total_100');

  const totalVolume = history.reduce((sum, entry) => sum + entry.totalVolume, 0);
  const maxSessionVolume = history.reduce((max, entry) => Math.max(max, entry.totalVolume), 0);
  if (maxSessionVolume >= 1000) tryUnlock('volume_1t');
  if (totalVolume >= 10000) tryUnlock('volume_10t');
  if (totalVolume >= 100000) tryUnlock('volume_100t');

  if (prCount >= 1) tryUnlock('first_pr');
  if (prCount >= 5) tryUnlock('pr_5');
  if (prCount >= 20) tryUnlock('pr_20');

  if (mealCount >= 1) tryUnlock('nutrition_first');
  if (mealCount >= 7) tryUnlock('nutrition_week');
  if (checkinCount >= 1) tryUnlock('checkin_first');
  if (checkinCount >= 30) tryUnlock('checkin_30');

  return newlyUnlocked;
}
