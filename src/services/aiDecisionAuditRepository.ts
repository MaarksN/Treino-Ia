import { AiDecisionAudit } from '../types/aiPersonalization';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export interface AiDecisionAuditRepository {
  persist(audit: AiDecisionAudit): Promise<void>;
  flush(): Promise<void>;
  pendingCount(): number;
}

const pendingAudits: AiDecisionAudit[] = [];

async function getAuthenticatedUserId(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id) return null;
  return data.user.id;
}

function toInsertPayload(audit: AiDecisionAudit, userId: string) {
  return {
    user_id: userId,
    feature: audit.feature,
    used_ai: audit.usedAi,
    used_deterministic_fallback: audit.usedDeterministicFallback,
    deterministic_flags: audit.deterministicFlags,
    validation_status: audit.validationStatus,
    reason: audit.reason,
    created_at: audit.createdAt,
  };
}

async function persistNow(audit: AiDecisionAudit): Promise<boolean> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return false;

  const { error } = await supabase
    .from('ai_decision_audits')
    .insert(toInsertPayload(audit, userId));

  if (error) return false;
  return true;
}

export const aiDecisionAuditRepository: AiDecisionAuditRepository = {
  async persist(audit) {
    const persisted = await persistNow(audit);
    if (!persisted) {
      pendingAudits.push(audit);
      if (pendingAudits.length > 250) pendingAudits.shift();
    }
  },

  async flush() {
    if (!pendingAudits.length) return;

    const nextQueue: AiDecisionAudit[] = [];
    for (const audit of pendingAudits) {
      const persisted = await persistNow(audit);
      if (!persisted) nextQueue.push(audit);
    }

    pendingAudits.splice(0, pendingAudits.length, ...nextQueue.slice(-250));
  },

  pendingCount() {
    return pendingAudits.length;
  },
};
