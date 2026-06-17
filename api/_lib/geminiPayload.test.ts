import { describe, expect, it } from 'vitest';
import { validateAndSerializeGeminiPayload } from './geminiPayload';

describe('geminiPayload', () => {
  it('keeps only supported Gemini proxy fields in a stable serialized payload', () => {
    const result = validateAndSerializeGeminiPayload(
      JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Monte um treino curto.' }] }],
        generationConfig: { responseMimeType: 'application/json' },
        apiKey: 'must-not-pass-through',
      }),
      { maxBytes: 120_000 },
    );

    expect(result.cacheable).toBe(true);
    expect(JSON.parse(result.bodyText)).toEqual({
      contents: [{ role: 'user', parts: [{ text: 'Monte um treino curto.' }] }],
      generationConfig: { responseMimeType: 'application/json' },
    });
    expect(result.bodyText).not.toContain('must-not-pass-through');
  });

  it('allows small inline image data but marks it as non-cacheable', () => {
    const result = validateAndSerializeGeminiPayload(
      JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: 'Analise a imagem.' },
              { inlineData: { data: 'YWJjZA==', mimeType: 'image/png' } },
            ],
          },
        ],
      }),
      { maxBytes: 120_000 },
    );

    expect(result.cacheable).toBe(false);
    expect(result.hasBinaryParts).toBe(true);
  });

  it('rejects unsupported parts before the provider call', () => {
    expect(() =>
      validateAndSerializeGeminiPayload(
        JSON.stringify({
          contents: [{ role: 'user', parts: [{ fileData: { uri: 'gs://private' } }] }],
        }),
        { maxBytes: 120_000 },
      ),
    ).toThrow('Parte Gemini não suportada pelo proxy.');
  });

  it('rejects oversized text parts', () => {
    expect(() =>
      validateAndSerializeGeminiPayload(
        JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'x'.repeat(40_000) }] }],
        }),
        { maxBytes: 120_000 },
      ),
    ).toThrow('Parte de texto do Gemini acima do limite permitido.');
  });
});
