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

type ActiveExerciseDraft = Omit<WorkoutExerciseLog, 'actualWeight' | 'actualReps' | 'rpe'> & {
  actualWeight: string;
  actualReps: string;
  rpe: string;
};

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

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formProfile, setFormProfile] = useState<UserProfile>(() => createDefaultProfile());
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [persistence, setPersistence] = useState<PersistenceStatus | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
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
        setFormProfile(createDefaultProfile());
        setShowAnamnesis(true);
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
      <main className="min-h-screen bg-brand-dark text-brand-light px-4 py-8 md:py-12">
        <div className="mx-auto max-w-5xl">
          <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-brand-neon">Modo treino ativo</p>
              <h1 className="font-display text-6xl uppercase leading-none text-brand-light text-shadow-neon md:text-7xl">
                {day.focus}
              </h1>
              <p className="mt-3 font-mono text-sm text-brand-light/70">
                Marque o que concluiu, registre carga/reps e finalize para ajustar a próxima recomendação.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveDayIndex(null)}
              className="rounded-full border-2 border-brand-light/20 px-5 py-3 font-mono text-xs uppercase tracking-widest text-brand-light transition-colors hover:border-brand-magenta hover:text-brand-magenta"
            >
              Voltar ao plano
            </button>
          </header>

          <section className="space-y-4">
            {activeDraft.map((exercise, index) => (
              <article key={exercise.exerciseId} className="rounded-[28px] border-2 border-brand-light/15 bg-brand-gray p-5 shadow-brutal-light">
                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                  <label className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={exercise.completed}
                      onChange={event => updateDraft(index, { completed: event.target.checked })}
                      className="mt-2 h-5 w-5 accent-brand-neon"
                    />
                    <span>
                      <span className="block font-display text-4xl uppercase leading-none text-brand-light">
                        {exercise.name}
                      </span>
                      <span className="mt-2 block font-mono text-xs uppercase tracking-widest text-brand-muted">
                        {exercise.targetSets} séries | {exercise.targetReps} reps | descanso {exercise.targetRest}
                      </span>
                    </span>
                  </label>

                  <div className="grid grid-cols-3 gap-3">
                    <label>
                      <span className={labelClass}>Carga kg</span>
                      <input
                        value={exercise.actualWeight}
                        onChange={event => updateDraft(index, { actualWeight: event.target.value })}
                        inputMode="decimal"
                        className={fieldClass}
                        placeholder="0"
                      />
                    </label>
                    <label>
                      <span className={labelClass}>Reps</span>
                      <input
                        value={exercise.actualReps}
                        onChange={event => updateDraft(index, { actualReps: event.target.value })}
                        inputMode="numeric"
                        className={fieldClass}
                        placeholder="0"
                      />
                    </label>
                    <label>
                      <span className={labelClass}>RPE</span>
                      <input
                        value={exercise.rpe}
                        onChange={event => updateDraft(index, { rpe: event.target.value })}
                        inputMode="decimal"
                        className={fieldClass}
                        placeholder="7"
                      />
                    </label>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="mt-6 rounded-[28px] border-4 border-brand-magenta bg-brand-gray p-6 shadow-brutal-magenta">
            <label>
              <span className={labelClass}>Feedback rápido</span>
              <textarea
                value={activeFeedback}
                onChange={event => setActiveFeedback(event.target.value)}
                className={`${fieldClass} min-h-24 resize-none`}
                placeholder="Ex: treino pesado, joelho ok, supino poderia subir carga."
              />
            </label>
            <button
              type="button"
              onClick={finishActiveWorkout}
              disabled={saving}
              className="mt-5 w-full rounded-[24px] border-2 border-brand-neon bg-brand-neon px-6 py-4 font-display text-3xl uppercase tracking-widest text-brand-dark shadow-brutal-neon transition-transform hover:scale-[1.01] disabled:opacity-60"
            >
              {saving ? 'Salvando...' : 'Finalizar e ajustar plano'}
            </button>
          </section>
        </div>
      </main>
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
                Treino <span className="text-brand-neon">Brutal</span>
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
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

        {showAnamnesis && (
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
        ) : (
          <section className="rounded-[28px] border-4 border-brand-neon bg-brand-gray p-8 text-center shadow-brutal-neon">
            <UserRound className="mx-auto mb-4 h-10 w-10 text-brand-neon" />
            <h2 className="font-display text-5xl uppercase text-brand-light">Crie sua anamnese</h2>
            <p className="mx-auto mt-3 max-w-2xl font-mono text-sm text-brand-light/70">
              O plano semanal, o modo treino ativo e o histórico dependem do perfil inicial.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

function CloudPanel({
  persistence,
  email,
  password,
  loading,
  onEmailChange,
  onPasswordChange,
  onSignIn,
  onSignUp,
  onSignOut,
}: {
  persistence: PersistenceStatus | null;
  email: string;
  password: string;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSignIn: () => void;
  onSignUp: () => void;
  onSignOut: () => void;
}) {
  if (!persistence) return null;

  return (
    <section className="mb-8 rounded-[28px] border-2 border-brand-light/15 bg-brand-gray/80 p-5 shadow-brutal-light">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-4">
          <div className={`rounded-[22px] border-2 p-3 ${persistence.mode === 'supabase' ? 'border-brand-neon text-brand-neon' : 'border-brand-magenta text-brand-magenta'}`}>
            {persistence.mode === 'supabase' ? <Cloud className="h-6 w-6" /> : <Database className="h-6 w-6" />}
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-muted">
              Persistência
            </p>
            <h3 className="font-display text-3xl uppercase text-brand-light">
              {persistence.mode === 'supabase' ? 'Supabase Cloud' : 'Local'}
            </h3>
            <p className="mt-1 font-mono text-xs text-brand-light/70">{persistence.message}</p>
          </div>
        </div>

        {persistence.authenticated ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="rounded-full border-2 border-brand-neon px-4 py-2 font-mono text-xs uppercase tracking-widest text-brand-neon">
              {persistence.email}
            </span>
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-full border-2 border-brand-light/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-brand-light hover:border-brand-magenta hover:text-brand-magenta"
            >
              Sair
            </button>
          </div>
        ) : persistence.configured ? (
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
            <input
              value={email}
              onChange={event => onEmailChange(event.target.value)}
              className={fieldClass}
              placeholder="email"
              type="email"
            />
            <input
              value={password}
              onChange={event => onPasswordChange(event.target.value)}
              className={fieldClass}
              placeholder="senha"
              type="password"
            />
            <button
              type="button"
              onClick={onSignIn}
              disabled={loading}
              className="rounded-[22px] border-2 border-brand-neon bg-brand-neon px-5 py-3 font-mono text-xs uppercase tracking-widest text-brand-dark disabled:opacity-60"
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={onSignUp}
              disabled={loading}
              className="rounded-[22px] border-2 border-brand-light/20 px-5 py-3 font-mono text-xs uppercase tracking-widest text-brand-light disabled:opacity-60"
            >
              Criar
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-[22px] border-2 border-brand-magenta/60 bg-brand-magenta/10 px-4 py-3 font-mono text-xs text-brand-light">
            <ShieldAlert className="h-5 w-5 text-brand-magenta" />
            Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
          </div>
        )}
      </div>
    </section>
  );
}

function AnamnesisForm({
  profile,
  saving,
  onChange,
  onSubmit,
}: {
  profile: UserProfile;
  saving: boolean;
  onChange: (profile: UserProfile) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="mb-8 rounded-[28px] border-4 border-brand-neon bg-brand-gray p-6 shadow-brutal-neon md:p-8">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-brand-neon">Anamnese</p>
          <h2 className="font-display text-5xl uppercase text-brand-light">Perfil do atleta</h2>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-[24px] border-2 border-brand-neon bg-brand-neon px-6 py-3 font-mono text-xs uppercase tracking-widest text-brand-dark disabled:opacity-60"
        >
          <Save className="mr-2 inline h-4 w-4" />
          {saving ? 'Salvando' : 'Salvar e gerar'}
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label>
          <span className={labelClass}>Nome</span>
          <input
            value={profile.name}
            onChange={event => onChange({ ...profile, name: event.target.value })}
            className={fieldClass}
            placeholder="Seu nome"
          />
        </label>

        <label>
          <span className={labelClass}>Objetivo</span>
          <select
            value={profile.goal}
            onChange={event => onChange({ ...profile, goal: event.target.value })}
            className={fieldClass}
          >
            {goalOptions.map(goal => <option key={goal} value={goal}>{goal}</option>)}
          </select>
        </label>

        <div className="md:col-span-2">
          <span className={labelClass}>Nível</span>
          <div className="mt-2 grid gap-3 md:grid-cols-3">
            {levelOptions.map(option => {
              const selected = profile.level === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onChange({ ...profile, level: option.value })}
                  className={`rounded-[22px] border-2 p-4 text-left transition-all ${
                    selected
                      ? 'border-brand-neon bg-brand-neon text-brand-dark shadow-brutal-neon'
                      : 'border-brand-light/15 bg-brand-dark text-brand-light hover:border-brand-neon'
                  }`}
                >
                  <span className="block font-display text-3xl uppercase leading-none">{option.label}</span>
                  <span className={`mt-1 block font-mono text-[10px] uppercase tracking-widest ${selected ? 'text-brand-dark/70' : 'text-brand-muted'}`}>
                    {option.detail}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <label>
          <span className={labelClass}>Dias por semana</span>
          <input
            type="number"
            min={1}
            max={6}
            value={profile.daysPerWeek}
            onChange={event => onChange({ ...profile, daysPerWeek: Number(event.target.value) })}
            className={fieldClass}
          />
        </label>

        <label>
          <span className={labelClass}>Tempo por treino (min)</span>
          <input
            type="number"
            min={20}
            max={120}
            value={profile.timePerWorkout}
            onChange={event => onChange({ ...profile, timePerWorkout: Number(event.target.value) })}
            className={fieldClass}
          />
        </label>

        <label>
          <span className={labelClass}>Equipamento disponível</span>
          <select
            value={profile.equipment}
            onChange={event => onChange({ ...profile, equipment: event.target.value })}
            className={fieldClass}
          >
            {equipmentOptions.map(equipment => <option key={equipment} value={equipment}>{equipment}</option>)}
          </select>
        </label>

        <label>
          <span className={labelClass}>Lesões ou limitações</span>
          <input
            value={profile.injuries}
            onChange={event => onChange({ ...profile, injuries: event.target.value })}
            className={fieldClass}
            placeholder="Ex: joelho, ombro, lombar"
          />
        </label>
      </div>
    </form>
  );
}

function MetricCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: 'neon' | 'magenta' | 'light' }) {
  const toneClass = tone === 'neon'
    ? 'border-brand-neon shadow-brutal-neon text-brand-neon'
    : tone === 'magenta'
      ? 'border-brand-magenta shadow-brutal-magenta text-brand-magenta'
      : 'border-brand-light shadow-brutal-light text-brand-light';

  return (
    <div className={`border-2 bg-brand-dark p-5 ${toneClass}`}>
      <div className="mb-3 h-7 w-7">{icon}</div>
      <p className="font-display text-5xl leading-none text-brand-light">{value}</p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-brand-muted">{label}</p>
    </div>
  );
}

function MetricPanel({ icon, title, value, tone }: { icon: React.ReactNode; title: string; value: string; tone: 'neon' | 'magenta' | 'light' }) {
  const toneClass = tone === 'neon'
    ? 'border-brand-neon shadow-brutal-neon text-brand-neon'
    : tone === 'magenta'
      ? 'border-brand-magenta shadow-brutal-magenta text-brand-magenta'
      : 'border-brand-light shadow-brutal-light text-brand-light';

  return (
    <article className={`rounded-[28px] border-2 bg-brand-gray/80 p-6 ${toneClass}`}>
      <div className="mb-4 h-8 w-8">{icon}</div>
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-muted">{title}</p>
      <h3 className="mt-3 font-display text-4xl uppercase leading-none text-brand-light">{value}</h3>
    </article>
  );
}

function WeeklyPlan({
  plan,
  selectedDayIndex,
  selectedDay,
  onSelectDay,
  onStartWorkout,
}: {
  plan: TrainingPlan;
  selectedDayIndex: number;
  selectedDay: TrainingPlan['days'][number] | null;
  onSelectDay: (index: number) => void;
  onStartWorkout: (index: number) => void;
}) {
  return (
    <section className="mb-8 rounded-[28px] border-4 border-brand-light bg-brand-gray p-6 shadow-[8px_8px_0_var(--color-brand-light)] md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-brand-neon">Plano semanal</p>
          <h2 className="font-display text-5xl uppercase text-brand-light">{plan.planName}</h2>
        </div>
        {selectedDay && (
          <button
            type="button"
            onClick={() => onStartWorkout(selectedDayIndex)}
            className="rounded-[24px] border-2 border-brand-neon bg-brand-neon px-6 py-3 font-mono text-xs uppercase tracking-widest text-brand-dark shadow-brutal-neon"
          >
            <Play className="mr-2 inline h-4 w-4 fill-current" />
            Iniciar treino
          </button>
        )}
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        {plan.days.map((day, index) => (
          <button
            key={day.id}
            type="button"
            onClick={() => onSelectDay(index)}
            className={`rounded-[22px] border-2 p-4 text-left transition-colors ${
              selectedDayIndex === index
                ? 'border-brand-neon bg-brand-neon text-brand-dark shadow-brutal-neon'
                : 'border-brand-light/15 bg-brand-dark text-brand-light hover:border-brand-neon'
            }`}
          >
            <span className="block font-mono text-[10px] uppercase tracking-widest opacity-70">{day.dayName}</span>
            <span className="mt-1 block font-display text-3xl uppercase leading-none">{day.focus}</span>
          </button>
        ))}
      </div>

      {selectedDay && (
        <div className="grid gap-4 lg:grid-cols-2">
          {selectedDay.exercises.map(exercise => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      )}
    </section>
  );
}

function ExerciseCard({ exercise }: { exercise: ExercisePrescription }) {
  return (
    <article className="rounded-[24px] border-2 border-brand-light/15 bg-brand-dark p-5 transition-colors hover:border-brand-neon">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-muted">{exercise.muscleGroup}</p>
          <h3 className="mt-2 font-display text-4xl uppercase leading-none text-brand-light">{exercise.name}</h3>
        </div>
        <CheckCircle2 className="h-6 w-6 text-brand-neon" />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 font-mono text-xs uppercase tracking-widest">
        <div className="rounded-[18px] border border-brand-light/10 p-3">
          <p className="text-brand-muted">Séries</p>
          <p className="mt-1 text-brand-light">{exercise.sets}</p>
        </div>
        <div className="rounded-[18px] border border-brand-light/10 p-3">
          <p className="text-brand-muted">Reps</p>
          <p className="mt-1 text-brand-light">{exercise.reps}</p>
        </div>
        <div className="rounded-[18px] border border-brand-light/10 p-3">
          <p className="text-brand-muted">Desc.</p>
          <p className="mt-1 text-brand-light">{exercise.rest}</p>
        </div>
      </div>
      <p className="mt-4 font-mono text-xs leading-6 text-brand-light/65">{exercise.notes}</p>
    </article>
  );
}

function HistoryPanel({ history }: { history: WorkoutSession[] }) {
  return (
    <section className="rounded-[28px] border-2 border-brand-light/15 bg-brand-gray/80 p-6 shadow-brutal-light md:p-8">
      <div className="mb-5 flex items-center gap-3">
        <History className="h-6 w-6 text-brand-neon" />
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-muted">Histórico</p>
          <h2 className="font-display text-4xl uppercase text-brand-light">Sessões finalizadas</h2>
        </div>
      </div>

      {history.length === 0 ? (
        <p className="font-mono text-sm text-brand-light/70">
          Nenhum treino finalizado ainda. Inicie um dia do plano para alimentar o motor adaptativo.
        </p>
      ) : (
        <div className="space-y-3">
          {history.slice(0, 5).map(session => (
            <article key={session.id} className="rounded-[22px] border-2 border-brand-light/10 bg-brand-dark p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-display text-3xl uppercase text-brand-light">{session.focus}</p>
                  <p className="font-mono text-xs uppercase tracking-widest text-brand-muted">
                    {formatDate(session.completedAt)} | {session.completedExercises}/{session.totalExercises} exercícios | {Math.round(session.totalVolume)} kg
                  </p>
                </div>
                <span className="rounded-full border-2 border-brand-neon px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-brand-neon">
                  {session.durationMinutes} min
                </span>
              </div>
              {session.nextRecommendation && (
                <p className="mt-3 font-mono text-xs leading-6 text-brand-light/65">{session.nextRecommendation}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
