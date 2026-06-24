import { type FormEvent, lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Dumbbell, UserRound } from 'lucide-react';
import {
  DatabaseService,
  type ExerciseIntensityTechnique,
  TrainingPlan,
  UserProfile,
  createDefaultProfile,
  normalizeProfile,
} from '../services/database';
import { CurrentPlanConsistencyHelper } from '../services/data/currentPlanConsistency';
import {
  aiRecommendationRepository,
} from '../services/data/aiRecommendationRepository';
import { calculateTrainingPlan } from '../rules/iaEngine';
import { BottomNav } from '../components/BottomNav';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Skeleton } from '../components/ui/Skeleton';
import { type User as StarterUser } from '../types';
import { getDashboardMobileSections, type DashboardSectionId } from '../utils/dashboardNavigation';
import {
  getAppRouteTargetId,
  pushAppRoute,
} from '../navigation/appRouter';
import { isProductFeatureVisible } from '../config/featureFlags';
import { ActiveExerciseDraft } from './Dashboard/types';
import {
  persistStarterUser,
} from './Dashboard/services/dashboardSession';
import {
  updateExerciseNotes,
  updateExerciseTechnique,
} from './Dashboard/services/workoutAuthoring';
import { getCriticalContrastClass } from '../utils/accessibilityContrast';
import { trackEventOnce } from '../utils/analytics';
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

import { useDashboardData } from './Dashboard/hooks/useDashboardData';
import {
  updateProfileAndRecalculatePlan,
  regeneratePlanFromHistory,
  reorderExercises,
} from './Dashboard/services/dashboardPlanService';
import {
  startWorkout as startWorkoutService,
  finishWorkout as finishWorkoutService,
} from './Dashboard/services/dashboardWorkoutService';
import { handleSignOutAndReload } from './Dashboard/services/dashboardDataService';
import { type WorkoutImportFileDraft } from '../services/workoutImportPipeline';

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

function LazyPanelFallback() {
  return <Skeleton lines={3} />;
}

export default function Dashboard() {
  const {
    profile, setProfile,
    formProfile, setFormProfile,
    plan, setPlan,
    history, setHistory,
    persistence, setPersistence,
    pendingRecommendation, setPendingRecommendation,
    notice, setNotice,
    error, setError,
    loading,
    route,
    showStarterRegistration, setShowStarterRegistration,
    showAnamnesis, setShowAnamnesis,
    loadData
  } = useDashboardData();

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);
  const [activeDraft, setActiveDraft] = useState<ActiveExerciseDraft[]>([]);
  const [activeFeedback, setActiveFeedback] = useState('');
  const [generationProgress, setGenerationProgress] = useState<{
    profile: UserProfile;
    plan: TrainingPlan;
  } | null>(null);
  const [activeSection, setActiveSection] = useState<DashboardSectionId>('overview');
  const [saving, setSaving] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showWorkoutImport, setShowWorkoutImport] = useState(false);
  const [workoutImportLoading, setWorkoutImportLoading] = useState(false);

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
      platformHubs: isProductFeatureVisible('platformHubs'),
    }),
    [],
  );

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

  const handleProfileSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSaving(true);
      setError('');
      setNotice('');

      const nextProfile = normalizeProfile(formProfile);
      const nextPlan = calculateTrainingPlan(nextProfile, history);
      setGenerationProgress({ profile: nextProfile, plan: nextPlan });

      try {
        const result = await updateProfileAndRecalculatePlan(formProfile, history, profile, plan);
        if (result) {
          if (result.error && !result.plan) {
            setError(result.error);
          } else {
            setProfile(result.profile);
            setFormProfile(result.profile);
            setPlan(result.plan);
            setNotice(result.notice);
            setError(result.error);
            setSelectedDayIndex(0);
            setShowAnamnesis(false);
            setPersistence(await DatabaseService.getPersistenceStatus());
          }
        }
      } finally {
        setGenerationProgress(null);
        setSaving(false);
      }
    },
    [formProfile, history, plan, profile, setFormProfile, setNotice, setPersistence, setPlan, setProfile, setError],
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
  }, [setFormProfile, setNotice, setError, setShowStarterRegistration, setShowAnamnesis]);

  const regeneratePlan = useCallback(async () => {
    if (!profile) return;
    setSaving(true);
    setError('');
    setNotice('');

    const nextPlan = calculateTrainingPlan(profile, history);
    setGenerationProgress({ profile, plan: nextPlan });

    try {
      const result = await regeneratePlanFromHistory(profile, history);
      if (result) {
        setPlan(result.plan);
        setNotice(result.notice);
        setError(result.error);
        setSelectedDayIndex(0);
      }
    } finally {
      setGenerationProgress(null);
      setSaving(false);
    }
  }, [history, profile, setNotice, setError, setPlan]);

  const moveSelectedExercise = useCallback(
    async (fromIndex: number, toIndex: number) => {
      if (!plan) return;
      setSaving(true);
      const result = await reorderExercises(plan, selectedDayIndex, fromIndex, toIndex);
      setPlan(result.plan);
      setNotice(result.notice);
      setError(result.error);
      setSaving(false);
    },
    [plan, selectedDayIndex, setPlan, setNotice, setError],
  );

  const updateSelectedExerciseTechnique = useCallback(
    async (exerciseIndex: number, technique: ExerciseIntensityTechnique) => {
      if (!plan) return;
      const nextPlan = updateExerciseTechnique(plan, selectedDayIndex, exerciseIndex, technique);
      setPlan(nextPlan);
      try {
        const res = await CurrentPlanConsistencyHelper.setCurrentPlan(nextPlan);
        if (res.status === 'local_fallback') {
          setNotice('Técnica do exercício atualizada (local).');
        } else {
          setNotice('Técnica do exercício atualizada.');
        }
      } catch {
        setError('Alteração aplicada na tela, mas não consegui salvar o plano agora.');
      }
    },
    [plan, selectedDayIndex, setPlan, setNotice, setError],
  );

  const updateSelectedExerciseNotes = useCallback(
    async (exerciseIndex: number, notes: string) => {
      if (!plan) return;
      const nextPlan = updateExerciseNotes(plan, selectedDayIndex, exerciseIndex, notes);
      setPlan(nextPlan);
      try {
        await CurrentPlanConsistencyHelper.setCurrentPlan(nextPlan);
      } catch {
        setError('Nota aplicada na tela, mas não consegui salvar o plano agora.');
      }
    },
    [plan, selectedDayIndex, setPlan, setError],
  );

  const handleWorkoutImport = useCallback(async (draft: WorkoutImportFileDraft) => {
    setWorkoutImportLoading(true);
    setNotice('');
    setError('');

    if (draft.status === 'blocked') {
      setError(draft.warnings[0] ?? 'Arquivo bloqueado para importação.');
    } else {
      setNotice(`Arquivo ${draft.fileName} preparado localmente.`);
      setShowWorkoutImport(false);
    }
    setWorkoutImportLoading(false);
  }, [setNotice, setError, setShowWorkoutImport]);

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

  const startActiveWorkout = useCallback(
    (dayIndex: number, options: { syncRoute?: boolean } = {}) => {
      if (!plan) return;
      const { activeDraft, activeDayIndex } = startWorkoutService(plan, dayIndex, history);
      setActiveDayIndex(activeDayIndex);
      setActiveDraft(activeDraft);
      setActiveFeedback('');
      if (options.syncRoute !== false) {
        pushAppRoute('active-workout');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [history, plan],
  );

  useEffect(() => {
    if (!profile || !plan || route.id !== 'active-workout' || activeDayIndex !== null) return;
    startActiveWorkout(selectedDayIndex, { syncRoute: false });
  }, [activeDayIndex, plan, profile, route.id, selectedDayIndex, startActiveWorkout]);

  useEffect(() => {
    if (!profile || !plan) return;

    if (route.id === 'nutrition' && !surface.nutritionSimple) {
      pushAppRoute('overview');
      return;
    }

    const routeTargetId = getAppRouteTargetId(route.id);
    const routeSection = mobileSections.find((section) => section.targetId === routeTargetId);

    if (routeSection) {
      document.getElementById(routeSection.targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(routeSection.id);
    }

    const handleScroll = () => {
      const current = mobileSections.reduce<DashboardSectionId>((active, section) => {
        const element = document.getElementById(section.targetId);
        if (!element) return active;
        return element.getBoundingClientRect().top <= 140 ? section.id : active;
      }, mobileSections[0]?.id ?? 'overview');
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileSections, plan, profile, route.id]);

  const updateDraft = useCallback((index: number, patch: Partial<ActiveExerciseDraft>) => {
    setActiveDraft((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    );
  }, []);

  const updateDraftSet = useCallback(
    (exerciseIndex: number, setIndex: number, patch: Partial<ActiveExerciseDraft['sets'][0]>) => {
      setActiveDraft((current) =>
        current.map((item, i) => {
          if (i !== exerciseIndex) return item;
          const newSets = [...item.sets];
          newSets[setIndex] = { ...newSets[setIndex], ...patch };
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
    const result = await finishWorkoutService(profile, plan, activeDayIndex, activeDraft, activeFeedback, history);
    setHistory(result.history);
    setPendingRecommendation(result.pendingRecommendation);
    setNotice(result.notice);
    setError(result.error);
    setActiveDayIndex(null);
    setActiveDraft([]);
    pushAppRoute('history');
    setSaving(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeDayIndex, activeDraft, activeFeedback, history, plan, profile, setHistory, setPendingRecommendation, setNotice, setError]);

  const acceptPendingRecommendation = useCallback(async () => {
    if (!pendingRecommendation) return;
    setSaving(true);
    try {
      const proposedPlan = pendingRecommendation.payload.proposedPlan;
      await CurrentPlanConsistencyHelper.setCurrentPlan(proposedPlan);
      await aiRecommendationRepository.markApplied(pendingRecommendation, proposedPlan);
      setPlan(proposedPlan);
      setPendingRecommendation(null);
      setNotice('Sugestao aceita e plano atualizado.');
    } catch {
      setError('Nao consegui aplicar a sugestao agora.');
    }
    setSaving(false);
  }, [pendingRecommendation, setPlan, setPendingRecommendation, setNotice, setError]);

  const rejectPendingRecommendation = useCallback(async () => {
    if (!pendingRecommendation) return;
    setSaving(true);
    try {
      await aiRecommendationRepository.reject(pendingRecommendation);
      setPendingRecommendation(null);
      setNotice('Sugestao rejeitada.');
    } catch {
      setError('Nao consegui rejeitar a sugestao agora.');
    }
    setSaving(false);
  }, [pendingRecommendation, setPendingRecommendation, setNotice, setError]);

  const dismissPendingRecommendation = useCallback(async () => {
    if (!pendingRecommendation) return;
    setSaving(true);
    try {
      await aiRecommendationRepository.dismiss(pendingRecommendation);
      setPendingRecommendation(null);
      setNotice('Sugestao arquivada.');
    } catch {
      setError('Nao consegui arquivar a sugestao agora.');
    }
    setSaving(false);
  }, [pendingRecommendation, setPendingRecommendation, setNotice, setError]);

  const handleAuth = useCallback(
    async (mode: 'signin' | 'signup') => {
      setAuthLoading(true);
      setError('');
      try {
        if (mode === 'signup') {
          await DatabaseService.signUp(authEmail, authPassword);
          setNotice('Conta criada. Verifique seu e-mail.');
        } else {
          await DatabaseService.signIn(authEmail, authPassword);
          await DatabaseService.migrateLocalToCloud();
          setNotice('Nuvem conectada.');
        }
        await loadData();
      } catch (authError: any) {
        setError(authError.message || 'Falha na autenticação.');
      }
      setAuthLoading(false);
    },
    [authEmail, authPassword, loadData, setNotice, setError],
  );

  const handleSignOut = useCallback(async () => {
    await DatabaseService.signOut();
    await loadData();
    setNotice('Sessão encerrada.');
  }, [loadData, setNotice]);

  if (loading) return <DashboardSkeleton />;

  if (activeDayIndex !== null && plan) {
    return (
      <ErrorBoundary section="ActiveWorkout">
        <ActiveWorkout
          day={plan.days[activeDayIndex]}
          activeDraft={activeDraft}
          activeFeedback={activeFeedback}
          saving={saving}
          onCancel={() => setActiveDayIndex(null)}
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
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-brand-magenta">Beta privado</p>
              <h1 className="font-display text-6xl uppercase leading-none tracking-widest text-brand-light text-shadow-neon md:text-7xl">
                Treino <span className="block text-brand-neon">Inteligente</span>
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {!showStarterRegistration && (
              <button
                type="button"
                onClick={() => setShowAnamnesis(!showAnamnesis)}
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
                onClick={() => setShowWorkoutImport(!showWorkoutImport)}
                className="rounded-full border-2 border-brand-light/20 bg-brand-gray px-5 py-3 font-mono text-xs uppercase tracking-widest text-brand-light transition-colors hover:border-brand-magenta hover:text-brand-magenta"
              >
                Importar ficha
              </button>
            )}
          </div>
        </header>

        {(notice || error) && (
          <div className={`mb-6 rounded-[24px] border-2 p-4 font-mono text-sm ${error ? warningStatusClass : positiveStatusClass}`}>
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
            onSignIn={() => handleAuth('signin')}
            onSignUp={() => handleAuth('signup')}
            onSignOut={handleSignOut}
          />
        ) : null}

        {showAnamnesis && (
          <AnamnesisForm
            profile={formProfile}
            saving={saving}
            onChange={setFormProfile}
            onSubmit={handleProfileSubmit}
          />
        )}

        {profile && plan && (
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
                platformHubs: surface.platformHubs,
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
              onSignIn={() => handleAuth('signin')}
              onSignUp={() => handleAuth('signup')}
              onSignOut={handleSignOut}
            />
          </>
        )}
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
