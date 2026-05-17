import { WorkoutSession } from '../../services/database';

export interface EcoLiftingStats {
  score: number;
  badges: string[];
  message: string;
}

/**
 * Evaluates sustainability actions (Eco-lifting) based on user's history and simple metrics.
 * Note: Does NOT calculate real CO2 emissions. It is purely an engagement and gamification feature.
 */
export function calculateEcoLiftingImpact(history: WorkoutSession[]): EcoLiftingStats {
  const score = history.length * 10;
  const badges: string[] = [];

  if (history.length >= 1) {
    badges.push('Garrafa Reutilizável Iniciante');
  }
  if (history.length >= 5) {
    badges.push('Treino Consistente Sustentável');
  }
  if (history.length >= 10) {
    badges.push('Defensor Local do Eco-lifting');
  }

  return {
    score,
    badges,
    message: 'Seu compromisso com o treino regular também é um compromisso com a longevidade. Continue adotando práticas sustentáveis, como usar garrafa reutilizável e evitar deslocamentos motorizados curtos.',
  };
}
