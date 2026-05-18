import { describe, expect, it } from 'vitest';
import { redactMetadata, redactSensitiveString } from './redact';

describe('redact helpers', () => {
  it('redacts Authorization bearer values', () => {
    expect(redactSensitiveString('Authorization: Bearer secret-token')).toBe('Authorization: Bearer [REDACTED]');
  });

  it('redacts token fields in metadata', () => {
    const redacted = redactMetadata({
      nested: {
        access_token: 'secret',
      },
      ok: true,
    });

    expect(redacted).toEqual({
      nested: {
        access_token: '[REDACTED]',
      },
      ok: true,
    });
  });

  it('redacts emails in strings and fields', () => {
    expect(redactSensitiveString('user@example.com failed')).toBe('[REDACTED_EMAIL] failed');
    expect(redactMetadata({ email: 'user@example.com' })).toEqual({ email: '[REDACTED]' });
  });

  it('redacts base64 image payloads and truncates oversized metadata', () => {
    const redacted = redactMetadata({
      image: 'data:image/png;base64,a'.padEnd(15_000, 'a'),
      notes: 'x'.repeat(15_000),
    }, {
      maxSerializedBytes: 50,
      maxStringLength: 100,
    });

    expect(redacted.truncated).toBe(true);
    expect(String(redacted.preview)).toContain('[REDACTED_IMAGE_DATA]');
    expect(String(redacted.preview).length).toBeLessThanOrEqual(114);
  });
});
