export interface SleepLogEntry {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  durationHours: number;
  quality: 1 | 2 | 3 | 4 | 5;
}

export interface WellnessEntry {
  date: string;
  mood: number;
  energy: number;
  stress: number;
  soreness: number;
  hrv?: number;
  sessionRpe?: number;
}

export interface RecoveryScoreResult {
  score: number;
  label: 'pronto' | 'moderado' | 'cautela' | 'descanso';
  recommendation: string;
}

export interface RecoveryCheckin {
  sleepHours: number;
  stressLevel: number;
  sorenessLevel: number;
  energyLevel: number;
  timestamp: number;
}

export interface DailyCheckin {
  id: string;
  date: string;
  sleepHours: number;
  sleepQuality: number;
  stressLevel: number;
  sorenessMap: Record<string, number>;
  energyLevel: number;
  hydrationGlasses: number;
  sleepGoalHours: number;
  notes?: string;
  timestamp: number;
}

export interface ReadinessScore {
  score: number;
  label: 'Excelente' | 'Boa' | 'Moderada' | 'Baixa' | 'Ruim';
  color: string;
  recommendation: 'Treino completo' | 'Treino moderado' | 'Treino leve' | 'Recuperação ativa' | 'Descanso';
  adjustedIntensity: number;
}

export interface InjuryRecord {
  id: string;
  region: string;
  description: string;
  severity: 'leve' | 'moderada' | 'grave';
  startDate: string;
  resolved?: boolean;
  resolvedDate?: string;
  notes?: string;
}

export interface SymptomRecord {
  id: string;
  date: string;
  region: string;
  symptom: string;
  intensity: number;
}

export type DailyCheckinType = DailyCheckin;
