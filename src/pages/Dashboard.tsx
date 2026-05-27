import { type FormEvent, lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Dumbbell, UserRound } from 'lucide-react';
import {
  createDefaultProfile,
  DatabaseService,
  type ExerciseIntensityTechnique,
  PersistenceStatus,
  TrainingPlan,
  UserProfile,
  WorkoutExerciseLog,
  WorkoutSession,
} from '../services/database';
import { CurrentPlanConsistencyHelper } from '../services/data/currentPlanConsistency';
import {
  aiRecommendationRepository,
  type AiRecommendationRecord,
} from '../services/data/aiRecommendationRepository';
import { calculateTrainingPlan } from '../rules/iaEngine';
import { BottomNav } from '../components/BottomNav';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Skeleton } from '../components/ui/Skeleton';
import { type User as StarterUser } from '../types';
import { getDashboardMobileSections, type DashboardSectionId } from '../utils/dashboardNavigation';
import {
  getAppRouteTargetId,
  getCurrentAppRoute,
  pushAppRoute,
  subscribeToAppRoute,
} from '../navigation/appRouter';
import { isProductFeatureVisible } from '../config/featureFlags';
import { ActiveExerciseDraft } from './Dashboard/types';
import {
  buildWorkoutExerciseLog,
  calculateWorkoutTonnage,
} from './Dashboard/services/activeWorkoutEngine';
import {
  createActiveDraft,
  createDashboardSessionId,
  persistStarterUser,
  readStarterUser,
} from './Dashboard/services/dashboardSession';
import { validateDashboardProfileInput } from './Dashboard/services/dashboardValidation';
import {
  reorderExercisesInDay,
  updateExerciseNotes,
  updateExerciseTechnique,
} from './Dashboard/services/workoutAuthoring';
import { triggerHapticFeedback } from '../services/hapticFeedback';
import { type WorkoutImportFileDraft } from '../services/workoutImportPipeline';
import { getCriticalContrastClass } from '../utils/accessibilityContrast';
import { trackDay7Return, trackEvent, trackEventOnce } from '../utils/analytics';
import { captureError } from '../utils/errorTelemetry';
import {
  AnamnesisForm,
  WeeklyPlan,
  HistoryPanel,
  ActiveWorkout,
  DashboardSkeleton,
  PlanGenerationProgress,
  PendingAiRecommendationCard,
  AccountSection,
  CoreOverview,
  DashboardBetaPanels,
} from './Dashboard/components';
import { buildGamificationRetentionState } from './Dashboard/services/gamificationRetentionEngine';
import { buildRemoteGamifiedState } from './Dashboard/services/remoteGamifiedEngine';

const PLAN_GENERATION_FEEDBACK_MS = 750;
const primaryActionClass = getCriticalContrastClass('primaryAction');
const positiveStatusClass = getCriticalContrastClass('positiveStatus');
const warningStatusClass = getCriticalContrastClass('warningStatus');
const RegistrationForm = lazy(() =>
  import('../components/RegistrationForm').then((module) => ({ default: module.RegistrationForm })),
);
const ImportWorkoutView = lazy(() =>
  import('../components/ImportWorkoutView').then((module) => ({
    default: module.ImportWorkoutView,
  })),
);
const TrainingReportPanel = lazy(() =>
  import('./Dashboard/components/TrainingReportPanel').then((module) => ({
    default: module.TrainingReportPanel,
  })),
);

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function LazyPanelFallback() {
  return <Skeleton lines={3} />;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formProfile, setFormProfile] = useState<UserProfile>(() => createDefaultProfile());
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [persistence, setPersistence] = useState<PersistenceStatus | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [showStarterRegistration, setShowStarterRegistration] = useState(false);
  const [showAnamnesis, setShowAnamnesis] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);
  const [activeDraft, setActiveDraft] = useState<ActiveExerciseDraft[]>([]);
  const [activeFeedback, setActiveFeedback] = useState('');
  const [generationProgress, setGenerationProgress] = useState<{
    profile: UserProfile;
    plan: TrainingPlan;
  } | null>(null);
  const [activeSection, setActiveSection] = useState<DashboardSectionId>('overview');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showWorkoutImport, setShowWorkoutImport] = useState(false);
  const [workoutImportLoading, setWorkoutImportLoading] = useState(false);
  const [pendingRecommendation, setPendingRecommendation] = useState<AiRecommendationRecord | null>(
    null,
  );
  const [route, setRoute] = useState(() => getCurrentAppRoute());

  const surface = useMemo(
    () => ({
      nutritionSimple: isProductFeatureVisible('nutrition.simple'),
      recoverySimple: isProductFeatureVisible('recovery.simple'),
      workoutImportManual: isProductFeatureVisible('workoutImport.manual'),
      social: isProductFeatureVisible('social'),
      advancedGamification: isProductFeatureVisible('gamification.advanced'),
      advancedWellness: isProductFeatureVisible('advancedWellness'),
      advancedAccessibility: isProductFeatureVisible('advancedAccessibility'),
      premiumUx: isProductFeatureVisible('premiumUx'),
      advancedAi: isProductFeatureVisible('advancedAi'),
      mediaEnhancements: isProductFeatureVisible('mediaEnhancements'),
      cameraFormCheck: isProductFeatureVisible('cameraFormCheck'),
      webxr: isProductFeatureVisible('webxr'),
      partnerTokens: isProductFeatureVisible('partnerTokens'),
      nutritionPhotoAnalysis: isProductFeatureVisible('nutrition.photoAnalysis'),
      marketplace: isProductFeatureVisible('marketplace'),
      premiumIntegrations: isProductFeatureVisible('premiumIntegrations'),
    }),
    [],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const status = await DatabaseService.getPersistenceStatus();
      const storedProfile = await DatabaseService.getProfile();
      const storedHistory = await DatabaseService.getWorkoutHistory();
      const starterUser = readStarterUser() as (StarterUser & { createdAt?: number }) | null;

      setPersistence(status);
      setHistory(storedHistory);
      trackDay7Return(starterUser?.createdAt, {
        hasProfile: Boolean(storedProfile),
        historyCount: storedHistory.length,
      });

      if (!storedProfile) {
        setFormProfile({
          ...createDefaultProfile(),
          name: starterUser?.name?.trim() || 'Atleta',
        });
        setAuthEmail(starterUser?.email?.trim() || '');
        setShowStarterRegistration(!starterUser);
        setShowAnamnesis(Boolean(starterUser));
        setProfile(null);
        setPlan(null);
        setPendingRecommendation(null);
        return;
      }

      const storedPlan = await DatabaseService.getCurrentPlan();
      const currentPlan = storedPlan?.days?.length
        ? storedPlan
        : calculateTrainingPlan(storedProfile, storedHistory);

      if (!storedPlan?.days?.length) {
        const res = await CurrentPlanConsistencyHelper.setCurrentPlan(currentPlan);
        if (res.status === 'local_fallback')
          setNotice('Plano salvo localmente. Aguardando sincronização.');
      }

      setProfile(storedProfile);
      setFormProfile(storedProfile);
      setPlan(currentPlan);
      setSelectedDayIndex(0);
      setShowStarterRegistration(false);
      setShowAnamnesis(false);
      setPendingRecommendation(
        await aiRecommendationRepository.getLatestPendingPlanRecommendation(),
      );
    } catch {
      setError('Não consegui carregar os dados. Verifique a configuração local ou Supabase.');
    } finally {
      setLoading(false);
    }
  }, []);

  const selectedDay = useMemo(
    () => plan?.days[selectedDayIndex] ?? plan?.days[0] ?? null,
    [plan, selectedDayIndex],
  );
  const mobileSections = useMemo(
    () =>
      getDashboardMobileSections(Boolean(profile && plan), {
        nutritionEnabled: surface.nutritionSimple,
      }),
    [profile, plan, surface.nutritionSimple],
  );

  const completionSummary = useMemo(() => {
    if (!history.length) return 'Sem sessões finalizadas ainda';
    const totalVolume = history.reduce((sum, session) => sum + session.totalVolume, 0);
    return `${history.length} sessões | ${Math.round(totalVolume).toLocaleString('pt-BR')} kg de volume`;
  }, [history]);

  const gamificationRetention = useMemo(
    () =>
      surface.advancedGamification && profile
        ? buildGamificationRetentionState(profile, history)
        : null,
    [profile, history, surface.advancedGamification],
  );

  const remoteGamifiedState = useMemo(
    () =>
      surface.advancedGamification && profile ? buildRemoteGamifiedState(profile, history) : null,
    [profile, history, surface.advancedGamification],
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => subscribeToAppRoute(setRoute), []);

  const handleProfileSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSaving(true);
      setError('');
      setNotice('');

      const validation = validateDashboardProfileInput(formProfile);
      if (!validation.success) {
        setError(validation.message);
        setSaving(false);
        return;
      }

      const isFirstPlan = !profile || !plan;

      try {
        const updatedProfile = validation.data;
        const startedAt = Date.now();
        const nextPlan = calculateTrainingPlan(updatedProfile, history);
        setGenerationProgress({ profile: updatedProfile, plan: nextPlan });

        await DatabaseService.saveProfile(updatedProfile);
        const res = await CurrentPlanConsistencyHelper.setCurrentPlan(nextPlan);
        if (res.status === 'local_fallback')
          setNotice('Plano salvo localmente. Aguardando sincronização.');
        await wait(Math.max(0, PLAN_GENERATION_FEEDBACK_MS - (Date.now() - startedAt)));

        setProfile(updatedProfile);
        setFormProfile(updatedProfile);
        setPlan(nextPlan);
        setSelectedDayIndex(0);
        setShowAnamnesis(false);
        setNotice('Anamnese salva e plano semanal recalculado.');
        setPersistence(await DatabaseService.getPersistenceStatus());
        trackEvent('anamnesis_completed', {
          goal: updatedProfile.goal,
          level: updatedProfile.level,
          daysPerWeek: updatedProfile.daysPerWeek,
        });
        if (isFirstPlan) {
          trackEventOnce('first_plan_created', {
            planId: nextPlan.id,
            daysPerWeek: updatedProfile.daysPerWeek,
            source: 'anamnesis_submit',
          });
        }
      } catch (saveError) {
        captureError(saveError, 'Dashboard.saveAnamnesis');
        setError('Não consegui salvar a anamnese agora.');
      } finally {
        setGenerationProgress(null);
        setSaving(false);
      }
    },
    [formProfile, history, plan, profile],
  );

  const handleStarterRegister = useCallback((starterUser: StarterUser) => {
    const persistedStarterUser = persistStarterUser(starterUser);
    const nextProfile = {
      ...createDefaultProfile(),
      name: persistedStarterUser.name || 'Atleta',
    };

    setFormProfile(nextProfile);
    setAuthEmail(persistedStarterUser.email);
    setShowStarterRegistration(false);
    setShowAnamnesis(true);
    setNotice('');
    setError('');
    trackEventOnce('registration_completed', {
      method: 'starter_local',
      hasEmail: Boolean(persistedStarterUser.email),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const regeneratePlan = useCallback(async () => {
    if (!profile) return;
    setSaving(true);
    setError('');
    setNotice('');

    try {
      const startedAt = Date.now();
      const updatedProfile = { ...profile, updatedAt: Date.now() };
      const nextPlan = calculateTrainingPlan(updatedProfile, history);
      setGenerationProgress({ profile: updatedProfile, plan: nextPlan });

      const res = await CurrentPlanConsistencyHelper.setCurrentPlan(nextPlan);
      if (res.status === 'local_fallback')
        setNotice('Plano salvo localmente. Aguardando sincronização.');
      await wait(Math.max(0, PLAN_GENERATION_FEEDBACK_MS - (Date.now() - startedAt)));

      setPlan(nextPlan);
      setSelectedDayIndex(0);
      setNotice('Plano recalculado com base no histórico mais recente.');
    } catch {
      setError('Não consegui recalcular o plano agora.');
    } finally {
      setGenerationProgress(null);
      setSaving(false);
    }
  }, [history, profile]);

  const persistEditedPlan = useCallback(async (nextPlan: TrainingPlan, successMessage: string) => {
    setPlan(nextPlan);
    setNotice(successMessage);
    setError('');

    try {
      const res = await CurrentPlanConsistencyHelper.setCurrentPlan(nextPlan);
      if (res.status === 'local_fallback')
        setNotice('Plano salvo localmente. Aguardando sincronização.');
    } catch {
      setError('Alteração aplicada na tela, mas não consegui salvar o plano agora.');
    }
  }, []);

  const moveSelectedExercise = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!plan) return;
      const nextPlan = reorderExercisesInDay(plan, selectedDayIndex, fromIndex, toIndex);
      if (nextPlan === plan) return;
      void persistEditedPlan(nextPlan, 'Ordem dos exercícios atualizada.');
    },
    [persistEditedPlan, plan, selectedDayIndex],
  );

  const updateSelectedExerciseTechnique = useCallback(
    (exerciseIndex: number, technique: ExerciseIntensityTechnique) => {
      if (!plan) return;
      const nextPlan = updateExerciseTechnique(plan, selectedDayIndex, exerciseIndex, technique);
      void persistEditedPlan(nextPlan, 'Técnica do exercício atualizada.');
    },
    [persistEditedPlan, plan, selectedDayIndex],
  );

  const updateSelectedExerciseNotes = useCallback(
    (exerciseIndex: number, notes: string) => {
      if (!plan) return;
      const nextPlan = updateExerciseNotes(plan, selectedDayIndex, exerciseIndex, notes);
      setPlan(nextPlan);
      setNotice('');
      setError('');
      void CurrentPlanConsistencyHelper.setCurrentPlan(nextPlan).catch(() => {
        setError('Nota aplicada na tela, mas não consegui salvar o plano agora.');
      });
    },
    [plan, selectedDayIndex],
  );

  const handleWorkoutImport = useCallback(async (draft: WorkoutImportFileDraft) => {
    setWorkoutImportLoading(true);
    setNotice('');
    setError('');

    try {
      if (draft.status === 'blocked') {
        setError(draft.warnings[0] ?? 'Arquivo bloqueado para importação.');
        return;
      }

      setNotice(
        `Arquivo ${draft.fileName} preparado localmente com crop ${draft.crop.width}% x ${draft.crop.height}%.`,
      );
      setShowWorkoutImport(false);
    } finally {
      setWorkoutImportLoading(false);
    }
  }, []);

  const handleMobileNavChange = useCallback(
    (id: string) => {
      const section = mobileSections.find((item) => item.id === id);
      if (!section) return;
      setActiveSection(section.id);
      pushAppRoute(section.routeId);
      document.getElementById(section.targetId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    },
    [mobileSections],
  );

  useEffect(() => {
    if (!profile || !plan) return;

    if (route.id === 'nutrition' && !surface.nutritionSimple) {
      setNotice('Nutricao esta em beta e nao esta habilitada para este usuario.');
      pushAppRoute('today');
      return;
    }

    const routeTargetId = getAppRouteTargetId(route.id);
    const routeSection = mobileSections.find((section) => section.targetId === routeTargetId);
    const routeScrollTimeouts: number[] = [];

    if (routeSection) {
      const scrollToRouteSection = (behavior: ScrollBehavior) => {
        const target = document.getElementById(routeSection.targetId);
        if (!target) return;

        target.scrollIntoView({ behavior, block: 'start' });
        setActiveSection(routeSection.id);
      };

      routeScrollTimeouts.push(window.setTimeout(() => scrollToRouteSection('smooth'), 0));
      routeScrollTimeouts.push(window.setTimeout(() => scrollToRouteSection('auto'), 800));
    }

    const handleScroll = () => {
      const lastSection = mobileSections[mobileSections.length - 1];
      const reachedPageEnd =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;

      if (reachedPageEnd && lastSection) {
        setActiveSection(lastSection.id);
        return;
      }

      const current = mobileSections.reduce<DashboardSectionId>((active, section) => {
        const element = document.getElementById(section.targetId);
        if (!element) return active;
        return element.getBoundingClientRect().top <= 140 ? section.id : active;
      }, mobileSections[0]?.id ?? 'overview');

      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      routeScrollTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
      window.removeEventListener('scroll', handleScroll);
    };
  }, [mobileSections, plan, profile, route.id, surface.nutritionSimple]);

  const startActiveWorkout = useCallback(
    (dayIndex: number, options: { syncRoute?: boolean } = {}) => {
      if (!plan) return;
      const day = plan.days[dayIndex];
      setActiveDayIndex(dayIndex);
      setActiveDraft(createActiveDraft(day, history));
      setActiveFeedback('');
      setNotice('');
      if (options.syncRoute !== false) {
        pushAppRoute('active-workout');
      }
      trackEvent('workout_started', {
        planId: plan.id,
        dayId: day.id,
        focus: day.focus,
      });
      if (history.length === 0) {
        trackEventOnce('first_workout_started', {
          planId: plan.id,
          dayId: day.id,
          focus: day.focus,
        });
      }
      void triggerHapticFeedback('selection');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [history, plan],
  );

  useEffect(() => {
    if (!profile || !plan || route.id !== 'active-workout' || activeDayIndex !== null) return;
    startActiveWorkout(selectedDayIndex, { syncRoute: false });
  }, [activeDayIndex, plan, profile, route.id, selectedDayIndex, startActiveWorkout]);

  const updateDraft = useCallback((index: number, patch: Partial<ActiveExerciseDraft>) => {
    setActiveDraft((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    );
  }, []);

  const updateDraftSet = useCallback(
    (exerciseIndex: number, setIndex: number, patch: Partial<ActiveExerciseDraft['sets'][0]>) => {
      if (patch.completed === true) {
        trackEvent('set_logged', {
          exerciseIndex,
          setIndex,
        });
      }

      setActiveDraft((current) =>
        current.map((item, i) => {
          if (i !== exerciseIndex) return item;
          const newSets = [...item.sets];
          newSets[setIndex] = { ...newSets[setIndex], ...patch };
          // Se um set foi concluído, avaliar se o exercício inteiro foi
          const allSetsCompleted = newSets.every((s) => s.completed);
          return { ...item, sets: newSets, completed: allSetsCompleted };
        }),
      );
    },
    [],
  );

  const finishActiveWorkout = useCallback(async () => {
    if (!profile || !plan || activeDayIndex === null) return;

    setSaving(true);
    setError('');

    try {
      const day = plan.days[activeDayIndex];
      const logs: WorkoutExerciseLog[] = activeDraft.map((exercise) =>
        buildWorkoutExerciseLog(exercise),
      );
      const completedExercises = logs.filter((exercise) => exercise.completed).length;
      const totalVolume = calculateWorkoutTonnage(activeDraft).completedTonnage;
      const session: WorkoutSession = {
        id: createDashboardSessionId(),
        planId: plan.id,
        dayId: day.id,
        dayName: day.dayName,
        focus: day.focus,
        completedAt: Date.now(),
        durationMinutes: profile.timePerWorkout,
        totalVolume,
        completedExercises,
        totalExercises: logs.length,
        feedback: activeFeedback.trim(),
        nextRecommendation: '',
        exercises: logs,
      };
      const nextHistory = [session, ...history.filter(item => item.id !== session.id)].slice(0, 50);
      const adjustedPlan = calculateTrainingPlan(profile, nextHistory);
      const completedSession = {
        ...session,
        nextRecommendation: adjustedPlan.nextRecommendation,
      };
      const finalHistory = [completedSession, ...history.filter(item => item.id !== completedSession.id)].slice(0, 50);

      const saveResult = await DatabaseService.saveWorkoutSessionWithStatus(completedSession);
      let recommendation: AiRecommendationRecord | null = null;
      try {
        recommendation = await aiRecommendationRepository.createPendingPlanRecommendation({
          currentPlan: plan,
          proposedPlan: adjustedPlan,
          reason: adjustedPlan.nextRecommendation,
          legacySourceSessionId: completedSession.id,
        });
      } catch (recommendationError) {
        trackEvent('ai_error', {
          operation: 'create_pending_plan_recommendation',
          source: 'finish_active_workout',
        });
        captureError(recommendationError, 'Dashboard.createPendingAiRecommendation');
      }

      setHistory(finalHistory);
      setPendingRecommendation(recommendation);
      setActiveDayIndex(null);
      setActiveDraft([]);
      const saveMessage = 'warning' in saveResult && saveResult.warning
        ? `${saveResult.message} ${saveResult.warning}`
        : saveResult.message;
      setNotice(
        recommendation
          ? `${saveMessage} A IA gerou uma sugestao pendente para voce revisar.`
          : `${saveMessage} Nao consegui gerar a sugestao da IA agora; seu historico foi mantido.`,
      );
      trackEvent('workout_completed', {
        planId: plan.id,
        dayId: day.id,
        totalVolume,
        completedExercises,
        totalExercises: logs.length,
      });
      if (history.length === 0) {
        trackEventOnce('first_workout_completed', {
          planId: plan.id,
          dayId: day.id,
          totalVolume,
          completedExercises,
          totalExercises: logs.length,
        });
      }
      if (recommendation) {
        trackEvent('ai_suggestion_generated', {
          recommendationId: recommendation.id,
          sourceSessionId: completedSession.id,
        });
      }
      pushAppRoute('history');
      void triggerHapticFeedback('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (saveError) {
      trackEvent('workout_save_failed', {
        planId: plan.id,
        dayId: plan.days[activeDayIndex]?.id,
      });
      captureError(saveError, 'Dashboard.finishActiveWorkout');
      setError('Não consegui finalizar o treino agora.');
    } finally {
      setSaving(false);
    }
  }, [activeDayIndex, activeDraft, activeFeedback, history, plan, profile]);

  const acceptPendingRecommendation = useCallback(async () => {
    if (!pendingRecommendation) return;

    setSaving(true);
    setError('');
    setNotice('');

    try {
      const proposedPlan = pendingRecommendation.payload.proposedPlan;
      const res = await CurrentPlanConsistencyHelper.setCurrentPlan(proposedPlan);
      if (res.status === 'failed') {
        throw new Error(res.error);
      }

      const applied = await aiRecommendationRepository.markApplied(
        pendingRecommendation,
        proposedPlan,
      );
      setPlan(proposedPlan);
      setPendingRecommendation(null);
      setSelectedDayIndex(0);
      setNotice(
        res.status === 'local_fallback'
          ? 'Sugestao aplicada localmente. Aguardando sincronizacao.'
          : 'Sugestao aceita e plano atualizado.',
      );
      trackEvent('ai_suggestion_accepted', {
        recommendationId: applied.id,
        planId: proposedPlan.id,
      });
    } catch {
      setError('Nao consegui aplicar a sugestao agora.');
    } finally {
      setSaving(false);
    }
  }, [pendingRecommendation]);

  const rejectPendingRecommendation = useCallback(async () => {
    if (!pendingRecommendation) return;

    setSaving(true);
    setError('');
    setNotice('');

    try {
      const rejected = await aiRecommendationRepository.reject(pendingRecommendation);
      setPendingRecommendation(null);
      setNotice('Sugestao rejeitada. Seu plano atual foi mantido.');
      trackEvent('ai_suggestion_rejected', {
        recommendationId: rejected.id,
      });
    } catch {
      setError('Nao consegui rejeitar a sugestao agora.');
    } finally {
      setSaving(false);
    }
  }, [pendingRecommendation]);

  const dismissPendingRecommendation = useCallback(async () => {
    if (!pendingRecommendation) return;

    setSaving(true);
    setError('');
    setNotice('');

    try {
      const dismissed = await aiRecommendationRepository.dismiss(pendingRecommendation);
      setPendingRecommendation(null);
      setNotice('Plano atual mantido. A sugestao foi arquivada.');
      trackEvent('ai_suggestion_dismissed', {
        recommendationId: dismissed.id,
      });
    } catch {
      setError('Nao consegui arquivar a sugestao agora.');
    } finally {
      setSaving(false);
    }
  }, [pendingRecommendation]);

  const handleAuth = useCallback(
    async (mode: 'signin' | 'signup') => {
      setAuthLoading(true);
      setError('');
      setNotice('');

      try {
        if (mode === 'signup') {
          await DatabaseService.signUp(authEmail, authPassword);
          setNotice(
            'Conta criada. Se o Supabase exigir confirmação, verifique seu e-mail antes de entrar.',
          );
          trackEvent('registration_completed', {
            method: 'supabase_signup',
          });
        } else {
          await DatabaseService.signIn(authEmail, authPassword);
          await DatabaseService.migrateLocalToCloud();
          setNotice('Nuvem conectada. Dados locais migrados quando disponíveis.');
        }
        await loadData();
      } catch (authError) {
        captureError(authError, `Dashboard.${mode}`);
        setError(
          authError instanceof Error ? authError.message : 'Falha na autenticação Supabase.',
        );
      } finally {
        setAuthLoading(false);
      }
    },
    [authEmail, authPassword, loadData],
  );

  const handleSignIn = useCallback(() => {
    void handleAuth('signin');
  }, [handleAuth]);

  const handleSignUp = useCallback(() => {
    void handleAuth('signup');
  }, [handleAuth]);

  const handleSignOut = useCallback(async () => {
    await DatabaseService.signOut();
    await loadData();
  }, [loadData]);

  const cancelActiveWorkout = useCallback(() => {
    setActiveDayIndex(null);
    pushAppRoute('plan');
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (activeDayIndex !== null && plan) {
    const day = plan.days[activeDayIndex];

    return (
      <ErrorBoundary section="ActiveWorkout">
        <ActiveWorkout
          day={day}
          activeDraft={activeDraft}
          activeFeedback={activeFeedback}
          saving={saving}
          onCancel={cancelActiveWorkout}
          onUpdateDraft={updateDraft}
          onUpdateDraftSet={updateDraftSet}
          onFeedbackChange={setActiveFeedback}
          onFinishWorkout={finishActiveWorkout}
          showCameraFeedback={surface.cameraFormCheck}
          showMediaEnhancements={surface.mediaEnhancements}
        />
      </ErrorBoundary>
    );
  }

  return (
    <main className="min-h-screen bg-brand-dark text-brand-light px-4 py-8 pb-28 md:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-[28px] border-2 border-brand-neon bg-brand-neon p-3 text-brand-dark shadow-brutal-neon">
              <Dumbbell className="h-9 w-9" />
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-brand-magenta">
                Beta privado
              </p>
              <h1 className="font-display text-6xl uppercase leading-none tracking-widest text-brand-light text-shadow-neon md:text-7xl">
                Treino <span className="block text-brand-neon">Inteligente</span>
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {!showStarterRegistration && (
              <button
                type="button"
                onClick={() => {
                  setShowAnamnesis((value) => !value);
                  if (profile) setFormProfile(profile);
                }}
                className={`rounded-full border-2 px-5 py-3 font-mono text-xs uppercase tracking-widest shadow-brutal-neon ${primaryActionClass}`}
              >
                {profile ? 'Editar anamnese' : 'Criar anamnese'}
              </button>
            )}
            {profile && (
              <button
                type="button"
                onClick={regeneratePlan}
                disabled={saving}
                className="rounded-full border-2 border-brand-light/20 bg-brand-gray px-5 py-3 font-mono text-xs uppercase tracking-widest text-brand-light transition-colors hover:border-brand-neon hover:text-brand-neon"
              >
                {saving ? 'Recalculando' : 'Recalcular plano'}
              </button>
            )}
            {surface.workoutImportManual && profile && plan && (
              <button
                type="button"
                onClick={() => setShowWorkoutImport((value) => !value)}
                className="rounded-full border-2 border-brand-light/20 bg-brand-gray px-5 py-3 font-mono text-xs uppercase tracking-widest text-brand-light transition-colors hover:border-brand-magenta hover:text-brand-magenta"
              >
                Importar ficha
              </button>
            )}
          </div>
        </header>

        {(notice || error) && (
          <div
            className={`mb-6 rounded-[24px] border-2 p-4 font-mono text-sm ${
              error ? warningStatusClass : positiveStatusClass
            }`}
          >
            {error || notice}
          </div>
        )}

        {generationProgress && (
          <PlanGenerationProgress
            profile={generationProgress.profile}
            history={history}
            plan={generationProgress.plan}
          />
        )}

        {surface.workoutImportManual && showWorkoutImport && profile && plan && (
          <Suspense fallback={<LazyPanelFallback />}>
            <ImportWorkoutView
              isLoading={workoutImportLoading}
              onImport={handleWorkoutImport}
              onCancel={() => setShowWorkoutImport(false)}
            />
          </Suspense>
        )}

        {showStarterRegistration && !profile ? (
          <Suspense fallback={<Skeleton lines={2} />}>
            <RegistrationForm onRegister={handleStarterRegister} />
          </Suspense>
        ) : !profile || !plan ? (
          <AccountSection
            persistence={persistence}
            email={authEmail}
            password={authPassword}
            loading={authLoading}
            billingEnabled={false}
            onEmailChange={setAuthEmail}
            onPasswordChange={setAuthPassword}
            onSignIn={handleSignIn}
            onSignUp={handleSignUp}
            onSignOut={handleSignOut}
          />
        ) : null}

        {!showStarterRegistration && showAnamnesis && (
          <AnamnesisForm
            profile={formProfile}
            saving={saving}
            onChange={setFormProfile}
            onSubmit={handleProfileSubmit}
          />
        )}

        {profile && plan ? (
          <>
            <CoreOverview
              profile={profile}
              plan={plan}
              historyCount={history.length}
              completionSummary={completionSummary}
              selectedDay={selectedDay}
              selectedDayIndex={selectedDayIndex}
              primaryActionClass={primaryActionClass}
              onStartWorkout={startActiveWorkout}
              profileTitle={gamificationRetention?.profileTitle}
            />

            <WeeklyPlan
              plan={plan}
              selectedDayIndex={selectedDayIndex}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDayIndex}
              onStartWorkout={startActiveWorkout}
              onMoveExercise={moveSelectedExercise}
              onUpdateExerciseTechnique={updateSelectedExerciseTechnique}
              onUpdateExerciseNotes={updateSelectedExerciseNotes}
            />

            <HistoryPanel history={history} />

            <Suspense fallback={<LazyPanelFallback />}>
              <TrainingReportPanel history={history} />
            </Suspense>

            {pendingRecommendation && (
              <PendingAiRecommendationCard
                recommendation={pendingRecommendation}
                saving={saving}
                onAccept={acceptPendingRecommendation}
                onReject={rejectPendingRecommendation}
                onDismiss={dismissPendingRecommendation}
              />
            )}

            <DashboardBetaPanels
              profile={profile}
              plan={plan}
              history={history}
              gamificationRetention={gamificationRetention}
              remoteGamifiedState={remoteGamifiedState}
              flags={{
                nutrition: surface.nutritionSimple,
                recovery: surface.recoverySimple,
                workoutImport: surface.workoutImportManual,
                social: surface.social,
                advancedGamification: surface.advancedGamification,
                advancedWellness: surface.advancedWellness,
                accessibility: surface.advancedAccessibility,
                advancedAi: surface.advancedAi,
                premiumUx: surface.premiumUx,
                mediaEnhancements: surface.mediaEnhancements,
                cameraFormCheck: surface.cameraFormCheck,
                webxr: surface.webxr,
                premiumIntegrations: surface.premiumIntegrations,
                partnerTokens: surface.partnerTokens,
              }}
            />

            <AccountSection
              persistence={persistence}
              email={authEmail}
              password={authPassword}
              loading={authLoading}
              billingEnabled={surface.marketplace}
              onEmailChange={setAuthEmail}
              onPasswordChange={setAuthPassword}
              onSignIn={handleSignIn}
              onSignUp={handleSignUp}
              onSignOut={handleSignOut}
            />
          </>
        ) : !showStarterRegistration ? (
          <section className="rounded-[28px] border-4 border-brand-neon bg-brand-gray p-8 text-center shadow-brutal-neon">
            <UserRound className="mx-auto mb-4 h-10 w-10 text-brand-neon" />
            <h2 className="font-display text-5xl uppercase text-brand-light">Crie sua anamnese</h2>
            <p className="mx-auto mt-3 max-w-2xl font-mono text-sm text-brand-light/70">
              O plano semanal, o modo treino ativo e o histórico dependem do perfil inicial.
            </p>
          </section>
        ) : null}
      </div>

      {profile && plan && (
        <BottomNav
          items={mobileSections}
          activeId={activeSection}
          onChange={handleMobileNavChange}
        />
      )}
    </main>
  );
}
