import { describe, expect, it } from 'vitest';
import { isWeeklyVolumeRecommendation, safeParseAiJson } from './aiResponseValidation';

describe('aiResponseValidation', () => {
  it('aceita JSON válido da IA quando o contrato bate', () => {
    const result = safeParseAiJson(
      JSON.stringify({
        muscleGroups: [{ group: 'Peito', weeklySets: 12, reason: 'Volume moderado.' }],
        summary: 'Volume semanal validado.',
      }),
      isWeeklyVolumeRecommendation
    );

    expect(result.ok).toBe(true);
    expect(result.reason).toBe('valid');
  });

  it('recusa JSON inválido e sinaliza fallback', () => {
    const result = safeParseAiJson('{ muscleGroups: [}', isWeeklyVolumeRecommendation);

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('invalid_json');
  });

  it('recusa resposta sem JSON e sinaliza fallback', () => {
    const result = safeParseAiJson('Use 10 a 12 séries por semana.', isWeeklyVolumeRecommendation);

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('no_json');
  });
});
