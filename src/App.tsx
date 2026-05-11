import React, { lazy, Suspense, useState, useEffect, useMemo } from 'react';
import { AnamnesisForm } from './components/AnamnesisForm';
import { RegistrationForm } from './components/RegistrationForm';
import { HomeMenu } from './components/HomeMenu';
import { ImportWorkoutView } from './components/ImportWorkoutView';
import { DailyCheckinForm } from './components/DailyCheckin';
import { ReadinessIndex } from './components/ReadinessIndex';
import { RecoveryProtocol } from './components/RecoveryProtocol';
import { InjuryTracker } from './components/InjuryTracker';
import { NutritionPanel } from './components/NutritionPanel';
import { BodyCompositionTracker } from './components/BodyCompositionTracker';
import { OnboardingTour } from './components/OnboardingTour';
import { SettingsPanel } from './components/SettingsPanel';
import { InstallPrompt } from './components/InstallPrompt';
import { AppUpdateBanner } from './components/AppUpdateBanner';
import { generateWorkoutPlan, extractWorkoutFromFile } from './services/geminiService';
import { AppSettings, Badge, DailyCheckin as DailyCheckinType, FatigueSnapshot, RecoveryCheckin, StreakData, TrainingExercisePerformance, User, UserProfile, WorkoutHistoryEntry, WorkoutHistoryRecord, WorkoutPlan, WorkoutSession } from './types';
import { calculateReadiness, getTodayCheckin, loadCheckins } from './utils/readinessUtils';
import { loadHistory, recordWorkoutSession, getTotalVolumeLifted } from './utils/analyticsUtils';
import { loadStreak, recordWorkoutForStreak } from './utils/streakUtils';
import { evaluateAndUnlockBadges } from './utils/badgeUtils';
import { syncChallengeProgress } from './utils/challengeUtils';
import { recordGamificationEvent } from './services/gamificationService';
import { enqueueOfflineAction } from './utils/offlineQueue';
import { registerBackgroundSync } from './utils/pwaUtils';
import { saveDashboardSnapshot } from './utils/syncUtils';
import { captureError } from './utils/errorTelemetry';
import { applyTheme, loadThemeId } from './utils/themeUtils';
import { Activity, BrainCircuit, Dumbbell, Globe2, Moon, Rocket, Server, Settings as SettingsIcon, Share2, Sun, Trophy, X } from 'lucide-react';

type ViewState = 'loading' | 'registration' | 'home' | 'anamnesis' | 'import' | 'dashboard' | 'active-workout' | 'global_feed' | 'social' | 'gamification' | 'infrastructure' | 'platform' | 'billing';

import { AssistantPopup } from './components/AssistantPopup';
import { BillingCenter } from './components/BillingCenter';

import { FuturisticHUD } from './components/FuturisticHUD';
import { BotMessageSquare } from 'lucide-react';

const WorkoutDashboard = lazy(() => import('./components/WorkoutDashboard').then(module => ({ default: module.WorkoutDashboard })));
const ActiveWorkoutView = lazy(() => import('./components/ActiveWorkoutView').then(module => ({ default: module.ActiveWorkoutView })));
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard').then(module => ({ default: module.AnalyticsDashboard })));
const ConsistencyHeatmap = lazy(() => import('./components/ConsistencyHeatmap').then(module => ({ default: module.ConsistencyHeatmap })));
const StreakTracker = lazy(() => import('./components/StreakTracker').then(module => ({ default: module.StreakTracker })));
const BadgeSystem = lazy(() => import('./components/BadgeSystem').then(module => ({ default: module.BadgeSystem })));
const ChallengeCenter = lazy(() => import('./components/ChallengeCenter').then(module => ({ default: module.ChallengeCenter })));
const HabitReminder = lazy(() => import('./components/HabitReminder').then(module => ({ default: module.HabitReminder })));
const ReactivationEngine = lazy(() => import('./components/ReactivationEngine').then(module => ({ default: module.ReactivationEngine })));
const AICoach = lazy(() => import('./components/AICoach').then(module => ({ default: module.AICoach })));
const PlanAutoAdjust = lazy(() => import('./components/PlanAutoAdjust').then(module => ({ default: module.PlanAutoAdjust })));
const WorkoutShareCard = lazy(() => import('./components/WorkoutShareCard').then(module => ({ default: module.WorkoutShareCard })));
const BiometricDashboard = lazy(() => import('./components/BiometricDashboard').then(module => ({ default: module.BiometricDashboard })));
const HormonalCycleTracker = lazy(() => import('./components/HormonalCycleTracker').then(module => ({ default: module.HormonalCycleTracker })));
const HydrationTracker = lazy(() => import('./components/HydrationTracker').then(module => ({ default: module.HydrationTracker })));
const PoseDetector = lazy(() => import('./components/PoseDetector').then(module => ({ default: module.PoseDetector })));
const SleepTracker = lazy(() => import('./components/SleepTracker').then(module => ({ default: module.SleepTracker })));
const WearableSync = lazy(() => import('./components/WearableSync').then(module => ({ default: module.WearableSync })));
const SocialHub = lazy(() => import('./components/SocialHub').then(module => ({ default: module.SocialHub })));
const PeriodizationLab = lazy(() => import('./components/PeriodizationLab').then(module => ({ default: module.PeriodizationLab })));
const GamificationHub = lazy(() => import('./components/GamificationHub').then(module => ({ default: module.GamificationHub })));
const InfrastructureHub = lazy(() => import('./components/InfrastructureHub').then(module => ({ default: module.InfrastructureHub })));
const AdvancedPlatformHub = lazy(() => import('./components/platform/AdvancedPlatformHub').then(module => ({ default: module.AdvancedPlatformHub })));
const GlobalFeed = lazy(() => import('./components/GlobalFeed').then(module => ({ default: module.GlobalFeed })));
const MusicPlayer = lazy(() => import('./components/MusicPlayer').then(module => ({ default: module.MusicPlayer })));
const AICoachChat = lazy(() => import('./components/AICoachChat').then(module => ({ default: module.AICoachChat })));

const ONBOARDING_KEY = '@TreinoApp:onboarded';
const LIGHT_THEME_VARS = {
  '--color-brand-dark': '#F8FAFC',
  '--color-brand-gray': '#FFFFFF',
  '--color-brand-surface': '#E2E8F0',
  '--color-brand-light': '#0F172A',
  '--color-brand-muted': '#64748B',
  '--color-white': '#0F172A',
};

function extractFirstNumber(value?: string | number): number {
  if (typeof value === 'number') return value;
  const match = String(value || '').match(/\d+/);
  return match ? Number(match[0]) : 8;
}

function getPlanPerformances(plan: WorkoutPlan | null): TrainingExercisePerformance[] {
  if (!plan) return [];

  return plan.days.flatMap(day =>
    day.exercises.map(exercise => {
      const targetReps = extractFirstNumber(exercise.reps);
      const actualReps = extractFirstNumber(exercise.actualReps || exercise.reps);

      return {
        exerciseName: exercise.name,
        sets: exercise.sets,
        currentLoad: exercise.actualWeight ?? 0,
        targetReps,
        actualReps,
        rpe: exercise.rpe ?? 7,
        completed: exercise.completed ?? true,
      };
    })
  );
}

function getAverageSoreness(checkin: DailyCheckinType | null): number {
  if (!checkin) return 5;

  const values = Object.values(checkin.sorenessMap);
  if (!values.length) return 0;

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function loadInitialVoiceEnabled() {
  try {
    const settings = JSON.parse(localStorage.getItem('@TreinoApp:settings') || '{}') as Partial<AppSettings>;
    return Boolean(settings.voiceEnabled);
  } catch {
    return false;
  }
}

export default function App() {
  const [view, setView] = useState<ViewState>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryRecord[]>([]);
  const [analyticsHistory, setAnalyticsHistory] = useState<WorkoutHistoryEntry[]>(() => loadHistory());
  const [streakData, setStreakData] = useState<StreakData>(() => loadStreak());
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [challengeVersion, setChallengeVersion] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [recoveryCheckin, setRecoveryCheckin] = useState<RecoveryCheckin | null>(null);
  const [todayCheckin, setTodayCheckin] = useState<DailyCheckinType | null>(() => getTodayCheckin());
  const [allCheckins, setAllCheckins] = useState<DailyCheckinType[]>(() => loadCheckins());
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState<'PT' | 'EN'>('PT');
  const [voiceEnabled, setVoiceEnabled] = useState(loadInitialVoiceEnabled);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCoachChat, setShowCoachChat] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem(ONBOARDING_KEY));
  const [shareEntry, setShareEntry] = useState<WorkoutHistoryEntry | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCoach, setShowCoach] = useState(false);

  // For tab navigation when a user is logged in
  const [activeTab, setActiveTab] = useState<'my_workouts' | 'global_feed' | 'social' | 'gamification' | 'infrastructure' | 'platform' | 'billing'>('my_workouts');

  useEffect(() => {
    applyTheme(loadThemeId());
  }, []);

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
    const savedUser = localStorage.getItem('@TreinoApp:user');
    const savedPlans = localStorage.getItem('@TreinoApp:plans');
    const savedHistory = localStorage.getItem('@TreinoApp:history');
    const savedProfile = localStorage.getItem('@TreinoApp:profile');
    const savedSessions = localStorage.getItem('@TreinoApp:sessions');
    const savedRecovery = localStorage.getItem('@TreinoApp:recovery');
    const savedTheme = localStorage.getItem('@TreinoApp:theme');

    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }

    if (savedHistory) {
      setWorkoutHistory(JSON.parse(savedHistory));
    }

    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }

    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }

    if (savedRecovery) {
      setRecoveryCheckin(JSON.parse(savedRecovery));
    }

    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      void recordGamificationEvent('login').catch(error => captureError(error, 'App.recordLogin'));
      if (parsedUser.profile && !savedProfile) {
        setProfile(parsedUser.profile);
      }
      if (savedPlans) {
        try {
          const parsed = JSON.parse(savedPlans);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPlans(parsed);
            setCurrentPlanId(parsed[0].id);
            setView('dashboard');
            return;
          }
        } catch (e) {
          console.error("Failed to restore plans");
        }
      }
      setView('home');
    } else {
      setView('registration');
    }
  }, []);

  const handleRegister = (newUser: User) => {
    localStorage.setItem('@TreinoApp:user', JSON.stringify(newUser));
    void recordGamificationEvent('login').catch(error => captureError(error, 'App.recordLogin'));
    setUser(newUser);
    if (newUser.profile) {
      setProfile(newUser.profile);
      localStorage.setItem('@TreinoApp:profile', JSON.stringify(newUser.profile));
    }
    
    // Attempt to request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    if (newUser.profile && plans.length > 0) {
      setView('dashboard');
    } else {
      setView('home');
    }
  };

  const saveNewPlan = (generatedPlan: WorkoutPlan) => {
    const newPlans = [generatedPlan, ...plans];
    setPlans(newPlans);
    setCurrentPlanId(generatedPlan.id);
    localStorage.setItem('@TreinoApp:plans', JSON.stringify(newPlans));
    setView('dashboard');
  };

  const handleAnamnesisSubmit = async (profile: UserProfile) => {
    setIsLoading(true);
    setError(null);
    try {
      localStorage.setItem('@TreinoApp:profile', JSON.stringify(profile));
      setProfile(profile);
      const generatedPlan = await generateWorkoutPlan(profile, plans);
      saveNewPlan(generatedPlan);
      
      if (user) {
         const updatedUser = { ...user, profile };
         setUser(updatedUser);
         localStorage.setItem('@TreinoApp:user', JSON.stringify(updatedUser));
         
         if ('Notification' in window && Notification.permission === 'default') {
           Notification.requestPermission().catch(() => {});
         } else if ('Notification' in window && Notification.permission === 'granted' && profile.preferredTime) {
           new Notification('Treino IA Gerado', {
             body: `Lembrete diário configurado para as ${profile.preferredTime}.`,
             icon: '/vite.svg'
           });
         }
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado. Tente novamente.');
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
    } catch (err: any) {
      setError(err.message || 'Erro ao importar. A imagem ou PDF estava legível?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePlan = (updatedPlan: WorkoutPlan) => {
    const newPlans = plans.map(p => p.id === updatedPlan.id ? updatedPlan : p);
    setPlans(newPlans);
    localStorage.setItem('@TreinoApp:plans', JSON.stringify(newPlans));
  };

  const handleSaveSession = (session: WorkoutSession) => {
    const updated = [...sessions, session];
    setSessions(updated);
    localStorage.setItem('@TreinoApp:sessions', JSON.stringify(updated));
  };

  const handleSaveRecoveryCheckin = (checkin: RecoveryCheckin) => {
    setRecoveryCheckin(checkin);
    localStorage.setItem('@TreinoApp:recovery', JSON.stringify(checkin));
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

  const getStoredArrayCount = (key: string) => {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  };

  const refreshEngagement = (
    nextStreak = streakData,
    nextHistory = analyticsHistory,
    nextCheckins = allCheckins
  ) => {
    syncChallengeProgress(
      nextHistory.length,
      getTotalVolumeLifted(nextHistory),
      nextCheckins.length
    );
    setChallengeVersion(value => value + 1);

    const newly = evaluateAndUnlockBadges(
      nextStreak,
      nextHistory,
      nextCheckins.length,
      getStoredArrayCount('@TreinoApp:prs'),
      getStoredArrayCount('@TreinoApp:meals')
    );
    if (newly.length) setNewBadges(newly);
  };

  const handleSaveCheckin = (checkin: DailyCheckinType) => {
    const updatedCheckins = loadCheckins();
    setTodayCheckin(checkin);
    setAllCheckins(updatedCheckins);
    refreshEngagement(streakData, analyticsHistory, updatedCheckins);
    void recordGamificationEvent('checkin').catch(error => captureError(error, 'App.dailyCheckin'));
    saveLocalDashboardSnapshot(analyticsHistory, streakData, updatedCheckins);
  };

  const saveLocalDashboardSnapshot = (
    nextHistory = analyticsHistory,
    nextStreak = streakData,
    nextCheckins = allCheckins
  ) => {
    try {
      saveDashboardSnapshot(user?.email || user?.name || 'local-user', {
        plans: plans.length,
        workoutHistory: nextHistory.length,
        totalVolume: getTotalVolumeLifted(nextHistory),
        currentStreak: nextStreak.currentStreak,
        checkins: nextCheckins.length,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      captureError(error, 'App.saveLocalDashboardSnapshot');
    }
  };

  const enqueueWorkoutSync = (record: WorkoutHistoryRecord) => {
    if (!navigator.onLine) {
      void enqueueOfflineAction({
        type: 'WORKOUT_SESSION_COMPLETED',
        payload: record,
      })
        .then(() => registerBackgroundSync())
        .catch(error => captureError(error, 'App.enqueueWorkoutOffline'));
    }
  };

  const handleCompleteDay = (record: WorkoutHistoryRecord) => {
    const newHistory = [...workoutHistory, record];
    setWorkoutHistory(newHistory);
    localStorage.setItem('@TreinoApp:history', JSON.stringify(newHistory));
    enqueueWorkoutSync(record);
    void recordGamificationEvent('workout_completed', record.id)
      .catch(error => captureError(error, 'App.workoutCompletedGamification'));

    const completedPlan = plans.find(plan => plan.id === record.planId);
    const completedDayIndex = completedPlan?.days.findIndex(day => day.id === record.dayId) ?? -1;
    if (completedPlan && completedDayIndex >= 0) {
      const completedEntry = recordWorkoutSession(
        completedPlan,
        completedDayIndex,
        record.durationMinutes,
        todayCheckin ? calculateReadiness(todayCheckin).score : undefined
      );
      const nextAnalyticsHistory = loadHistory();
      const nextStreak = recordWorkoutForStreak();
      setAnalyticsHistory(nextAnalyticsHistory);
      setStreakData(nextStreak);
      setShareEntry(completedEntry);
      refreshEngagement(nextStreak, nextAnalyticsHistory, allCheckins);
      saveLocalDashboardSnapshot(nextAnalyticsHistory, nextStreak, allCheckins);
    }
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
    <div className="min-h-screen bg-brand-dark text-brand-light font-sans antialiased py-8 md:py-12 px-4 selection:bg-brand-neon selection:text-brand-dark transition-colors duration-500">
      <Suspense fallback={
        <div className="max-w-5xl mx-auto bg-brand-gray border-2 border-brand-light/10 p-5 font-mono text-sm text-brand-neon uppercase tracking-widest">
          Carregando módulo...
        </div>
      }>
      {showOnboarding && (
        <OnboardingTour
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingComplete}
        />
      )}
      
      {/* Header & Navbar */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between mb-12 gap-6 relative z-20">
        <div 
          onClick={() => { if(user) setView(plans.length > 0 ? 'dashboard' : 'home'); }}
          className={`flex items-center gap-3 transition-transform hover:scale-105 ${user ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <div className="bg-brand-neon text-brand-dark p-2 rounded-2xl shadow-brutal-neon animate-pulse-glow">
            <Dumbbell className="w-8 h-8" />
          </div>
          <span className="font-display font-black text-4xl uppercase tracking-widest leading-none mt-1">TREINO<br/><span className="text-brand-neon text-shadow-neon">BRUTAL</span></span>
        </div>

        {user && view !== 'registration' && (
          <div className="flex flex-wrap items-center justify-center gap-3 bg-brand-gray border-2 border-brand-light/20 p-2 rounded-[2rem] shadow-[0_0_15px_rgba(0,0,0,0.2)]">
            
            <div className="flex items-center gap-2 border-r-2 border-brand-light/20 pr-4">
               <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-brand-muted hover:text-brand-neon transition-colors" title="Toggle Theme">
                 {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
               </button>
               <button onClick={() => setLanguage(l => l === 'PT' ? 'EN' : 'PT')} className="font-bold font-mono text-sm uppercase text-brand-muted hover:text-brand-neon transition-colors flex items-center">
                 <Globe2 className="w-4 h-4 mr-1" /> {language}
               </button>
            </div>

            <div className="flex items-center gap-1 border-r-2 border-brand-light/20 pr-3">
              <button
                onClick={() => activeProfile && setShowCoach(true)}
                disabled={!activeProfile}
                className="p-2 text-brand-muted hover:text-brand-neon transition-colors disabled:opacity-30"
                title="APEX Coach"
              >
                <BrainCircuit className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  const latest = analyticsHistory[analyticsHistory.length - 1];
                  if (latest) setShareEntry(latest);
                }}
                disabled={analyticsHistory.length === 0}
                className="p-2 text-brand-muted hover:text-brand-neon transition-colors disabled:opacity-30"
                title="Compartilhar último treino"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-brand-muted hover:text-brand-neon transition-colors"
                title="Configurações"
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
            </div>

            <button 
              onClick={() => { setActiveTab('my_workouts'); setView(plans.length > 0 ? 'dashboard' : 'home'); }}
              className={`px-5 py-2 font-mono font-bold text-sm uppercase flex items-center transition-colors rounded-full ${activeTab === 'my_workouts' && view !== 'global_feed' ? 'bg-brand-neon text-brand-dark shadow-[0_0_10px_var(--color-brand-neon)]' : 'text-brand-muted hover:text-brand-light hover:bg-brand-light/5'}`}
            >
              <Dumbbell className="w-4 h-4 mr-2" /> Meus Treinos
            </button>
            <button 
              onClick={() => { setActiveTab('social'); setView('social'); }}
              className={`px-5 py-2 font-mono font-bold text-sm uppercase flex items-center transition-colors rounded-full ${view === 'social' ? 'bg-brand-neon text-brand-dark shadow-[0_0_10px_var(--color-brand-neon)]' : 'text-brand-muted hover:text-brand-light hover:bg-brand-light/5'}`}
            >
              <Globe2 className="w-4 h-4 mr-2" /> Comunidade
            </button>
            <button
              onClick={() => { setActiveTab('gamification'); setView('gamification'); }}
              className={`px-5 py-2 font-mono font-bold text-sm uppercase flex items-center transition-colors rounded-full ${view === 'gamification' ? 'bg-brand-neon text-brand-dark shadow-[0_0_10px_var(--color-brand-neon)]' : 'text-brand-muted hover:text-brand-light hover:bg-brand-light/5'}`}
            >
              <Trophy className="w-4 h-4 mr-2" /> Gamificacao
            </button>
            <button
              onClick={() => { setActiveTab('infrastructure'); setView('infrastructure'); }}
              className={`px-5 py-2 font-mono font-bold text-sm uppercase flex items-center transition-colors rounded-full ${view === 'infrastructure' ? 'bg-brand-neon text-brand-dark shadow-[0_0_10px_var(--color-brand-neon)]' : 'text-brand-muted hover:text-brand-light hover:bg-brand-light/5'}`}
            >
              <Server className="w-4 h-4 mr-2" /> Infra
            </button>
            <button
              onClick={() => { setActiveTab('billing'); setView('billing'); }}
              className={`px-5 py-2 font-mono font-bold text-sm uppercase flex items-center transition-colors rounded-full ${view === 'billing' ? 'bg-brand-neon text-brand-dark shadow-[0_0_10px_var(--color-brand-neon)]' : 'text-brand-muted hover:text-brand-light hover:bg-brand-light/5'}`}
            >
              <Activity className="w-4 h-4 mr-2" /> Assinatura
            </button>
            <button
              onClick={() => { setActiveTab('platform'); setView('platform'); }}
              className={`px-5 py-2 font-mono font-bold text-sm uppercase flex items-center transition-colors rounded-full ${view === 'platform' ? 'bg-brand-neon text-brand-dark shadow-[0_0_10px_var(--color-brand-neon)]' : 'text-brand-muted hover:text-brand-light hover:bg-brand-light/5'}`}
            >
              <Rocket className="w-4 h-4 mr-2" /> Plataforma
            </button>
            <div className="ml-2 pl-2 border-l-2 border-brand-light/20 flex items-center gap-3">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-brand-neon object-cover shadow-[0_0_10px_var(--color-brand-neon)]" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-neon text-brand-dark flex items-center justify-center font-bold font-display text-xl uppercase shadow-[0_0_10px_var(--color-brand-neon)]">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {user && view !== 'registration' && (
        <div className="max-w-5xl mx-auto">
          <FuturisticHUD user={user} />
        </div>
      )}

      {error && (
        <div className="max-w-2xl mx-auto mb-8 bg-brand-magenta text-brand-light border-4 border-brand-light p-4 flex items-center shadow-brutal-light font-mono font-bold">
          <Activity className="w-6 h-6 mr-4 shrink-0" />
          <p className="text-sm uppercase tracking-widest">{error}</p>
        </div>
      )}

      {view === 'registration' && (
        <RegistrationForm onRegister={handleRegister} />
      )}

      {view === 'home' && user && (
        <div className="max-w-5xl mx-auto mb-6 relative">
          {plans.length > 0 && (
             <button onClick={() => setView('dashboard')} className="absolute -top-12 left-0 text-brand-neon hover:text-brand-magenta hover:underline text-sm font-bold uppercase tracking-widest font-mono transition-colors">&larr; Voltar ao Treino Atual</button>
          )}
          <HomeMenu 
            user={user} 
            onCreateNew={() => setView('anamnesis')} 
            onImport={() => setView('import')} 
            onUpdateUser={handleRegister}
          />
        </div>
      )}

      {view === 'anamnesis' && (
        <div className="max-w-5xl mx-auto mb-6 relative">
          <button onClick={() => setView(plans.length > 0 ? 'dashboard' : 'home')} className="absolute -top-10 left-4 text-brand-neon hover:text-brand-magenta hover:underline text-sm font-bold uppercase tracking-widest font-mono transition-colors">&larr; Voltar</button>
          <AnamnesisForm onSubmit={handleAnamnesisSubmit} isLoading={isLoading} />
        </div>
      )}

      {view === 'import' && (
        <div className="max-w-5xl mx-auto mb-6 relative">
          <button onClick={() => setView(plans.length > 0 ? 'dashboard' : 'home')} className="absolute -top-10 left-4 text-brand-neon hover:text-brand-magenta hover:underline text-sm font-bold uppercase tracking-widest font-mono transition-colors">&larr; Voltar</button>
          <ImportWorkoutView 
            onImport={handleImportWorkout} 
            onCancel={() => setView(plans.length > 0 ? 'dashboard' : 'home')} 
            isLoading={isLoading} 
          />
        </div>
      )}

      {view === 'dashboard' && currentPlan && (
        <WorkoutDashboard 
          plan={currentPlan} 
          history={plans}
          workoutHistory={workoutHistory}
          sessions={sessions}
          profile={activeProfile}
          recoveryCheckin={recoveryCheckin}
          userProfile={activeProfile || undefined}
          onUpdatePlan={handleUpdatePlan}
          onSaveSession={handleSaveSession}
          onSaveRecoveryCheckin={handleSaveRecoveryCheckin}
          onSelectHistory={(id) => setCurrentPlanId(id)}
          onNew={() => setView('home')} 
          onCompleteDay={handleCompleteDay}
          onSaveNewPlan={saveNewPlan}
          onStartActiveWorkout={() => setView('active-workout')}
          voiceEnabled={voiceEnabled}
          onVoiceEnabledChange={setVoiceEnabled}
          dailyCheckin={todayCheckin}
          allDailyCheckins={allCheckins}
        />
      )}

      {view === 'dashboard' && currentPlan && (
        <div className="max-w-5xl mx-auto mt-8 space-y-6 print:hidden">
          <ReactivationEngine
            streak={streakData}
            userName={user?.name}
            goal={activeProfile?.goal}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StreakTracker streak={streakData} />
            <HabitReminder />
          </div>

          <AnalyticsDashboard history={analyticsHistory} plans={plans} />
          <ConsistencyHeatmap history={analyticsHistory} checkins={allCheckins} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BadgeSystem newlyUnlocked={newBadges} onDismiss={() => setNewBadges([])} />
            <ChallengeCenter key={challengeVersion} />
          </div>
        </div>
      )}

      {view === 'dashboard' && currentPlan && activeProfile && (
        <div className="max-w-5xl mx-auto mt-8 space-y-6 print:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DailyCheckinForm existing={todayCheckin} onSave={handleSaveCheckin} />
            <ReadinessIndex checkin={todayCheckin} allCheckins={allCheckins} />
          </div>

          <PlanAutoAdjust
            plan={currentPlan}
            history={analyticsHistory}
            checkins={allCheckins}
            profile={activeProfile}
          />

          <PeriodizationLab
            performances={periodizationPerformances}
            fatigue={periodizationFatigue}
          />

          <div className="space-y-4">
            <div>
              <p className="text-brand-neon font-mono text-xs uppercase tracking-widest">Bloco 6</p>
              <h2 className="font-display text-4xl uppercase tracking-widest text-brand-light text-shadow-neon">Inteligência Corporal</h2>
            </div>

            <BiometricDashboard profile={activeProfile} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WearableSync profile={activeProfile} />
              <PoseDetector />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HydrationTracker weightKg={activeProfile.weight} workoutMinutes={60} />
              <SleepTracker />
            </div>

            <HormonalCycleTracker />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecoveryProtocol plan={currentPlan} checkin={todayCheckin} allCheckins={allCheckins} profile={activeProfile} />
            <InjuryTracker />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NutritionPanel profile={activeProfile} />
            <BodyCompositionTracker />
          </div>
        </div>
      )}

      {view === 'active-workout' && currentPlan && (
        <ActiveWorkoutView
          plan={currentPlan}
          onClose={() => setView('dashboard')}
          onUpdatePlan={handleUpdatePlan}
          voiceEnabled={voiceEnabled}
        />
      )}

      {view === 'global_feed' && (
        <GlobalFeed />
      )}

      {view === 'social' && (
        <SocialHub />
      )}

      {view === 'gamification' && (
        <GamificationHub />
      )}

      {view === 'infrastructure' && (
        <InfrastructureHub />
      )}

      {view === 'platform' && (
        <AdvancedPlatformHub
          userName={user?.name}
          profile={activeProfile}
          currentPlan={currentPlan}
        />
      )}

      {view === 'billing' && (
        <BillingCenter />
      )}

      {shareEntry && (
        <WorkoutShareCard
          entry={shareEntry}
          streak={streakData}
          userName={user?.name}
          onClose={() => setShareEntry(null)}
        />
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4 print:hidden">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="absolute right-3 top-3 z-10 p-2 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20"
              aria-label="Fechar configurações"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
            <SettingsPanel
              plans={plans}
              history={analyticsHistory}
              streak={streakData}
              onSettingsChange={handleSettingsChange}
            />
          </div>
        </div>
      )}

      {showCoach && activeProfile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4 print:hidden">
          <div className="w-full max-w-3xl relative">
            <button
              type="button"
              onClick={() => setShowCoach(false)}
              className="absolute right-3 top-3 z-10 p-2 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20"
              aria-label="Fechar coach"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
            <AICoach
              profile={activeProfile}
              currentPlan={currentPlan}
              streak={streakData.currentStreak}
            />
          </div>
        </div>
      )}

      <MusicPlayer />
      <AssistantPopup />
      <InstallPrompt />
      <AppUpdateBanner />
      
      {user && view === 'dashboard' && (
        <>
           {!showCoachChat && (
             <button 
               onClick={() => setShowCoachChat(true)}
               className="fixed bottom-6 left-6 bg-brand-neon text-brand-dark p-4 rounded-full shadow-brutal-neon border-brutal hover:scale-110 transition-transform z-40 flex items-center group"
             >
               <BotMessageSquare className="w-6 h-6" />
             </button>
           )}
           {showCoachChat && (
             <AICoachChat user={user} onClose={() => setShowCoachChat(false)} />
           )}
        </>
      )}
      </Suspense>
    </div>
  );
}

