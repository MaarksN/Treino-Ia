import { redactMetadata, redactSensitiveData, redactSensitiveString } from '../../../api/_lib/redact';
import type { ObservabilityEvent } from './observability.types';

const OBSERVABILITY_STRING_MAX_LENGTH = 1_000;
const OBSERVABILITY_METADATA_OPTIONS = {
  maxDepth: 5,
  maxArrayItems: 25,
  maxObjectKeys: 50,
  maxStringLength: OBSERVABILITY_STRING_MAX_LENGTH,
  maxSerializedBytes: 8_000,
};

export function redactObservabilityString(value: string): string {
  return redactSensitiveString(value, OBSERVABILITY_STRING_MAX_LENGTH);
}

export function redactObservabilityUrl(value: string): string {
  return redactObservabilityString(value);
}

export function redactObservabilityMetadata(metadata: unknown): Record<string, unknown> {
  return redactMetadata(metadata, OBSERVABILITY_METADATA_OPTIONS);
}

export function redactObservabilityValue<T>(value: T): T {
  return redactSensitiveData(value, OBSERVABILITY_METADATA_OPTIONS) as T;
}

export function redactObservabilityEvent(event: ObservabilityEvent): ObservabilityEvent {
  return {
    ...event,
    name: redactObservabilityString(event.name),
    requestId: event.requestId,
    correlationId: event.correlationId,
    route: event.route ? redactObservabilityUrl(event.route) : undefined,
    metadata: redactObservabilityMetadata(event.metadata),
  };
}
