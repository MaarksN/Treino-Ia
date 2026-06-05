import { afterEach, describe, expect, it, vi } from 'vitest';
import { InMemoryObservabilitySink } from './observabilitySink';

describe('observabilitySink', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('captures redacted events in memory only', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const sink = new InMemoryObservabilitySink();

    await sink.captureEvent({
      name: 'frontend.unhandled_error',
      severity: 'error',
      requestId: 'req-1',
      correlationId: 'corr-1',
      route: '/dashboard?access_token=secret',
      source: 'frontend',
      metadata: {
        access_token: 'secret',
        email: 'user@example.com',
      },
      occurredAt: '2026-05-21T00:00:00.000Z',
    });

    const [event] = sink.getEvents();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(event.requestId).toBe('req-1');
    expect(event.correlationId).toBe('corr-1');
    expect(event.route).toContain('access_token=[REDACTED]');
    expect(event.metadata?.access_token).toBe('[REDACTED]');
    expect(event.metadata?.email).toBe('[REDACTED]');
  });

  it('captures errors without throwing and redacts sensitive error details', async () => {
    const sink = new InMemoryObservabilitySink();

    await expect(
      sink.captureError(new Error('Authorization: Bearer secret for user@example.com'), {
        name: 'api.5xx',
        severity: 'fatal',
        source: 'api',
        metadata: {
          prompt: 'sensitive prompt',
        },
      }),
    ).resolves.toBeUndefined();

    const [event] = sink.getEvents();
    const serialized = JSON.stringify(event);
    expect(event.name).toBe('api.5xx');
    expect(event.severity).toBe('fatal');
    expect(serialized).not.toContain('secret');
    expect(serialized).not.toContain('user@example.com');
    expect(event.metadata?.prompt).toBe('[REDACTED]');
  });

  it('tracks dropped events without reporting them as captured', async () => {
    const sink = new InMemoryObservabilitySink({ maxEvents: 0 });

    await sink.captureEvent({
      name: 'telemetry.rejected',
      severity: 'warn',
      source: 'api',
      metadata: {},
      occurredAt: '2026-05-21T00:00:00.000Z',
    });

    expect(sink.getEvents()).toEqual([]);
    expect(sink.getDroppedEventCount()).toBe(1);
  });
});
