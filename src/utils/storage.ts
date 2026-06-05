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

import { CURRENT_STORAGE_VERSION, StorageEnvelope } from './storageSchema';
import { migrateStorage } from './migrations';

let hasMigrated = false;

function ensureMigration() {
  if (typeof window === 'undefined') return;
  if (!hasMigrated) {
    migrateStorage();
    hasMigrated = true;
  }
}

export function getJSON<T>(key: string, fallback: T): T {
  ensureMigration();
  if (!canUseStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);

    // Suporte para nova estrutura com envelope
    if (parsed && typeof parsed === 'object' && 'version' in parsed && 'data' in parsed) {
      return (parsed as StorageEnvelope<T>).data;
    }

    // Suporte legado
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function setJSON<T>(key: string, value: T) {
  ensureMigration();
  if (!canUseStorage()) return;

  const envelope: StorageEnvelope<T> = {
    version: CURRENT_STORAGE_VERSION,
    updatedAt: new Date().toISOString(),
    data: value,
  };

  try {
    window.localStorage.setItem(key, JSON.stringify(envelope));
  } catch (error) {
    console.warn(`Erro ao salvar no localStorage [${key}]:`, error);
  }
}

export function updateWorkoutStreak(): WorkoutStreak {
  const today = new Date().toDateString();
  const current = getJSON<WorkoutStreak>(STORAGE_KEYS.streak, { count: 0, lastDate: null });
  const currentCount = current.count ?? current.currentStreak ?? 0;
  const currentLastDate =
    current.lastDate ||
    (current.lastWorkoutDate
      ? new Date(`${current.lastWorkoutDate}T00:00:00`).toDateString()
      : null);

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
    ? (current.totalWorkouts ?? current.workoutDates.length)
    : (current.totalWorkouts ?? current.workoutDates?.length ?? 0) + 1;
  next.workoutDates = current.workoutDates?.includes(isoToday)
    ? current.workoutDates
    : [...(current.workoutDates || []), isoToday];

  setJSON(STORAGE_KEYS.streak, next);
  return next;
}
