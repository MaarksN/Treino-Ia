import {
  HabitEventType,
  QuickWorkoutPlan,
  QuickWorkoutSuggestionInput,
  ReminderSchedule,
  RetentionChallenge,
  RetentionHabitEvent,
  RetentionMetrics,
  RetentionProfile,
  RetentionStreak,
} from '../types/retention';

const DAY_MS = 86_400_000;

const WORKOUT_EVENT_TYPES: HabitEventType[] = [
  'workout_completed',
  'alternative_workout_completed',
];

function toUtcDate(value: string | Date): Date {
  const source = value instanceof Date ? value : new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
  return new Date(Date.UTC(source.getUTCFullYear(), source.getUTCMonth(), source.getUTCDate()));
}

export function normalizeIsoDate(value: string | Date): string {
  return toUtcDate(value).toISOString().slice(0, 10);
}

export function getWeekStartIso(value: string | Date): string {
  const date = toUtcDate(value);
  const day = date.getUTCDay();
  const offset = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + offset);
  return normalizeIsoDate(date);
}

export function uniqueSortedDates(dates: Array<string | Date>): string[] {
  return Array.from(new Set(dates.map(normalizeIsoDate))).sort();
}

export function calculateDailyStreak(dates: Array<string | Date>, today: string | Date = new Date()): number {
  const available = new Set(uniqueSortedDates(dates));
  let cursor = toUtcDate(today);
  let count = 0;

  while (available.has(normalizeIsoDate(cursor))) {
    count += 1;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }

  return count;
}

export function calculateBestDailyStreak(dates: Array<string | Date>): number {
  const sorted = uniqueSortedDates(dates);
  let best = 0;
  let current = 0;
  let previous: Date | null = null;

  sorted.forEach(dateValue => {
    const currentDate = toUtcDate(dateValue);
    const consecutive = previous
      ? currentDate.getTime() - previous.getTime() === DAY_MS
      : false;

    current = consecutive ? current + 1 : 1;
    best = Math.max(best, current);
    previous = currentDate;
  });

  return best;
}

export function calculateWeeklyStreak(dates: Array<string | Date>, today: string | Date = new Date()): number {
  const weekStarts = new Set(uniqueSortedDates(dates).map(getWeekStartIso));
  let cursor = toUtcDate(getWeekStartIso(today));
  let count = 0;

  while (weekStarts.has(normalizeIsoDate(cursor))) {
    count += 1;
    cursor = new Date(cursor.getTime() - 7 * DAY_MS);
  }

  return count;
}

export function calculateBestWeeklyStreak(dates: Array<string | Date>): number {
  const sortedWeeks = uniqueSortedDates(dates).map(getWeekStartIso);
  const uniqueWeeks = Array.from(new Set(sortedWeeks)).sort();
  let best = 0;
  let current = 0;
  let previous: Date | null = null;

  uniqueWeeks.forEach(weekValue => {
    const currentWeek = toUtcDate(weekValue);
    const consecutive = previous
      ? currentWeek.getTime() - previous.getTime() === 7 * DAY_MS
      : false;

    current = consecutive ? current + 1 : 1;
    best = Math.max(best, current);
    previous = currentWeek;
  });

  return best;
}

export function getInactiveDays(lastDate?: string | null, today: string | Date = new Date()): number | null {
  if (!lastDate) return null;
  const diff = toUtcDate(today).getTime() - toUtcDate(lastDate).getTime();
  return Math.max(0, Math.floor(diff / DAY_MS));
}

export function buildRetentionStreakFromEvents(
  userId: string,
  events: RetentionHabitEvent[],
  today: string | Date = new Date(),
): RetentionStreak {
  const workoutDates = events
    .filter(event => WORKOUT_EVENT_TYPES.includes(event.event_type))
    .map(event => event.event_date);
  const lastActivityDate = uniqueSortedDates(workoutDates).at(-1) ?? null;
  const todayIso = normalizeIsoDate(today);
  const weekStart = getWeekStartIso(today);
  const workoutsThisWeek = workoutDates.filter(date => getWeekStartIso(date) === weekStart).length;

  return {
    user_id: userId,
    daily_streak: calculateDailyStreak(workoutDates, todayIso),
    weekly_streak: calculateWeeklyStreak(workoutDates, todayIso),
    best_daily_streak: calculateBestDailyStreak(workoutDates),
    best_weekly_streak: calculateBestWeeklyStreak(workoutDates),
    last_activity_date: lastActivityDate,
    active_week_start: weekStart,
    weekly_workouts: workoutsThisWeek,
    updated_at: new Date().toISOString(),
  };
}

export function attachChallengeProgress(
  challenges: RetentionChallenge[],
  events: RetentionHabitEvent[],
): RetentionChallenge[] {
  const workoutDates = uniqueSortedDates(
    events
      .filter(event => WORKOUT_EVENT_TYPES.includes(event.event_type))
      .map(event => event.event_date),
  );

  return challenges.map(challenge => {
    const progress = workoutDates.filter(date => (
      date >= challenge.starts_on && date <= challenge.ends_on
    )).length;

    return {
      ...challenge,
      progress: Math.min(progress, challenge.target_days),
      status: progress >= challenge.target_days && challenge.status === 'active'
        ? 'completed'
        : challenge.status,
    };
  });
}

export function buildRetentionMetrics(
  profile: RetentionProfile,
  streak: RetentionStreak,
  events: RetentionHabitEvent[],
  challenges: RetentionChallenge[],
  badgeCount: number,
  today: string | Date = new Date(),
): RetentionMetrics {
  const todayIso = normalizeIsoDate(today);
  const weekStart = getWeekStartIso(todayIso);
  const weekEvents = events.filter(event => event.event_date >= weekStart && event.event_date <= todayIso);
  const todayHydration = events
    .filter(event => event.event_type === 'hydration_logged' && event.event_date === todayIso)
    .reduce((sum, event) => sum + Number(event.amount ?? 0), 0);
  const sleepEvents = events
    .filter(event => event.event_type === 'sleep_logged' && Number(event.amount ?? 0) > 0)
    .slice(0, 7);
  const activeChallenges = challenges.filter(challenge => challenge.status === 'active').length;
  const completedChallenges = challenges.filter(challenge => challenge.status === 'completed').length;

  return {
    dailyStreak: streak.daily_streak,
    weeklyStreak: streak.weekly_streak,
    bestDailyStreak: streak.best_daily_streak,
    bestWeeklyStreak: streak.best_weekly_streak,
    workoutsThisWeek: weekEvents.filter(event => WORKOUT_EVENT_TYPES.includes(event.event_type)).length,
    checkinsThisWeek: weekEvents.filter(event => event.event_type === 'checkin_completed').length,
    hydrationTodayMl: todayHydration,
    sleepAverageMinutes: sleepEvents.length
      ? Math.round(sleepEvents.reduce((sum, event) => sum + Number(event.amount ?? 0), 0) / sleepEvents.length)
      : 0,
    activeChallenges,
    completedChallenges,
    unlockedBadges: badgeCount,
    inactiveDays: getInactiveDays(streak.last_activity_date, todayIso),
  };
}

export function validateReminderSchedule(type: string, schedule: ReminderSchedule): void {
  if (schedule.time && !/^\d{2}:\d{2}$/.test(schedule.time)) {
    throw new Error('Horário do lembrete inválido.');
  }

  if (schedule.daysOfWeek?.some(day => day < 0 || day > 6 || !Number.isInteger(day))) {
    throw new Error('Dias do lembrete devem estar entre 0 e 6.');
  }

  if (type === 'hydration' && schedule.everyMinutes !== undefined && schedule.everyMinutes < 15) {
    throw new Error('Lembrete de hidratação precisa ter intervalo mínimo de 15 minutos.');
  }

  if (type === 'reactivation' && schedule.inactivityDays !== undefined && schedule.inactivityDays < 2) {
    throw new Error('Reativação automática deve aguardar pelo menos 2 dias de inatividade.');
  }
}

export function buildQuickWorkoutPlan(input: QuickWorkoutSuggestionInput): QuickWorkoutPlan {
  const duration = Math.max(8, Math.min(45, Math.round(input.durationMinutes)));
  const goal = String(input.goal || '').toLowerCase();
  const location = String(input.location || '').toLowerCase();
  const bodyweight = location.includes('casa') || location.includes('home') || location.includes('sem equipamento');
  const focus = goal.includes('força')
    ? 'Força técnica'
    : goal.includes('emag') || goal.includes('condicion')
      ? 'Condicionamento'
      : 'Hipertrofia compacta';
  const intensity: QuickWorkoutPlan['intensity'] = duration <= 15 ? 'moderate' : 'high';
  const exercises = bodyweight
    ? ['Agachamento livre', 'Flexão inclinada', 'Remada com mochila', 'Ponte de glúteo', 'Prancha']
    : focus === 'Força técnica'
      ? ['Agachamento goblet', 'Supino com halteres', 'Remada baixa', 'Levantamento terra romeno', 'Farmer walk']
      : focus === 'Condicionamento'
        ? ['Bike ou esteira intervalada', 'Kettlebell swing', 'Remada curvada', 'Avanço alternado', 'Prancha dinâmica']
        : ['Leg press', 'Supino máquina', 'Puxada alta', 'Desenvolvimento halteres', 'Rosca + tríceps corda'];

  return {
    title: `Treino alternativo ${duration}min`,
    durationMinutes: duration,
    focus,
    intensity,
    exercises: exercises.slice(0, duration <= 15 ? 4 : 5),
    reason: input.reason,
  };
}
