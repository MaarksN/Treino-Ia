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
  id?: string;
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

// Social real & comunidade

export type SocialPostType = 'workout' | 'pr' | 'badge' | 'challenge' | 'text';
export type SocialVisibility = 'public' | 'followers' | 'private' | 'group';

export interface SocialProfile {
  id: string;
  username: string;
  display_name: string;
  bio?: string | null;
  avatar_url?: string | null;
  city?: string | null;
  goal?: string | null;
  is_coach: boolean;
  is_public: boolean;
  total_workouts: number;
  current_streak: number;
  best_streak: number;
  total_volume: number;
  badges: SocialBadge[];
  created_at: string;
  updated_at: string;
}

export interface SocialBadge {
  id: string;
  name: string;
  emoji: string;
  unlocked_at: string;
}

export interface SocialPost {
  id: string;
  author_id: string;
  type: SocialPostType;
  title: string;
  body?: string | null;
  metric_label?: string | null;
  metric_value?: string | null;
  visibility: SocialVisibility;
  group_id?: string | null;
  workout_template_id?: string | null;
  created_at: string;
  author?: SocialProfile;
  likes_count?: number;
  comments_count?: number;
  liked_by_me?: boolean;
}

export interface SocialComment {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author?: SocialProfile;
}

export interface TrainingGroup {
  id: string;
  owner_id: string;
  name: string;
  description?: string | null;
  invite_code: string;
  is_private: boolean;
  created_at: string;
  members_count?: number;
}

export interface TrainingGroupMessage {
  id: string;
  group_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author?: SocialProfile;
}

export interface GroupChallenge {
  id: string;
  group_id: string;
  name: string;
  description?: string | null;
  target: number;
  metric: 'workouts' | 'volume' | 'streak';
  starts_at: string;
  ends_at: string;
  badge_reward?: string | null;
  created_at: string;
  current?: number;
  completed?: boolean;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string | null;
  total_volume: number;
  current_streak: number;
  total_workouts: number;
}

export interface CoachStudent {
  student: SocialProfile;
  status: 'pending' | 'active' | 'archived';
  created_at: string;
}

export interface CoachPrivateNote {
  id: string;
  coach_id: string;
  student_id: string;
  note: string;
  created_at: string;
}

export interface PublicWorkoutTemplate {
  id: string;
  author_id: string;
  title: string;
  description?: string | null;
  goal?: string | null;
  level?: string | null;
  workout_json: unknown;
  likes_count: number;
  created_at: string;
  author?: SocialProfile;
}

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

export type SubscriptionPlanId = 'free' | 'premium_monthly' | 'premium_yearly';

export type PremiumFeature =
  | 'premium_theme'
  | 'export_data'
  | 'unlimited_ai'
  | 'wearable_sync'
  | 'pose_detection'
  | 'premium_community'
  | 'exclusive_badge'
  | 'advanced_analytics'
  | 'priority_coach'
  | 'periodization_lab';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  subtitle: string;
  price: number;
  billing: 'none' | 'month' | 'year';
  features: string[];
  unlockedFeatures: PremiumFeature[];
  highlighted?: boolean;
  badge?: string;
}

export interface PremiumCoupon {
  code: string;
  label: string;
  discountPercent: number;
  durationMonths: number;
  validUntil?: number;
}

export interface EntitlementState {
  planId: SubscriptionPlanId;
  billingStatus: 'free' | 'trialing' | 'active' | 'canceled';
  isPremium: boolean;
  unlockedFeatures: PremiumFeature[];
  usage: {
    aiRequestsThisMonth: number;
    exportsThisMonth: number;
    prCount: number;
    bestStreak: number;
    lastUsageResetAt: number;
  };
  activeCoupon?: string;
  currentPeriodEnd?: number;
  trialStartedAt?: number;
  trialEndsAt?: number;
  prPaywallShownAt?: number;
  streakPaywallShownAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface PaywallTrigger {
  source: string;
  feature?: PremiumFeature;
  title?: string;
  description?: string;
}

export type MissionType =
  | 'daily'
  | 'weekly'
  | 'flash'
  | 'boss'
  | 'weekend';

export type MissionMetric =
  | 'workouts'
  | 'sets'
  | 'volume'
  | 'streak'
  | 'checkin'
  | 'rpe_logged'
  | 'exercise_completed'
  | 'group_contribution';

export type MissionStatus = 'active' | 'completed' | 'claimed' | 'expired';

export type CosmeticType =
  | 'avatar_skin'
  | 'frame'
  | 'badge'
  | 'title'
  | 'effect';

export type Rarity =
  | 'common'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic';

export interface XpEvent {
  id: string;
  source: string;
  amount: number;
  label: string;
  occurredAt: number;
}

export interface GamificationMission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  metric: MissionMetric;
  target: number;
  progress: number;
  xpReward: number;
  coinReward?: number;
  status: MissionStatus;
  expiresAt: number;
  createdAt: number;
}

export interface CosmeticItem {
  id: string;
  type: CosmeticType;
  name: string;
  description: string;
  emoji: string;
  rarity: Rarity;
  price: number;
  unlocked: boolean;
  equipped?: boolean;
}

export interface SeasonReward {
  level: number;
  freeReward?: {
    label: string;
    xp?: number;
    coins?: number;
    cosmeticId?: string;
  };
  eliteReward?: {
    label: string;
    xp?: number;
    coins?: number;
    cosmeticId?: string;
  };
  claimedFree?: boolean;
  claimedElite?: boolean;
}

export interface SeasonPassState {
  id: string;
  name: string;
  theme: string;
  startsAt: number;
  endsAt: number;
  seasonXp: number;
  seasonLevel: number;
  eliteActive: boolean;
  rewards: SeasonReward[];
}

export interface AvatarState {
  archetype: 'rookie' | 'warrior' | 'champion' | 'legend' | 'immortal';
  equippedSkin?: string;
  equippedFrame?: string;
  equippedBadge?: string;
  equippedTitle?: string;
  equippedEffect?: string;
}

export interface ClanState {
  id: string;
  name: string;
  tag: string;
  memberCount: number;
  weeklyXp: number;
  bossDamage: number;
}

export interface SeasonalLeaderboardEntry {
  userId: string;
  displayName: string;
  level: number;
  seasonXp: number;
  streak: number;
  clanTag?: string;
}

export interface GamificationState {
  userId: string;
  xp: number;
  level: number;
  coins: number;
  loginStreak: number;
  lastLoginAt?: number;
  lastCheckinAt?: number;
  titlesUnlocked: string[];
  activeTitle?: string;
  missions: GamificationMission[];
  cosmetics: CosmeticItem[];
  season: SeasonPassState;
  avatar: AvatarState;
  clan?: ClanState;
  xpEvents: XpEvent[];
  lootBoxesOpened: number;
  createdAt: number;
  updatedAt: number;
}
