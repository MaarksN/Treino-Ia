import { create } from 'zustand';
import { 
  User, 
  WorkoutPlan, 
  UserProfile, 
  StreakData, 
  WorkoutHistoryRecord, 
  WorkoutHistoryEntry, 
  DailyCheckin, 
  RecoveryCheckin 
} from '../types';
import { loadHistory } from '../utils/analyticsUtils';
import { loadStreak } from '../utils/streakUtils';

interface AppState {
  // User Data
  user: User | null;
  profile: UserProfile | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;

  // Plan & Premium
  isPremium: boolean;
  setIsPremium: (isPremium: boolean) => void;
  plans: WorkoutPlan[];
  setPlans: (plans: WorkoutPlan[]) => void;
  currentPlanId: string | null;
  setCurrentPlanId: (id: string | null) => void;

  // History & Gamification
  workoutHistory: WorkoutHistoryRecord[];
  setWorkoutHistory: (history: WorkoutHistoryRecord[]) => void;
  analyticsHistory: WorkoutHistoryEntry[];
  setAnalyticsHistory: (history: WorkoutHistoryEntry[]) => void;
  streakData: StreakData;
  setStreakData: (streak: StreakData) => void;

  // Check-ins
  todayCheckin: DailyCheckin | null;
  setTodayCheckin: (checkin: DailyCheckin | null) => void;
  recoveryCheckin: RecoveryCheckin | null;
  setRecoveryCheckin: (checkin: RecoveryCheckin | null) => void;

  // Settings
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
  language: 'PT' | 'EN';
  setLanguage: (language: 'PT' | 'EN') => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (voiceEnabled: boolean) => void;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),

  isPremium: false,
  setIsPremium: (isPremium) => set({ isPremium }),
  plans: [],
  setPlans: (plans) => set({ plans }),
  currentPlanId: null,
  setCurrentPlanId: (currentPlanId) => set({ currentPlanId }),

  workoutHistory: [],
  setWorkoutHistory: (workoutHistory) => set({ workoutHistory }),
  analyticsHistory: loadHistory(),
  setAnalyticsHistory: (analyticsHistory) => set({ analyticsHistory }),
  streakData: loadStreak(),
  setStreakData: (streakData) => set({ streakData }),

  todayCheckin: null,
  setTodayCheckin: (todayCheckin) => set({ todayCheckin }),
  recoveryCheckin: null,
  setRecoveryCheckin: (recoveryCheckin) => set({ recoveryCheckin }),

  darkMode: true,
  setDarkMode: (darkMode) => set({ darkMode }),
  language: 'PT',
  setLanguage: (language) => set({ language }),
  voiceEnabled: localStorage.getItem('@TreinoApp:voiceEnabled') === 'true',
  setVoiceEnabled: (voiceEnabled) => set({ voiceEnabled }),
  showOnboarding: !localStorage.getItem('@TreinoApp:onboarding'),
  setShowOnboarding: (showOnboarding) => set({ showOnboarding }),
}));
