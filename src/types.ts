export interface GamificationData {
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: number | null;
  badges: string[];
}

export interface User {
  name: string;
  email: string;
  avatarUrl?: string;
  notificationsEnabled?: boolean;
  gamification?: GamificationData;
  profile?: UserProfile;
}

export interface UserProfile {
  age: number;
  gender: string;
  weight: number;
  height: number;
  bodyFatPercent?: number;
  experienceLevel: string;
  goal: string;
  secondaryGoal?: string;
  daysPerWeek: number;
  sessionDuration?: string;
  preferredTime?: string;
  injuries: string;
  equipment?: string;
  gymType?: string;
  sleepHours?: string;
  stressLevel?: string;
  preferredMethods?: string[];
  weakPoints?: string;
  timePerWorkout?: number;
  workoutLocation?: string;
  secondaryFocus?: string;
}

export type ExerciseFeedback = 'easy' | 'hard' | 'painful' | 'good' | null;

export interface SetLog {
  setNumber: number;
  weight?: number;
  reps?: number;
  rpe?: number;
  failed?: boolean;
  technicalFailure?: boolean;
  note?: string;
  completedAt?: number;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  videoUrl?: string;
  muscleGroup?: string;
  movementPattern?: string;
  tags?: string[];
  favorited?: boolean;
  isCustom?: boolean;
  executionDetails?: string;
  concentricPhase?: string;
  eccentricPhase?: string;
  notes?: string;
  completed?: boolean;
  feedback?: ExerciseFeedback;
  actualWeight?: number;
  actualReps?: string;
  performanceNotes?: string;
  rpe?: number;
  setLogs?: SetLog[];
}

export interface PersonalRecord {
  exerciseName: string;
  weight: number;
  reps: number;
  date: number;
  planId: string;
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

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealEntry {
  id: string;
  date: string;
  mealType: 'Café da manhã' | 'Almoço' | 'Jantar' | 'Lanche' | 'Pré-treino' | 'Pós-treino';
  description: string;
  estimatedCalories?: number;
  estimatedProtein?: number;
  estimatedCarbs?: number;
  estimatedFat?: number;
  photoBase64?: string;
  aiAnalysis?: string;
}

export interface FavoriteFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface SupplementEntry {
  id: string;
  name: string;
  dose: string;
  timing: string;
}

export interface BodyMetric {
  id: string;
  date: string;
  weight?: number;
  bodyFatPercent?: number;
  chest?: number;
  waist?: number;
  hip?: number;
  arm?: number;
  thigh?: number;
  photoBase64?: string;
  aiAnalysis?: string;
}

export interface NutritionWeekSummary {
  avgCalories: number;
  avgProtein: number;
  adherencePercent: number;
  bestDay: string;
  worstDay: string;
}

export interface ExerciseLog {
  exerciseId?: string;
  exerciseName: string;
  date: number;
  actualWeight?: number;
  actualReps?: string;
  rpe?: number;
  setLogs?: SetLog[];
  feedback?: ExerciseFeedback;
  performanceNotes?: string;
}

export interface WorkoutSession {
  id: string;
  planId: string;
  dayId: string;
  completedAt: number;
  durationMinutes?: number;
  logs: ExerciseLog[];
  readiness?: RecoveryCheckin;
}

export interface WeeklyInsight {
  title: string;
  description: string;
  severity: 'good' | 'warning' | 'critical' | 'info';
}

export interface MacrocyclePhase {
  name: string;
  objective: string;
  durationWeeks: number;
  intensity: string;
  volume: string;
}

export interface Microcycle {
  week: number;
  focus: string;
  notes: string;
}

export interface AiCoachMessage {
  role: 'user' | 'assistant';
  text: string;
  createdAt: number;
}

export interface AiFeedback {
  overallAssessment: string;
  strengths: string[];
  improvements: string[];
  nextStepTips: string[];
  motivationalNote: string;
  progressIndicator: number;
}

export interface WorkoutFeedback {
  date: number;
  difficulty: number;
  feeling: string;
  comments: string;
}

export interface WorkoutDay {
  id: string;
  dayName: string;
  focus: string;
  exercises: Exercise[];
  warmup?: string;
  cooldown?: string;
  estimatedDuration?: string;
  completed?: boolean;
  workoutFeedback?: WorkoutFeedback;
}

export interface WorkoutPlan {
  id: string;
  createdAt: number;
  planName: string;
  goalDescription: string;
  days: WorkoutDay[];
}

export interface WorkoutHistoryRecord {
  id: string;
  date: number;
  planId: string;
  dayId: string;
  dayName: string;
  focus: string;
  volumeLoad: number; // total kg lifted
  durationMinutes: number;
  exercises: Exercise[];
}
