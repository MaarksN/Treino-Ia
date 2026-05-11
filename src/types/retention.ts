import { WorkoutPlan } from '../types';

export type RetentionDataMode =
  | 'supabase'
  | 'native'
  | 'oauth'
  | 'csv'
  | 'ble'
  | 'external_pending';

export type HabitEventType =
  | 'workout_completed'
  | 'checkin_completed'
  | 'hydration_logged'
  | 'sleep_logged'
  | 'pr_shared'
  | 'badge_unlocked'
  | 'alternative_workout_completed'
  | 'coach_message_sent';

export type ReminderType =
  | 'workout'
  | 'hydration'
  | 'sleep'
  | 'checkin'
  | 'reactivation';

export type ReminderChannel = 'push' | 'email' | 'whatsapp' | 'in_app';

export type ChallengeStatus = 'active' | 'completed' | 'cancelled' | 'expired';

export type IntegrationProvider =
  | 'apple_health'
  | 'google_fit'
  | 'garmin'
  | 'fitbit'
  | 'ble_hr'
  | 'strava'
  | 'health_connect';

export type IntegrationStatus = 'connected' | 'needs_config' | 'revoked' | 'error';

export type CalendarItemStatus = 'scheduled' | 'done' | 'skipped' | 'cancelled';

export type CalendarItemType = 'workout' | 'checkin' | 'recovery' | 'assessment';

export interface RetentionProfile {
  user_id: string;
  consistency_workouts_per_week: number;
  consistency_checkins_per_week: number;
  hydration_goal_ml: number;
  sleep_goal_minutes: number;
  preferred_workout_time: string;
  quiet_hours_start: string;
  quiet_hours_end: string;
  last_activity_at?: string | null;
  white_label_tenant_id?: string | null;
  updated_at: string;
}

export interface RetentionStreak {
  user_id: string;
  daily_streak: number;
  weekly_streak: number;
  best_daily_streak: number;
  best_weekly_streak: number;
  last_activity_date?: string | null;
  active_week_start?: string | null;
  weekly_workouts: number;
  updated_at: string;
}

export interface RetentionHabitEvent {
  id: string;
  user_id: string;
  event_type: HabitEventType;
  event_date: string;
  amount?: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface RetentionReminder {
  id: string;
  user_id: string;
  reminder_type: ReminderType;
  enabled: boolean;
  channel: ReminderChannel;
  schedule: ReminderSchedule;
  message: string;
  next_run_at?: string | null;
  last_sent_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReminderSchedule {
  daysOfWeek?: number[];
  time?: string;
  everyMinutes?: number;
  inactivityDays?: number;
  timezone?: string;
}

export interface RetentionChallenge {
  id: string;
  user_id: string;
  duration_days: 7 | 14 | 30;
  title: string;
  starts_on: string;
  ends_on: string;
  target_days: number;
  status: ChallengeStatus;
  created_at: string;
  updated_at: string;
  progress?: number;
}

export interface RetentionBadge {
  user_id: string;
  badge_id: string;
  badge_name: string;
  badge_description: string;
  emoji: string;
  category: string;
  source: string;
  unlocked_at: string;
}

export interface OnboardingProgress {
  user_id: string;
  current_step: number;
  total_steps: number;
  payload: Record<string, unknown>;
  completed: boolean;
  completed_at?: string | null;
  updated_at: string;
}

export interface AutomatedCheckin {
  id: string;
  user_id: string;
  message_type: 'daily_checkin' | 'reactivation' | 'coach_followup';
  scheduled_for: string;
  status: 'pending' | 'sent' | 'cancelled';
  subject: string;
  body: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AlternativeWorkout {
  id: string;
  user_id: string;
  title: string;
  duration_minutes: number;
  focus: string;
  intensity: 'low' | 'moderate' | 'high';
  exercises: string[];
  reason: string;
  status: 'suggested' | 'scheduled' | 'completed' | 'dismissed';
  suggested_for: string;
  created_at: string;
}

export interface WorkoutCalendarItem {
  id: string;
  user_id: string;
  event_type: CalendarItemType;
  title: string;
  scheduled_for: string;
  time_of_day?: string | null;
  status: CalendarItemStatus;
  source: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface HealthIntegration {
  user_id: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  data_mode: RetentionDataMode;
  scopes: string[];
  last_sync_at?: string | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WhiteLabelTenant {
  id: string;
  owner_id: string;
  brand_name: string;
  slug: string;
  primary_color: string;
  logo_url?: string | null;
  support_email?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TenantStudent {
  tenant_id: string;
  student_id: string;
  coach_id: string;
  status: 'invited' | 'active' | 'paused' | 'archived';
  assigned_at: string;
}

export interface StudentAssessment {
  id: string;
  tenant_id: string;
  student_id: string;
  coach_id: string;
  assessment_type: 'initial' | 'progress' | 'risk' | 'adherence';
  score?: number | null;
  notes: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface StudentMessage {
  id: string;
  tenant_id: string;
  student_id: string;
  coach_id: string;
  body: string;
  channel: ReminderChannel;
  status: 'queued' | 'sent' | 'failed';
  created_at: string;
}

export interface RetentionMetrics {
  dailyStreak: number;
  weeklyStreak: number;
  bestDailyStreak: number;
  bestWeeklyStreak: number;
  workoutsThisWeek: number;
  checkinsThisWeek: number;
  hydrationTodayMl: number;
  sleepAverageMinutes: number;
  activeChallenges: number;
  completedChallenges: number;
  unlockedBadges: number;
  inactiveDays: number | null;
}

export interface RetentionHubState {
  dataMode: 'supabase';
  profile: RetentionProfile;
  streak: RetentionStreak;
  metrics: RetentionMetrics;
  events: RetentionHabitEvent[];
  reminders: RetentionReminder[];
  challenges: RetentionChallenge[];
  badges: RetentionBadge[];
  onboarding: OnboardingProgress | null;
  automatedCheckins: AutomatedCheckin[];
  alternatives: AlternativeWorkout[];
  calendar: WorkoutCalendarItem[];
  integrations: HealthIntegration[];
  tenants: WhiteLabelTenant[];
  students: TenantStudent[];
  assessments: StudentAssessment[];
  messages: StudentMessage[];
}

export interface QuickWorkoutSuggestionInput {
  durationMinutes: number;
  goal?: string;
  location?: string;
  reason: string;
  date?: string;
  currentPlan?: WorkoutPlan | null;
}

export interface QuickWorkoutPlan {
  title: string;
  durationMinutes: number;
  focus: string;
  intensity: 'low' | 'moderate' | 'high';
  exercises: string[];
  reason: string;
}
