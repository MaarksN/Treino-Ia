import {
  type TrainingPlan,
  type UserProfile,
  type WorkoutSession,
} from './database/database.types';

export interface TrainingProfileRow {
  profile_json?: Partial<UserProfile> | null;
}

export interface TrainingPlanRow {
  plan_json?: TrainingPlan | null;
}

export interface TrainingHistoryRow {
  record_json?: WorkoutSession | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

export function buildTrainingProfileUpsert(userId: string, profile: UserProfile) {
  return {
    user_id: userId,
    profile_json: profile,
    profile_goal: profile.goal,
    profile_name: profile.name,
  };
}

export function readTrainingProfileJson(row: TrainingProfileRow | null | undefined): Partial<UserProfile> | null {
  return isRecord(row?.profile_json) ? row.profile_json : null;
}

export function buildTrainingPlanUpsert(userId: string, plan: TrainingPlan) {
  return {
    user_id: userId,
    id: plan.id,
    plan_name: plan.planName,
    goal_description: plan.goalDescription,
    created_at_ms: plan.createdAt,
    is_current: true,
    plan_json: plan,
  };
}

export function readTrainingPlanJson(row: TrainingPlanRow | null | undefined): TrainingPlan | null {
  const plan = row?.plan_json;
  if (!isRecord(plan) || !Array.isArray(plan.days)) return null;
  return plan as TrainingPlan;
}

export function buildWorkoutHistoryUpsert(userId: string, session: WorkoutSession) {
  return {
    user_id: userId,
    id: session.id,
    workout_date: new Date(session.completedAt).toISOString(),
    plan_id: session.planId,
    day_id: session.dayId,
    day_name: session.dayName,
    focus: session.focus,
    volume_load: session.totalVolume,
    duration_minutes: session.durationMinutes,
    record_json: session,
  };
}

export function readWorkoutSessionJson(row: TrainingHistoryRow | null | undefined): WorkoutSession | null {
  const session = row?.record_json;
  if (!isRecord(session) || typeof session.id !== 'string') return null;
  return session as WorkoutSession;
}
