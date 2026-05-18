import { AiTaskType } from './aiGateway.types';

export interface AiBudgetPolicyItem {
  timeoutMs: number;
  maxRetries: number;
  allowCache: boolean;
  allowMultimodal: boolean;
  recommendedFallback: 'local' | 'cached' | 'none';
}

export const AI_BUDGET_POLICY: Record<AiTaskType, AiBudgetPolicyItem> = {
  training_plan: { timeoutMs: 30_000, maxRetries: 1, allowCache: false, allowMultimodal: false, recommendedFallback: 'local' },
  nutrition_analysis: { timeoutMs: 20_000, maxRetries: 1, allowCache: true, allowMultimodal: true, recommendedFallback: 'cached' },
  personalization: { timeoutMs: 20_000, maxRetries: 1, allowCache: false, allowMultimodal: false, recommendedFallback: 'local' },
  equipment_replan: { timeoutMs: 20_000, maxRetries: 1, allowCache: false, allowMultimodal: false, recommendedFallback: 'local' },
  meal_scan: { timeoutMs: 30_000, maxRetries: 0, allowCache: false, allowMultimodal: true, recommendedFallback: 'none' },
  generic: { timeoutMs: 15_000, maxRetries: 0, allowCache: false, allowMultimodal: false, recommendedFallback: 'none' },
};

export function getAiBudgetPolicy(taskType: AiTaskType): AiBudgetPolicyItem {
  return AI_BUDGET_POLICY[taskType];
}
