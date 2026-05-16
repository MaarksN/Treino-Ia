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
