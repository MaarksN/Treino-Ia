import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Brain,
  CheckCircle2,
  Cloud,
  Database,
  Dumbbell,
  Flame,
  Gauge,
  History,
  LogIn,
  Play,
  RotateCcw,
  Save,
  ShieldAlert,
  Target,
  Timer,
  UserRound,
  Zap,
} from 'lucide-react';
import {
  createDefaultProfile,
  DatabaseService,
  ExercisePrescription,
  PersistenceStatus,
  TrainingPlan,
  UserProfile,
  WorkoutExerciseLog,
  WorkoutSession,
} from '../services/database';
import { calculateTrainingPlan } from '../rules/iaEngine';
import { RegistrationForm } from '../components/RegistrationForm';
import { User as StarterUser } from '../types';
import { ActiveExerciseDraft } from './Dashboard/types';
import {
  CloudPanel,
  AnamnesisForm,
  MetricCard,
  MetricPanel,
  WeeklyPlan,
  HistoryPanel,
  ActiveWorkout,
} from './Dashboard/components';

const levelOptions: Array<{ value: UserProfile['level']; label: string; detail: string }> = [
  { value: 'iniciante', label: 'Iniciante', detail: 'Base técnica' },
  { value: 'intermediario', label: 'Intermediário', detail: 'Carga progressiva' },
  { value: 'avancado', label: 'Avançado', detail: 'Periodização' },
];

const goalOptions = ['Hipertrofia', 'Força', 'Definição', 'Condicionamento'];

const equipmentOptions = [
  'Academia completa',
  'Casa com halteres',
  'Peso corporal',
  'Elásticos',
  'Academia do prédio',
];

const STARTER_USER_KEY = '@TreinoIA:starterUser';

const fieldClass = 'mt-2 w-full rounded-[22px] border-2 border-brand-light/15 bg-brand-gray px-4 py-3 font-mono text-sm text-brand-light outline-none transition-colors placeholder:text-brand-muted focus:border-brand-neon';
const labelClass = 'block font-mono text-[11px] uppercase tracking-[0.25em] text-brand-muted';

const levelScore: Record<UserProfile['level'], string> = {
  iniciante: '03',
  intermediario: '05',
  avancado: '06',
};

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function parseNumber(value: string) {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function createSessionId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? `session_${crypto.randomUUID()}`
    : `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function createActiveDraft(day: TrainingPlan['days'][number]): ActiveExerciseDraft[] {
  return day.exercises.map(exercise => ({
    exerciseId: exercise.id,
    name: exercise.name,
    targetSets: exercise.sets,
    targetReps: exercise.reps,
    targetRest: exercise.rest,
    completed: false,
    actualWeight: '',
    actualReps: '',
    rpe: '7',
  }));
}

function readStarterUser(): StarterUser | null {
  try {
    const raw = localStorage.getItem(STARTER_USER_KEY);
    return raw ? JSON.parse(raw) as StarterUser : null;
  } catch {
    return null;
  }
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
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    void loadData();
  }, []);

  const selectedDay = plan?.days[selectedDayIndex] ?? plan?.days[0] ?? null;

  const completionSummary = useMemo(() => {
    if (!history.length) return 'Sem sessões finalizadas ainda';
    const totalVolume = history.reduce((sum, session) => sum + session.totalVolume, 0);
    return `${history.length} sessões | ${Math.round(totalVolume).toLocaleString('pt-BR')} kg de volume`;
  }, [history]);

  async function loadData() {
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
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');

    try {
      const updatedProfile: UserProfile = {
        ...formProfile,
        name: formProfile.name.trim() || 'Atleta',
        goal: formProfile.goal.trim() || 'Hipertrofia',
        injuries: formProfile.injuries.trim() || 'Nenhuma',
        equipment: formProfile.equipment.trim() || 'Academia completa',
        daysPerWeek: Math.min(6, Math.max(1, Number(formProfile.daysPerWeek))),
        timePerWorkout: Math.min(120, Math.max(20, Number(formProfile.timePerWorkout))),
        updatedAt: Date.now(),
      };
      const nextPlan = calculateTrainingPlan(updatedProfile, history);

      await DatabaseService.saveProfile(updatedProfile);
      await DatabaseService.saveCurrentPlan(nextPlan);

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
      setSaving(false);
    }
  }

  function handleStarterRegister(starterUser: StarterUser) {
    const nextProfile = {
      ...createDefaultProfile(),
      name: starterUser.name.trim() || 'Atleta',
    };

    setFormProfile(nextProfile);
    setAuthEmail(starterUser.email.trim());
    localStorage.setItem(STARTER_USER_KEY, JSON.stringify({
      name: starterUser.name.trim(),
      email: starterUser.email.trim(),
      avatarUrl: starterUser.avatarUrl,
      createdAt: Date.now(),
    }));
    setShowStarterRegistration(false);
    setShowAnamnesis(true);
    setNotice('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function regeneratePlan() {
    if (!profile) return;
    const nextPlan = calculateTrainingPlan({ ...profile, updatedAt: Date.now() }, history);
    await DatabaseService.saveCurrentPlan(nextPlan);
    setPlan(nextPlan);
    setSelectedDayIndex(0);
    setNotice('Plano recalculado com base no histórico mais recente.');
  }

  function startActiveWorkout(dayIndex: number) {
    if (!plan) return;
    const day = plan.days[dayIndex];
    setActiveDayIndex(dayIndex);
    setActiveDraft(createActiveDraft(day));
    setActiveFeedback('');
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateDraft(index: number, patch: Partial<ActiveExerciseDraft>) {
    setActiveDraft(current => current.map((item, itemIndex) => (
      itemIndex === index ? { ...item, ...patch } : item
    )));
  }

  async function finishActiveWorkout() {
    if (!profile || !plan || activeDayIndex === null) return;

    setSaving(true);
    setError('');

    try {
      const day = plan.days[activeDayIndex];
      const logs: WorkoutExerciseLog[] = activeDraft.map(exercise => ({
        ...exercise,
        actualWeight: parseNumber(exercise.actualWeight),
        actualReps: parseNumber(exercise.actualReps),
        rpe: parseNumber(exercise.rpe),
      }));
      const completedExercises = logs.filter(exercise => exercise.completed).length;
      const totalVolume = logs.reduce((sum, exercise) => {
        if (!exercise.completed) return sum;
        return sum + exercise.actualWeight * exercise.actualReps * exercise.targetSets;
      }, 0);
      const session: WorkoutSession = {
        id: createSessionId(),
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError('Não consegui finalizar o treino agora.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAuth(mode: 'signin' | 'signup') {
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
  }

  async function handleSignOut() {
    await DatabaseService.signOut();
    await loadData();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-brand-dark text-brand-light flex flex-col items-center justify-center px-4">
        <div className="relative mb-8 h-32 w-32">
          <div className="absolute inset-0 rounded-full border-4 border-brand-neon opacity-20 animate-ping" />
          <div className="absolute inset-3 rounded-full border-4 border-brand-magenta border-t-transparent animate-spin" />
          <Dumbbell className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 text-brand-light animate-pulse" />
        </div>
        <h1 className="font-display text-5xl uppercase tracking-widest text-brand-light text-shadow-neon">
          Inicializando
        </h1>
        <p className="mt-3 font-mono text-sm uppercase tracking-widest text-brand-magenta">
          Carregando perfil, plano e histórico
        </p>
      </main>
    );
  }

  if (activeDayIndex !== null && plan) {
    const day = plan.days[activeDayIndex];

    return (
      <ActiveWorkout
        day={day}
        activeDraft={activeDraft}
        activeFeedback={activeFeedback}
        saving={saving}
        onCancel={() => setActiveDayIndex(null)}
        onUpdateDraft={updateDraft}
        onFeedbackChange={setActiveFeedback}
        onFinishWorkout={finishActiveWorkout}
      />
    );
  }

  return (
    <main className="min-h-screen bg-brand-dark text-brand-light px-4 py-8 md:py-12">
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
                className="rounded-full border-2 border-brand-neon bg-brand-neon px-5 py-3 font-mono text-xs uppercase tracking-widest text-brand-dark shadow-brutal-neon"
              >
                {profile ? 'Editar anamnese' : 'Criar anamnese'}
              </button>
            )}
            {profile && (
              <button
                type="button"
                onClick={regeneratePlan}
                className="rounded-full border-2 border-brand-light/20 bg-brand-gray px-5 py-3 font-mono text-xs uppercase tracking-widest text-brand-light transition-colors hover:border-brand-neon hover:text-brand-neon"
              >
                Recalcular plano
              </button>
            )}
          </div>
        </header>

        {(notice || error) && (
          <div className={`mb-6 rounded-[24px] border-2 p-4 font-mono text-sm ${
            error
              ? 'border-brand-magenta bg-brand-magenta/10 text-brand-light'
              : 'border-brand-neon bg-brand-neon/10 text-brand-light'
          }`}>
            {error || notice}
          </div>
        )}

        {showStarterRegistration && !profile ? (
          <RegistrationForm onRegister={handleStarterRegister} />
        ) : (
          <CloudPanel
            persistence={persistence}
            email={authEmail}
            password={authPassword}
            loading={authLoading}
            onEmailChange={setAuthEmail}
            onPasswordChange={setAuthPassword}
            onSignIn={() => handleAuth('signin')}
            onSignUp={() => handleAuth('signup')}
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
            <section className="mb-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
              <div className="relative overflow-hidden rounded-[28px] border-4 border-brand-light bg-brand-gray p-6 shadow-[8px_8px_0_var(--color-brand-light)] md:p-10">
                <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-brand-neon/10 blur-3xl" />
                <div className="relative z-10">
                  <p className="mb-3 font-mono text-xs uppercase tracking-[0.35em] text-brand-neon">
                    Bem-vindo de volta
                  </p>
                  <h2 className="font-display text-7xl uppercase leading-none tracking-tight text-brand-light md:text-8xl">
                    {profile.name}
                  </h2>
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

            <WeeklyPlan
              plan={plan}
              selectedDayIndex={selectedDayIndex}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDayIndex}
              onStartWorkout={startActiveWorkout}
            />

            <HistoryPanel history={history} />
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
    </main>
  );
}


