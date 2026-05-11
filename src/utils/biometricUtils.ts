import { HydrationEntry, HydrationGoal, SleepEntry } from '../types';

const HYDRATION_KEY = '@TreinoApp:hydration';
const HYDRO_GOAL_KEY = '@TreinoApp:hydrationGoal';
const SLEEP_KEY = '@TreinoApp:sleep';

export function loadHydrationEntries(): HydrationEntry[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(HYDRATION_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHydrationEntry(entry: HydrationEntry) {
  const all = loadHydrationEntries();
  all.push(entry);
  localStorage.setItem(HYDRATION_KEY, JSON.stringify(all.slice(-300)));
}

export function loadHydrationGoal(): HydrationGoal {
  try {
    return { dailyMl: 2500, remindEveryMinutes: 60, ...JSON.parse(localStorage.getItem(HYDRO_GOAL_KEY) || '{}') };
  } catch {
    return { dailyMl: 2500, remindEveryMinutes: 60 };
  }
}

export function saveHydrationGoal(goal: HydrationGoal) {
  localStorage.setItem(HYDRO_GOAL_KEY, JSON.stringify(goal));
}

export function getTodayHydration(entries: HydrationEntry[]): number {
  const today = new Date().toISOString().slice(0, 10);
  return entries
    .filter(entry => entry.date === today)
    .reduce((sum, entry) => sum + entry.amountMl, 0);
}

export function calcHydrationGoal(weightKg: number, workoutMinutes = 0): number {
  return Math.round(weightKg * 35 + (workoutMinutes / 60) * 500);
}

export function loadSleepEntries(): SleepEntry[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(SLEEP_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSleepEntry(entry: SleepEntry) {
  const all = loadSleepEntries();
  const existing = all.findIndex(item => item.date === entry.date);
  if (existing >= 0) all[existing] = entry;
  else all.push(entry);
  localStorage.setItem(SLEEP_KEY, JSON.stringify(all.slice(-120)));
}

export function calcSleepDuration(bedtime: string, wakeTime: string): number {
  const [bedHour, bedMinute] = bedtime.split(':').map(Number);
  const [wakeHour, wakeMinute] = wakeTime.split(':').map(Number);

  if ([bedHour, bedMinute, wakeHour, wakeMinute].some(value => Number.isNaN(value))) {
    return 0;
  }

  let bedMinutes = bedHour * 60 + bedMinute;
  const wakeMinutes = wakeHour * 60 + wakeMinute;
  if (wakeMinutes <= bedMinutes) bedMinutes -= 24 * 60;
  return Math.max(0, wakeMinutes - bedMinutes);
}

export function getSleepQualityLabel(quality: 1 | 2 | 3 | 4 | 5): string {
  return ['Muito ruim', 'Ruim', 'Regular', 'Bom', 'Excelente'][quality - 1];
}

export function getSleepQualityColor(quality: number): string {
  return ['#ef4444', '#f97316', '#fbbf24', '#34d399', '#a3e635'][quality - 1] || '#6b7280';
}

export function getAvgSleepQuality(entries: SleepEntry[], days = 7): number {
  const recent = entries.slice(-days);
  if (!recent.length) return 0;
  return recent.reduce((sum, entry) => sum + entry.quality, 0) / recent.length;
}

export function getAvgSleepDuration(entries: SleepEntry[], days = 7): number {
  const recent = entries.slice(-days);
  if (!recent.length) return 0;
  return Math.round(recent.reduce((sum, entry) => sum + entry.durationMinutes, 0) / recent.length);
}
