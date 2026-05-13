// Arquivo gerado automaticamente - Motor de IA e Personalização
export interface TrainingPlan {
  volume: string;
  frequency: string;
  focus: string;
  aiRecommendation: string;
}

export function calculateTrainingPlan(level: string, goal: string): TrainingPlan {
  // Motor de regras de negócio complexas
  if (level === 'iniciante') {
    return {
      volume: 'Baixo (9 a 12 séries/músculo)',
      frequency: '3x na semana (Fullbody)',
      focus: 'Adaptação Anatômica e Execução',
      aiRecommendation: 'Foque em aprender o movimento perfeito antes de subir a carga.'
    };
  }
  
  if (level === 'intermediario') {
    return {
      volume: 'Médio (14 a 18 séries/músculo)',
      frequency: '4x a 5x na semana (AB ou ABC)',
      focus: 'Progressão de Carga',
      aiRecommendation: 'Hora de desafiar seus limites. Anote suas cargas a cada treino.'
    };
  }

  return {
    volume: 'Alto (18 a 22 séries/músculo)',
    frequency: '5x a 6x na semana (ABCDE)',
    focus: 'Periodização Ondulatória',
    aiRecommendation: 'Atenção aos sinais de overtraining. O descanso é vital nessa fase.'
  };
}
