import { describe, expect, it, vi } from 'vitest';
import { FetchTimeoutError, fetchWithTimeout } from './fetchWithTimeout';

describe('fetchWithTimeout', () => {
  it('aborts when timeout is reached', async () => {
    const fetchImpl = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => {
        reject(new DOMException('Aborted', 'AbortError'));
      });
    }));

    await expect(fetchWithTimeout('https://example.com', {}, {
      timeoutMs: 1,
      fetchImpl,
    })).rejects.toBeInstanceOf(FetchTimeoutError);
  });
});
