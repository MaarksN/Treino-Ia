import { describe, expect, it } from 'vitest';
import { getServiceWorkerCacheStrategy } from './cachePolicy';

const APP_ORIGIN = 'https://treino.example';

describe('service worker cache policy', () => {
  it('does not cache /api/user', () => {
    expect(getServiceWorkerCacheStrategy({ url: '/api/user' }, APP_ORIGIN)).toBe('network-only');
  });

  it('does not cache /api/gamification/event', () => {
    expect(getServiceWorkerCacheStrategy({ url: '/api/gamification/event' }, APP_ORIGIN)).toBe('network-only');
  });

  it('allows static assets to use cache-first', () => {
    expect(getServiceWorkerCacheStrategy({ url: '/assets/app.js' }, APP_ORIGIN)).toBe('cache-first');
  });

  it('keeps index.html on the app-shell cache policy', () => {
    expect(getServiceWorkerCacheStrategy({ url: '/index.html' }, APP_ORIGIN)).toBe('cache-first');
  });

  it('never caches requests with Authorization', () => {
    expect(getServiceWorkerCacheStrategy({
      url: '/assets/app.js',
      headers: {
        Authorization: 'Bearer test-token',
      },
    }, APP_ORIGIN)).toBe('network-only');
  });
});
