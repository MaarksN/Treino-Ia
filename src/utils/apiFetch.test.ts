import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiFetch, readCorrelationId, withCorrelationHeaders } from './apiFetch';

describe('apiFetch correlation headers', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('adds a correlation id without replacing caller headers', () => {
    const headers = withCorrelationHeaders({ authorization: 'Bearer token' });

    expect(headers.get('authorization')).toBe('Bearer token');
    expect(headers.get('x-correlation-id')).toEqual(expect.any(String));
  });

  it('preserves an existing correlation id', () => {
    const headers = withCorrelationHeaders({ 'X-Correlation-ID': 'billing:test-1234' });

    expect(headers.get('x-correlation-id')).toBe('billing:test-1234');
  });

  it('uses correlated headers for fetch calls', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}'));
    vi.stubGlobal('fetch', fetchMock);

    await apiFetch('/api/example', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(init.headers);

    expect(headers.get('content-type')).toBe('application/json');
    expect(headers.get('x-correlation-id')).toEqual(expect.any(String));
  });

  it('reads correlation ids from API responses', () => {
    const response = new Response('{}', {
      headers: { 'x-correlation-id': 'sync:test-1234' },
    });

    expect(readCorrelationId(response)).toBe('sync:test-1234');
  });
});
