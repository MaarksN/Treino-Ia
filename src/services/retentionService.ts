import { getCurrentUserId, isSupabaseConfigured, supabase } from './supabaseClient';
import {
  AlternativeWorkout,
  AutomatedCheckin,
  CalendarItemType,
  HealthIntegration,
  IntegrationProvider,
  IntegrationStatus,
  OnboardingProgress,
  QuickWorkoutSuggestionInput,
  ReminderChannel,
  ReminderSchedule,
  ReminderType,
  RetentionBadge,
  RetentionChallenge,
  RetentionDataMode,
  RetentionHabitEvent,
  RetentionHubState,
  RetentionProfile,
  RetentionReminder,
  RetentionStreak,
  StudentAssessment,
  StudentMessage,
  TenantStudent,
  WhiteLabelTenant,
  WorkoutCalendarItem,
} from '../types/retention';
import {
  attachChallengeProgress,
  buildQuickWorkoutPlan,
  buildRetentionMetrics,
  buildRetentionStreakFromEvents,
  normalizeIsoDate,
  validateReminderSchedule,
} from '../utils/retentionUtils';

type SupabaseErrorLike = { message?: string; details?: string; hint?: string; code?: string } | null | undefined;

const DEFAULT_REMINDERS: Array<Pick<RetentionReminder, 'reminder_type' | 'enabled' | 'channel' | 'schedule' | 'message'>> = [
  {
    reminder_type: 'workout',
    enabled: true,
    channel: 'push',
    schedule: { daysOfWeek: [1, 3, 5], time: '07:00', timezone: 'America/Sao_Paulo' },
    message: 'Treino principal agendado.',
  },
  {
    reminder_type: 'hydration',
    enabled: true,
    channel: 'push',
    schedule: { everyMinutes: 90, timezone: 'America/Sao_Paulo' },
    message: 'Registrar hidratação.',
  },
  {
    reminder_type: 'sleep',
    enabled: true,
    channel: 'push',
    schedule: { time: '22:30', timezone: 'America/Sao_Paulo' },
    message: 'Preparar rotina de sono.',
  },
  {
    reminder_type: 'checkin',
    enabled: true,
    channel: 'in_app',
    schedule: { daysOfWeek: [0, 1, 2, 3, 4, 5, 6], time: '08:00', timezone: 'America/Sao_Paulo' },
    message: 'Check-in diario de prontidao.',
  },
  {
    reminder_type: 'reactivation',
    enabled: true,
    channel: 'in_app',
    schedule: { inactivityDays: 3, timezone: 'America/Sao_Paulo' },
    message: 'Fluxo de reativacao apos inatividade.',
  },
];

const DEFAULT_HEALTH_INTEGRATIONS: Array<{
  provider: IntegrationProvider;
  status: IntegrationStatus;
  data_mode: RetentionDataMode;
  scopes: string[];
}> = [
  { provider: 'apple_health', status: 'needs_config', data_mode: 'native', scopes: ['workouts', 'sleep', 'active_energy'] },
  { provider: 'google_fit', status: 'needs_config', data_mode: 'oauth', scopes: ['activity', 'sleep', 'heart_rate'] },
  { provider: 'health_connect', status: 'needs_config', data_mode: 'native', scopes: ['steps', 'sleep', 'heart_rate'] },
  { provider: 'ble_hr', status: 'needs_config', data_mode: 'ble', scopes: ['heart_rate'] },
  { provider: 'garmin', status: 'needs_config', data_mode: 'csv', scopes: ['workouts', 'heart_rate'] },
  { provider: 'fitbit', status: 'needs_config', data_mode: 'oauth', scopes: ['activity', 'sleep', 'heartrate'] },
  { provider: 'strava', status: 'needs_config', data_mode: 'oauth', scopes: ['activity:read_all'] },
];

const BADGE_DEFINITIONS = [
  {
    id: 'first_workout',
    name: 'Primeiro treino real',
    description: 'Registrou o primeiro treino no backend.',
    emoji: '1',
    category: 'consistency',
    condition: (input: { streak: RetentionStreak; metrics: ReturnType<typeof buildRetentionMetrics> }) => input.metrics.workoutsThisWeek > 0 || input.streak.best_daily_streak > 0,
  },
  {
    id: 'streak_7_backend',
    name: '7 dias consistentes',
    description: 'Manteve 7 dias de treino em sequencia.',
    emoji: '7',
    category: 'consistency',
    condition: (input: { streak: RetentionStreak }) => input.streak.best_daily_streak >= 7,
  },
  {
    id: 'weekly_streak_4',
    name: '4 semanas no trilho',
    description: 'Treinou em 4 semanas consecutivas.',
    emoji: '4w',
    category: 'consistency',
    condition: (input: { streak: RetentionStreak }) => input.streak.best_weekly_streak >= 4,
  },
  {
    id: 'hydration_goal_backend',
    name: 'Hidratacao em dia',
    description: 'Bateu a meta diaria de hidratacao.',
    emoji: 'ml',
    category: 'recovery',
    condition: (input: { profile: RetentionProfile; metrics: ReturnType<typeof buildRetentionMetrics> }) => input.metrics.hydrationTodayMl >= input.profile.hydration_goal_ml,
  },
  {
    id: 'sleep_goal_backend',
    name: 'Sono protegido',
    description: 'Registrou media de sono dentro da meta.',
    emoji: 'zz',
    category: 'recovery',
    condition: (input: { profile: RetentionProfile; metrics: ReturnType<typeof buildRetentionMetrics> }) => input.metrics.sleepAverageMinutes >= input.profile.sleep_goal_minutes,
  },
  {
    id: 'challenge_30_backend',
    name: 'Desafio 30 dias',
    description: 'Concluiu um desafio de 30 dias.',
    emoji: '30',
    category: 'challenge',
    condition: (input: { challenges: RetentionChallenge[] }) => input.challenges.some(challenge => challenge.duration_days === 30 && challenge.status === 'completed'),
  },
];

function assertSupabaseConfigured(): void {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase nao configurado. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
  }
}

function assertNoError(error: SupabaseErrorLike): void {
  if (error) {
    throw new Error(error.message || 'Falha ao acessar Supabase.');
  }
}

function sanitizeShortText(value: string, max = 160): string {
  return value.trim().replace(/\s+/g, ' ').slice(0, max);
}

function createSlug(value: string): string {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

  return normalized || `tenant-${Date.now()}`;
}

async function ensureRetentionDefaults(userId: string): Promise<void> {
  assertSupabaseConfigured();

  const { error: profileError } = await supabase
    .from('retention_profiles')
    .upsert({ user_id: userId }, { onConflict: 'user_id' });
  assertNoError(profileError);

  const { error: streakError } = await supabase
    .from('user_streaks')
    .upsert({ user_id: userId }, { onConflict: 'user_id' });
  assertNoError(streakError);

  const { data: existingReminders, error: remindersError } = await supabase
    .from('habit_reminders')
    .select('reminder_type')
    .eq('user_id', userId);
  assertNoError(remindersError);

  const reminderTypes = new Set((existingReminders ?? []).map(row => String(row.reminder_type)));
  const missingReminders = DEFAULT_REMINDERS
    .filter(reminder => !reminderTypes.has(reminder.reminder_type))
    .map(reminder => ({ ...reminder, user_id: userId }));

  if (missingReminders.length) {
    const { error } = await supabase.from('habit_reminders').insert(missingReminders);
    assertNoError(error);
  }

  const { data: existingIntegrations, error: integrationError } = await supabase
    .from('health_integrations')
    .select('provider')
    .eq('user_id', userId);
  assertNoError(integrationError);

  const providers = new Set((existingIntegrations ?? []).map(row => String(row.provider)));
  const missingIntegrations = DEFAULT_HEALTH_INTEGRATIONS
    .filter(integration => !providers.has(integration.provider))
    .map(integration => ({ ...integration, user_id: userId }));

  if (missingIntegrations.length) {
    const { error } = await supabase.from('health_integrations').insert(missingIntegrations);
    assertNoError(error);
  }
}

async function loadCoreState(userId: string) {
  const [
    profileResult,
    streakResult,
    eventsResult,
    remindersResult,
    challengesResult,
    badgesResult,
    onboardingResult,
    checkinsResult,
    alternativesResult,
    calendarResult,
    integrationsResult,
    tenantsResult,
  ] = await Promise.all([
    supabase.from('retention_profiles').select('*').eq('user_id', userId).single(),
    supabase.from('user_streaks').select('*').eq('user_id', userId).single(),
    supabase.from('habit_events').select('*').eq('user_id', userId).order('event_date', { ascending: false }).order('created_at', { ascending: false }).limit(240),
    supabase.from('habit_reminders').select('*').eq('user_id', userId).order('reminder_type'),
    supabase.from('consistency_challenges').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(40),
    supabase.from('retention_badges').select('*').eq('user_id', userId).order('unlocked_at', { ascending: false }),
    supabase.from('onboarding_progress').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('automated_checkins').select('*').eq('user_id', userId).order('scheduled_for', { ascending: false }).limit(30),
    supabase.from('alternative_workouts').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
    supabase.from('workout_calendar_items').select('*').eq('user_id', userId).order('scheduled_for', { ascending: true }).limit(60),
    supabase.from('health_integrations').select('*').eq('user_id', userId).order('provider'),
    supabase.from('white_label_tenants').select('*').eq('owner_id', userId).order('created_at', { ascending: false }),
  ]);

  [
    profileResult.error,
    streakResult.error,
    eventsResult.error,
    remindersResult.error,
    challengesResult.error,
    badgesResult.error,
    onboardingResult.error,
    checkinsResult.error,
    alternativesResult.error,
    calendarResult.error,
    integrationsResult.error,
    tenantsResult.error,
  ].forEach(assertNoError);

  const tenants = (tenantsResult.data ?? []) as WhiteLabelTenant[];
  const tenantIds = tenants.map(tenant => tenant.id);

  const [studentsResult, assessmentsResult, messagesResult] = tenantIds.length
    ? await Promise.all([
        supabase.from('tenant_students').select('*').in('tenant_id', tenantIds).order('assigned_at', { ascending: false }),
        supabase.from('student_assessments').select('*').in('tenant_id', tenantIds).order('created_at', { ascending: false }).limit(40),
        supabase.from('student_messages').select('*').in('tenant_id', tenantIds).order('created_at', { ascending: false }).limit(40),
      ])
    : [
        { data: [], error: null },
        { data: [], error: null },
        { data: [], error: null },
      ];

  [studentsResult.error, assessmentsResult.error, messagesResult.error].forEach(assertNoError);

  return {
    profile: profileResult.data as RetentionProfile,
    streak: streakResult.data as RetentionStreak,
    events: (eventsResult.data ?? []) as RetentionHabitEvent[],
    reminders: (remindersResult.data ?? []) as RetentionReminder[],
    challenges: (challengesResult.data ?? []) as RetentionChallenge[],
    badges: (badgesResult.data ?? []) as RetentionBadge[],
    onboarding: onboardingResult.data as OnboardingProgress | null,
    automatedCheckins: (checkinsResult.data ?? []) as AutomatedCheckin[],
    alternatives: (alternativesResult.data ?? []) as AlternativeWorkout[],
    calendar: (calendarResult.data ?? []) as WorkoutCalendarItem[],
    integrations: (integrationsResult.data ?? []) as HealthIntegration[],
    tenants,
    students: (studentsResult.data ?? []) as TenantStudent[],
    assessments: (assessmentsResult.data ?? []) as StudentAssessment[],
    messages: (messagesResult.data ?? []) as StudentMessage[],
  };
}

async function syncRetentionBadges(
  userId: string,
  profile: RetentionProfile,
  streak: RetentionStreak,
  metrics: ReturnType<typeof buildRetentionMetrics>,
  challenges: RetentionChallenge[],
  existing: RetentionBadge[],
): Promise<RetentionBadge[]> {
  const existingIds = new Set(existing.map(badge => badge.badge_id));
  const input = { profile, streak, metrics, challenges };
  const missing = BADGE_DEFINITIONS
    .filter(definition => !existingIds.has(definition.id) && definition.condition(input))
    .map(definition => ({
      user_id: userId,
      badge_id: definition.id,
      badge_name: definition.name,
      badge_description: definition.description,
      emoji: definition.emoji,
      category: definition.category,
      source: 'retention_service',
    }));

  if (!missing.length) return existing;

  const { data, error } = await supabase
    .from('retention_badges')
    .upsert(missing, { onConflict: 'user_id,badge_id' })
    .select('*');
  assertNoError(error);

  return [...(data ?? []) as RetentionBadge[], ...existing];
}

async function refreshDerivedRetentionState(userId: string): Promise<void> {
  const { events, profile, challenges, badges } = await loadCoreState(userId);
  const derivedStreak = buildRetentionStreakFromEvents(userId, events);
  const challengesWithProgress = attachChallengeProgress(challenges, events);
  const metrics = buildRetentionMetrics(profile, derivedStreak, events, challengesWithProgress, badges.length);

  const { error: streakError } = await supabase
    .from('user_streaks')
    .upsert(derivedStreak, { onConflict: 'user_id' });
  assertNoError(streakError);

  const completedChallengeIds = challengesWithProgress
    .filter(challenge => challenge.status === 'completed')
    .map(challenge => challenge.id);

  if (completedChallengeIds.length) {
    const { error } = await supabase
      .from('consistency_challenges')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .in('id', completedChallengeIds)
      .eq('user_id', userId);
    assertNoError(error);
  }

  await syncRetentionBadges(userId, profile, derivedStreak, metrics, challengesWithProgress, badges);

  await supabase
    .from('social_profiles')
    .update({
      current_streak: derivedStreak.daily_streak,
      best_streak: derivedStreak.best_daily_streak,
      total_workouts: events.filter(event => event.event_type === 'workout_completed' || event.event_type === 'alternative_workout_completed').length,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
}

export async function fetchRetentionHubState(): Promise<RetentionHubState> {
  assertSupabaseConfigured();
  const userId = await getCurrentUserId();
  await ensureRetentionDefaults(userId);
  await refreshDerivedRetentionState(userId);

  const state = await loadCoreState(userId);
  const challenges = attachChallengeProgress(state.challenges, state.events);
  const metrics = buildRetentionMetrics(state.profile, state.streak, state.events, challenges, state.badges.length);

  return {
    dataMode: 'supabase',
    ...state,
    challenges,
    metrics,
  };
}

export async function saveConsistencyGoal(input: {
  workoutsPerWeek: number;
  checkinsPerWeek: number;
  hydrationGoalMl: number;
  sleepGoalMinutes: number;
  preferredWorkoutTime: string;
}): Promise<RetentionProfile> {
  assertSupabaseConfigured();
  const userId = await getCurrentUserId();

  if (input.workoutsPerWeek < 1 || input.workoutsPerWeek > 7) {
    throw new Error('Meta semanal de treinos deve ficar entre 1 e 7.');
  }
  if (input.checkinsPerWeek < 1 || input.checkinsPerWeek > 7) {
    throw new Error('Meta semanal de check-ins deve ficar entre 1 e 7.');
  }
  if (input.hydrationGoalMl < 500 || input.hydrationGoalMl > 8000) {
    throw new Error('Meta de hidratacao deve ficar entre 500ml e 8000ml.');
  }
  if (input.sleepGoalMinutes < 240 || input.sleepGoalMinutes > 720) {
    throw new Error('Meta de sono deve ficar entre 4h e 12h.');
  }

  const { data, error } = await supabase
    .from('retention_profiles')
    .upsert({
      user_id: userId,
      consistency_workouts_per_week: input.workoutsPerWeek,
      consistency_checkins_per_week: input.checkinsPerWeek,
      hydration_goal_ml: input.hydrationGoalMl,
      sleep_goal_minutes: input.sleepGoalMinutes,
      preferred_workout_time: input.preferredWorkoutTime,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select('*')
    .single();

  assertNoError(error);
  return data as RetentionProfile;
}

export async function saveReminder(input: {
  reminderType: ReminderType;
  enabled: boolean;
  channel: ReminderChannel;
  schedule: ReminderSchedule;
  message: string;
}): Promise<RetentionReminder> {
  assertSupabaseConfigured();
  const userId = await getCurrentUserId();
  validateReminderSchedule(input.reminderType, input.schedule);

  const { data, error } = await supabase
    .from('habit_reminders')
    .upsert({
      user_id: userId,
      reminder_type: input.reminderType,
      enabled: input.enabled,
      channel: input.channel,
      schedule: input.schedule,
      message: sanitizeShortText(input.message, 220),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,reminder_type' })
    .select('*')
    .single();

  assertNoError(error);
  return data as RetentionReminder;
}

export async function recordHabitEvent(input: {
  eventType: RetentionHabitEvent['event_type'];
  eventDate?: string;
  amount?: number;
  metadata?: Record<string, unknown>;
}): Promise<RetentionHabitEvent> {
  assertSupabaseConfigured();
  const userId = await getCurrentUserId();
  const amount = input.amount ?? null;

  if (amount !== null && (!Number.isFinite(amount) || amount < 0)) {
    throw new Error('Valor do evento deve ser positivo.');
  }

  const { data, error } = await supabase
    .from('habit_events')
    .insert({
      user_id: userId,
      event_type: input.eventType,
      event_date: normalizeIsoDate(input.eventDate ?? new Date()),
      amount,
      metadata: input.metadata ?? {},
    })
    .select('*')
    .single();

  assertNoError(error);
  await refreshDerivedRetentionState(userId);
  return data as RetentionHabitEvent;
}

export async function startConsistencyChallenge(durationDays: 7 | 14 | 30): Promise<RetentionChallenge> {
  assertSupabaseConfigured();
  const userId = await getCurrentUserId();
  const start = normalizeIsoDate(new Date());
  const endDate = new Date(`${start}T00:00:00.000Z`);
  endDate.setUTCDate(endDate.getUTCDate() + durationDays - 1);

  const { data, error } = await supabase
    .from('consistency_challenges')
    .insert({
      user_id: userId,
      duration_days: durationDays,
      title: `Desafio ${durationDays} dias`,
      starts_on: start,
      ends_on: normalizeIsoDate(endDate),
      target_days: durationDays,
      status: 'active',
    })
    .select('*')
    .single();

  assertNoError(error);
  return data as RetentionChallenge;
}

export async function saveOnboardingProgress(input: {
  currentStep: number;
  totalSteps: number;
  payload?: Record<string, unknown>;
  completed?: boolean;
}): Promise<OnboardingProgress> {
  assertSupabaseConfigured();
  const userId = await getCurrentUserId();
  const completed = Boolean(input.completed);

  if (input.currentStep < 0 || input.totalSteps < 1 || input.currentStep > input.totalSteps) {
    throw new Error('Progresso de onboarding invalido.');
  }

  const { data, error } = await supabase
    .from('onboarding_progress')
    .upsert({
      user_id: userId,
      current_step: input.currentStep,
      total_steps: input.totalSteps,
      payload: input.payload ?? {},
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select('*')
    .single();

  assertNoError(error);
  return data as OnboardingProgress;
}

export async function scheduleAutomatedCheckin(input: {
  messageType: AutomatedCheckin['message_type'];
  scheduledFor: string;
  subject: string;
  body: string;
  metadata?: Record<string, unknown>;
}): Promise<AutomatedCheckin> {
  assertSupabaseConfigured();
  const userId = await getCurrentUserId();
  const scheduled = new Date(input.scheduledFor);

  if (Number.isNaN(scheduled.getTime())) {
    throw new Error('Data de check-in invalida.');
  }

  const { data, error } = await supabase
    .from('automated_checkins')
    .insert({
      user_id: userId,
      message_type: input.messageType,
      scheduled_for: scheduled.toISOString(),
      subject: sanitizeShortText(input.subject, 120),
      body: sanitizeShortText(input.body, 600),
      status: 'pending',
      metadata: input.metadata ?? {},
    })
    .select('*')
    .single();

  assertNoError(error);
  return data as AutomatedCheckin;
}

export async function createAlternativeWorkoutSuggestion(
  input: QuickWorkoutSuggestionInput,
): Promise<AlternativeWorkout> {
  assertSupabaseConfigured();
  const userId = await getCurrentUserId();
  const plan = buildQuickWorkoutPlan(input);

  const { data, error } = await supabase
    .from('alternative_workouts')
    .insert({
      user_id: userId,
      title: plan.title,
      duration_minutes: plan.durationMinutes,
      focus: plan.focus,
      intensity: plan.intensity,
      exercises: plan.exercises,
      reason: plan.reason,
      status: 'suggested',
      suggested_for: normalizeIsoDate(input.date ?? new Date()),
    })
    .select('*')
    .single();

  assertNoError(error);
  return data as AlternativeWorkout;
}

export async function createWorkoutCalendarItem(input: {
  eventType: CalendarItemType;
  title: string;
  scheduledFor: string;
  timeOfDay?: string;
  source: string;
  metadata?: Record<string, unknown>;
}): Promise<WorkoutCalendarItem> {
  assertSupabaseConfigured();
  const userId = await getCurrentUserId();

  if (!sanitizeShortText(input.title, 120)) {
    throw new Error('Titulo da agenda e obrigatorio.');
  }

  const { data, error } = await supabase
    .from('workout_calendar_items')
    .insert({
      user_id: userId,
      event_type: input.eventType,
      title: sanitizeShortText(input.title, 120),
      scheduled_for: normalizeIsoDate(input.scheduledFor),
      time_of_day: input.timeOfDay ?? null,
      status: 'scheduled',
      source: sanitizeShortText(input.source, 80),
      metadata: input.metadata ?? {},
    })
    .select('*')
    .single();

  assertNoError(error);
  return data as WorkoutCalendarItem;
}

export async function updateHealthIntegration(input: {
  provider: IntegrationProvider;
  status: IntegrationStatus;
  dataMode: RetentionDataMode;
  scopes?: string[];
  errorMessage?: string | null;
}): Promise<HealthIntegration> {
  assertSupabaseConfigured();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('health_integrations')
    .upsert({
      user_id: userId,
      provider: input.provider,
      status: input.status,
      data_mode: input.dataMode,
      scopes: input.scopes ?? [],
      error_message: input.errorMessage ?? null,
      last_sync_at: input.status === 'connected' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,provider' })
    .select('*')
    .single();

  assertNoError(error);
  return data as HealthIntegration;
}

export async function saveWhiteLabelTenant(input: {
  brandName: string;
  primaryColor: string;
  logoUrl?: string;
  supportEmail?: string;
}): Promise<WhiteLabelTenant> {
  assertSupabaseConfigured();
  const userId = await getCurrentUserId();
  const brandName = sanitizeShortText(input.brandName, 80);

  if (brandName.length < 2) {
    throw new Error('Nome da marca deve ter pelo menos 2 caracteres.');
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(input.primaryColor)) {
    throw new Error('Cor primaria deve estar em formato hexadecimal.');
  }

  const { data, error } = await supabase
    .from('white_label_tenants')
    .upsert({
      owner_id: userId,
      brand_name: brandName,
      slug: createSlug(brandName),
      primary_color: input.primaryColor,
      logo_url: input.logoUrl?.trim() || null,
      support_email: input.supportEmail?.trim() || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'owner_id,slug' })
    .select('*')
    .single();

  assertNoError(error);
  return data as WhiteLabelTenant;
}

export async function createStudentAssessment(input: {
  tenantId: string;
  studentId: string;
  assessmentType: StudentAssessment['assessment_type'];
  score?: number;
  notes: string;
  metadata?: Record<string, unknown>;
}): Promise<StudentAssessment> {
  assertSupabaseConfigured();
  const coachId = await getCurrentUserId();

  if (!input.notes.trim()) {
    throw new Error('Notas da avaliacao sao obrigatorias.');
  }

  const { data, error } = await supabase
    .from('student_assessments')
    .insert({
      tenant_id: input.tenantId,
      student_id: input.studentId,
      coach_id: coachId,
      assessment_type: input.assessmentType,
      score: input.score ?? null,
      notes: sanitizeShortText(input.notes, 1000),
      metadata: input.metadata ?? {},
    })
    .select('*')
    .single();

  assertNoError(error);
  return data as StudentAssessment;
}

export async function sendStudentMessage(input: {
  tenantId: string;
  studentId: string;
  body: string;
  channel: ReminderChannel;
}): Promise<StudentMessage> {
  assertSupabaseConfigured();
  const coachId = await getCurrentUserId();

  if (!input.body.trim()) {
    throw new Error('Mensagem do aluno e obrigatoria.');
  }

  const { data, error } = await supabase
    .from('student_messages')
    .insert({
      tenant_id: input.tenantId,
      student_id: input.studentId,
      coach_id: coachId,
      body: sanitizeShortText(input.body, 1200),
      channel: input.channel,
      status: 'queued',
    })
    .select('*')
    .single();

  assertNoError(error);
  return data as StudentMessage;
}
