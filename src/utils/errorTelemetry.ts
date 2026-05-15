import { getErrorMessage, toError } from './errors';

export interface ErrorTelemetryEvent {
  id: string;
  message: string;
  stack?: string;
  source: string;
  userAgent: string;
  url: string;
  createdAt: number;
  metadata?: Record<string, unknown>;
}

const ERROR_KEY = '@TreinoApp:errorTelemetry';
let installed = false;

export function loadErrorTelemetry(): ErrorTelemetryEvent[] {
  try {
    return JSON.parse(localStorage.getItem(ERROR_KEY) || '[]') as ErrorTelemetryEvent[];
  } catch {
    return [];
  }
}

export function saveErrorTelemetry(events: ErrorTelemetryEvent[]): void {
  localStorage.setItem(ERROR_KEY, JSON.stringify(events.slice(-100)));
}

export function captureError(
  error: unknown,
  source = 'app',
  metadata?: Record<string, unknown>,
): ErrorTelemetryEvent {
  const normalizedError = toError(error);
  const event: ErrorTelemetryEvent = {
    id: crypto.randomUUID(),
    message: getErrorMessage(normalizedError),
    stack: normalizedError.stack,
    source,
    userAgent: navigator.userAgent,
    url: window.location.href,
    createdAt: Date.now(),
    metadata,
  };

  const events = loadErrorTelemetry();
  saveErrorTelemetry([...events, event]);

  return event;
}

export function installGlobalErrorTelemetry(): void {
  if (installed) return;
  installed = true;

  window.addEventListener('error', event => {
    captureError(event.error ?? event.message, 'window.error', {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', event => {
    captureError(event.reason, 'window.unhandledrejection');
  });
}

export async function flushErrorTelemetry(endpoint = '/api/telemetry/errors'): Promise<void> {
  const events = loadErrorTelemetry();

  if (!events.length) return;

  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const { supabase } = await import('../services/supabaseClient');
    const { data } = await supabase.auth.getSession();

    if (data.session?.access_token) {
      headers = {
        ...headers,
        Authorization: `Bearer ${data.session.access_token}`,
      };
    }
  } catch {
    // Telemetry can still be flushed anonymously.
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ events }),
  });

  if (response.ok) {
    saveErrorTelemetry([]);
  }
}
