import { beforeEach, describe, expect, it, vi } from 'vitest';

const requireSupabaseUser = vi.fn();
const getSupabaseAdmin = vi.fn();

vi.mock('../api/_lib/server-supabase', () => ({
  requireSupabaseUser,
  getSupabaseAdmin,
}));

describe('critical API payload limits', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    requireSupabaseUser.mockResolvedValue({ id: 'user-1', email: 'u@test.com' });
  });

  it.each([
    ['background jobs', '../api/jobs/create', '/api/jobs/create', { jobType: 'pdf_export', payload: { padding: 'x'.repeat(61_000) } }],
    ['offline sync', '../api/sync/offline-actions', '/api/sync/offline-actions', { id: 'offline-1', type: 'workout.completed', payload: { padding: 'x'.repeat(121_000) } }],
    ['health sync', '../api/health/sync', '/api/health/sync', { provider: 'apple_health', summary: { padding: 'x'.repeat(81_000) } }],
    ['health OAuth start', '../api/health/oauth/start', '/api/health/oauth/start', { provider: 'strava', redirectTo: '/', padding: 'x'.repeat(8_500) }],
  ])('rejects oversized %s bodies before database writes', async (_name, modulePath, route, body) => {
    const { default: handler } = await import(modulePath);
    const request = new Request(`http://localhost${route}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });

    const response = await handler(request);
    const payload = await response.json();

    expect(response.status).toBe(413);
    expect(payload.error).toBe('Request body is too large');
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
  });
});
