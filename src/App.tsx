import React, { Suspense, useEffect, useMemo, useState, lazy } from 'react';
import { useAppNavigation } from './hooks/useAppNavigation';
import { useAuthState } from './hooks/useAuthState';
import { useCheckinManager } from './hooks/useCheckinManager';
import { Dumbbell } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import { OnboardingTour } from './components/OnboardingTour';
import {
  type AppSettings,
  type Badge,
  type DailyCheckin,
  type FatigueSnapshot,
  type RecoveryCheckin,
  type User,
  type UserProfile,
  type WorkoutHistoryEntry,
  type WorkoutHistoryRecord,
  type WorkoutPlan,
  type WorkoutSession,
  type StreakData,
} from './types';
import { VIEWS, type AppView } from './navigation/views';
import { loadHistory, getTotalVolumeLifted, recordWorkoutSession } from './utils/analyticsUtils';
import { evaluateAndUnlockBadges } from './utils/badgeUtils';
import { syncChallengeProgress } from './utils/challengeUtils';
import { captureError } from './utils/errorTelemetry';
import { getErrorMessage } from './utils/errors';
import { enqueueOfflineAction } from './utils/offlineQueue';
import { registerBackgroundSync } from './utils/pwaUtils';
import { calculateReadiness } from './utils/readinessUtils';
import { loadStreak, recordWorkoutForStreak } from './utils/streakUtils';
import { saveDashboardSnapshot } from './utils/syncUtils';
import { applyTheme, loadThemeId } from './utils/themeUtils';
import { fetchBillingEntitlement } from './services/billingService';
import { extractWorkoutFromFile, generateWorkoutPlan } from './services/geminiService';
import { recordGamificationEvent } from './services/gamificationService';
import { useWorkoutManager } from './hooks/useWorkoutManager';
import {
  persistUserProfileToBackend,
  persistWorkoutPlansToBackend,
} from './services/legacyTrainingSyncService';
import { useAppStore } from './stores/useAppStore';
import { useTrainingSync } from './hooks/useTrainingSync';

import './index.css';

const LIGHT_THEME_VARS: Record<string, string> = {
  '--color-brand-neon': '#a3e635',
  '--color-brand-neon-hover': '#84cc16',
  '--color-brand-magenta': '#f43f5e',
  '--color-brand-dark': '#0a0a0a',
  '--color-brand-gray': '#141413',
  '--color-brand-surface': '#1a1917',
  '--color-brand-light': '#f8fafc',
  '--color-brand-muted': '#6b7280',
  '--gradient-hero': 'linear-gradient(135deg, #0a0a0a 0%, #1a1917 100%)',
};

const ONBOARDING_KEY = '@TreinoApp:onboarding';


export default function App() {
  const {
    view,
    setView,
    goToDashboard,
    goToHome,
    goToPublicProfile,
    goToRegistration,
    goToSocial,
  } = useAppNavigation(VIEWS.LOADING);
  const {
    user, setUser,
    profile, setProfile,
    isPremium, setIsPremium,
    plans, setPlans,
    currentPlanId, setCurrentPlanId,
    workoutHistory, setWorkoutHistory,
    analyticsHistory, setAnalyticsHistory,
    streakData, setStreakData,
    todayCheckin, setTodayCheckin,
    recoveryCheckin, setRecoveryCheckin,
    darkMode, setDarkMode,
    language, setLanguage,
    voiceEnabled, setVoiceEnabled,
    showOnboarding, setShowOnboarding,
  } = useAppStore();

  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [challengeVersion, setChallengeVersion] = useState(0);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [allCheckins, setAllCheckins] = useState<DailyCheckin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCoachChat, setShowCoachChat] = useState(false);
  const [shareEntry, setShareEntry] = useState<WorkoutHistoryEntry | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCoach, setShowCoach] = useState(false);

  // For tab navigation when a user is logged in
  const [activeTab, setActiveTab] = useState<'my_workouts' | 'global_feed' | 'social' | 'gamification' | 'retention' | 'infrastructure' | 'platform' | 'billing'>('my_workouts');

  const handleCompleteOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  const getPlanPerformances = (plan: WorkoutPlan | null) =>
    (plan?.days || []).map(day => ({
      sets: day.exercises.reduce((acc, ex) => acc + (ex.sets || 0), 0),
      completion: day.exercises.length
        ? Math.round((day.exercises.filter(ex => ex.completed).length / day.exercises.length) * 100)
        : 0,
    }));

  const getAverageSoreness = (checkin: DailyCheckin | null) => {
    if (!checkin) return 0;
    const values = Object.values(checkin.sorenessMap || {});
    if (!values.length) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  };

  const {
    handleCompleteDay,
    refreshEngagement,
    saveLocalDashboardSnapshot
  } = useWorkoutManager({
    allCheckins,
    todayCheckin,
    onShareEntry: setShareEntry,
    onChallengeVersionChange: () => setChallengeVersion(v => v + 1),
    onNewBadges: (badges) => setNewBadges(badges)
  });

  const {
    healthDataMode,
    healthWarning,
    checkinSaving,
    checkinError,
    handleSaveCheckin,
    handleSaveRecoveryCheckin,
    refreshDailyCheckins
  } = useCheckinManager({
    allCheckins,
    setAllCheckins,
    onEngagementRefresh: refreshEngagement,
    onSnapshotSave: saveLocalDashboardSnapshot
  });

  const { migrateLegacyTrainingState } = useTrainingSync({
    onGoToDashboard: goToDashboard,
  });

  useEffect(() => {
    applyTheme(loadThemeId());
  }, [
    goToPublicProfile,
    goToRegistration,
    goToSocial,
    migrateLegacyTrainingState,
    setDarkMode,
    setIsPremium,
    setShowOnboarding,
  ]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('@TreinoApp:theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      applyTheme(loadThemeId());
    } else {
      Object.entries(LIGHT_THEME_VARS).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    }
  }, [darkMode]);

  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/u/')) {
      goToPublicProfile();
      return;
    }
    if (currentPath.startsWith('/groups/join/')) {
      goToSocial();
      return;
    }

    void migrateLegacyTrainingState();

    const savedTheme = localStorage.getItem('@TreinoApp:theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }

    if (localStorage.getItem(ONBOARDING_KEY)) {
      setShowOnboarding(false);
    }

    fetchBillingEntitlement()
      .then(entitlement => setIsPremium(entitlement.isPremium))
      .catch(() => setIsPremium(false));

    goToRegistration();
  }, []);



  useAuthState({ onSessionRefresh: migrateLegacyTrainingState });

  const handleRegister = (newUser: User) => {
    void recordGamificationEvent('login').catch(error => captureError(error, 'App.recordLogin'));
    setUser(newUser);
    if (newUser.profile) {
      setProfile(newUser.profile);
    }
    
    // Attempt to request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    if (newUser.profile && plans.length > 0) {
      goToDashboard();
    } else {
      setView('home');
    }
  };

  const saveNewPlan = (generatedPlan: WorkoutPlan) => {
    const newPlans = [generatedPlan, ...plans];
    setPlans(newPlans);
    setCurrentPlanId(generatedPlan.id);
    void persistWorkoutPlansToBackend(newPlans, generatedPlan.id)
      .catch(error => captureError(error, 'App.persistWorkoutPlans'));
    goToDashboard();
  };

  const handleAnamnesisSubmit = async (profile: UserProfile) => {
    setIsLoading(true);
    setError(null);
    try {
      setProfile(profile);
      void persistUserProfileToBackend(profile)
        .catch(error => captureError(error, 'App.persistUserProfile'));
      const generatedPlan = await generateWorkoutPlan(profile, plans);
      saveNewPlan(generatedPlan);
      
      if (user) {
         const updatedUser = { ...user, profile };
         setUser(updatedUser);
         
         if ('Notification' in window && Notification.permission === 'default') {
           Notification.requestPermission().catch(() => {});
         } else if ('Notification' in window && Notification.permission === 'granted' && profile.preferredTime) {
           new Notification('Treino IA Gerado', {
             body: `Lembrete diário configurado para as ${profile.preferredTime}.`,
             icon: '/vite.svg'
           });
         }
      }
    } catch (error) {
      setError(getErrorMessage(error, 'Erro inesperado. Tente novamente.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportWorkout = async (base64: string, mimeType: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const importedPlan = await extractWorkoutFromFile(base64, mimeType);
      saveNewPlan(importedPlan);
    } catch (error) {
      setError(getErrorMessage(error, 'Erro ao importar. A imagem ou PDF estava legível?'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePlan = (updatedPlan: WorkoutPlan) => {
    const newPlans = plans.map(p => p.id === updatedPlan.id ? updatedPlan : p);
    setPlans(newPlans);
    void persistWorkoutPlansToBackend(newPlans, currentPlanId)
      .catch(error => captureError(error, 'App.persistUpdatedWorkoutPlans'));
  };

  const handleSaveSession = (session: WorkoutSession) => {
    const updated = [...sessions, session];
    setSessions(updated);
  };



  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setShowOnboarding(false);
  };

  const handleSettingsChange = (settings: AppSettings) => {
    setVoiceEnabled(settings.voiceEnabled);
    setLanguage('PT');
    setDarkMode(true);
  };

  const activeProfile = profile || user?.profile || null;
  const currentPlan = currentPlanId ? plans.find(p => p.id === currentPlanId) || null : null;
  const periodizationPerformances = useMemo(
    () => getPlanPerformances(currentPlan),
    [currentPlan]
  );
  const periodizationFatigue = useMemo<Partial<FatigueSnapshot>>(() => {
    const readiness = todayCheckin ? calculateReadiness(todayCheckin).score : 68;
    const weeklyVolume = periodizationPerformances.reduce((sum, item) => sum + item.sets, 0);
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentSessions = sessions.filter(session => session.completedAt >= sevenDaysAgo);

    return {
      date: new Date().toISOString(),
      readiness,
      soreness: getAverageSoreness(todayCheckin),
      sleep: todayCheckin ? Math.min(10, Math.round(todayCheckin.sleepHours)) : 7,
      stress: todayCheckin?.stressLevel ?? 4,
      weeklyVolume,
      completedSessions: recentSessions.length || undefined,
      missedSessions: 0,
    };
  }, [periodizationPerformances, sessions, todayCheckin]);

  if (view === 'loading') {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center">
        <div className="relative w-32 h-32 mb-8">
          <div className="absolute inset-0 border-4 border-brand-neon rounded-full animate-ping opacity-20"></div>
          <div className="absolute inset-2 border-4 border-brand-magenta rounded-full animate-spin border-t-transparent"></div>
          <Dumbbell className="w-16 h-16 text-brand-light absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <h2 className="font-display font-black text-6xl uppercase tracking-widest text-brand-light mb-2 text-shadow-neon">Inicializando</h2>
        <p className="text-brand-magenta font-mono font-bold uppercase tracking-widest animate-pulse">Carregando dados da forja...</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Carregando Aplicação...</div>}>
      {showOnboarding && (
        <OnboardingTour
          onComplete={handleCompleteOnboarding}
          onSkip={handleCompleteOnboarding}
        />
      )}
      <Dashboard />
    </Suspense>
  );
}
