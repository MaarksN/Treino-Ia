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
}

export interface UserProfile {
  age: number;
  gender: string;
  weight: number;
  height: number;
  experienceLevel: string;
  goal: string;
  daysPerWeek: number;
  injuries: string;
  timePerWorkout: number;
  workoutLocation: string;
  secondaryFocus?: string;
  preferredTime?: string;
}

export type ExerciseFeedback = 'easy' | 'hard' | 'painful' | 'good' | null;

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  executionDetails?: string;
  concentricPhase?: string;
  eccentricPhase?: string;
  notes?: string;
  completed?: boolean;
  feedback?: ExerciseFeedback;
  actualWeight?: number;
  actualReps?: string;
  performanceNotes?: string;
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
