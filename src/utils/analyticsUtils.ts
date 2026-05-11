import { MuscleGroupVolume, WeeklyStats, WorkoutHistoryEntry, WorkoutPlan } from '../types';

const HISTORY_KEY = '@TreinoApp:workoutHistory';

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function loadHistory(): WorkoutHistoryEntry[] {
  return safeRead<WorkoutHistoryEntry[]>(HISTORY_KEY, []);
}

export function saveHistory(history: WorkoutHistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function getExerciseVolume(exercise: WorkoutPlan['days'][number]['exercises'][number]) {
  const setLogVolume = (exercise.setLogs || []).reduce(
    (sum, log) => sum + (log.weight || 0) * (log.reps || 0),
    0
  );

  if (setLogVolume > 0) return setLogVolume;

  const reps = Number(String(exercise.actualReps || exercise.reps).match(/\d+/)?.[0] || 0);
  return (exercise.actualWeight || 0) * reps * exercise.sets;
}

export function recordWorkoutSession(
  plan: WorkoutPlan,
  dayIdx: number,
  durationMinutes?: number,
  readinessScore?: number
): WorkoutHistoryEntry {
  const day = plan.days[dayIdx];
  const exercises = day?.exercises || [];
  const completed = exercises.filter(exercise => exercise.completed);
  const totalVolume = exercises.reduce((sum, exercise) => sum + getExerciseVolume(exercise), 0);
  const prsBroken = exercises
    .filter(exercise => exercise.setLogs?.some(log => log.weight && log.reps) || exercise.actualWeight)
    .map(exercise => exercise.name);

  const entry: WorkoutHistoryEntry = {
    id: crypto.randomUUID(),
    planId: plan.id,
    planName: plan.planName,
    date: new Date().toISOString().slice(0, 10),
    dayFocus: day?.focus || '',
    exerciseCount: exercises.length,
    completedCount: completed.length,
    totalVolume,
    durationMinutes,
    readinessScore,
    prsBroken,
  };

  const history = loadHistory();
  history.push(entry);
  saveHistory(history);
  return entry;
}

export function getWeeklyStats(history: WorkoutHistoryEntry[], weeksBack = 8): WeeklyStats[] {
  const weeks: WeeklyStats[] = [];

  for (let weekOffset = weeksBack - 1; weekOffset >= 0; weekOffset--) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - weekOffset * 7 - start.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);
    const weekEntries = history.filter(entry => entry.date >= startStr && entry.date <= endStr);

    weeks.push({
      weekLabel: `Sem ${getWeekNumber(start)}`,
      sessions: weekEntries.length,
      totalVolume: weekEntries.reduce((sum, entry) => sum + entry.totalVolume, 0),
      avgReadiness: weekEntries.length
        ? weekEntries.reduce((sum, entry) => sum + (entry.readinessScore || 0), 0) / weekEntries.length
        : 0,
      adherence: Math.min(weekEntries.length / 3, 1),
    });
  }

  return weeks;
}

function getWeekNumber(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
}

export function getMuscleGroupVolume(history: WorkoutHistoryEntry[], plans: WorkoutPlan[]): MuscleGroupVolume[] {
  const map: Record<string, { volume: number; sessions: number }> = {};

  history.forEach(entry => {
    const plan = plans.find(item => item.id === entry.planId);
    if (!plan) return;

    plan.days.forEach(day => {
      if (entry.dayFocus && day.focus !== entry.dayFocus) return;

      day.exercises.forEach(exercise => {
        const group = exercise.muscleGroup || 'Outros';
        const volume = getExerciseVolume(exercise);
        if (!map[group]) map[group] = { volume: 0, sessions: 0 };
        map[group].volume += volume;
        map[group].sessions += 1;
      });
    });
  });

  return Object.entries(map)
    .map(([group, data]) => ({ group, ...data }))
    .sort((a, b) => b.volume - a.volume);
}

export function getAdherenceRate(history: WorkoutHistoryEntry[], days = 30): number {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().slice(0, 10);
  const recent = history.filter(entry => entry.date >= sinceStr);
  return Math.min((recent.length / ((days / 7) * 3)) * 100, 100);
}

export function getTotalVolumeLifted(history: WorkoutHistoryEntry[]): number {
  return history.reduce((sum, entry) => sum + entry.totalVolume, 0);
}

export function getAvgSessionDuration(history: WorkoutHistoryEntry[]): number {
  const withDuration = history.filter(entry => entry.durationMinutes);
  if (!withDuration.length) return 0;
  return Math.round(withDuration.reduce((sum, entry) => sum + (entry.durationMinutes || 0), 0) / withDuration.length);
}
