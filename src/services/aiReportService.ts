import { PlateauSignal, PredictivePrForecast } from '../types/ai';

export function buildQuarterlyAiReport(plateau: PlateauSignal, forecast: PredictivePrForecast) {
  return [
    `Risco de plato em ${plateau.exercise}: ${plateau.risk}.`,
    `Acao sugerida: ${plateau.action}.`,
    `Proximo PR de ${forecast.targetKg}kg estimado em ${forecast.estimatedWeeks} semana(s).`,
    `Confianca do forecast: ${forecast.confidence}%.`,
  ];
}
