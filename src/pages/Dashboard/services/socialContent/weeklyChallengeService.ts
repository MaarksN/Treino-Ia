import { WorkoutSession } from '../../../../services/database';

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  unit: string;
}

const CHALLENGES_POOL: WeeklyChallenge[] = [
  { id: 'w1', title: 'O Retorno Jedi', description: 'Complete 3 treinos nesta semana para construir consistência.', target: 3, unit: 'treinos' },
  { id: 'w2', title: 'Volume Insano', description: 'Acumule 10.000 kg de volume total nesta semana.', target: 10000, unit: 'kg' },
  { id: 'w3', title: 'Foco e Disciplina', description: 'Não modifique a técnica sugerida pela IA em nenhum exercício por 2 treinos seguidos.', target: 2, unit: 'treinos' },
  { id: 'w4', title: 'Descanso de Campeão', description: 'Respeite todos os tempos de descanso cronometrados.', target: 100, unit: '%' },
];

export function getCurrentWeeklyChallenge(): WeeklyChallenge {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

  // Deterministic challenge selection based on week number
  const index = weekNo % CHALLENGES_POOL.length;
  return CHALLENGES_POOL[index] as WeeklyChallenge;
}

export function calculateLocalChallengeProgress(challenge: WeeklyChallenge, history: WorkoutSession[]): number {
  if (!history || history.length === 0) return 0;

  // Filter history for the current week (simplified: last 7 days)
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentHistory = history.filter(session => session.completedAt >= oneWeekAgo);

  switch (challenge.id) {
    case 'w1': // Complete 3 treinos
      return Math.min(recentHistory.length, challenge.target);
    case 'w2': { // Accumulate 10000 kg volume
      const totalVol = recentHistory.reduce((sum, session) => sum + session.totalVolume, 0);
      return Math.min(totalVol, challenge.target);
    }
    case 'w3': // Não modifique técnica
    case 'w4': // Respeite tempos de descanso
      // Mock progress for these as they are harder to calculate without deeper history inspection
      return Math.min(recentHistory.length * 50, challenge.target);
    default:
      return 0;
  }
}
