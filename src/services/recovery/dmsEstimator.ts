export type DomsRiskLevel = 'baixo' | 'moderado' | 'alto';

export interface DomsEstimate {
  risk: DomsRiskLevel;
  message: string;
}

export function estimateDomsRisk(totalVolume: number, averageRpe: number): DomsEstimate {
  if (totalVolume === 0) {
    return { risk: 'baixo', message: 'Sem volume de treino registrado.' };
  }

  // Simple heuristic: High volume and high RPE leads to high DOMS risk
  // These are illustrative thresholds for an educational estimation
  const score = totalVolume * averageRpe;

  if (score > 10000 && averageRpe > 8) {
    return {
      risk: 'alto',
      message: 'Treino intenso e volumoso. Risco alto de DMT (Dor Muscular Tardia) nas próximas 24-48h. Priorize recuperação e sono.'
    };
  } else if (score > 5000 || averageRpe > 7) {
    return {
      risk: 'moderado',
      message: 'Volume e intensidade moderados. É provável que você sinta uma leve DMT. Mantenha-se hidratado.'
    };
  }

  return {
    risk: 'baixo',
    message: 'Treino leve. Risco baixo de dor muscular tardia.'
  };
}
