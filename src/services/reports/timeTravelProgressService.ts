import { WorkoutSession } from '../../services/database';

export interface TimeTravelSnapshot {
  periodLabel: string;
  totalWorkouts: number;
  totalVolume: number;
}

export interface TimeTravelProgressResult {
  hasEnoughData: boolean;
  message: string;
  snapshots: TimeTravelSnapshot[];
}

/**
 * Generates a retrospective view of the user's progress using existing history.
 * SAFETY: Does not invent data, fake predictions, or promise health outcomes.
 */
export function generateTimeTravelProgress(history: WorkoutSession[]): TimeTravelProgressResult {
  if (history.length < 2) {
    return {
      hasEnoughData: false,
      message: 'Complete mais treinos para visualizar sua evolução no tempo.',
      snapshots: [],
    };
  }

  // Create a simple split: older half vs newer half
  const half = Math.floor(history.length / 2);
  const newerWorkouts = history.slice(0, half);
  const olderWorkouts = history.slice(half);

  const olderVolume = olderWorkouts.reduce((sum, s) => sum + s.totalVolume, 0);
  const newerVolume = newerWorkouts.reduce((sum, s) => sum + s.totalVolume, 0);

  return {
    hasEnoughData: true,
    message: 'Comparativo real baseado no seu histórico de treino registrado.',
    snapshots: [
      {
        periodLabel: 'Primeira Metade',
        totalWorkouts: olderWorkouts.length,
        totalVolume: olderVolume,
      },
      {
        periodLabel: 'Metade Recente',
        totalWorkouts: newerWorkouts.length,
        totalVolume: newerVolume,
      },
    ],
  };
}
