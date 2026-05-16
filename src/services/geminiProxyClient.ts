import { Schema } from '../types/geminiSchema';
import { supabase } from './supabaseClient';

interface GeminiGenerateContentRequest {
  model: string;
  contents: unknown;
  config?: {
    responseMimeType?: string;
    responseSchema?: Schema;
    systemInstruction?: string | Record<string, unknown>;
  };
}

interface GeminiApiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

function normalizeContents(contents: unknown): unknown {
  if (typeof contents === 'string') {
    return [{ role: 'user', parts: [{ text: contents }] }];
  }

  if (Array.isArray(contents)) {
    const alreadyFormatted = contents.some(item => {
      return Boolean(
        item &&
        typeof item === 'object' &&
        ('role' in item || 'parts' in item)
      );
    });

    if (alreadyFormatted) return contents;

    return [
      {
        role: 'user',
        parts: contents.map(item => typeof item === 'string' ? { text: item } : item),
      },
    ];
  }

  return contents;
}

function normalizeSystemInstruction(systemInstruction?: string | Record<string, unknown>) {
  if (!systemInstruction) return undefined;

  if (typeof systemInstruction === 'string') {
    return {
      parts: [{ text: systemInstruction }],
    };
  }

  return systemInstruction;
}

export async function generateGeminiContent(request: GeminiGenerateContentRequest): Promise<{ text: string }> {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session?.access_token) {
    throw new Error('Faça login para usar recursos de IA.');
  }

  const response = await fetch('/api/gemini-proxy', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${data.session.access_token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      contents: normalizeContents(request.contents),
      systemInstruction: normalizeSystemInstruction(request.config?.systemInstruction),
      generationConfig: request.config
        ? {
            responseMimeType: request.config.responseMimeType,
            responseSchema: request.config.responseSchema,
          }
        : undefined,
    }),
  });

  const bodyText = await response.text();

  if (!response.ok) {
    try {
      const body = JSON.parse(bodyText) as { error?: string };
      throw new Error(body.error || 'Falha ao chamar proxy Gemini.');
    } catch (parseError) {
      if (parseError instanceof Error && parseError.message !== 'Unexpected end of JSON input') {
        throw parseError;
      }
      throw new Error(bodyText || 'Falha ao chamar proxy Gemini.');
    }
  }

  const parsed = JSON.parse(bodyText) as GeminiApiResponse;
  const text = parsed.candidates?.[0]?.content?.parts
    ?.map(part => part.text ?? '')
    .join('')
    .trim();

  if (!text) {
    throw new Error('Gemini não retornou texto utilizável.');
  }

  return { text };
}

export function createGeminiProxyClient() {
  return {
    models: {
      generateContent: generateGeminiContent,
    },
  };
}

