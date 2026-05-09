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

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  videoUrl?: string;
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
}

export interface RecoveryCheckin {
  sleepHours: number;
  stressLevel: number;
  sorenessLevel: number;
  energyLevel: number;
  timestamp: number;
}

export interface ExerciseLog {
  exerciseId?: string;
  exerciseName: string;
  date: number;
  actualWeight?: number;
  actualReps?: string;
  rpe?: number;
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
