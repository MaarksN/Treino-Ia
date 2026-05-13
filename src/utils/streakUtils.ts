import { StreakData } from '../types';

export function loadStreakFromWorkoutDates(workoutDates: string[], nowIso = new Date().toISOString().slice(0, 10)): StreakData {
  const uniqueDates = Array.from(new Set(workoutDates)).sort();
  if (!uniqueDates.length) {
    return { currentStreak: 0, longestStreak: 0, lastWorkoutDate: null, totalWorkouts: 0, workoutDates: [] };
  }

  const best = uniqueDates.reduce((acc, date, index) => {
    if (index === 0) return { best: 1, run: 1, prev: date };
    const prev = new Date(`${acc.prev}T00:00:00`);
    const current = new Date(`${date}T00:00:00`);
    const gap = Math.round((current.getTime() - prev.getTime()) / 86400000);
    const run = gap === 1 ? acc.run + 1 : 1;
    return { best: Math.max(acc.best, run), run, prev: date };
  }, { best: 1, run: 1, prev: uniqueDates[0] });

  const currentStreak = (() => {
    let streak = 0;
    let cursor = new Date(`${nowIso}T00:00:00`);
    const dateSet = new Set(uniqueDates);
    while (dateSet.has(cursor.toISOString().slice(0, 10))) {
      streak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    return streak;
  })();

  return {
    currentStreak,
    longestStreak: best.best,
    lastWorkoutDate: uniqueDates[uniqueDates.length - 1],
    totalWorkouts: uniqueDates.length,
    workoutDates: uniqueDates,
  };
}

export function loadStreak(): StreakData {
  return { currentStreak: 0, longestStreak: 0, lastWorkoutDate: null, totalWorkouts: 0, workoutDates: [] };
}

export function recordWorkoutForStreak(existing: StreakData, workoutDateIso: string): StreakData {
  return loadStreakFromWorkoutDates([...existing.workoutDates, workoutDateIso], workoutDateIso);
}

export function getDaysSinceLastWorkout(streak: StreakData): number {
  if (!streak.lastWorkoutDate) return Infinity;
  const last = new Date(`${streak.lastWorkoutDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - last.getTime()) / 86400000);
}
