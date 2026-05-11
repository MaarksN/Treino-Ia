import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BadgeCheck,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Droplets,
  Flame,
  Loader2,
  Moon,
  RefreshCw,
  Send,
  ShieldCheck,
  Trophy,
  Users,
  Watch,
} from 'lucide-react';
import { UserProfile, WorkoutHistoryEntry, WorkoutPlan } from '../types';
import {
  ReminderChannel,
  ReminderType,
  RetentionHubState,
} from '../types/retention';
import {
  createAlternativeWorkoutSuggestion,
  createStudentAssessment,
  createWorkoutCalendarItem,
  fetchRetentionHubState,
  recordHabitEvent,
  saveConsistencyGoal,
  saveOnboardingProgress,
  saveReminder,
  saveWhiteLabelTenant,
  scheduleAutomatedCheckin,
  sendStudentMessage,
  startConsistencyChallenge,
  updateHealthIntegration,
} from '../services/retentionService';
import { createAchievementPost } from '../services/socialService';

interface Props {
  userName?: string;
  profile?: UserProfile | null;
  currentPlan?: WorkoutPlan | null;
  history?: WorkoutHistoryEntry[];
}

const REMINDER_LABELS: Record<ReminderType, string> = {
  workout: 'Treino',
  hydration: 'Hidratação',
  sleep: 'Sono',
  checkin: 'Check-in',
  reactivation: 'Reativação',
};

const CHANNELS: ReminderChannel[] = ['push', 'in_app', 'email', 'whatsapp'];

function formatMinutes(minutes: number) {
  if (!minutes) return '0h';
  return `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')}`;
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString('pt-BR');
}

function getLatestHistory(history?: WorkoutHistoryEntry[]) {
  return history?.[history.length - 1] ?? null;
}

export function RetentionOperationsHub({ userName = 'Atleta', profile, currentPlan, history = [] }: Props) {
  const [state, setState] = useState<RetentionHubState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const latest = useMemo(() => getLatestHistory(history), [history]);

  const [workoutsGoal, setWorkoutsGoal] = useState(4);
  const [checkinsGoal, setCheckinsGoal] = useState(5);
  const [hydrationGoal, setHydrationGoal] = useState(2500);
  const [sleepGoal, setSleepGoal] = useState(480);
  const [preferredTime, setPreferredTime] = useState(profile?.preferredTime || '07:00');
  const [hydrationAmount, setHydrationAmount] = useState(350);
  const [sleepHours, setSleepHours] = useState(8);
  const [reminderType, setReminderType] = useState<ReminderType>('workout');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderChannel, setReminderChannel] = useState<ReminderChannel>('push');
  const [reminderTime, setReminderTime] = useState('07:00');
  const [reminderEvery, setReminderEvery] = useState(90);
  const [reminderInactivity, setReminderInactivity] = useState(3);
  const [reminderMessage, setReminderMessage] = useState('');
  const [calendarDate, setCalendarDate] = useState(new Date().toISOString().slice(0, 10));
  const [calendarTime, setCalendarTime] = useState(profile?.preferredTime || '07:00');
  const [checkinBody, setCheckinBody] = useState('Como você dormiu, treinou e se recuperou desde o último check-in?');
  const [prTitle, setPrTitle] = useState('Conquista registrada');
  const [prBody, setPrBody] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [tenantColor, setTenantColor] = useState('#a3e635');
  const [supportEmail, setSupportEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [assessmentNote, setAssessmentNote] = useState('');
  const [studentMessage, setStudentMessage] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const next = await fetchRetentionHubState();
      setState(next);
      setWorkoutsGoal(next.profile.consistency_workouts_per_week);
      setCheckinsGoal(next.profile.consistency_checkins_per_week);
      setHydrationGoal(next.profile.hydration_goal_ml);
      setSleepGoal(next.profile.sleep_goal_minutes);
      setPreferredTime(next.profile.preferred_workout_time);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar retenção.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const selected = state?.reminders.find(item => item.reminder_type === reminderType);
    if (!selected) return;

    setReminderEnabled(selected.enabled);
    setReminderChannel(selected.channel);
    setReminderTime(selected.schedule.time || '07:00');
    setReminderEvery(selected.schedule.everyMinutes || 90);
    setReminderInactivity(selected.schedule.inactivityDays || 3);
    setReminderMessage(selected.message);
  }, [state, reminderType]);

  const runAction = async (label: string, action: () => Promise<unknown>, success: string) => {
    setSaving(label);
    setStatus('');
    setError('');

    try {
      await action();
      setStatus(success);
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Ação não concluída.');
    } finally {
      setSaving('');
    }
  };

  const saveGoals = () => runAction(
    'goals',
    () => saveConsistencyGoal({
      workoutsPerWeek: workoutsGoal,
      checkinsPerWeek: checkinsGoal,
      hydrationGoalMl: hydrationGoal,
      sleepGoalMinutes: sleepGoal,
      preferredWorkoutTime: preferredTime,
    }),
    'Metas sincronizadas no Supabase.',
  );

  const saveSelectedReminder = () => runAction(
    'reminder',
    () => saveReminder({
      reminderType,
      enabled: reminderEnabled,
      channel: reminderChannel,
      schedule: {
        daysOfWeek: reminderType === 'hydration' || reminderType === 'reactivation' ? undefined : [0, 1, 2, 3, 4, 5, 6],
        time: reminderType === 'hydration' || reminderType === 'reactivation' ? undefined : reminderTime,
        everyMinutes: reminderType === 'hydration' ? reminderEvery : undefined,
        inactivityDays: reminderType === 'reactivation' ? reminderInactivity : undefined,
        timezone: 'America/Sao_Paulo',
      },
      message: reminderMessage || `${REMINDER_LABELS[reminderType]} agendado.`,
    }),
    'Lembrete salvo no backend.',
  );

  const logHydration = () => runAction(
    'hydration',
    () => recordHabitEvent({
      eventType: 'hydration_logged',
      amount: hydrationAmount,
      metadata: { source: 'retention_hub' },
    }),
    'Hidratação registrada.',
  );

  const logSleep = () => runAction(
    'sleep',
    () => recordHabitEvent({
      eventType: 'sleep_logged',
      amount: Math.round(sleepHours * 60),
      metadata: { source: 'retention_hub' },
    }),
    'Sono registrado.',
  );

  const logCheckin = () => runAction(
    'checkin',
    () => recordHabitEvent({
      eventType: 'checkin_completed',
      metadata: { source: 'retention_hub', userName },
    }),
    'Check-in registrado.',
  );

  const scheduleCheckin = () => runAction(
    'schedule-checkin',
    () => scheduleAutomatedCheckin({
      messageType: 'daily_checkin',
      scheduledFor: `${calendarDate}T${calendarTime}:00`,
      subject: 'Check-in do aluno',
      body: checkinBody,
      metadata: { source: 'retention_hub' },
    }),
    'Check-in automático agendado.',
  );

  const createCalendarWorkout = () => runAction(
    'calendar',
    () => createWorkoutCalendarItem({
      eventType: 'workout',
      title: currentPlan?.planName || 'Treino planejado',
      scheduledFor: calendarDate,
      timeOfDay: calendarTime,
      source: 'retention_hub',
      metadata: { planId: currentPlan?.id ?? null },
    }),
    'Treino adicionado à agenda.',
  );

  const startChallenge = (days: 7 | 14 | 30) => runAction(
    `challenge-${days}`,
    () => startConsistencyChallenge(days),
    `Desafio de ${days} dias iniciado.`,
  );

  const createAlternative = (durationMinutes: number) => runAction(
    `alternative-${durationMinutes}`,
    async () => {
      const suggestion = await createAlternativeWorkoutSuggestion({
        durationMinutes,
        goal: profile?.goal,
        location: profile?.workoutLocation,
        currentPlan,
        reason: 'agenda_corrida',
        date: calendarDate,
      });

      await createWorkoutCalendarItem({
        eventType: 'workout',
        title: suggestion.title,
        scheduledFor: calendarDate,
        timeOfDay: calendarTime,
        source: 'alternative_workout',
        metadata: {
          alternativeWorkoutId: suggestion.id,
          exercises: suggestion.exercises,
        },
      });
    },
    `Treino alternativo de ${durationMinutes}min criado e agendado.`,
  );

  const shareAchievement = () => runAction(
    'share',
    async () => {
      const metricValue = latest
        ? `${latest.totalVolume}kg · ${latest.completedCount}/${latest.exerciseCount}`
        : currentPlan?.planName || 'Evolução registrada';

      await createAchievementPost({
        title: prTitle.trim(),
        body: prBody.trim() || `Conquista de ${userName} no Treino Brutal.`,
        metricLabel: latest ? 'Treino' : 'Conquista',
        metricValue,
      });

      await recordHabitEvent({
        eventType: 'pr_shared',
        amount: latest?.totalVolume ?? undefined,
        metadata: { source: 'retention_hub', latestWorkoutId: latest?.id ?? null },
      });
    },
    'Conquista publicada no feed social.',
  );

  const saveTenant = () => runAction(
    'tenant',
    () => saveWhiteLabelTenant({
      brandName: tenantName,
      primaryColor: tenantColor,
      supportEmail,
    }),
    'White-label salvo.',
  );

  const saveAssessment = () => runAction(
    'assessment',
    () => createStudentAssessment({
      tenantId: state?.tenants[0]?.id || '',
      studentId,
      assessmentType: 'progress',
      notes: assessmentNote,
      metadata: { source: 'retention_hub' },
    }),
    'Avaliação do aluno salva.',
  );

  const sendMessage = () => runAction(
    'student-message',
    async () => {
      await sendStudentMessage({
        tenantId: state?.tenants[0]?.id || '',
        studentId,
        body: studentMessage,
        channel: 'in_app',
      });
      await recordHabitEvent({
        eventType: 'coach_message_sent',
        metadata: { source: 'retention_hub', studentId },
      });
    },
    'Mensagem do aluno enfileirada.',
  );

  const syncOnboarding = () => runAction(
    'onboarding',
    () => saveOnboardingProgress({
      currentStep: state?.onboarding?.current_step ?? 1,
      totalSteps: state?.onboarding?.total_steps ?? 7,
      payload: { source: 'retention_hub', currentPlanId: currentPlan?.id ?? null },
      completed: Boolean(state?.onboarding?.completed),
    }),
    'Progresso de onboarding salvo.',
  );

  const markIntegrationPending = (integration: RetentionHubState['integrations'][number]) => runAction(
    `integration-${integration.provider}`,
    () => updateHealthIntegration({
      provider: integration.provider,
      status: 'needs_config',
      dataMode: integration.data_mode,
      scopes: integration.scopes,
      errorMessage: 'Aguardando configuração OAuth/nativa segura fora do frontend.',
    }),
    'Integração registrada como pendente de configuração segura.',
  );

  const metrics = state?.metrics;
  const firstTenant = state?.tenants[0];
  const hasTenant = Boolean(firstTenant);

  return (
    <div className="min-h-screen bg-brand-dark text-white p-4 md:p-6">
      <header className="max-w-7xl mx-auto mb-8">
        <p className="text-brand-neon text-xs uppercase tracking-[0.25em] font-bold">
          Bloco 05
        </p>
        <h1 className="text-4xl font-black mt-2">Retenção, Hábito e Operação</h1>
        <p className="text-brand-muted mt-2 max-w-3xl">
          Streaks, metas, lembretes, agenda, social e operação de alunos com persistência Supabase/RLS.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={load}
            disabled={loading || Boolean(saving)}
            className="bg-white/10 text-white rounded-xl px-4 py-3 font-bold flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
            Atualizar
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        {loading && (
          <section className="bg-brand-gray border border-white/10 rounded-2xl p-5 flex items-center gap-3">
            <Loader2 className="animate-spin text-brand-neon" />
            <span className="font-bold">Carregando dados reais...</span>
          </section>
        )}

        {error && (
          <section className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 text-red-200">
            <p className="font-black">Operação indisponível</p>
            <p className="text-sm mt-1">{error}</p>
          </section>
        )}

        {status && (
          <section className="bg-brand-neon/10 border border-brand-neon/30 rounded-2xl p-4 text-brand-neon font-bold">
            {status}
          </section>
        )}

        {state && metrics && (
          <>
            <section className="grid md:grid-cols-4 gap-4">
              <Metric icon={<Flame />} label="Streak diário" value={`${metrics.dailyStreak}d`} />
              <Metric icon={<CalendarDays />} label="Streak semanal" value={`${metrics.weeklyStreak}sem`} />
              <Metric icon={<Activity />} label="Treinos na semana" value={`${metrics.workoutsThisWeek}/${state.profile.consistency_workouts_per_week}`} />
              <Metric icon={<BadgeCheck />} label="Badges" value={metrics.unlockedBadges} />
            </section>

            <section className="grid xl:grid-cols-[1.1fr_0.9fr] gap-5">
              <div className="bg-brand-gray border border-white/10 rounded-2xl p-5">
                <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-5">
                  <Trophy className="text-brand-neon" />
                  Metas de Consistência
                </h2>

                <div className="grid md:grid-cols-5 gap-3">
                  <NumberField label="Treinos/sem" value={workoutsGoal} min={1} max={7} onChange={setWorkoutsGoal} />
                  <NumberField label="Check-ins/sem" value={checkinsGoal} min={1} max={7} onChange={setCheckinsGoal} />
                  <NumberField label="Água ml" value={hydrationGoal} min={500} max={8000} step={100} onChange={setHydrationGoal} />
                  <NumberField label="Sono min" value={sleepGoal} min={240} max={720} step={15} onChange={setSleepGoal} />
                  <label className="text-sm text-brand-muted">
                    Horário
                    <input
                      type="time"
                      value={preferredTime}
                      onChange={event => setPreferredTime(event.target.value)}
                      className="mt-2 w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-3 text-white outline-none"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={saveGoals}
                  disabled={saving === 'goals'}
                  className="mt-4 bg-brand-neon text-brand-dark rounded-xl px-5 py-3 font-black disabled:opacity-50"
                >
                  Salvar metas
                </button>
              </div>

              <div className="bg-brand-gray border border-white/10 rounded-2xl p-5">
                <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-5">
                  <Bell className="text-brand-neon" />
                  Lembretes Inteligentes
                </h2>

                <div className="grid md:grid-cols-2 gap-3">
                  <label className="text-sm text-brand-muted">
                    Tipo
                    <select
                      value={reminderType}
                      onChange={event => setReminderType(event.target.value as ReminderType)}
                      className="mt-2 w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-3 text-white outline-none"
                    >
                      {(Object.keys(REMINDER_LABELS) as ReminderType[]).map(type => (
                        <option key={type} value={type}>{REMINDER_LABELS[type]}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm text-brand-muted">
                    Canal
                    <select
                      value={reminderChannel}
                      onChange={event => setReminderChannel(event.target.value as ReminderChannel)}
                      className="mt-2 w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-3 text-white outline-none"
                    >
                      {CHANNELS.map(channel => <option key={channel} value={channel}>{channel}</option>)}
                    </select>
                  </label>
                  {reminderType === 'hydration' ? (
                    <NumberField label="Intervalo min" value={reminderEvery} min={15} max={240} step={15} onChange={setReminderEvery} />
                  ) : reminderType === 'reactivation' ? (
                    <NumberField label="Dias inativo" value={reminderInactivity} min={2} max={30} onChange={setReminderInactivity} />
                  ) : (
                    <label className="text-sm text-brand-muted">
                      Horário
                      <input
                        type="time"
                        value={reminderTime}
                        onChange={event => setReminderTime(event.target.value)}
                        className="mt-2 w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-3 text-white outline-none"
                      />
                    </label>
                  )}
                  <label className="text-sm text-brand-muted flex items-center gap-2 pt-8">
                    <input
                      type="checkbox"
                      checked={reminderEnabled}
                      onChange={event => setReminderEnabled(event.target.checked)}
                      className="h-4 w-4"
                    />
                    Ativo
                  </label>
                </div>
                <input
                  value={reminderMessage}
                  onChange={event => setReminderMessage(event.target.value)}
                  placeholder="Mensagem do lembrete"
                  className="mt-3 w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-3 text-white outline-none"
                />
                <button
                  type="button"
                  onClick={saveSelectedReminder}
                  disabled={saving === 'reminder'}
                  className="mt-4 bg-brand-neon text-brand-dark rounded-xl px-5 py-3 font-black disabled:opacity-50"
                >
                  Salvar lembrete
                </button>
              </div>
            </section>

            <section className="grid xl:grid-cols-3 gap-5">
              <div className="bg-brand-gray border border-white/10 rounded-2xl p-5">
                <h2 className="text-xl font-black text-white flex items-center gap-2 mb-4">
                  <Droplets className="text-brand-neon" />
                  Check-in, Água e Sono
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <NumberField label="Água ml" value={hydrationAmount} min={50} max={2000} step={50} onChange={setHydrationAmount} />
                  <NumberField label="Sono h" value={sleepHours} min={1} max={14} step={0.5} onChange={setSleepHours} />
                </div>
                <div className="mt-4 grid gap-2">
                  <ActionButton onClick={logCheckin} saving={saving === 'checkin'} icon={<CheckCircle2 size={16} />} label="Registrar check-in" />
                  <ActionButton onClick={logHydration} saving={saving === 'hydration'} icon={<Droplets size={16} />} label="Registrar hidratação" />
                  <ActionButton onClick={logSleep} saving={saving === 'sleep'} icon={<Moon size={16} />} label="Registrar sono" />
                </div>
                <p className="mt-3 text-xs text-brand-muted">
                  Hoje: {metrics.hydrationTodayMl}ml · sono médio {formatMinutes(metrics.sleepAverageMinutes)}
                </p>
              </div>

              <div className="bg-brand-gray border border-white/10 rounded-2xl p-5">
                <h2 className="text-xl font-black text-white flex items-center gap-2 mb-4">
                  <Trophy className="text-brand-neon" />
                  Desafios 7/14/30
                </h2>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {([7, 14, 30] as const).map(days => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => startChallenge(days)}
                      disabled={saving === `challenge-${days}`}
                      className="bg-brand-neon text-brand-dark rounded-xl px-3 py-3 font-black disabled:opacity-50"
                    >
                      {days}d
                    </button>
                  ))}
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {state.challenges.map(challenge => (
                    <div key={challenge.id} className="bg-brand-dark border border-white/10 rounded-xl p-3">
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="text-white font-bold">{challenge.title}</span>
                        <span className="text-brand-neon">{challenge.progress ?? 0}/{challenge.target_days}</span>
                      </div>
                      <p className="text-xs text-brand-muted">
                        {formatDate(challenge.starts_on)} até {formatDate(challenge.ends_on)} · {challenge.status}
                      </p>
                    </div>
                  ))}
                  {!state.challenges.length && <p className="text-sm text-brand-muted">Nenhum desafio iniciado.</p>}
                </div>
              </div>

              <div className="bg-brand-gray border border-white/10 rounded-2xl p-5">
                <h2 className="text-xl font-black text-white flex items-center gap-2 mb-4">
                  <BadgeCheck className="text-brand-neon" />
                  Badges
                </h2>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {state.badges.map(badge => (
                    <div key={badge.badge_id} className="bg-brand-dark border border-white/10 rounded-xl p-3">
                      <p className="text-white font-bold">{badge.emoji} {badge.badge_name}</p>
                      <p className="text-xs text-brand-muted">{badge.badge_description}</p>
                    </div>
                  ))}
                  {!state.badges.length && <p className="text-sm text-brand-muted">Nenhuma conquista desbloqueada ainda.</p>}
                </div>
              </div>
            </section>

            <section className="grid xl:grid-cols-2 gap-5">
              <div className="bg-brand-gray border border-white/10 rounded-2xl p-5">
                <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-5">
                  <CalendarDays className="text-brand-neon" />
                  Agenda e Treino Corrido
                </h2>
                <div className="grid md:grid-cols-2 gap-3 mb-4">
                  <label className="text-sm text-brand-muted">
                    Data
                    <input
                      type="date"
                      value={calendarDate}
                      onChange={event => setCalendarDate(event.target.value)}
                      className="mt-2 w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-3 text-white outline-none"
                    />
                  </label>
                  <label className="text-sm text-brand-muted">
                    Horário
                    <input
                      type="time"
                      value={calendarTime}
                      onChange={event => setCalendarTime(event.target.value)}
                      className="mt-2 w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-3 text-white outline-none"
                    />
                  </label>
                </div>
                <div className="grid md:grid-cols-4 gap-2">
                  <ActionButton onClick={createCalendarWorkout} saving={saving === 'calendar'} icon={<CalendarDays size={16} />} label="Agendar treino" />
                  {[12, 20, 30].map(minutes => (
                    <ActionButton
                      key={minutes}
                      onClick={() => createAlternative(minutes)}
                      saving={saving === `alternative-${minutes}`}
                      icon={<Activity size={16} />}
                      label={`${minutes}min`}
                    />
                  ))}
                </div>
                <div className="mt-4 space-y-2 max-h-52 overflow-y-auto">
                  {state.calendar.map(item => (
                    <div key={item.id} className="bg-brand-dark border border-white/10 rounded-xl p-3 flex justify-between gap-3">
                      <div>
                        <p className="text-white font-bold">{item.title}</p>
                        <p className="text-xs text-brand-muted">{formatDate(item.scheduled_for)} · {item.time_of_day ?? '--:--'} · {item.source}</p>
                      </div>
                      <span className="text-xs text-brand-neon">{item.status}</span>
                    </div>
                  ))}
                  {!state.calendar.length && <p className="text-sm text-brand-muted">Agenda vazia.</p>}
                </div>
              </div>

              <div className="bg-brand-gray border border-white/10 rounded-2xl p-5">
                <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-5">
                  <Send className="text-brand-neon" />
                  Social e Check-ins Automáticos
                </h2>
                <input
                  value={prTitle}
                  onChange={event => setPrTitle(event.target.value)}
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-3 text-white outline-none mb-3"
                  placeholder="Título da conquista"
                />
                <textarea
                  value={prBody}
                  onChange={event => setPrBody(event.target.value)}
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-3 text-white outline-none min-h-24 mb-3"
                  placeholder="Contexto para o feed"
                />
                <ActionButton onClick={shareAchievement} saving={saving === 'share'} icon={<Trophy size={16} />} label="Publicar conquista" />
                <textarea
                  value={checkinBody}
                  onChange={event => setCheckinBody(event.target.value)}
                  className="mt-4 w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-3 text-white outline-none min-h-20"
                />
                <button
                  type="button"
                  onClick={scheduleCheckin}
                  disabled={saving === 'schedule-checkin'}
                  className="mt-3 bg-white/10 text-white rounded-xl px-5 py-3 font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {saving === 'schedule-checkin' ? <Loader2 className="animate-spin" size={16} /> : <Bell size={16} />}
                  Agendar check-in
                </button>
                <p className="mt-3 text-xs text-brand-muted">
                  Pendentes: {state.automatedCheckins.filter(item => item.status === 'pending').length}
                </p>
              </div>
            </section>

            <section className="grid xl:grid-cols-[0.9fr_1.1fr] gap-5">
              <div className="bg-brand-gray border border-white/10 rounded-2xl p-5">
                <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-5">
                  <Watch className="text-brand-neon" />
                  Wearables e Health
                </h2>
                <div className="space-y-2">
                  {state.integrations.map(integration => (
                    <div key={integration.provider} className="bg-brand-dark border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-white font-bold">{integration.provider}</p>
                        <p className="text-xs text-brand-muted">{integration.status} · {integration.data_mode}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => markIntegrationPending(integration)}
                        disabled={saving === `integration-${integration.provider}`}
                        className="bg-white/10 text-white rounded-xl px-3 py-2 text-xs font-bold disabled:opacity-50"
                      >
                        Revalidar
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-brand-gray border border-white/10 rounded-2xl p-5">
                <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-5">
                  <ShieldCheck className="text-brand-neon" />
                  White-label e Gestão
                </h2>
                <div className="grid md:grid-cols-[1fr_120px_1fr_auto] gap-3">
                  <input
                    value={tenantName}
                    onChange={event => setTenantName(event.target.value)}
                    placeholder="Marca do coach/academia"
                    className="bg-brand-dark border border-white/10 rounded-xl px-3 py-3 text-white outline-none"
                  />
                  <input
                    type="color"
                    value={tenantColor}
                    onChange={event => setTenantColor(event.target.value)}
                    className="h-12 bg-brand-dark border border-white/10 rounded-xl px-2"
                    title="Cor primária"
                  />
                  <input
                    value={supportEmail}
                    onChange={event => setSupportEmail(event.target.value)}
                    placeholder="suporte@marca.com"
                    className="bg-brand-dark border border-white/10 rounded-xl px-3 py-3 text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={saveTenant}
                    disabled={saving === 'tenant'}
                    className="bg-brand-neon text-brand-dark rounded-xl px-5 py-3 font-black disabled:opacity-50"
                  >
                    Salvar
                  </button>
                </div>
                <div className="mt-5 grid md:grid-cols-[1fr_1fr] gap-3">
                  <input
                    value={studentId}
                    onChange={event => setStudentId(event.target.value)}
                    placeholder="UUID do aluno"
                    className="bg-brand-dark border border-white/10 rounded-xl px-3 py-3 text-white outline-none"
                  />
                  <input
                    value={assessmentNote}
                    onChange={event => setAssessmentNote(event.target.value)}
                    placeholder="Nota de avaliação"
                    disabled={!hasTenant}
                    className="bg-brand-dark border border-white/10 rounded-xl px-3 py-3 text-white outline-none disabled:opacity-50"
                  />
                  <input
                    value={studentMessage}
                    onChange={event => setStudentMessage(event.target.value)}
                    placeholder="Mensagem para o aluno"
                    disabled={!hasTenant}
                    className="bg-brand-dark border border-white/10 rounded-xl px-3 py-3 text-white outline-none disabled:opacity-50"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={saveAssessment}
                      disabled={!hasTenant || !studentId || saving === 'assessment'}
                      className="flex-1 bg-white/10 text-white rounded-xl px-3 py-3 font-bold disabled:opacity-50"
                    >
                      Avaliar
                    </button>
                    <button
                      type="button"
                      onClick={sendMessage}
                      disabled={!hasTenant || !studentId || saving === 'student-message'}
                      className="flex-1 bg-brand-neon text-brand-dark rounded-xl px-3 py-3 font-black disabled:opacity-50"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
                <div className="mt-4 grid md:grid-cols-3 gap-3 text-sm">
                  <Metric icon={<Users />} label="Tenants" value={state.tenants.length} compact />
                  <Metric icon={<ClipboardList />} label="Avaliações" value={state.assessments.length} compact />
                  <Metric icon={<Send />} label="Mensagens" value={state.messages.length} compact />
                </div>
              </div>
            </section>

            <section className="bg-brand-gray border border-white/10 rounded-2xl p-5">
              <h2 className="text-2xl font-black text-white mb-4">Onboarding com Auto-save</h2>
              <div className="grid md:grid-cols-[1fr_auto] gap-4 items-center">
                <div>
                  <p className="text-brand-muted">
                    Etapa {state.onboarding?.current_step ?? 0}/{state.onboarding?.total_steps ?? 7} · {state.onboarding?.completed ? 'concluído' : 'em andamento'}
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    Atualizado em {state.onboarding?.updated_at ? new Date(state.onboarding.updated_at).toLocaleString('pt-BR') : '-'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={syncOnboarding}
                  disabled={saving === 'onboarding'}
                  className="bg-brand-neon text-brand-dark rounded-xl px-5 py-3 font-black disabled:opacity-50"
                >
                  Sincronizar
                </button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  compact = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  compact?: boolean;
}) {
  return (
    <div className={`bg-brand-gray border border-white/10 rounded-2xl ${compact ? 'p-3' : 'p-5'}`}>
      <div className="text-brand-neon mb-2">{icon}</div>
      <p className="text-xs text-brand-muted uppercase tracking-widest">{label}</p>
      <p className={`${compact ? 'text-xl' : 'text-3xl'} font-black text-white mt-1 tabular-nums`}>{value}</p>
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="text-sm text-brand-muted">
      {label}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={event => onChange(Number(event.target.value))}
        className="mt-2 w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-3 text-white outline-none"
      />
    </label>
  );
}

function ActionButton({
  onClick,
  saving,
  icon,
  label,
}: {
  onClick: () => void;
  saving: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="bg-white/10 text-white rounded-xl px-4 py-3 font-bold flex items-center justify-center gap-2 disabled:opacity-50"
    >
      {saving ? <Loader2 className="animate-spin" size={16} /> : icon}
      {label}
    </button>
  );
}
