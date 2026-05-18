import { AiTaskType } from './aiGateway.types';
import { getAiModelPolicy } from './aiModelPolicy';

export interface AiPromptRegistryItem {
  taskType: AiTaskType;
  promptVersion: string;
  promptTag: string;
}

export const AI_PROMPT_REGISTRY: Record<AiTaskType, AiPromptRegistryItem> = {
  training_plan: { taskType: 'training_plan', promptVersion: getAiModelPolicy('training_plan').promptVersion, promptTag: 'plan_generation' },
  nutrition_analysis: { taskType: 'nutrition_analysis', promptVersion: getAiModelPolicy('nutrition_analysis').promptVersion, promptTag: 'nutrition_analysis' },
  personalization: { taskType: 'personalization', promptVersion: getAiModelPolicy('personalization').promptVersion, promptTag: 'personalization' },
  equipment_replan: { taskType: 'equipment_replan', promptVersion: getAiModelPolicy('equipment_replan').promptVersion, promptTag: 'equipment_replan' },
  meal_scan: { taskType: 'meal_scan', promptVersion: getAiModelPolicy('meal_scan').promptVersion, promptTag: 'meal_scan' },
  generic: { taskType: 'generic', promptVersion: getAiModelPolicy('generic').promptVersion, promptTag: 'generic' },
};

export function getPromptRegistry(taskType: AiTaskType): AiPromptRegistryItem {
  return AI_PROMPT_REGISTRY[taskType];
}
