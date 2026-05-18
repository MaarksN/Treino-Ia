import { describe, expect, it, vi } from 'vitest';
import { retryWithBackoff, shouldRetryGeminiStatus } from './retryPolicy';

describe('retryPolicy', () => {
  it('retries transient 5xx responses', async () => {
    const operation = vi.fn()
      .mockResolvedValueOnce(new Response('{}', { status: 503 }))
      .mockResolvedValueOnce(new Response('{"ok":true}', { status: 200 }));

    const response = await retryWithBackoff<Response>(operation, {
      maxRetries: 2,
      baseDelayMs: 1,
      shouldRetryResult: result => shouldRetryGeminiStatus(result.status),
      sleep: async () => undefined,
    });

    expect(operation).toHaveBeenCalledTimes(2);
    expect(response.status).toBe(200);
  });

  it.each([400, 401, 403, 429])('does not retry %s responses', async status => {
    const operation = vi.fn().mockResolvedValue(new Response('{}', { status }));

    const response = await retryWithBackoff<Response>(operation, {
      maxRetries: 2,
      baseDelayMs: 1,
      shouldRetryResult: result => shouldRetryGeminiStatus(result.status),
      sleep: async () => undefined,
    });

    expect(operation).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(status);
  });
});
