export interface MicrobiotaInsight {
  status: 'healthy' | 'needs_fiber' | 'unknown';
  message: string;
  recommendedFibersGrams: number;
}

export function estimateMicrobiotaHealth(dailyFiberGrams: number, calories: number): MicrobiotaInsight {
  if (calories <= 0) {
    return { status: 'unknown', message: 'Sem dados nutricionais suficientes.', recommendedFibersGrams: 0 };
  }

  // General recommendation: 14g fiber per 1000 kcal
  const targetFiber = (calories / 1000) * 14;

  if (dailyFiberGrams >= targetFiber) {
    return {
      status: 'healthy',
      message: 'Sua ingestão de fibras está excelente, favorecendo uma microbiota saudável.',
      recommendedFibersGrams: targetFiber
    };
  }

  return {
    status: 'needs_fiber',
    message: 'Aumente a ingestão de fibras para melhorar a saúde da microbiota intestinal. Foque em vegetais, legumes e grãos integrais.',
    recommendedFibersGrams: targetFiber
  };
}
