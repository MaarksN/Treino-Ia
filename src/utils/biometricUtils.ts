import { HydrationEntry, SleepEntry } from '../types';

export function getTodayHydration(entries: HydrationEntry[]): number {
  const today = new Date().toISOString().slice(0, 10);
  return entries
    .filter(entry => entry.date === today)
    .reduce((sum, entry) => sum + entry.amountMl, 0);
}

export function calcHydrationGoal(weightKg: number, workoutMinutes = 0): number {
  return Math.round(weightKg * 35 + (workoutMinutes / 60) * 500);
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
