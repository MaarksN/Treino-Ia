import { type FormEvent, lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Brain,
  Dumbbell,
  Gauge,
  History,
  Target,
  Timer,
  UserRound,
} from 'lucide-react';
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
import { calculateTrainingPlan } from '../rules/iaEngine';
import { BottomNav } from '../components/BottomNav';
import { ImportWorkoutView } from '../components/ImportWorkoutView';
import { NutritionLifestyleHub } from '../components/NutritionLifestyleHub';
import { AdvancedSocialHub } from '../components/AdvancedSocial/AdvancedSocialHub';
import { Skeleton } from '../components/ui/Skeleton';
import { type User as StarterUser } from '../types';
import {
  getDashboardMobileSections,
  type DashboardSectionId,
} from '../utils/dashboardNavigation';
import { getCurrentAppRoute, pushAppRoute } from '../navigation/appRouter';
import { ActiveExerciseDraft } from './Dashboard/types';
import { buildWorkoutExerciseLog, calculateWorkoutTonnage } from './Dashboard/services/activeWorkoutEngine';
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
import {
  CloudPanel,
  AnamnesisForm,
  MetricCard,
  MetricPanel,
  GamificationRetentionPanel,
  RecoveryReadinessSection,
  WeeklyPlan,
  HistoryPanel,
  ActiveWorkout,
  DashboardSkeleton,
  PlanGenerationProgress,
  TrainingReportPanel,
} from './Dashboard/components';
import { buildGamificationRetentionState } from './Dashboard/services/gamificationRetentionEngine';

const PLAN_GENERATION_FEEDBACK_MS = 750;
const primaryActionClass = getCriticalContrastClass('primaryAction');
const positiveStatusClass = getCriticalContrastClass('positiveStatus');
const warningStatusClass = getCriticalContrastClass('warningStatus');
const RegistrationForm = lazy(() =>
  import('../components/RegistrationForm').then(module => ({ default: module.RegistrationForm })),
);

function wait(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
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
  const [generationProgress, setGenerationProgress] = useState<{ profile: UserProfile; plan: TrainingPlan } | null>(null);
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

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const status = await DatabaseService.getPersistenceStatus();
      const storedProfile = await DatabaseService.getProfile();
      const storedHistory = await DatabaseService.getWorkoutHistory();

      setPersistence(status);
      setHistory(storedHistory);

      if (!storedProfile) {
        const starterUser = readStarterUser();
        setFormProfile({
          ...createDefaultProfile(),
          name: starterUser?.name?.trim() || 'Atleta',
        });
        setAuthEmail(starterUser?.email?.trim() || '');
        setShowStarterRegistration(!starterUser);
        setShowAnamnesis(Boolean(starterUser));
        setProfile(null);
        setPlan(null);
        return;
      }

      const storedPlan = await DatabaseService.getCurrentPlan();
      const currentPlan = storedPlan?.days?.length
        ? storedPlan
        : calculateTrainingPlan(storedProfile, storedHistory);

      if (!storedPlan?.days?.length) {
        await DatabaseService.saveCurrentPlan(currentPlan);
      }

      setProfile(storedProfile);
      setFormProfile(storedProfile);
      setPlan(currentPlan);
      setSelectedDayIndex(0);
      setShowStarterRegistration(false);
      setShowAnamnesis(false);
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
    () => getDashboardMobileSections(Boolean(profile && plan)),
    [profile, plan]
  );

  const completionSummary = useMemo(() => {
    if (!history.length) return 'Sem sessões finalizadas ainda';
    const totalVolume = history.reduce((sum, session) => sum + session.totalVolume, 0);
    return `${history.length} sessões | ${Math.round(totalVolume).toLocaleString('pt-BR')} kg de volume`;
  }, [history]);

  const gamificationRetention = useMemo(() => (
    profile ? buildGamificationRetentionState(profile, history) : null
  ), [profile, history]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleProfileSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
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

    try {
      const updatedProfile = validation.data;
      const startedAt = Date.now();
      const nextPlan = calculateTrainingPlan(updatedProfile, history);
      setGenerationProgress({ profile: updatedProfile, plan: nextPlan });

      await DatabaseService.saveProfile(updatedProfile);
      await DatabaseService.saveCurrentPlan(nextPlan);
      await wait(Math.max(0, PLAN_GENERATION_FEEDBACK_MS - (Date.now() - startedAt)));

      setProfile(updatedProfile);
      setFormProfile(updatedProfile);
      setPlan(nextPlan);
      setSelectedDayIndex(0);
      setShowAnamnesis(false);
      setNotice('Anamnese salva e plano semanal recalculado.');
      setPersistence(await DatabaseService.getPersistenceStatus());
    } catch {
      setError('Não consegui salvar a anamnese agora.');
    } finally {
      setGenerationProgress(null);
      setSaving(false);
    }
  }, [formProfile, history]);

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

      await DatabaseService.saveCurrentPlan(nextPlan);
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
      await DatabaseService.saveCurrentPlan(nextPlan);
    } catch {
      setError('Alteração aplicada na tela, mas não consegui salvar o plano agora.');
    }
  }, []);

  const moveSelectedExercise = useCallback((fromIndex: number, toIndex: number) => {
    if (!plan) return;
    const nextPlan = reorderExercisesInDay(plan, selectedDayIndex, fromIndex, toIndex);
    if (nextPlan === plan) return;
    void persistEditedPlan(nextPlan, 'Ordem dos exercícios atualizada.');
  }, [persistEditedPlan, plan, selectedDayIndex]);

  const updateSelectedExerciseTechnique = useCallback((
    exerciseIndex: number,
    technique: ExerciseIntensityTechnique,
  ) => {
    if (!plan) return;
    const nextPlan = updateExerciseTechnique(plan, selectedDayIndex, exerciseIndex, technique);
    void persistEditedPlan(nextPlan, 'Técnica do exercício atualizada.');
  }, [persistEditedPlan, plan, selectedDayIndex]);

  const updateSelectedExerciseNotes = useCallback((exerciseIndex: number, notes: string) => {
    if (!plan) return;
    const nextPlan = updateExerciseNotes(plan, selectedDayIndex, exerciseIndex, notes);
    setPlan(nextPlan);
    setNotice('');
    setError('');
    void DatabaseService.saveCurrentPlan(nextPlan).catch(() => {
      setError('Nota aplicada na tela, mas não consegui salvar o plano agora.');
    });
  }, [plan, selectedDayIndex]);

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
        `Arquivo ${draft.fileName} preparado com crop ${draft.crop.width}% x ${draft.crop.height}%. OCR não executado neste lote.`,
      );
      setShowWorkoutImport(false);
    } finally {
      setWorkoutImportLoading(false);
    }
  }, []);

  const handleMobileNavChange = useCallback((id: string) => {
    const section = mobileSections.find(item => item.id === id);
    if (!section) return;
    setActiveSection(section.id);
    pushAppRoute(section.id === 'nutrition' ? 'nutrition' : 'dashboard');
    document.getElementById(section.targetId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [mobileSections]);

  useEffect(() => {
    if (!profile || !plan) return;

    if (getCurrentAppRoute().id === 'nutrition') {
      window.setTimeout(() => {
        document.getElementById('dashboard-nutrition')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        setActiveSection('nutrition');
      }, 0);
    }

    const handleScroll = () => {
      const current = mobileSections.reduce<DashboardSectionId>((active, section) => {
        const element = document.getElementById(section.targetId);
        if (!element) return active;
        return element.getBoundingClientRect().top <= 140 ? section.id : active;
      }, mobileSections[0]?.id ?? 'overview');

      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileSections, plan, profile]);

  const startActiveWorkout = useCallback((dayIndex: number) => {
    if (!plan) return;
    const day = plan.days[dayIndex];
    setActiveDayIndex(dayIndex);
    setActiveDraft(createActiveDraft(day, history));
    setActiveFeedback('');
    setNotice('');
    void triggerHapticFeedback('selection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [history, plan]);

  const updateDraft = useCallback((index: number, patch: Partial<ActiveExerciseDraft>) => {
    setActiveDraft(current => current.map((item, itemIndex) => (
      itemIndex === index ? { ...item, ...patch } : item
    )));
  }, []);

  const updateDraftSet = useCallback((exerciseIndex: number, setIndex: number, patch: Partial<ActiveExerciseDraft['sets'][0]>) => {
    setActiveDraft(current => current.map((item, i) => {
      if (i !== exerciseIndex) return item;
      const newSets = [...item.sets];
      newSets[setIndex] = { ...newSets[setIndex], ...patch };
      // Se um set foi concluído, avaliar se o exercício inteiro foi
      const allSetsCompleted = newSets.every(s => s.completed);
      return { ...item, sets: newSets, completed: allSetsCompleted };
    }));
  }, []);

  const finishActiveWorkout = useCallback(async () => {
    if (!profile || !plan || activeDayIndex === null) return;

    setSaving(true);
    setError('');

    try {
      const day = plan.days[activeDayIndex];
      const logs: WorkoutExerciseLog[] = activeDraft.map(exercise => buildWorkoutExerciseLog(exercise));
      const completedExercises = logs.filter(exercise => exercise.completed).length;
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
      const nextHistory = [session, ...history].slice(0, 50);
      const adjustedPlan = calculateTrainingPlan(profile, nextHistory);
      const completedSession = {
        ...session,
        nextRecommendation: adjustedPlan.nextRecommendation,
      };
      const finalHistory = [completedSession, ...history].slice(0, 50);

      await DatabaseService.saveWorkoutSession(completedSession);
      await DatabaseService.saveCurrentPlan(adjustedPlan);

      setHistory(finalHistory);
      setPlan(adjustedPlan);
      setActiveDayIndex(null);
      setActiveDraft([]);
      setNotice(`Treino finalizado. ${adjustedPlan.nextRecommendation}`);
      void triggerHapticFeedback('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError('Não consegui finalizar o treino agora.');
    } finally {
      setSaving(false);
    }
  }, [activeDayIndex, activeDraft, activeFeedback, history, plan, profile]);

  const handleAuth = useCallback(async (mode: 'signin' | 'signup') => {
    setAuthLoading(true);
    setError('');
    setNotice('');

    try {
      if (mode === 'signup') {
        await DatabaseService.signUp(authEmail, authPassword);
        setNotice('Conta criada. Se o Supabase exigir confirmação, verifique seu e-mail antes de entrar.');
      } else {
        await DatabaseService.signIn(authEmail, authPassword);
        await DatabaseService.migrateLocalToCloud();
        setNotice('Nuvem conectada. Dados locais migrados quando disponíveis.');
      }
      await loadData();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Falha na autenticação Supabase.');
    } finally {
      setAuthLoading(false);
    }
  }, [authEmail, authPassword, loadData]);

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

  const cancelActiveWorkout = useCallback(() => setActiveDayIndex(null), []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (activeDayIndex !== null && plan) {
    const day = plan.days[activeDayIndex];

    return (
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
      />
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
                Plataforma inteligente
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
                  setShowAnamnesis(value => !value);
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
            {profile && plan && (
              <button
                type="button"
                onClick={() => setShowWorkoutImport(value => !value)}
                className="rounded-full border-2 border-brand-light/20 bg-brand-gray px-5 py-3 font-mono text-xs uppercase tracking-widest text-brand-light transition-colors hover:border-brand-magenta hover:text-brand-magenta"
              >
                Importar ficha
              </button>
            )}
          </div>
        </header>

        {(notice || error) && (
          <div className={`mb-6 rounded-[24px] border-2 p-4 font-mono text-sm ${
            error ? warningStatusClass : positiveStatusClass
          }`}>
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

        {showWorkoutImport && profile && plan && (
          <ImportWorkoutView
            isLoading={workoutImportLoading}
            onImport={handleWorkoutImport}
            onCancel={() => setShowWorkoutImport(false)}
          />
        )}

        {showStarterRegistration && !profile ? (
          <Suspense fallback={<Skeleton lines={2} />}>
            <RegistrationForm onRegister={handleStarterRegister} />
          </Suspense>
        ) : (
          <CloudPanel
            persistence={persistence}
            email={authEmail}
            password={authPassword}
            loading={authLoading}
            onEmailChange={setAuthEmail}
            onPasswordChange={setAuthPassword}
            onSignIn={handleSignIn}
            onSignUp={handleSignUp}
            onSignOut={handleSignOut}
          />
        )}

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
            <section id="dashboard-overview" className="mb-8 grid gap-6 scroll-mt-24 lg:grid-cols-[1.35fr_0.65fr]">
              <div className="relative overflow-hidden rounded-[28px] border-4 border-brand-light bg-brand-gray p-6 shadow-[8px_8px_0_var(--color-brand-light)] md:p-10">
                <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-brand-neon/10 blur-3xl" />
                <div className="relative z-10">
                  <p className="mb-3 font-mono text-xs uppercase tracking-[0.35em] text-brand-neon">
                    Bem-vindo de volta
                  </p>
                  <h2 className="font-display text-7xl uppercase leading-none tracking-tight text-brand-light md:text-8xl">
                    {profile.name}
                  </h2>
                  {gamificationRetention && (
                    <div className="mt-4 inline-flex max-w-full flex-wrap items-center gap-2 border-2 border-brand-neon bg-brand-neon px-3 py-2 font-mono text-xs uppercase tracking-widest text-brand-dark shadow-brutal-neon">
                      <span>Nivel {gamificationRetention.profileTitle.level}</span>
                      <span className="h-1 w-1 rounded-full bg-brand-dark" />
                      <span>{gamificationRetention.profileTitle.title}</span>
                    </div>
                  )}
                  <p className="mt-5 max-w-3xl font-mono text-sm leading-7 text-brand-light/75">
                    {plan.goalDescription} Divisão semanal: {plan.weeklySplit}.
                  </p>

                  <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <MetricCard icon={<Gauge />} label="Dias por semana" value={String(profile.daysPerWeek).padStart(2, '0')} tone="neon" />
                    <MetricCard icon={<Timer />} label="Minutos por treino" value={`${profile.timePerWorkout}`} tone="magenta" />
                    <MetricCard icon={<History />} label="Histórico" value={String(history.length).padStart(2, '0')} tone="light" />
                  </div>
                </div>
              </div>

              <aside className="rounded-[28px] border-4 border-brand-neon bg-brand-dark p-6 shadow-brutal-neon">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-muted">Anamnese ativa</p>
                <h3 className="font-display text-4xl uppercase text-brand-light">{profile.goal}</h3>
                <div className="mt-5 space-y-3 font-mono text-sm text-brand-light/80">
                  <p><span className="text-brand-muted">Nível:</span> {profile.level}</p>
                  <p><span className="text-brand-muted">Equipamento:</span> {profile.equipment}</p>
                  <p><span className="text-brand-muted">Lesões:</span> {profile.injuries}</p>
                  <p><span className="text-brand-muted">Resumo:</span> {completionSummary}</p>
                </div>
              </aside>
            </section>

            <section className="mb-8 grid gap-5 md:grid-cols-3">
              <MetricPanel icon={<Activity />} title="Volume" value={plan.volume} tone="neon" />
              <MetricPanel icon={<Target />} title="Frequência" value={plan.frequency} tone="magenta" />
              <MetricPanel icon={<Brain />} title="Foco" value={plan.focus} tone="light" />
            </section>

            {gamificationRetention && (
              <div id="dashboard-gamification" className="scroll-mt-24">
                <GamificationRetentionPanel state={gamificationRetention} />
              </div>
            )}

            <section className="mb-8 rounded-[28px] border-4 border-brand-magenta bg-brand-gray p-6 shadow-brutal-magenta md:p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-start">
                <div className="rounded-[24px] border-2 border-brand-magenta bg-brand-magenta p-4 text-brand-light shadow-brutal-magenta">
                  <Brain className="h-8 w-8" />
                </div>
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.35em] text-brand-magenta">Próxima recomendação</p>
                  <h2 className="mt-2 font-display text-4xl uppercase text-brand-light md:text-5xl">
                    Ajuste automático da IA
                  </h2>
                  <p className="mt-4 max-w-4xl font-mono text-sm leading-7 text-brand-light/80 md:text-base">
                    {plan.nextRecommendation}
                  </p>
                </div>
              </div>
            </section>

            <div id="dashboard-nutrition" className="scroll-mt-24">
              <NutritionLifestyleHub profile={profile} plan={plan} history={history} />
            </div>

            <div id="dashboard-advanced-social" className="scroll-mt-24">
              <AdvancedSocialHub profile={profile} />
            </div>

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

            <RecoveryReadinessSection history={history} />

            <HistoryPanel history={history} />

            <TrainingReportPanel history={history} />
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
