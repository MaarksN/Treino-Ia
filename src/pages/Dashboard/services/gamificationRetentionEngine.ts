import { type UserProfile, type WorkoutSession } from '../../../services/database';

const DAY_MS = 86_400_000;
const XP_PER_WORKOUT = 180;
const XP_PER_COMPLETE_WORKOUT = 70;
const XP_PER_FEEDBACK = 25;

export interface ConsistencyLeaderboardEntry {
  id: string;
  label: string;
  rangeLabel: string;
  workouts: number;
  target: number;
  completionRate: number;
  totalVolume: number;
  score: number;
  rank: number;
  isCurrentWeek: boolean;
}

export interface LifestyleBadgeProgress {
  id: string;
  title: string;
  description: string;
  category: 'consistency' | 'recovery' | 'reflection' | 'execution';
  progress: number;
  target: number;
  unit: string;
  percent: number;
  achieved: boolean;
  unlockedAt?: number;
}

export interface StreakFreezeState {
  rawDailyStreak: number;
  protectedDailyStreak: number;
  restDaysAllowance: number;
  freezesUsed: number;
  freezesRemaining: number;
  isProtectedToday: boolean;
  statusLabel: string;
  explanation: string;
}

export interface ProfileTitleState {
  level: number;
  xp: number;
  title: string;
  nextTitle: string | null;
  xpToNextTitle: number;
  progressPercent: number;
}

export interface HiddenDailyMission {
  id: string;
  title: string;
  hiddenTitle: string;
  hint: string;
  rewardLabel: string;
  progress: number;
  target: number;
  unit: string;
  percent: number;
  revealed: boolean;
  completed: boolean;
}

export interface GamificationRetentionState {
  profileTitle: ProfileTitleState;
  leaderboard: ConsistencyLeaderboardEntry[];
  badges: LifestyleBadgeProgress[];
  freeze: StreakFreezeState;
  hiddenMissions: HiddenDailyMission[];
  summary: {
    totalWorkouts: number;
    completeWorkouts: number;
    feedbackCount: number;
    activeDays: number;
    currentWeekWorkouts: number;
  };
}

interface MissionDefinition {
  id: string;
  title: string;
  hiddenTitle: string;
  hint: string;
  rewardLabel: string;
  target: (input: MissionInput) => number;
  progress: (input: MissionInput) => number;
  unit: string;
}

interface MissionInput {
  profile: UserProfile;
  history: WorkoutSession[];
  today: Date;
  todaySessions: WorkoutSession[];
  currentWeekSessions: WorkoutSession[];
}

const TITLE_TIERS = [
  { level: 1, title: 'Recruta da Forja' },
  { level: 3, title: 'Atleta em Chamas' },
  { level: 6, title: 'Disciplina de Aco' },
  { level: 10, title: 'Guardiao da Sequencia' },
  { level: 15, title: 'Mestre da Rotina' },
  { level: 20, title: 'Guardiao da Forja' },
];

const HIDDEN_MISSION_DEFINITIONS: MissionDefinition[] = [
  {
    id: 'daily_feedback',
    title: 'Diario pos-treino',
    hiddenTitle: 'Missao escondida',
    hint: 'Finalize um treino hoje e deixe uma nota curta sobre como foi.',
    rewardLabel: '+25 XP de reflexao',
    target: () => 1,
    progress: ({ todaySessions }) => todaySessions.filter(hasFeedback).length,
    unit: 'nota',
  },
  {
    id: 'clean_execution',
    title: 'Execucao limpa',
    hiddenTitle: 'Missao escondida',
    hint: 'Complete todos os exercicios de uma sessao hoje.',
    rewardLabel: '+40 XP de execucao',
    target: () => 1,
    progress: ({ todaySessions }) => todaySessions.filter(isCompleteSession).length,
    unit: 'treino',
  },
  {
    id: 'rpe_trace',
    title: 'RPE rastreado',
    hiddenTitle: 'Missao escondida',
    hint: 'Registre RPE em pelo menos 5 series hoje.',
    rewardLabel: '+30 XP tecnico',
    target: () => 5,
    progress: ({ todaySessions }) => todaySessions.reduce((sum, session) => (
      sum + session.exercises.reduce((exerciseSum, exercise) => (
        exerciseSum + (exercise.sets ?? []).filter(set => Number(set.rpe) > 0).length
      ), 0)
    ), 0),
    unit: 'series',
  },
  {
    id: 'weekly_step',
    title: 'Passo da semana',
    hiddenTitle: 'Missao escondida',
    hint: 'Some mais um dia ativo rumo a meta semanal.',
    rewardLabel: '+35 XP de consistencia',
    target: ({ profile }) => Math.max(1, profile.daysPerWeek),
    progress: ({ currentWeekSessions }) => uniqueDateKeys(currentWeekSessions.map(session => session.completedAt)).length,
    unit: 'dias',
  },
  {
    id: 'return_signal',
    title: 'Retorno sem drama',
    hiddenTitle: 'Missao escondida',
    hint: 'Se ficou alguns dias parado, um treino simples hoje reativa a rotina.',
    rewardLabel: '+45 XP de retomada',
    target: () => 1,
    progress: ({ todaySessions }) => todaySessions.length > 0 ? 1 : 0,
    unit: 'retorno',
  },
];

export function buildGamificationRetentionState(
  profile: UserProfile,
  history: WorkoutSession[],
  today: Date = new Date(),
): GamificationRetentionState {
  const sortedHistory = sortSessionsNewest(history);
  const currentWeekSessions = getSessionsInWeek(sortedHistory, today);
  const completeWorkouts = sortedHistory.filter(isCompleteSession).length;
  const feedbackCount = sortedHistory.filter(hasFeedback).length;
  const activeDays = uniqueDateKeys(sortedHistory.map(session => session.completedAt)).length;

  return {
    profileTitle: buildProfileTitle(sortedHistory),
    leaderboard: buildConsistencyLeaderboard(profile, sortedHistory, today),
    badges: buildLifestyleBadges(profile, sortedHistory, today),
    freeze: buildStreakFreezeState(profile, sortedHistory, today),
    hiddenMissions: buildHiddenDailyMissions(profile, sortedHistory, today),
    summary: {
      totalWorkouts: sortedHistory.length,
      completeWorkouts,
      feedbackCount,
      activeDays,
      currentWeekWorkouts: uniqueDateKeys(currentWeekSessions.map(session => session.completedAt)).length,
    },
  };
}

export function buildConsistencyLeaderboard(
  profile: UserProfile,
  history: WorkoutSession[],
  today: Date = new Date(),
): ConsistencyLeaderboardEntry[] {
  const target = Math.max(1, profile.daysPerWeek);
  const weeks = new Map<string, WorkoutSession[]>();
  const currentWeekStart = getWeekStart(today);
  weeks.set(formatDateKey(currentWeekStart), []);

  history.forEach(session => {
    const weekStart = getWeekStart(new Date(session.completedAt));
    const key = formatDateKey(weekStart);
    weeks.set(key, [...(weeks.get(key) ?? []), session]);
  });

  const entries = Array.from(weeks.entries()).map(([weekKey, sessions]) => {
    const start = parseDateKey(weekKey);
    const end = addDays(start, 6);
    const activeDays = uniqueDateKeys(sessions.map(session => session.completedAt)).length;
    const completionRate = calculateCompletionRate(sessions);
    const consistencyScore = Math.min(1, activeDays / target) * 76;
    const executionScore = completionRate * 18;
    const returnScore = sessions.length > 0 ? 6 : 0;
    const score = Math.round(consistencyScore + executionScore + returnScore);

    return {
      id: weekKey,
      label: sameDate(start, currentWeekStart) ? 'Semana atual' : `Semana de ${formatShortDate(start)}`,
      rangeLabel: `${formatShortDate(start)} - ${formatShortDate(end)}`,
      workouts: activeDays,
      target,
      completionRate,
      totalVolume: sessions.reduce((sum, session) => sum + session.totalVolume, 0),
      score,
      rank: 0,
      isCurrentWeek: sameDate(start, currentWeekStart),
    };
  });

  return entries
    .sort((a, b) => b.score - a.score || b.workouts - a.workouts || b.id.localeCompare(a.id))
    .slice(0, 5)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export function buildLifestyleBadges(
  profile: UserProfile,
  history: WorkoutSession[],
  today: Date = new Date(),
): LifestyleBadgeProgress[] {
  const sorted = sortSessionsOldest(history);
  const currentWeekSessions = getSessionsInWeek(history, today);
  const currentWeekActiveDays = uniqueDateKeys(currentWeekSessions.map(session => session.completedAt)).length;
  const activeDays = uniqueDateKeys(history.map(session => session.completedAt)).length;
  const completeWorkouts = history.filter(isCompleteSession).length;
  const feedbackCount = history.filter(hasFeedback).length;

  return [
    createBadge({
      id: 'first_workout_local',
      title: 'Primeiro treino real',
      description: 'Uma sessao foi finalizada no historico local.',
      category: 'consistency',
      progress: history.length,
      target: 1,
      unit: 'treino',
      unlockedAt: sorted[0]?.completedAt,
    }),
    createBadge({
      id: 'weekly_lifestyle_target',
      title: 'Semana no trilho',
      description: 'Bata a meta semanal configurada na anamnese.',
      category: 'consistency',
      progress: currentWeekActiveDays,
      target: Math.max(1, profile.daysPerWeek),
      unit: 'dias',
      unlockedAt: currentWeekSessions[0]?.completedAt,
    }),
    createBadge({
      id: 'seven_active_days',
      title: '7 dias ativos',
      description: 'Construa um estilo de vida com sete dias de treino registrados.',
      category: 'recovery',
      progress: activeDays,
      target: 7,
      unit: 'dias',
      unlockedAt: sorted[6]?.completedAt,
    }),
    createBadge({
      id: 'ten_workouts_no_gap',
      title: '10 treinos sem sumir',
      description: 'Acumule dez sessoes finalizadas no Dashboard.',
      category: 'consistency',
      progress: history.length,
      target: 10,
      unit: 'treinos',
      unlockedAt: sorted[9]?.completedAt,
    }),
    createBadge({
      id: 'clean_execution_five',
      title: 'Execucao completa',
      description: 'Finalize todos os exercicios em cinco treinos.',
      category: 'execution',
      progress: completeWorkouts,
      target: 5,
      unit: 'treinos',
      unlockedAt: sorted.filter(isCompleteSession)[4]?.completedAt,
    }),
    createBadge({
      id: 'reflection_habit',
      title: 'Check-out consciente',
      description: 'Registre feedback em tres treinos para melhorar a proxima recomendacao.',
      category: 'reflection',
      progress: feedbackCount,
      target: 3,
      unit: 'notas',
      unlockedAt: sorted.filter(hasFeedback)[2]?.completedAt,
    }),
  ];
}

export function buildStreakFreezeState(
  profile: UserProfile,
  history: WorkoutSession[],
  today: Date = new Date(),
): StreakFreezeState {
  const activeKeys = new Set(uniqueDateKeys(history.map(session => session.completedAt)));
  const restDaysAllowance = Math.max(0, 7 - Math.max(1, profile.daysPerWeek));
  const rawDailyStreak = calculateDailyStreak(activeKeys, today, 0).streak;
  const protectedResult = calculateDailyStreak(activeKeys, today, restDaysAllowance);
  const todayKey = formatDateKey(today);
  const yesterdayKey = formatDateKey(addDays(today, -1));
  const isProtectedToday = !activeKeys.has(todayKey)
    && restDaysAllowance > 0
    && (activeKeys.has(yesterdayKey) || protectedResult.streak > rawDailyStreak);
  const freezesUsed = isProtectedToday ? protectedResult.freezesUsed + 1 : protectedResult.freezesUsed;
  const protectedDailyStreak = isProtectedToday ? protectedResult.streak + 1 : protectedResult.streak;
  const freezesRemaining = Math.max(0, restDaysAllowance - freezesUsed);

  return {
    rawDailyStreak,
    protectedDailyStreak,
    restDaysAllowance,
    freezesUsed,
    freezesRemaining,
    isProtectedToday,
    statusLabel: activeKeys.has(todayKey)
      ? 'Streak ativo hoje'
      : isProtectedToday
        ? 'Freeze legitimo protegendo hoje'
        : restDaysAllowance > 0
          ? 'Freeze disponivel quando houver sequencia'
          : 'Sem freeze: plano de alta frequencia',
    explanation: buildFreezeExplanation(profile, freezesUsed, freezesRemaining, isProtectedToday),
  };
}

export function buildProfileTitle(history: WorkoutSession[]): ProfileTitleState {
  const xp = history.reduce((sum, session) => {
    const completionBonus = isCompleteSession(session) ? XP_PER_COMPLETE_WORKOUT : 0;
    const feedbackBonus = hasFeedback(session) ? XP_PER_FEEDBACK : 0;
    return sum + XP_PER_WORKOUT + completionBonus + feedbackBonus;
  }, 0);
  const level = Math.max(1, Math.floor(xp / 300) + 1);
  const currentTier = [...TITLE_TIERS].reverse().find(tier => level >= tier.level) ?? TITLE_TIERS[0];
  const nextTier = TITLE_TIERS.find(tier => tier.level > level) ?? null;
  const currentTierXp = (currentTier.level - 1) * 300;
  const nextTierXp = nextTier ? (nextTier.level - 1) * 300 : currentTierXp;
  const tierSpan = Math.max(1, nextTierXp - currentTierXp);

  return {
    level,
    xp,
    title: currentTier.title,
    nextTitle: nextTier?.title ?? null,
    xpToNextTitle: nextTier ? Math.max(0, nextTierXp - xp) : 0,
    progressPercent: nextTier ? clampPercent(((xp - currentTierXp) / tierSpan) * 100) : 100,
  };
}

export function buildHiddenDailyMissions(
  profile: UserProfile,
  history: WorkoutSession[],
  today: Date = new Date(),
): HiddenDailyMission[] {
  const todaySessions = history.filter(session => sameDate(new Date(session.completedAt), today));
  const currentWeekSessions = getSessionsInWeek(history, today);
  const input: MissionInput = { profile, history, today, todaySessions, currentWeekSessions };
  const offset = getDayOfYear(today) % HIDDEN_MISSION_DEFINITIONS.length;

  return rotate(HIDDEN_MISSION_DEFINITIONS, offset)
    .slice(0, 3)
    .map(definition => {
      const target = Math.max(1, definition.target(input));
      const progress = Math.min(target, definition.progress(input));
      const completed = progress >= target;

      return {
        id: `${definition.id}_${formatDateKey(today)}`,
        title: definition.title,
        hiddenTitle: definition.hiddenTitle,
        hint: definition.hint,
        rewardLabel: definition.rewardLabel,
        progress,
        target,
        unit: definition.unit,
        percent: clampPercent((progress / target) * 100),
        revealed: completed || progress > 0,
        completed,
      };
    });
}

function createBadge(input: Omit<LifestyleBadgeProgress, 'achieved' | 'percent'>): LifestyleBadgeProgress {
  const progress = Math.min(input.progress, input.target);
  const achieved = progress >= input.target;

  return {
    ...input,
    progress,
    achieved,
    percent: clampPercent((progress / input.target) * 100),
    unlockedAt: achieved ? input.unlockedAt : undefined,
  };
}

function calculateDailyStreak(activeKeys: Set<string>, today: Date, freezeAllowance: number) {
  if (!activeKeys.size) return { streak: 0, freezesUsed: 0 };

  const earliest = parseDateKey(Array.from(activeKeys).sort()[0]);
  let cursor = startOfDay(today);
  let streak = 0;
  let freezesUsed = 0;

  while (cursor.getTime() >= earliest.getTime()) {
    const key = formatDateKey(cursor);

    if (activeKeys.has(key)) {
      streak += 1;
      cursor = addDays(cursor, -1);
      continue;
    }

    if (streak > 0 && freezesUsed < freezeAllowance) {
      freezesUsed += 1;
      streak += 1;
      cursor = addDays(cursor, -1);
      continue;
    }

    if (streak === 0 && sameDate(cursor, today) && freezeAllowance === 0) {
      cursor = addDays(cursor, -1);
      continue;
    }

    break;
  }

  return { streak, freezesUsed };
}

function buildFreezeExplanation(
  profile: UserProfile,
  freezesUsed: number,
  freezesRemaining: number,
  isProtectedToday: boolean,
) {
  if (profile.daysPerWeek >= 7) {
    return 'Seu plano marca treino todos os dias, entao nao ha descanso planejado para converter em freeze.';
  }

  if (isProtectedToday) {
    return `Dia de descanso legitimo: ${freezesUsed} freeze usado e ${freezesRemaining} ainda disponivel nesta sequencia.`;
  }

  return `Seu plano permite ${Math.max(0, 7 - profile.daysPerWeek)} dia(s) de descanso por semana sem quebrar a ofensiva local.`;
}

function calculateCompletionRate(sessions: WorkoutSession[]) {
  const totals = sessions.reduce((acc, session) => ({
    completed: acc.completed + session.completedExercises,
    total: acc.total + session.totalExercises,
  }), { completed: 0, total: 0 });

  if (!totals.total) return 0;
  return totals.completed / totals.total;
}

function isCompleteSession(session: WorkoutSession) {
  return session.totalExercises > 0 && session.completedExercises >= session.totalExercises;
}

function hasFeedback(session: WorkoutSession) {
  return session.feedback.trim().length > 0;
}

function getSessionsInWeek(history: WorkoutSession[], date: Date) {
  const start = getWeekStart(date).getTime();
  const end = addDays(getWeekStart(date), 7).getTime();
  return history.filter(session => session.completedAt >= start && session.completedAt < end);
}

function sortSessionsNewest(history: WorkoutSession[]) {
  return [...history].sort((a, b) => b.completedAt - a.completedAt);
}

function sortSessionsOldest(history: WorkoutSession[]) {
  return [...history].sort((a, b) => a.completedAt - b.completedAt);
}

function rotate<T>(items: T[], offset: number): T[] {
  return [...items.slice(offset), ...items.slice(0, offset)];
}

function uniqueDateKeys(values: Array<number | Date>) {
  return Array.from(new Set(values.map(value => formatDateKey(value instanceof Date ? value : new Date(value))))).sort();
}

function getWeekStart(value: Date) {
  const date = startOfDay(value);
  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  return addDays(date, offset);
}

function getDayOfYear(value: Date) {
  const start = new Date(value.getFullYear(), 0, 0);
  return Math.floor((startOfDay(value).getTime() - start.getTime()) / DAY_MS);
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function addDays(value: Date, days: number) {
  const next = startOfDay(value);
  next.setDate(next.getDate() + days);
  return next;
}

function sameDate(a: Date, b: Date) {
  return formatDateKey(a) === formatDateKey(b);
}

function formatDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatShortDate(value: Date) {
  return value.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
