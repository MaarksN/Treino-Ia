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

export interface WorkoutHistoryEntry {
  id: string;
  planId: string;
  planName: string;
  date: string;
  dayFocus: string;
  exerciseCount: number;
  completedCount: number;
  totalVolume: number;
  durationMinutes?: number;
  readinessScore?: number;
  prsBroken?: string[];
}

export interface WeeklyStats {
  weekLabel: string;
  sessions: number;
  totalVolume: number;
  avgReadiness: number;
  adherence: number;
}

export interface MuscleGroupVolume {
  group: string;
  volume: number;
  sessions: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
  totalWorkouts: number;
  workoutDates: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlockedAt?: number;
  unlocked: boolean;
  category: 'consistency' | 'volume' | 'pr' | 'nutrition' | 'recovery' | 'special';
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  type: 'weekly' | 'monthly' | 'custom';
  target: number;
  current: number;
  unit: string;
  startDate: string;
  endDate: string;
  completed: boolean;
  reward?: string;
}

export interface ReminderConfig {
  enabled: boolean;
  days: number[];
  time: string;
  message: string;
  reactivationDays: number;
}

// Social & compartilhamento

export interface ShareCardData {
  userName: string;
  planName: string;
  dayFocus: string;
  exercises: string[];
  stats: {
    totalVolume?: number;
    prsBroken?: string[];
    duration?: number;
    streak?: number;
  };
  date: string;
  theme: 'dark' | 'neon' | 'fire' | 'ocean' | 'minimal';
}

export interface PublicProfile {
  username: string;
  bio?: string;
  goal: string;
  totalWorkouts: number;
  currentStreak: number;
  badges: string[];
  favoriteSplit?: string;
  isPublic: boolean;
}

// AI Coach

export interface CoachMessage {
  id: string;
  role: 'user' | 'coach';
  content: string;
  timestamp: number;
}

export interface AutoAdjustSuggestion {
  type: 'volume_reduction' | 'intensity_increase' | 'deload' | 'frequency_change' | 'exercise_swap';
  title: string;
  description: string;
  affectedDay?: string;
  affectedExercise?: string;
  action: string;
}

// Tema premium

export interface AppTheme {
  id: string;
  name: string;
  description: string;
  emoji: string;
  isPremium: boolean;
  vars: Record<string, string>;
}

// Configuracoes gerais

export interface AppSettings {
  themeId: string;
  language: 'pt-BR';
  weightUnit: 'kg' | 'lb';
  voiceEnabled: boolean;
  hapticEnabled: boolean;
  defaultRestSeconds: number;
  autoStartTimer: boolean;
  showRPE: boolean;
  showPRBadge: boolean;
  publicProfile: boolean;
  username: string;
}

// Wearable & biometrico

export interface HeartRateReading {
  bpm: number;
  timestamp: number;
}

export interface WearableSession {
  id: string;
  startedAt: number;
  endedAt?: number;
  avgHR: number;
  maxHR: number;
  minHR: number;
  readings: HeartRateReading[];
  deviceName: string;
  calories?: number;
  hrZones: HRZones;
}

export interface HRZones {
  zone1: number;
  zone2: number;
  zone3: number;
  zone4: number;
  zone5: number;
}

// Pose detection

export interface PoseAnalysis {
  id: string;
  exerciseName: string;
  date: string;
  repCount: number;
  formScore: number;
  issues: string[];
  tips: string[];
  keyAngles: Record<string, number>;
  thumbnail?: string;
}

// Ciclo hormonal

export type MenstrualPhase = 'menstrual' | 'folicular' | 'ovulação' | 'lútea';

export interface CycleEntry {
  id: string;
  startDate: string;
  cycleLengthDays: number;
  periodLengthDays: number;
}

export interface CycleDay {
  date: string;
  phase: MenstrualPhase;
  dayOfCycle: number;
  energyExpected: 'baixa' | 'moderada' | 'alta' | 'máxima';
  trainingRecommendation: string;
  nutritionTip: string;
}

// Hidratacao

export interface HydrationEntry {
  id: string;
  date: string;
  time: string;
  amountMl: number;
  type: 'água' | 'isotônico' | 'whey' | 'café' | 'outro';
}

export interface HydrationGoal {
  dailyMl: number;
  remindEveryMinutes: number;
}

// Sono

export interface SleepEntry {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  durationMinutes: number;
  quality: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  deepSleepPct?: number;
  remSleepPct?: number;
}
