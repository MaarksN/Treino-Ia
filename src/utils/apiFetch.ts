const CORRELATION_ID_HEADER = 'X-Correlation-ID';

export function createCorrelationId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `cid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

export function withCorrelationHeaders(headers?: HeadersInit): Headers {
  const nextHeaders = new Headers(headers);

  if (!nextHeaders.has(CORRELATION_ID_HEADER)) {
    nextHeaders.set(CORRELATION_ID_HEADER, createCorrelationId());
  }

  return nextHeaders;
}

export function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  return fetch(input, {
    ...init,
    headers: withCorrelationHeaders(init.headers),
  });
}

export function readCorrelationId(response: Response): string | null {
  return response.headers.get(CORRELATION_ID_HEADER);
}
