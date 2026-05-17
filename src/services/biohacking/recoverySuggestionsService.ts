export interface PostWorkoutMetrics {
  rpe: number; // 1-10
  muscleSoreness: number; // 1-10
  exhaustionLevel: 'low' | 'moderate' | 'high';
}

export interface RecoverySuggestion {
  type: 'cold_exposure' | 'heat_exposure' | 'active_recovery' | 'rest';
  description: string;
  disclaimer: string;
}

export const generateRecoverySuggestion = (metrics: PostWorkoutMetrics): RecoverySuggestion => {
  const disclaimer = "Aviso: Esta é uma sugestão de bem-estar, não uma recomendação médica. Consulte um profissional de saúde se sentir dor aguda.";

  if (metrics.rpe > 8 || metrics.exhaustionLevel === 'high') {
    return {
      type: 'rest',
      description: 'Nível de exaustão alto. Priorize descanso passivo e hidratação.',
      disclaimer
    };
  }

  if (metrics.muscleSoreness > 6) {
    return {
      type: 'active_recovery',
      description: 'Dor muscular moderada/alta. Considere recuperação ativa leve ou alongamento suave.',
      disclaimer
    };
  }

  // Simplified logic for cold/heat suggestion based on typical wellness practices
  // Avoid cold immediately after hypertrophy (reduces inflammation/adaptation), but good for CNS recovery
  // Suggest heat for muscle relaxation if RPE was moderate
  if (metrics.rpe > 6 && metrics.rpe <= 8) {
     return {
      type: 'cold_exposure',
      description: 'Sugestão: Banho frio rápido para recuperação do sistema nervoso central.',
      disclaimer
    };
  }

  return {
    type: 'heat_exposure',
    description: 'Sugestão: Banho morno/quente para relaxamento muscular e fluxo sanguíneo.',
    disclaimer
  };
};
