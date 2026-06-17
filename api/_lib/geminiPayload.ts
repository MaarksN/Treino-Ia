import { HttpError } from './http';

export interface GeminiTextPart {
  text: string;
}

export interface GeminiInlineDataPart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

export type GeminiPart = GeminiTextPart | GeminiInlineDataPart;

export interface GeminiContent {
  role?: 'user' | 'model';
  parts: GeminiPart[];
}

export interface GeminiProxyPayload {
  contents: GeminiContent[];
  generationConfig?: Record<string, unknown>;
  systemInstruction?: unknown;
}

export interface GeminiPayloadValidationResult {
  bodyText: string;
  cacheable: boolean;
  contentCount: number;
  byteLength: number;
  hasBinaryParts: boolean;
}

interface GeminiPayloadOptions {
  maxBytes: number;
}

const MAX_CONTENTS = 16;
const MAX_PARTS_PER_CONTENT = 16;
const MAX_TEXT_PART_BYTES = 32_000;
const MAX_INLINE_DATA_BYTES = 96_000;
const BASE64_PATTERN = /^[a-zA-Z0-9+/=_-]+$/;
const ALLOWED_INLINE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function byteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, 'Payload Gemini deve ser um objeto JSON.');
  }

  return value as Record<string, unknown>;
}

function sanitizeTextPart(value: unknown): GeminiTextPart | null {
  const record = asRecord(value);
  const text = record.text;
  if (typeof text !== 'string') return null;

  if (!text.trim()) {
    throw new HttpError(400, 'Partes de texto do Gemini não podem ser vazias.');
  }

  if (byteLength(text) > MAX_TEXT_PART_BYTES) {
    throw new HttpError(413, 'Parte de texto do Gemini acima do limite permitido.');
  }

  return { text };
}

function sanitizeInlineDataPart(value: unknown): GeminiInlineDataPart | null {
  const record = asRecord(value);
  const inlineData = record.inlineData;
  if (!inlineData || typeof inlineData !== 'object' || Array.isArray(inlineData)) return null;

  const data = (inlineData as Record<string, unknown>).data;
  const mimeType = (inlineData as Record<string, unknown>).mimeType;

  if (typeof data !== 'string' || typeof mimeType !== 'string') {
    throw new HttpError(400, 'inlineData do Gemini deve conter data e mimeType.');
  }

  if (!ALLOWED_INLINE_MIME_TYPES.has(mimeType)) {
    throw new HttpError(400, 'MIME type de inlineData não permitido para Gemini proxy.');
  }

  if (!BASE64_PATTERN.test(data) || byteLength(data) > MAX_INLINE_DATA_BYTES) {
    throw new HttpError(413, 'inlineData do Gemini acima do limite permitido.');
  }

  return { inlineData: { data, mimeType } };
}

function sanitizePart(value: unknown): { part: GeminiPart; hasBinaryPart: boolean } {
  const textPart = sanitizeTextPart(value);
  if (textPart) return { part: textPart, hasBinaryPart: false };

  const inlineDataPart = sanitizeInlineDataPart(value);
  if (inlineDataPart) return { part: inlineDataPart, hasBinaryPart: true };

  throw new HttpError(400, 'Parte Gemini não suportada pelo proxy.');
}

function sanitizeContent(value: unknown): { content: GeminiContent; hasBinaryPart: boolean } {
  const record = asRecord(value);
  const role = record.role;

  if (role !== undefined && role !== 'user' && role !== 'model') {
    throw new HttpError(400, 'Role Gemini inválido.');
  }

  if (!Array.isArray(record.parts) || record.parts.length === 0) {
    throw new HttpError(400, 'Cada conteúdo Gemini deve conter parts.');
  }

  if (record.parts.length > MAX_PARTS_PER_CONTENT) {
    throw new HttpError(413, 'Conteúdo Gemini com parts demais.');
  }

  let hasBinaryPart = false;
  const parts = record.parts.map((part) => {
    const sanitized = sanitizePart(part);
    hasBinaryPart ||= sanitized.hasBinaryPart;
    return sanitized.part;
  });

  return {
    content: role ? { role, parts } : { parts },
    hasBinaryPart,
  };
}

function sanitizeOptionalObject(
  value: unknown,
  label: string,
): Record<string, unknown> | undefined {
  if (value === undefined) return undefined;
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, `${label} deve ser um objeto JSON.`);
  }

  return value as Record<string, unknown>;
}

export function validateAndSerializeGeminiPayload(
  rawBody: string,
  options: GeminiPayloadOptions,
): GeminiPayloadValidationResult {
  if (!rawBody || rawBody.trim().length === 0) {
    throw new HttpError(400, 'Payload vazio para Gemini proxy.');
  }

  const requestBytes = byteLength(rawBody);
  if (requestBytes > options.maxBytes) {
    throw new HttpError(413, 'Payload acima do limite permitido para Gemini proxy.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    throw new HttpError(400, 'Payload JSON inválido para Gemini proxy.');
  }

  const record = asRecord(parsed);
  if (!Array.isArray(record.contents) || record.contents.length === 0) {
    throw new HttpError(400, 'Payload Gemini deve conter "contents" com ao menos um item.');
  }

  if (record.contents.length > MAX_CONTENTS) {
    throw new HttpError(413, 'Payload Gemini contém contents demais.');
  }

  let hasBinaryParts = false;
  const contents = record.contents.map((content) => {
    const sanitized = sanitizeContent(content);
    hasBinaryParts ||= sanitized.hasBinaryPart;
    return sanitized.content;
  });

  const payload: GeminiProxyPayload = {
    contents,
  };
  const systemInstruction = sanitizeOptionalObject(record.systemInstruction, 'systemInstruction');
  const generationConfig = sanitizeOptionalObject(record.generationConfig, 'generationConfig');

  if (systemInstruction) payload.systemInstruction = systemInstruction;
  if (generationConfig) payload.generationConfig = generationConfig;

  return {
    bodyText: JSON.stringify(payload),
    cacheable: !hasBinaryParts,
    contentCount: contents.length,
    byteLength: requestBytes,
    hasBinaryParts,
  };
}
