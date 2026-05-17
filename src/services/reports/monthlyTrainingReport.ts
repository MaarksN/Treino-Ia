import { type WorkoutSession } from '../database';

export interface MonthlyTrainingReport {
  month: string;
  sessions: number;
  totalVolume: number;
  averageDurationMinutes: number;
  highlights: string[];
}

export type TrainingReportPeriod = 'month' | 'year';

export interface TrainingPeriodReport {
  period: TrainingReportPeriod;
  label: string;
  sessions: number;
  totalVolume: number;
  averageDurationMinutes: number;
  totalDurationMinutes: number;
  completionRate: number;
  topFocus: string;
  activeDays: number;
  highlights: string[];
}

export function buildMonthlyTrainingReport(month: string, sessions: WorkoutSession[]): MonthlyTrainingReport {
  const totalVolume = sessions.reduce((sum, session) => sum + session.totalVolume, 0);
  const averageDurationMinutes = sessions.length
    ? Math.round(sessions.reduce((sum, session) => sum + session.durationMinutes, 0) / sessions.length)
    : 0;

  const highlights = [
    sessions.length >= 12 ? 'Consistência mensal elevada.' : 'Consistência em construção.',
    totalVolume > 0 ? `Volume total: ${Math.round(totalVolume)} kg.` : 'Sem volume registrado.',
  ];

  return { month, sessions: sessions.length, totalVolume, averageDurationMinutes, highlights };
}

function isSameMonth(date: Date, reference: Date) {
  return date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth();
}

function isSameYear(date: Date, reference: Date) {
  return date.getFullYear() === reference.getFullYear();
}

function formatPeriodLabel(period: TrainingReportPeriod, reference: Date) {
  if (period === 'year') return String(reference.getFullYear());

  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(reference);
}

export function filterWorkoutSessionsByPeriod(
  sessions: WorkoutSession[],
  period: TrainingReportPeriod,
  reference = new Date()
) {
  return sessions.filter(session => {
    const date = new Date(session.completedAt);
    return period === 'month' ? isSameMonth(date, reference) : isSameYear(date, reference);
  });
}

export function buildTrainingPeriodReport(
  period: TrainingReportPeriod,
  sessions: WorkoutSession[],
  reference = new Date()
): TrainingPeriodReport {
  const scopedSessions = filterWorkoutSessionsByPeriod(sessions, period, reference);
  const totalVolume = scopedSessions.reduce((sum, session) => sum + session.totalVolume, 0);
  const totalDurationMinutes = scopedSessions.reduce((sum, session) => sum + session.durationMinutes, 0);
  const averageDurationMinutes = scopedSessions.length
    ? Math.round(totalDurationMinutes / scopedSessions.length)
    : 0;
  const completionRate = scopedSessions.length
    ? Math.round(
        scopedSessions.reduce((sum, session) => {
          if (!session.totalExercises) return sum;
          return sum + (session.completedExercises / session.totalExercises) * 100;
        }, 0) / scopedSessions.length
      )
    : 0;

  const focusCounts = scopedSessions.reduce<Record<string, number>>((acc, session) => {
    acc[session.focus] = (acc[session.focus] ?? 0) + 1;
    return acc;
  }, {});
  const topFocus = Object.entries(focusCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Sem foco dominante';
  const activeDays = new Set(scopedSessions.map(session => new Date(session.completedAt).toDateString())).size;

  const highlights = scopedSessions.length
    ? [
        `${scopedSessions.length} sessoes registradas em ${formatPeriodLabel(period, reference)}.`,
        `Volume total de ${Math.round(totalVolume).toLocaleString('pt-BR')} kg.`,
        completionRate >= 85
          ? `Aderencia alta: ${completionRate}% dos exercicios concluidos.`
          : `Aderencia em construcao: ${completionRate}% dos exercicios concluidos.`,
      ]
    : [
        `Sem sessoes finalizadas em ${formatPeriodLabel(period, reference)}.`,
        'Finalize treinos para alimentar o relatorio.',
      ];

  return {
    period,
    label: formatPeriodLabel(period, reference),
    sessions: scopedSessions.length,
    totalVolume,
    averageDurationMinutes,
    totalDurationMinutes,
    completionRate,
    topFocus,
    activeDays,
    highlights,
  };
}
