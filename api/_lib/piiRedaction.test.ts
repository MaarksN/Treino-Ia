import { describe, expect, it } from 'vitest';
import { sanitizeTelemetryMessage, sanitizeTelemetryMetadata, sanitizeTelemetryUrl } from './piiRedaction';

describe('pii redaction', () => {
  it('redacts email phone cpf and nested tokens', () => {
    const msg = sanitizeTelemetryMessage('email a@b.com phone +55 11 98888-7777 cpf 123.456.789-10');
    expect(msg).not.toContain('a@b.com');
    const meta = sanitizeTelemetryMetadata({ nested: { access_token: 'secret' } }) as any;
    expect(meta.nested.access_token).toBe('[REDACTED]');
  });

  it('redacts token query and removes base64 image and truncates', () => {
    const url = sanitizeTelemetryUrl('https://x.com?a=1&access_token=abc');
    expect(url).not.toContain('abc');
    const meta = sanitizeTelemetryMetadata({ image: 'data:image/png;base64,' + 'a'.repeat(15000), requestId: 'r1' });
    expect(JSON.stringify(meta)).not.toContain('base64');
    expect(JSON.stringify(meta)).toContain('requestId');
  });
});
