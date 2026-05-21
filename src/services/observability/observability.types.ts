export type ObservabilitySeverity = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type ObservabilitySource = 'frontend' | 'api' | 'worker' | 'unknown';

export type ObservabilityEvent = {
  name: string;
  severity: ObservabilitySeverity;
  requestId?: string;
  correlationId?: string;
  route?: string;
  source: ObservabilitySource;
  metadata?: Record<string, unknown>;
  occurredAt: string;
};

export type ObservabilitySink = {
  captureEvent(event: ObservabilityEvent): Promise<void>;
  captureError(error: unknown, context?: Partial<ObservabilityEvent>): Promise<void>;
};
