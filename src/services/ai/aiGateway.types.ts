export type AiTaskType =
  | 'training_plan'
  | 'nutrition_analysis'
  | 'personalization'
  | 'equipment_replan'
  | 'meal_scan'
  | 'generic';

export type AiBudgetTier = 'low' | 'medium' | 'high';

export interface AiRequestConfig {
  taskType: AiTaskType;
  promptVersion: string;
  modelPolicy: string;
  timeoutMs?: number;
  maxRetries?: number;
  budgetTier?: AiBudgetTier;
}

export type AiGatewayErrorCode =
  | 'provider_error'
  | 'timeout'
  | 'invalid_json'
  | 'invalid_schema'
  | 'no_json'
  | 'unknown';

export interface AiGatewayError {
  code: AiGatewayErrorCode;
  message: string;
  retryable: boolean;
}

export interface AiGatewayMeta {
  taskType: AiTaskType;
  model: string;
  promptVersion: string;
  usedFallback: boolean;
  retries: number;
  budgetTier: AiBudgetTier;
}

export type AiGatewayResult<T> =
  | { ok: true; data: T; meta: AiGatewayMeta }
  | { ok: false; error: AiGatewayError; fallback?: T; meta: AiGatewayMeta };
