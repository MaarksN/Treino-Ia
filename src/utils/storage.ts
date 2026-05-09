export const STORAGE_KEYS = {
  user: '@TreinoApp:user',
  plans: '@TreinoApp:plans',
  history: '@TreinoApp:history',
  sessions: '@TreinoApp:sessions',
  streak: '@TreinoApp:streak',
  profile: '@TreinoApp:profile',
  recovery: '@TreinoApp:recovery',
  theme: '@TreinoApp:theme',
};

export interface WorkoutStreak {
  count: number;
  lastDate: string | null;
}

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

export function getJSON<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function setJSON<T>(key: string, value: T) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function updateWorkoutStreak(): WorkoutStreak {
  const today = new Date().toDateString();
  const current = getJSON<WorkoutStreak>(STORAGE_KEYS.streak, { count: 0, lastDate: null });

  if (current.lastDate === today) return current;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const next =
    current.lastDate === yesterday.toDateString()
      ? { count: current.count + 1, lastDate: today }
      : { count: 1, lastDate: today };

  setJSON(STORAGE_KEYS.streak, next);
  return next;
}
