import { redactMetadata, redactSensitiveString } from './redact';

export function sanitizeTelemetryMessage(input: string): string {
  return redactSensitiveString(input, 1000);
}

export function sanitizeTelemetryUrl(url: string): string {
  return redactSensitiveString(url, 1000);
}

export function sanitizeTelemetryMetadata(metadata: unknown): Record<string, unknown> {
  return redactMetadata(metadata, { maxSerializedBytes: 8000, maxStringLength: 1000 });
}
