import { redactObservabilityEvent } from './observabilityRedaction';
import type { ObservabilityEvent, ObservabilitySink, ObservabilitySource } from './observability.types';

type InMemoryObservabilitySinkOptions = {
  maxEvents?: number;
};

const DEFAULT_MAX_EVENTS = 100;

function normalizeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return { value: error };
}

function buildErrorEvent(error: unknown, context: Partial<ObservabilityEvent>): ObservabilityEvent {
  const source: ObservabilitySource = context.source ?? 'unknown';

  return {
    name: context.name ?? 'error.captured',
    severity: context.severity ?? 'error',
    requestId: context.requestId,
    correlationId: context.correlationId,
    route: context.route,
    source,
    metadata: {
      ...context.metadata,
      error: normalizeError(error),
    },
    occurredAt: context.occurredAt ?? new Date().toISOString(),
  };
}

export class InMemoryObservabilitySink implements ObservabilitySink {
  private readonly maxEvents: number;
  private events: ObservabilityEvent[] = [];
  private droppedEvents = 0;

  constructor(options: InMemoryObservabilitySinkOptions = {}) {
    this.maxEvents = Math.max(0, options.maxEvents ?? DEFAULT_MAX_EVENTS);
  }

  async captureEvent(event: ObservabilityEvent): Promise<void> {
    try {
      if (this.maxEvents === 0) {
        this.droppedEvents += 1;
        return;
      }

      const redactedEvent = redactObservabilityEvent(event);
      this.events = [...this.events, redactedEvent].slice(-this.maxEvents);
    } catch {
      this.droppedEvents += 1;
    }
  }

  async captureError(error: unknown, context: Partial<ObservabilityEvent> = {}): Promise<void> {
    await this.captureEvent(buildErrorEvent(error, context));
  }

  getEvents(): ObservabilityEvent[] {
    return [...this.events];
  }

  getDroppedEventCount(): number {
    return this.droppedEvents;
  }

  clear(): void {
    this.events = [];
    this.droppedEvents = 0;
  }
}

export const defaultObservabilitySink = new InMemoryObservabilitySink();
