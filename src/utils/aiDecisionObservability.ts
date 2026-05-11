import { AiDecisionAudit } from '../types/aiPersonalization';

export interface AiFallbackQualityMetrics {
  totalDecisions: number;
  aiSuccesses: number;
  deterministicFallbacks: number;
  fallbackRate: number;
  invalidResponseRate: number;
  blockedRate: number;
  byFeature: Record<string, {
    total: number;
    fallbackRate: number;
    lastValidationStatus: AiDecisionAudit['validationStatus'];
    lastReason: string;
  }>;
}

export function summarizeAiDecisionQuality(audits: AiDecisionAudit[]): AiFallbackQualityMetrics {
  const totalDecisions = audits.length;
  const aiSuccesses = audits.filter(audit => audit.usedAi && audit.validationStatus === 'valid').length;
  const deterministicFallbacks = audits.filter(audit => audit.usedDeterministicFallback).length;
  const invalidResponses = audits.filter(audit =>
    audit.validationStatus === 'invalid_json'
    || audit.validationStatus === 'invalid_schema'
    || audit.validationStatus === 'no_json'
  ).length;
  const blocked = audits.filter(audit => audit.validationStatus === 'blocked').length;
  const featureDraft: Record<string, {
    total: number;
    fallbackCount: number;
    lastValidationStatus: AiDecisionAudit['validationStatus'];
    lastReason: string;
  }> = {};

  for (const audit of audits) {
    const current = featureDraft[audit.feature] || {
      total: 0,
      fallbackCount: 0,
      lastValidationStatus: audit.validationStatus,
      lastReason: audit.reason,
    };

    current.total += 1;
    current.fallbackCount += audit.usedDeterministicFallback ? 1 : 0;
    current.lastValidationStatus = audit.validationStatus;
    current.lastReason = audit.reason;
    featureDraft[audit.feature] = current;
  }

  const byFeature: AiFallbackQualityMetrics['byFeature'] = {};
  Object.entries(featureDraft).forEach(([feature, value]) => {
    byFeature[feature] = {
      total: value.total,
      fallbackRate: value.total ? value.fallbackCount / value.total : 0,
      lastValidationStatus: value.lastValidationStatus,
      lastReason: value.lastReason,
    };
  });

  return {
    totalDecisions,
    aiSuccesses,
    deterministicFallbacks,
    fallbackRate: totalDecisions ? deterministicFallbacks / totalDecisions : 0,
    invalidResponseRate: totalDecisions ? invalidResponses / totalDecisions : 0,
    blockedRate: totalDecisions ? blocked / totalDecisions : 0,
    byFeature,
  };
}
