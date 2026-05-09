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
  currentStreak?: number;
  longestStreak?: number;
  lastWorkoutDate?: string | null;
  totalWorkouts?: number;
  workoutDates?: string[];
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
  const currentCount = current.count ?? current.currentStreak ?? 0;
  const currentLastDate = current.lastDate || (current.lastWorkoutDate ? new Date(`${current.lastWorkoutDate}T00:00:00`).toDateString() : null);

  if (currentLastDate === today) {
    return { ...current, count: currentCount, lastDate: currentLastDate };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const next =
    currentLastDate === yesterday.toDateString()
      ? { ...current, count: currentCount + 1, lastDate: today }
      : { ...current, count: 1, lastDate: today };

  const isoToday = new Date().toISOString().slice(0, 10);
  next.currentStreak = next.count;
  next.longestStreak = Math.max(current.longestStreak ?? 0, next.count);
  next.lastWorkoutDate = isoToday;
  next.totalWorkouts = current.workoutDates?.includes(isoToday)
    ? current.totalWorkouts ?? current.workoutDates.length
    : (current.totalWorkouts ?? current.workoutDates?.length ?? 0) + 1;
  next.workoutDates = current.workoutDates?.includes(isoToday)
    ? current.workoutDates
    : [...(current.workoutDates || []), isoToday];

  setJSON(STORAGE_KEYS.streak, next);
  return next;
}
