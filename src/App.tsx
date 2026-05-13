import React, { Suspense } from 'react';
import Dashboard from './pages/Dashboard';
import './index.css';

export default function App() {
  const [view, setView] = useState<ViewState>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [isPremium, setIsPremium] = useState(false);
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
  const [todayCheckin, setTodayCheckin] = useState<DailyCheckinType | null>(null);
  const [allCheckins, setAllCheckins] = useState<DailyCheckinType[]>([]);
  const [healthDataMode, setHealthDataMode] = useState<DataMode | undefined>();
  const [healthWarning, setHealthWarning] = useState<string | null>(null);
  const [checkinSaving, setCheckinSaving] = useState(false);
  const [checkinError, setCheckinError] = useState<string | null>(null);
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
  const [activeTab, setActiveTab] = useState<'my_workouts' | 'global_feed' | 'social' | 'gamification' | 'retention' | 'infrastructure' | 'platform' | 'billing'>('my_workouts');

  const refreshDailyCheckins = async () => {
    try {
      const result = await loadDailyCheckins();
      setAllCheckins(result.data);
      setTodayCheckin(getTodayCheckinFromList(result.data));
      setHealthDataMode(result.dataMode);
      setHealthWarning(result.warning ?? null);
      setCheckinError(null);
      return result.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao carregar check-ins.';
      setCheckinError(message);
      captureError(error, 'App.loadDailyCheckins');
      return allCheckins;
    }
  };

  const hydrateTrainingStateFromBackend = async () => {
    try {
      const result = await loadTrainingStateFromBackend();
      if (result.dataMode !== 'supabase') return;

      if (result.profile) {
        setProfile(result.profile);
      }

      if (result.history.length) {
        setWorkoutHistory(result.history);
      }

      if (result.plans.length) {
        setPlans(result.plans);
        setCurrentPlanId(result.currentPlanId || result.plans[0].id);
        setView('dashboard');
      }
    } catch (error) {
      captureError(error, 'App.hydrateTrainingStateFromBackend');
    }
  };

  const migrateLegacyTrainingState = async () => {
    try {
      const result = await migrateLegacyTrainingStateToBackend();
      if (result.dataMode === 'supabase') {
        await hydrateTrainingStateFromBackend();
      }
    } catch (error) {
      captureError(error, 'App.migrateLegacyTrainingState');
    }
  };

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
    void refreshDailyCheckins();

    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/u/')) {
      setView('public_profile');
      return;
    }
    if (currentPath.startsWith('/groups/join/')) {
      setView('social');
      return;
    }

    void migrateLegacyTrainingState();

    const savedTheme = localStorage.getItem('@TreinoApp:theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }

    fetchBillingEntitlement()
      .then(entitlement => setIsPremium(entitlement.isPremium))
      .catch(() => setIsPremium(false));

    setView('registration');
  }, []);

  useEffect(() => {
    return onAuthStateChange(event => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        void migrateLegacyTrainingState();
      }
    });
  }, []);

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
      setView('dashboard');
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
    setView('dashboard');
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
    void persistWorkoutPlansToBackend(newPlans, currentPlanId)
      .catch(error => captureError(error, 'App.persistUpdatedWorkoutPlans'));
  };

  const handleSaveSession = (session: WorkoutSession) => {
    const updated = [...sessions, session];
    setSessions(updated);
  };

  const handleSaveRecoveryCheckin = (checkin: RecoveryCheckin) => {
    setRecoveryCheckin(checkin);

    const today = new Date().toISOString().slice(0, 10);
    const dailyFromRecovery: DailyCheckinType = {
      id: todayCheckin?.id || crypto.randomUUID(),
      date: today,
      sleepHours: checkin.sleepHours,
      sleepQuality: todayCheckin?.sleepQuality || 3,
      stressLevel: checkin.stressLevel,
      sorenessMap: {
        ...(todayCheckin?.sorenessMap || {}),
        Geral: checkin.sorenessLevel,
      },
      energyLevel: checkin.energyLevel,
      hydrationGlasses: todayCheckin?.hydrationGlasses || 0,
      sleepGoalHours: todayCheckin?.sleepGoalHours || 8,
      notes: todayCheckin?.notes,
      timestamp: Date.now(),
    };

    void saveDailyCheckin(dailyFromRecovery)
      .then(async result => {
        setHealthDataMode(result.dataMode);
        setHealthWarning(result.warning ?? null);
        await refreshDailyCheckins();
      })
      .catch(error => {
        setCheckinError(error instanceof Error ? error.message : 'Falha ao salvar prontidão pré-treino.');
        captureError(error, 'App.saveRecoveryAsDailyCheckin');
      });
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

  const getNutritionMealCount = () => Math.max(
    getStoredArrayCount('@TreinoApp:meals:mock_dev_only'),
    getStoredArrayCount('@TreinoApp:meals')
  );

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
      getNutritionMealCount()
    );
    if (newly.length) setNewBadges(newly);
  };

  const handleSaveCheckin = async (checkin: DailyCheckinType) => {
    setCheckinSaving(true);
    setCheckinError(null);

    try {
      const saved = await saveDailyCheckin(checkin);
      setHealthDataMode(saved.dataMode);
      setHealthWarning(saved.warning ?? null);
      const updatedCheckins = await refreshDailyCheckins();
      setTodayCheckin(saved.data);
      refreshEngagement(streakData, analyticsHistory, updatedCheckins);
      void recordGamificationEvent('checkin').catch(error => captureError(error, 'App.dailyCheckin'));
      saveLocalDashboardSnapshot(analyticsHistory, streakData, updatedCheckins);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao salvar check-in.';
      setCheckinError(message);
      captureError(error, 'App.saveDailyCheckin');
      throw new Error(message);
    } finally {
      setCheckinSaving(false);
    }
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
    void persistWorkoutHistoryToBackend(newHistory)
      .catch(error => captureError(error, 'App.persistWorkoutHistory'));
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
      const nextStreak = recordWorkoutForStreak(streakData, new Date(record.date).toISOString().slice(0, 10));
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
    <Suspense fallback={<div>Carregando Aplicação...</div>}>
      <Dashboard />
    </Suspense>
  );
}
