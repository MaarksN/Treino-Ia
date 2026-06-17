import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

interface VercelHeader {
  key: string;
  value: string;
}

interface VercelConfig {
  headers?: Array<{
    source: string;
    headers: VercelHeader[];
  }>;
}

function loadCspHeader() {
  const config = JSON.parse(readFileSync('vercel.json', 'utf8')) as VercelConfig;
  const globalHeaders = config.headers?.find((entry) => entry.source === '/(.*)')?.headers ?? [];

  return globalHeaders.find((header) => header.key === 'Content-Security-Policy')?.value ?? '';
}

function loadGlobalHeaders() {
  const config = JSON.parse(readFileSync('vercel.json', 'utf8')) as VercelConfig;
  const globalHeaders = config.headers?.find((entry) => entry.source === '/(.*)')?.headers ?? [];

  return new Map(globalHeaders.map((header) => [header.key, header.value]));
}

function getDirective(csp: string, name: string): string[] {
  const directive = csp
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name} `));

  return directive ? directive.split(/\s+/).slice(1) : [];
}

describe('CSP headers', () => {
  it('keeps script-src free from unsafe inline/eval while allowing required script providers', () => {
    const scriptSrc = getDirective(loadCspHeader(), 'script-src');

    expect(scriptSrc).toContain("'self'");
    expect(scriptSrc).toContain('https://html2canvas.hertzen.com');
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
  });

  it('keeps explicit allowlists for app integrations and hardening directives', () => {
    const csp = loadCspHeader();

    expect(getDirective(csp, 'connect-src')).toEqual(
      expect.arrayContaining([
        "'self'",
        'https://*.supabase.co',
        'https://generativelanguage.googleapis.com',
        'https://api.stripe.com',
      ]),
    );
    expect(getDirective(csp, 'frame-src')).toEqual(
      expect.arrayContaining([
        'https://js.stripe.com',
        'https://checkout.stripe.com',
        'https://www.youtube.com',
        'https://www.youtube-nocookie.com',
        'https://open.spotify.com',
        'https://w.soundcloud.com',
      ]),
    );
    expect(getDirective(csp, 'object-src')).toEqual(["'none'"]);
    expect(getDirective(csp, 'base-uri')).toEqual(["'self'"]);
    expect(getDirective(csp, 'form-action')).toEqual(["'self'"]);
    expect(getDirective(csp, 'frame-ancestors')).toEqual(["'none'"]);
    expect(getDirective(csp, 'worker-src')).toEqual(["'self'", 'blob:']);
    expect(getDirective(csp, 'media-src')).toEqual(["'self'", 'blob:']);
  });

  it('keeps deployment security headers enabled', () => {
    const headers = loadGlobalHeaders();

    expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headers.get('X-Frame-Options')).toBe('DENY');
    expect(headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(headers.get('Strict-Transport-Security')).toContain('includeSubDomains');
    expect(headers.get('Permissions-Policy')).toContain('payment=()');
  });
});
