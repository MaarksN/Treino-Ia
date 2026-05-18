import { FetchTimeoutError } from './fetchWithTimeout';

export interface RetryWithBackoffOptions<T> {
  maxRetries: number;
  baseDelayMs: number;
  shouldRetryResult?: (result: T) => boolean;
  shouldRetryError?: (error: unknown) => boolean;
  sleep?: (delayMs: number) => Promise<void>;
}

function defaultSleep(delayMs: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, delayMs);
  });
}

export function getBackoffDelayMs(attempt: number, baseDelayMs: number): number {
  return baseDelayMs * (2 ** attempt);
}

export function shouldRetryGeminiStatus(status: number): boolean {
  return status >= 500;
}

export function isTransientFetchError(error: unknown): boolean {
  if (error instanceof FetchTimeoutError) return true;
  if (error instanceof DOMException && error.name === 'AbortError') return true;
  if (error instanceof TypeError) return true;

  return false;
}

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryWithBackoffOptions<T>,
): Promise<T> {
  const sleep = options.sleep ?? defaultSleep;

  for (let attempt = 0; attempt <= options.maxRetries; attempt += 1) {
    try {
      const result = await operation();

      if (
        attempt < options.maxRetries &&
        options.shouldRetryResult?.(result)
      ) {
        await sleep(getBackoffDelayMs(attempt, options.baseDelayMs));
        continue;
      }

      return result;
    } catch (error) {
      if (
        attempt >= options.maxRetries ||
        !options.shouldRetryError?.(error)
      ) {
        throw error;
      }

      await sleep(getBackoffDelayMs(attempt, options.baseDelayMs));
    }
  }

  return operation();
}
