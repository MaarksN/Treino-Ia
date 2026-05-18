export interface RedactionOptions {
  maxDepth?: number;
  maxArrayItems?: number;
  maxObjectKeys?: number;
  maxStringLength?: number;
  maxSerializedBytes?: number;
}

const DEFAULT_OPTIONS: Required<RedactionOptions> = {
  maxDepth: 5,
  maxArrayItems: 25,
  maxObjectKeys: 50,
  maxStringLength: 2_000,
  maxSerializedBytes: 12_000,
};

const REDACTED = '[REDACTED]';
const REDACTED_EMAIL = '[REDACTED_EMAIL]';
const REDACTED_CPF = '[REDACTED_CPF]';
const REDACTED_PHONE = '[REDACTED_PHONE]';
const REDACTED_IMAGE = '[REDACTED_IMAGE_DATA]';

const SENSITIVE_KEY_PARTS = [
  'authorization',
  'password',
  'accesstoken',
  'refreshtoken',
  'apikey',
  'token',
  'email',
  'cpf',
  'phone',
];

function normalizeKey(key: string): string {
  return key.replace(/[-_\s]/g, '').toLowerCase();
}

function isSensitiveKey(key: string): boolean {
  const normalized = normalizeKey(key);
  return SENSITIVE_KEY_PARTS.some(part => normalized.includes(part));
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

export function redactSensitiveString(value: string, maxLength = DEFAULT_OPTIONS.maxStringLength): string {
  const redacted = value
    .replace(/data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=\s]+/gi, REDACTED_IMAGE)
    .replace(/(authorization\s*[:=]\s*bearer\s+)[^\s,;"']+/gi, `$1${REDACTED}`)
    .replace(/([?&](?:token|access_token|refresh_token|apiKey|password|email|cpf|phone|authorization)=)[^&#\s]+/gi, `$1${REDACTED}`)
    .replace(/"((?:access_)?token|refresh_token|apiKey|authorization|password|email|cpf|phone)"\s*:\s*"[^"]*"/gi, (_, key: string) => `"${key}":"${REDACTED}"`)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, REDACTED_EMAIL)
    .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, REDACTED_CPF)
    .replace(/\b(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?\d{4,5}-?\d{4}\b/g, REDACTED_PHONE);

  if (redacted.length <= maxLength) return redacted;

  return `${redacted.slice(0, maxLength)}...[TRUNCATED]`;
}

export function redactSensitiveData(value: unknown, options: RedactionOptions = {}, depth = 0): unknown {
  const resolved = { ...DEFAULT_OPTIONS, ...options };

  if (typeof value === 'string') {
    return redactSensitiveString(value, resolved.maxStringLength);
  }

  if (
    value === null ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'undefined'
  ) {
    return value;
  }

  if (depth >= resolved.maxDepth) {
    return '[MAX_DEPTH]';
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, resolved.maxArrayItems)
      .map(item => redactSensitiveData(item, resolved, depth + 1));
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).slice(0, resolved.maxObjectKeys);
    const output: Record<string, unknown> = {};

    for (const [key, entryValue] of entries) {
      output[key] = isSensitiveKey(key)
        ? REDACTED
        : redactSensitiveData(entryValue, resolved, depth + 1);
    }

    return output;
  }

  return REDACTED;
}

export function redactMetadata(
  metadata: unknown,
  options: RedactionOptions = {},
): Record<string, unknown> {
  const resolved = { ...DEFAULT_OPTIONS, ...options };
  const redacted = redactSensitiveData(metadata && typeof metadata === 'object' ? metadata : {}, resolved);
  const safeObject = redacted && typeof redacted === 'object' && !Array.isArray(redacted)
    ? redacted as Record<string, unknown>
    : {};
  const serialized = JSON.stringify(safeObject);

  if (byteLength(serialized) <= resolved.maxSerializedBytes) {
    return safeObject;
  }

  return {
    truncated: true,
    preview: redactSensitiveString(serialized, Math.min(resolved.maxStringLength, 1_000)),
  };
}
