import { StreakData } from '../types';

const STREAK_KEY = '@TreinoApp:streak';

type StoredStreak = Partial<StreakData> & {
  count?: number;
  lastDate?: string | null;
};

function normalizeDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

function persistStreak(data: StreakData) {
  localStorage.setItem(STREAK_KEY, JSON.stringify({
    ...data,
    count: data.currentStreak,
    lastDate: data.lastWorkoutDate ? new Date(`${data.lastWorkoutDate}T00:00:00`).toDateString() : null,
  }));
}

export function loadStreak(): StreakData {
  const fallback: StreakData = {
    currentStreak: 0,
    longestStreak: 0,
    lastWorkoutDate: null,
    totalWorkouts: 0,
    workoutDates: [],
  };

  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as StoredStreak;
    const workoutDates = Array.isArray(parsed.workoutDates)
      ? parsed.workoutDates
      : normalizeDate(parsed.lastDate)
        ? [normalizeDate(parsed.lastDate)!]
        : [];

    return {
      currentStreak: parsed.currentStreak ?? parsed.count ?? 0,
      longestStreak: parsed.longestStreak ?? parsed.count ?? 0,
      lastWorkoutDate: parsed.lastWorkoutDate ?? normalizeDate(parsed.lastDate),
      totalWorkouts: parsed.totalWorkouts ?? workoutDates.length,
      workoutDates,
    };
  } catch {
    return fallback;
  }
}

export function recordWorkoutForStreak(): StreakData {
  const data = loadStreak();
  const today = new Date().toISOString().slice(0, 10);

  if (data.workoutDates.includes(today)) return data;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  const isConsecutive = data.lastWorkoutDate === yesterdayStr || data.lastWorkoutDate === today;
  const currentStreak = isConsecutive ? data.currentStreak + 1 : 1;

  const updated: StreakData = {
    currentStreak,
    longestStreak: Math.max(data.longestStreak, currentStreak),
    lastWorkoutDate: today,
    totalWorkouts: data.totalWorkouts + 1,
    workoutDates: [...data.workoutDates, today],
  };

  persistStreak(updated);
  return updated;
}

export function getDaysSinceLastWorkout(streak: StreakData): number {
  if (!streak.lastWorkoutDate) return Infinity;
  const last = new Date(`${streak.lastWorkoutDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - last.getTime()) / 86400000);
}
