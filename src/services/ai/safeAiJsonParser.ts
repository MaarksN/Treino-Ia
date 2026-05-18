export type TypeGuard<T> = (value: unknown) => value is T;

export type SafeAiJsonResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: 'no_json' | 'invalid_json' | 'invalid_schema'; fallback?: T };

export function safeAiJsonParser<T>(raw: string | undefined, guard: TypeGuard<T>, fallback?: T): SafeAiJsonResult<T> {
  const extracted = extractJson(raw);
  if (!extracted) return { ok: false, reason: 'no_json', fallback };
  try {
    const parsed: unknown = JSON.parse(extracted);
    if (!guard(parsed)) return { ok: false, reason: 'invalid_schema', fallback };
    return { ok: true, data: parsed };
  } catch {
    return { ok: false, reason: 'invalid_json', fallback };
  }
}

function extractJson(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  const trimmed = raw.trim();
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) return trimmed.slice(firstBrace, lastBrace + 1);
  const firstBracket = trimmed.indexOf('[');
  const lastBracket = trimmed.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) return trimmed.slice(firstBracket, lastBracket + 1);
  return null;
}
