export type AiValidationStatus = 'valid' | 'invalid_json' | 'invalid_schema' | 'no_json' | 'error' | 'blocked';

export interface AiDecisionAudit {
  feature: string;
  usedAi: boolean;
  usedDeterministicFallback: boolean;
  deterministicFlags: string[];
  validationStatus: AiValidationStatus;
  reason: string;
  createdAt: string;
}

export interface AiStructuredResponse<T> {
  data: T;
  audit: AiDecisionAudit;
}

export interface GeneratedWorkoutFromAnamnesis {
  split: string;
  dayFocus: string[];
  weeklyVolume: string;
  idealFrequency: number;
  safetyNotes: string[];
  initialProgression: string;
  summary: string;
}

export interface WeeklyPlanAdaptation {
  changes: string[];
  volumeAdjustment: 'increase' | 'maintain' | 'reduce';
  intensityAdjustment: 'increase' | 'maintain' | 'reduce';
  safetyNotes: string[];
  summary: string;
}

export interface LoadProgressionItem {
  exercise: string;
  action: 'increase' | 'maintain' | 'reduce' | 'swap';
  adjustment: string;
  reason: string;
}

export interface LoadProgressionAdvice {
  items: LoadProgressionItem[];
  summary: string;
}

export interface PlateauPrediction {
  risk: 'baixo' | 'medio' | 'alto';
  plateauDetected: boolean;
  stagnantExercises: string[];
  probableCause: string;
  suggestedAction: string;
  summary: string;
}

export interface DeloadAdvice {
  needed: boolean;
  signals: string[];
  nextWeekAdjustment: string;
  volumeReductionPercent: number;
  intensityReductionPercent: number;
  summary: string;
}

export interface ExerciseAlternative {
  name: string;
  reason: string;
  safetyNote: string;
}

export interface ExerciseAlternativesAdvice {
  byEquipment: ExerciseAlternative[];
  byPainOrLimitation: ExerciseAlternative[];
  summary: string;
}

export interface WeeklyVolumeRecommendation {
  muscleGroups: Array<{
    group: string;
    weeklySets: number;
    reason: string;
  }>;
  summary: string;
}

export interface AdvancedMethodsRecommendation {
  methods: Array<{
    name: string;
    applyTo: string;
    caution: string;
  }>;
  summary: string;
}

export interface IdealFrequencyRecommendation {
  daysPerWeek: number;
  rationale: string;
  recoveryNotes: string[];
  summary: string;
}

export interface SleepStressAdjustment {
  intensityAdjustment: 'maintain' | 'reduce';
  volumeAdjustment: 'maintain' | 'reduce';
  aggressiveness: 'normal' | 'conservative';
  notes: string[];
  summary: string;
}

export interface DayVariationAdvice {
  availableMinutes: number;
  equipment: string[];
  volumeAdjustment: 'maintain' | 'reduce';
  intensityAdjustment: 'maintain' | 'reduce';
  variations: string[];
  safetyNotes: string[];
  summary: string;
}

export interface PostWorkoutFeedbackContract {
  overallAssessment: string;
  strengths: string[];
  improvements: string[];
  nextStepTips: string[];
  motivationalNote: string;
  progressIndicator: number;
}

export interface WeeklyInsightsContract {
  consistency: string;
  fatigue: string;
  progress: string;
  adherence: string;
  nextWeekRecommendation: string;
  alerts: string[];
  summary: string;
}

export interface AbandonmentRiskContract {
  risk: 'baixo' | 'medio' | 'alto';
  signals: string[];
  recommendedAction: string;
  alert: string;
  summary: string;
}
