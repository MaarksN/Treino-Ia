import { type WorkoutSession } from '../database';

export interface MonthlyTrainingReport {
  month: string;
  sessions: number;
  totalVolume: number;
  averageDurationMinutes: number;
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
