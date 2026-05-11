import { Exercise, MuscleGroupVolume, UserProfile, WeeklyStats, WorkoutHistoryEntry, WorkoutHistoryRecord, WorkoutPlan } from '../types';

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

function getLoggedExerciseVolume(exercise: Exercise) {
  const setLogVolume = (exercise.setLogs || []).reduce(
    (sum, log) => sum + (log.weight || 0) * (log.reps || 0),
    0
  );

  if (setLogVolume > 0) return setLogVolume;

  const reps = Number(String(exercise.actualReps || exercise.reps).match(/\d+/)?.[0] || 0);
  return (exercise.actualWeight || 0) * reps * exercise.sets;
}

function getExerciseRpeValues(exercise: Exercise) {
  const setRpes = (exercise.setLogs || [])
    .map(log => log.rpe)
    .filter((value): value is number => Number.isFinite(value));

  if (setRpes.length) return setRpes;
  return Number.isFinite(exercise.rpe) && exercise.rpe ? [exercise.rpe] : [];
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

function getWeekWindow(weekOffset: number) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - weekOffset * 7 - start.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    start,
    end,
    startStr: start.toISOString().slice(0, 10),
    endStr: end.toISOString().slice(0, 10),
    label: `Sem ${getWeekNumber(start)}`,
  };
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

export interface WeeklyMuscleGroupVolume {
  weekLabel: string;
  totalVolume: number;
  groups: Record<string, number>;
}

export function getWeeklyMuscleGroupVolume(records: WorkoutHistoryRecord[], weeksBack = 8): WeeklyMuscleGroupVolume[] {
  const weeks = Array.from({ length: weeksBack }, (_, index) => getWeekWindow(weeksBack - 1 - index));

  return weeks.map(week => {
    const groups: Record<string, number> = {};
    records
      .filter(record => {
        const date = new Date(record.date).toISOString().slice(0, 10);
        return date >= week.startStr && date <= week.endStr;
      })
      .forEach(record => {
        record.exercises.forEach(exercise => {
          const group = exercise.muscleGroup || record.focus || 'Outros';
          groups[group] = (groups[group] || 0) + getLoggedExerciseVolume(exercise);
        });
      });

    return {
      weekLabel: week.label,
      groups,
      totalVolume: Object.values(groups).reduce((sum, volume) => sum + volume, 0),
    };
  });
}

export function getTopWeeklyMuscleGroups(points: WeeklyMuscleGroupVolume[], limit = 5): string[] {
  const totals: Record<string, number> = {};
  points.forEach(point => {
    Object.entries(point.groups).forEach(([group, volume]) => {
      totals[group] = (totals[group] || 0) + volume;
    });
  });

  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([group]) => group);
}

export interface WeeklyRpeTrend {
  weekLabel: string;
  avgRpe: number;
  samples: number;
}

export function getWeeklyAverageRpe(records: WorkoutHistoryRecord[], weeksBack = 8): WeeklyRpeTrend[] {
  const weeks = Array.from({ length: weeksBack }, (_, index) => getWeekWindow(weeksBack - 1 - index));

  return weeks.map(week => {
    const values = records
      .filter(record => {
        const date = new Date(record.date).toISOString().slice(0, 10);
        return date >= week.startStr && date <= week.endStr;
      })
      .flatMap(record => record.exercises.flatMap(getExerciseRpeValues));

    return {
      weekLabel: week.label,
      avgRpe: values.length ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)) : 0,
      samples: values.length,
    };
  });
}

export interface WeekOverWeekComparison {
  currentWeekLabel: string;
  previousWeekLabel: string;
  sessionsDelta: number;
  volumeDelta: number;
  adherenceDelta: number;
  rpeDelta: number;
  current: {
    sessions: number;
    totalVolume: number;
    adherence: number;
    avgRpe: number;
  };
  previous: {
    sessions: number;
    totalVolume: number;
    adherence: number;
    avgRpe: number;
  };
}

export function getWeekOverWeekComparison(
  history: WorkoutHistoryEntry[],
  records: WorkoutHistoryRecord[],
  expectedSessions = 3,
): WeekOverWeekComparison {
  const [previousWindow, currentWindow] = [getWeekWindow(1), getWeekWindow(0)];

  const entriesFor = (window: ReturnType<typeof getWeekWindow>) =>
    history.filter(entry => entry.date >= window.startStr && entry.date <= window.endStr);
  const recordsFor = (window: ReturnType<typeof getWeekWindow>) =>
    records.filter(record => {
      const date = new Date(record.date).toISOString().slice(0, 10);
      return date >= window.startStr && date <= window.endStr;
    });
  const summarize = (window: ReturnType<typeof getWeekWindow>) => {
    const entries = entriesFor(window);
    const rpeValues = recordsFor(window).flatMap(record => record.exercises.flatMap(getExerciseRpeValues));
    const sessions = entries.length;
    const totalVolume = entries.reduce((sum, entry) => sum + entry.totalVolume, 0);
    const adherence = Math.min(sessions / Math.max(1, expectedSessions), 1);
    const avgRpe = rpeValues.length ? Number((rpeValues.reduce((sum, value) => sum + value, 0) / rpeValues.length).toFixed(1)) : 0;

    return { sessions, totalVolume, adherence, avgRpe };
  };
  const current = summarize(currentWindow);
  const previous = summarize(previousWindow);

  return {
    currentWeekLabel: currentWindow.label,
    previousWeekLabel: previousWindow.label,
    sessionsDelta: current.sessions - previous.sessions,
    volumeDelta: current.totalVolume - previous.totalVolume,
    adherenceDelta: Math.round((current.adherence - previous.adherence) * 100),
    rpeDelta: Number((current.avgRpe - previous.avgRpe).toFixed(1)),
    current,
    previous,
  };
}

export interface GoalProgressIndicator {
  label: string;
  value: string;
  detail: string;
  tone: 'good' | 'warning' | 'danger' | 'info';
}

export function getGoalProgressIndicators(
  profile: UserProfile | null | undefined,
  history: WorkoutHistoryEntry[],
  records: WorkoutHistoryRecord[],
): GoalProgressIndicator[] {
  const comparison = getWeekOverWeekComparison(history, records, profile?.daysPerWeek || 3);
  const goal = (profile?.goal || '').toLowerCase();
  const adherencePercent = Math.round(comparison.current.adherence * 100);
  const volumeDirection = comparison.volumeDelta > 0 ? 'subiu' : comparison.volumeDelta < 0 ? 'caiu' : 'manteve';

  if (goal.includes('emag') || goal.includes('perda')) {
    return [
      {
        label: 'Consistência para perda de gordura',
        value: `${adherencePercent}%`,
        detail: adherencePercent >= 80 ? 'Frequência forte para sustentar déficit sem perder treino.' : 'A frequência ainda limita o gasto semanal planejado.',
        tone: adherencePercent >= 80 ? 'good' : adherencePercent >= 50 ? 'warning' : 'danger',
      },
      {
        label: 'Volume como manutenção muscular',
        value: `${Math.round(comparison.current.totalVolume).toLocaleString()}kg`,
        detail: `O volume ${volumeDirection} versus a semana anterior.`,
        tone: comparison.volumeDelta >= 0 ? 'good' : 'warning',
      },
    ];
  }

  if (goal.includes('força')) {
    return [
      {
        label: 'Exposição a carga',
        value: `${Math.round(comparison.current.totalVolume).toLocaleString()}kg`,
        detail: comparison.volumeDelta >= 0 ? 'Carga semanal em progressão.' : 'Carga semanal caiu; verifique fadiga ou faltas.',
        tone: comparison.volumeDelta >= 0 ? 'good' : 'warning',
      },
      {
        label: 'RPE médio',
        value: comparison.current.avgRpe ? comparison.current.avgRpe.toFixed(1) : '-',
        detail: comparison.current.avgRpe >= 8.8 ? 'Intensidade alta; monitore deload.' : 'Intensidade controlada para acumular prática.',
        tone: comparison.current.avgRpe >= 9 ? 'danger' : comparison.current.avgRpe >= 8 ? 'warning' : 'info',
      },
    ];
  }

  return [
    {
      label: 'Sinal de hipertrofia',
      value: `${Math.round(comparison.current.totalVolume).toLocaleString()}kg`,
      detail: comparison.volumeDelta >= 0 ? 'Volume semanal sustentado ou crescente.' : 'Volume caiu; pode reduzir estímulo de recomposição.',
      tone: comparison.volumeDelta >= 0 ? 'good' : 'warning',
    },
    {
      label: 'Aderência ao plano',
      value: `${adherencePercent}%`,
      detail: adherencePercent >= 75 ? 'Boa base para evolução contínua.' : 'Ajuste agenda ou número de sessões esperadas.',
      tone: adherencePercent >= 75 ? 'good' : adherencePercent >= 50 ? 'warning' : 'danger',
    },
  ];
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
