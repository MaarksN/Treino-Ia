export type CoachPersonaId = 'rigoroso' | 'motivador' | 'tecnico' | 'amigo';

export interface CoachPersona {
  id: CoachPersonaId;
  name: string;
  tone: string;
  bestFor: string;
  promptHint: string;
}

export interface PlateauSignal {
  exercise: string;
  risk: 'baixo' | 'medio' | 'alto';
  reason: string;
  action: string;
}

export interface PredictivePrForecast {
  exercise: string;
  currentBestKg: number;
  targetKg: number;
  estimatedWeeks: number;
  confidence: number;
}
