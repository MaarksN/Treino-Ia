export class FetchTimeoutError extends Error {
  timeoutMs: number;

  constructor(timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`);
    this.name = 'FetchTimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

export interface FetchWithTimeoutOptions {
  timeoutMs: number;
  fetchImpl?: typeof fetch;
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: FetchWithTimeoutOptions,
): Promise<Response> {
  const controller = new AbortController();
  const fetchImpl = options.fetchImpl ?? fetch;
  let timedOut = false;

  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, options.timeoutMs);

  const existingSignal = init.signal;
  const abortFromExistingSignal = () => controller.abort(existingSignal?.reason);

  if (existingSignal) {
    if (existingSignal.aborted) {
      abortFromExistingSignal();
    } else {
      existingSignal.addEventListener('abort', abortFromExistingSignal, { once: true });
    }
  }

  try {
    return await fetchImpl(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (timedOut) {
      throw new FetchTimeoutError(options.timeoutMs);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
    existingSignal?.removeEventListener('abort', abortFromExistingSignal);
  }
}
