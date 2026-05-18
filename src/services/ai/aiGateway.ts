import { createGeminiProxyClient } from '../geminiProxyClient';
import { getAiBudgetPolicy } from './aiBudgetPolicy';
import { getAiModelPolicy } from './aiModelPolicy';
import { safeAiJsonParser, TypeGuard } from './safeAiJsonParser';
import { AiGatewayResult, AiRequestConfig } from './aiGateway.types';

export async function runAiTask<T>(prompt: string, config: AiRequestConfig, guard: TypeGuard<T>, fallback?: T): Promise<AiGatewayResult<T>> {
  const modelPolicy = getAiModelPolicy(config.taskType);
  const budgetPolicy = getAiBudgetPolicy(config.taskType);
  const meta = {
    taskType: config.taskType,
    model: modelPolicy.model,
    promptVersion: config.promptVersion || modelPolicy.promptVersion,
    usedFallback: false,
    retries: config.maxRetries ?? budgetPolicy.maxRetries,
    budgetTier: config.budgetTier ?? modelPolicy.budgetTier,
  } as const;

  try {
    const response = await createGeminiProxyClient().models.generateContent({
      model: modelPolicy.model,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = safeAiJsonParser(response.text, guard, fallback);
    if (parsed.ok) return { ok: true, data: parsed.data, meta };
    if (fallback !== undefined) {
      return { ok: false, error: { code: parsed.reason, message: 'Resposta IA inválida.', retryable: parsed.reason !== 'invalid_schema' }, fallback, meta: { ...meta, usedFallback: true } };
    }

    return { ok: false, error: { code: parsed.reason, message: 'Resposta IA inválida.', retryable: parsed.reason !== 'invalid_schema' }, meta };
  } catch {
    if (fallback !== undefined) {
      return { ok: false, error: { code: 'provider_error', message: 'Falha no provedor de IA.', retryable: true }, fallback, meta: { ...meta, usedFallback: true } };
    }
    return { ok: false, error: { code: 'provider_error', message: 'Falha no provedor de IA.', retryable: true }, meta };
  }
}
