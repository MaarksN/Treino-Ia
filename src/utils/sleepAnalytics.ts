import { SleepLogEntry } from '../types/recovery';

export function getAverageSleepHours(entries: SleepLogEntry[]) {
  if (!entries.length) return 0;
  return Number((entries.reduce((sum, item) => sum + item.durationHours, 0) / entries.length).toFixed(1));
}

export function getSleepTrend(entries: SleepLogEntry[]) {
  const recent = entries.slice(-7);
  const previous = entries.slice(-14, -7);
  const delta = getAverageSleepHours(recent) - getAverageSleepHours(previous);

  if (delta > 0.4) return 'subindo';
  if (delta < -0.4) return 'caindo';
  return 'estavel';
}
