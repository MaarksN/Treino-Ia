import { describe, expect, it } from 'vitest';
import {
  redactObservabilityEvent,
  redactObservabilityMetadata,
  redactObservabilityString,
} from './observabilityRedaction';

describe('observabilityRedaction', () => {
  it('redacts authorization and OAuth tokens', () => {
    const redacted = redactObservabilityMetadata({
      authorization: 'Bearer secret',
      access_token: 'access-secret',
      refresh_token: 'refresh-secret',
      nested: {
        apiKey: 'api-key-secret',
      },
    });

    expect(redacted.authorization).toBe('[REDACTED]');
    expect(redacted.access_token).toBe('[REDACTED]');
    expect(redacted.refresh_token).toBe('[REDACTED]');
    expect((redacted.nested as Record<string, unknown>).apiKey).toBe('[REDACTED]');
    expect(redactObservabilityString('Authorization: Bearer abc123')).toBe(
      'Authorization: Bearer [REDACTED]',
    );
  });

  it('redacts email phone cpf and OAuth query fields', () => {
    const value = 'user@example.com +55 11 98888-7777 cpf 123.456.789-10 ?code=abc&state=xyz';

    const redacted = redactObservabilityString(value);

    expect(redacted).toContain('[REDACTED_EMAIL]');
    expect(redacted).toContain('[REDACTED_PHONE]');
    expect(redacted).toContain('[REDACTED_CPF]');
    expect(redacted).toContain('code=[REDACTED]');
    expect(redacted).toContain('state=[REDACTED]');
  });

  it('redacts image base64 and prompt payloads', () => {
    const redacted = redactObservabilityMetadata({
      image: 'data:image/png;base64,'.padEnd(2_000, 'a'),
      photoBase64: 'raw-base64-payload',
      prompt: 'sensitive health prompt',
      safe: 'ok',
    });

    expect(redacted.image).toBe('[REDACTED]');
    expect(redacted.photoBase64).toBe('[REDACTED]');
    expect(redacted.prompt).toBe('[REDACTED]');
    expect(redacted.safe).toBe('ok');
  });

  it('preserves request and correlation ids while redacting metadata', () => {
    const redacted = redactObservabilityEvent({
      name: 'api.5xx',
      severity: 'error',
      requestId: 'req-123',
      correlationId: 'corr-456',
      route: '/api/health/oauth/callback?code=secret',
      source: 'api',
      metadata: {
        requestId: 'req-123',
        correlationId: 'corr-456',
        email: 'user@example.com',
      },
      occurredAt: '2026-05-21T00:00:00.000Z',
    });

    expect(redacted.requestId).toBe('req-123');
    expect(redacted.correlationId).toBe('corr-456');
    expect(redacted.route).toContain('code=[REDACTED]');
    expect(redacted.metadata?.requestId).toBe('req-123');
    expect(redacted.metadata?.correlationId).toBe('corr-456');
    expect(redacted.metadata?.email).toBe('[REDACTED]');
  });

  it('truncates oversized metadata without breaking valid payloads', () => {
    const redacted = redactObservabilityMetadata({
      requestId: 'req-789',
      details: Array.from({ length: 25 }, () => 'x'.repeat(1_000)),
    });

    expect(redacted.truncated).toBe(true);
    expect(String(redacted.preview)).toContain('req-789');
    expect(String(redacted.preview).length).toBeLessThan(1_100);
  });
});
