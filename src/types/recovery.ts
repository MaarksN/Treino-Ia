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
