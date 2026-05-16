export type MuscleGroup =
  | 'Peito'
  | 'Costas'
  | 'Quadríceps'
  | 'Posteriores'
  | 'Glúteos'
  | 'Ombros'
  | 'Bíceps'
  | 'Tríceps'
  | 'Panturrilhas'
  | 'Core';

export type VolumeStatus =
  | 'below_mev'
  | 'optimal'
  | 'high_tolerable'
  | 'above_mrv';

export type LoadAction = 'increase' | 'decrease' | 'keep' | 'swap';

export type IntensitySemaphore = 'green' | 'yellow' | 'red';

export type PeriodizationPhaseType =
  | 'resistance'
  | 'hypertrophy'
  | 'strength'
  | 'deload'
  | 'peak'
  | 'taper'
  | 'transition';

export interface MuscleVolumeLandmark {
  muscle: MuscleGroup;
  mev: number;
  mav: number;
  mrv: number;
  currentVolume: number;
}

export interface FatigueSnapshot {
  date: string;
  readiness: number;
  soreness: number;
  sleep: number;
  stress: number;
  hrv?: number;
  weeklyVolume?: number;
  completedSessions?: number;
  missedSessions?: number;
  fatigueScore?: number;
}

export interface TrainingExercisePerformance {
  exerciseName: string;
  muscle?: MuscleGroup;
  sets: number;
  currentLoad: number;
  targetReps: number;
  actualReps: number;
  rpe: number;
  rir?: number;
  pain?: boolean;
  completed?: boolean;
}

export interface LoadSuggestion {
  exerciseName: string;
  currentLoad: number;
  suggestedLoad: number;
  action: LoadAction;
  reason: string;
  confidence: number;
}

export interface SessionReadiness {
  readinessScore: number;
  fatigueScore: number;
  recoveryIndex: number;
  semaphore: IntensitySemaphore;
  recommendation: string;
}

export interface PeriodizationWeek {
  week: number;
  phase: PeriodizationPhaseType;
  title: string;
  volumeMultiplier: number;
  intensityMultiplier: number;
  targetRpe: string;
  focus: string;
  notes: string;
}

export interface TwelveWeekPlan {
  title: string;
  createdAt: string;
  weeks: PeriodizationWeek[];
}

export interface UserPeriodizationPlan {
  id: string;
  profile_id: string;
  current_week: number;
  plan_data: TwelveWeekPlan;
  created_at: string;
}
