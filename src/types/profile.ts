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
