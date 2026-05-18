import { describe, expect, it, vi } from 'vitest';
import { handleApiError, readJsonObject } from './http';

describe('http helpers', () => {
  it('returns a generic 500 without leaking internal messages', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const response = handleApiError(new Error('database password=secret failed'));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('Internal server error');
    expect(body.requestId).toEqual(expect.any(String));
    expect(JSON.stringify(body)).not.toContain('secret');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('limits JSON body size while preserving object format', async () => {
    const request = new Request('https://treino.example/api/test', {
      method: 'POST',
      body: JSON.stringify({ ok: true }),
    });

    await expect(readJsonObject(request, { maxBytes: 4 })).rejects.toMatchObject({
      status: 413,
    });
  });
});
