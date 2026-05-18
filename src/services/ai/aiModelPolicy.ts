import { AiTaskType, AiBudgetTier } from './aiGateway.types';

export interface AiModelPolicyItem {
  model: string;
  promptVersion: string;
  budgetTier: AiBudgetTier;
  allowMultimodal: boolean;
  temperature?: number;
  fallbackModel?: string;
}

export const AI_MODEL_POLICIES: Record<AiTaskType, AiModelPolicyItem> = {
  training_plan: { model: 'gemini-2.5-pro', promptVersion: 'training-plan-v1', budgetTier: 'high', allowMultimodal: false, temperature: 0.4, fallbackModel: 'gemini-2.5-flash' },
  nutrition_analysis: { model: 'gemini-2.5-flash', promptVersion: 'nutrition-analysis-v1', budgetTier: 'medium', allowMultimodal: true, temperature: 0.3, fallbackModel: 'gemini-2.5-pro' },
  personalization: { model: 'gemini-2.5-pro', promptVersion: 'personalization-v1', budgetTier: 'high', allowMultimodal: false, temperature: 0.3 },
  equipment_replan: { model: 'gemini-2.5-flash', promptVersion: 'equipment-replan-v1', budgetTier: 'medium', allowMultimodal: false, temperature: 0.3 },
  meal_scan: { model: 'gemini-2.5-pro', promptVersion: 'meal-scan-v1', budgetTier: 'high', allowMultimodal: true, temperature: 0.2 },
  generic: { model: 'gemini-2.5-flash', promptVersion: 'generic-v1', budgetTier: 'low', allowMultimodal: false, temperature: 0.2 },
};

export function getAiModelPolicy(taskType: AiTaskType): AiModelPolicyItem {
  return AI_MODEL_POLICIES[taskType];
}
