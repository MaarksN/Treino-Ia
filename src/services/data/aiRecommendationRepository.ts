import type { TrainingPlan } from '../database';
import { getCurrentUserId, isSupabaseConfigured, supabase } from '../supabaseClient';

export type AiRecommendationStatus = 'pending' | 'accepted' | 'rejected' | 'dismissed' | 'applied';

export interface PlanRecommendationPayload {
  currentPlan: TrainingPlan;
  proposedPlan: TrainingPlan;
  source: 'workout_completion';
}

export interface AiRecommendationRecord {
  id: string;
  userId: string | null;
  recommendationType: 'plan_revision';
  status: AiRecommendationStatus;
  payload: PlanRecommendationPayload;
  reason: string;
  legacySourceSessionId?: string;
  createdAt: string;
  reviewedAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  dismissedAt?: string;
  appliedAt?: string;
  decisionReason?: string;
}

const LOCAL_KEY = '@TreinoIA:aiRecommendations';

function createLocalId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `ai_rec_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function readLocal(): AiRecommendationRecord[] {
  if (typeof window === 'undefined') return [];

  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_KEY) || '[]') as AiRecommendationRecord[];
  } catch {
    return [];
  }
}

function writeLocal(records: AiRecommendationRecord[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(records.slice(0, 50)));
}

async function getOptionalUserId(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  try {
    return await getCurrentUserId();
  } catch {
    return null;
  }
}

function mapRow(row: Record<string, unknown>): AiRecommendationRecord {
  const payload = row.payload_json as PlanRecommendationPayload;

  return {
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : null,
    recommendationType: 'plan_revision',
    status: String(row.status) as AiRecommendationStatus,
    payload,
    reason: row.reason ? String(row.reason) : '',
    legacySourceSessionId: row.legacy_source_session_id
      ? String(row.legacy_source_session_id)
      : undefined,
    createdAt: String(row.created_at),
    reviewedAt: row.reviewed_at ? String(row.reviewed_at) : undefined,
    acceptedAt: row.accepted_at ? String(row.accepted_at) : undefined,
    rejectedAt: row.rejected_at ? String(row.rejected_at) : undefined,
    dismissedAt: row.dismissed_at ? String(row.dismissed_at) : undefined,
    appliedAt: row.applied_at ? String(row.applied_at) : undefined,
    decisionReason: row.decision_reason ? String(row.decision_reason) : undefined,
  };
}

function replaceLocal(record: AiRecommendationRecord): AiRecommendationRecord {
  const current = readLocal();
  const next = [record, ...current.filter((item) => item.id !== record.id)];
  writeLocal(next);
  return record;
}

type ReviewedDecisionStatus = Extract<AiRecommendationStatus, 'rejected' | 'dismissed'>;
type ReviewedDecisionField = 'rejectedAt' | 'dismissedAt';

function getReviewedDecisionRecord(
  record: AiRecommendationRecord,
  status: ReviewedDecisionStatus,
  reviewedField: ReviewedDecisionField,
  now: string,
  decisionReason: string,
): AiRecommendationRecord {
  return {
    ...record,
    status,
    reviewedAt: now,
    [reviewedField]: now,
    decisionReason,
  };
}

async function updateReviewedDecision(
  record: AiRecommendationRecord,
  userId: string,
  status: ReviewedDecisionStatus,
  now: string,
  decisionReason: string,
): Promise<AiRecommendationRecord> {
  const updatePayload =
    status === 'rejected'
      ? {
          status,
          reviewed_at: now,
          rejected_at: now,
          decided_by: userId,
          decision_reason: decisionReason,
        }
      : {
          status,
          reviewed_at: now,
          dismissed_at: now,
          decided_by: userId,
          decision_reason: decisionReason,
        };

  const { data, error } = await supabase
    .from('ai_recommendations')
    .update(updatePayload)
    .eq('id', record.id)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) throw error;
  return mapRow(data as Record<string, unknown>);
}

export const aiRecommendationRepository = {
  async createPendingPlanRecommendation(input: {
    currentPlan: TrainingPlan;
    proposedPlan: TrainingPlan;
    reason: string;
    legacySourceSessionId: string;
  }): Promise<AiRecommendationRecord> {
    const userId = await getOptionalUserId();
    const now = new Date().toISOString();
    const payload: PlanRecommendationPayload = {
      currentPlan: input.currentPlan,
      proposedPlan: input.proposedPlan,
      source: 'workout_completion',
    };

    if (!userId) {
      return replaceLocal({
        id: createLocalId(),
        userId: null,
        recommendationType: 'plan_revision',
        status: 'pending',
        payload,
        reason: input.reason,
        legacySourceSessionId: input.legacySourceSessionId,
        createdAt: now,
      });
    }

    const { data, error } = await supabase
      .from('ai_recommendations')
      .insert({
        user_id: userId,
        recommendation_type: 'plan_revision',
        status: 'pending',
        payload_json: payload,
        reason: input.reason,
        legacy_source_session_id: input.legacySourceSessionId,
        plan_before_json: input.currentPlan,
        plan_after_json: input.proposedPlan,
      })
      .select('*')
      .single();

    if (error) throw error;
    return mapRow(data as Record<string, unknown>);
  },

  async getLatestPendingPlanRecommendation(): Promise<AiRecommendationRecord | null> {
    const userId = await getOptionalUserId();

    if (!userId) {
      return (
        readLocal()
          .filter(
            (item) => item.recommendationType === 'plan_revision' && item.status === 'pending',
          )
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0] ?? null
      );
    }

    const { data, error } = await supabase
      .from('ai_recommendations')
      .select('*')
      .eq('user_id', userId)
      .eq('recommendation_type', 'plan_revision')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data ? mapRow(data as Record<string, unknown>) : null;
  },

  async markApplied(
    record: AiRecommendationRecord,
    appliedPlan: TrainingPlan,
  ): Promise<AiRecommendationRecord> {
    const userId = await getOptionalUserId();
    const now = new Date().toISOString();
    const next: AiRecommendationRecord = {
      ...record,
      status: 'applied',
      reviewedAt: now,
      acceptedAt: now,
      appliedAt: now,
      payload: {
        ...record.payload,
        proposedPlan: appliedPlan,
      },
    };

    if (!userId) {
      return replaceLocal(next);
    }

    const { data, error } = await supabase
      .from('ai_recommendations')
      .update({
        status: 'applied',
        reviewed_at: now,
        accepted_at: now,
        applied_at: now,
        decided_by: userId,
        plan_after_json: appliedPlan,
      })
      .eq('id', record.id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;

    await supabase.from('plan_revisions').insert({
      user_id: userId,
      plan_id: appliedPlan.id,
      source_recommendation_id: record.id,
      status: 'applied',
      revision_json: appliedPlan,
      applied_at: now,
    });

    return mapRow(data as Record<string, unknown>);
  },

  async reject(
    record: AiRecommendationRecord,
    decisionReason = 'user_rejected',
  ): Promise<AiRecommendationRecord> {
    const userId = await getOptionalUserId();
    const now = new Date().toISOString();
    const next = getReviewedDecisionRecord(record, 'rejected', 'rejectedAt', now, decisionReason);

    if (!userId) {
      return replaceLocal(next);
    }

    return updateReviewedDecision(record, userId, 'rejected', now, decisionReason);
  },

  async dismiss(
    record: AiRecommendationRecord,
    decisionReason = 'kept_current_plan',
  ): Promise<AiRecommendationRecord> {
    const userId = await getOptionalUserId();
    const now = new Date().toISOString();
    const next = getReviewedDecisionRecord(record, 'dismissed', 'dismissedAt', now, decisionReason);

    if (!userId) {
      return replaceLocal(next);
    }

    return updateReviewedDecision(record, userId, 'dismissed', now, decisionReason);
  },
};
