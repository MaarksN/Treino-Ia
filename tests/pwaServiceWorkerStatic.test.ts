import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const serviceWorkerSource = readFileSync('public/sw.js', 'utf8');
const offlineFallbackSource = readFileSync('public/offline.html', 'utf8').toLowerCase();

function extractFunctionSource(functionName: string): string {
  const signatureStart = serviceWorkerSource.indexOf(`function ${functionName}`);
  const asyncSignatureStart = serviceWorkerSource.indexOf(`async function ${functionName}`);
  const start = signatureStart >= 0 ? signatureStart : asyncSignatureStart;

  if (start < 0) {
    throw new Error(`Function ${functionName} not found`);
  }

  const bodyStart = serviceWorkerSource.indexOf('{', start);
  let depth = 0;

  for (let index = bodyStart; index < serviceWorkerSource.length; index += 1) {
    const char = serviceWorkerSource[index];

    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;

    if (depth === 0) {
      return serviceWorkerSource.slice(start, index + 1);
    }
  }

  throw new Error(`Function ${functionName} body not closed`);
}

describe('PWA service worker static cache safety', () => {
  it('routes /api and Authorization requests through the bypass policy', () => {
    const bypassSource = extractFunctionSource('shouldBypassCache');

    expect(serviceWorkerSource).toContain('event.respondWith(networkOnly(request, url))');
    expect(bypassSource).toContain('hasAuthorizationHeader(request)');
    expect(bypassSource).toContain("url.pathname.startsWith('/api/')");
  });

  it('keeps the network-only path from writing to CacheStorage', () => {
    const networkOnlySource = extractFunctionSource('networkOnly');

    expect(networkOnlySource).toContain('return await fetch(request)');
    expect(networkOnlySource).not.toContain('caches.open');
    expect(networkOnlySource).not.toContain('cache.put');
  });

  it('returns a no-store 503 fallback for offline same-origin API requests', () => {
    const networkOnlySource = extractFunctionSource('networkOnly');

    expect(networkOnlySource).toContain("url.pathname.startsWith('/api/')");
    expect(networkOnlySource).toContain('status: 503');
    expect(networkOnlySource).toContain("'cache-control': 'no-store'");
    expect(networkOnlySource).toContain("error: 'Network unavailable'");
  });

  it('keeps the offline fallback free of sensitive payload markers', () => {
    expect(offlineFallbackSource).not.toContain('authorization');
    expect(offlineFallbackSource).not.toContain('bearer');
    expect(offlineFallbackSource).not.toContain('token');
    expect(offlineFallbackSource).not.toContain('password');
    expect(offlineFallbackSource).not.toContain('cpf');
    expect(offlineFallbackSource).not.toContain('session');
    expect(offlineFallbackSource).not.toContain('user@example');
  });
});
