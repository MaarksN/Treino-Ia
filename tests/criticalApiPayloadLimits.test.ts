import { beforeEach, describe, expect, it, vi } from 'vitest';

const requireSupabaseUser = vi.fn();
const getSupabaseAdmin = vi.fn();

vi.mock('../api/_lib/server-supabase', () => ({
  requireSupabaseUser,
  getSupabaseAdmin,
}));

describe('critical API payload limits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('queues supported background jobs with a sanitized payload object', async () => {
    const job = { id: 'job-1', job_type: 'pdf_export', status: 'queued', created_at: '2026-05-31T00:00:00Z' };
    const single = vi.fn().mockResolvedValue({ data: job, error: null });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    const from = vi.fn(() => ({ insert }));
    getSupabaseAdmin.mockReturnValue({ from });

    const { default: handler } = await import('../api/jobs/create');
    const response = await handler(new Request('http://localhost/api/jobs/create', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jobType: 'pdf_export', payload: { format: 'pdf' } }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(202);
    expect(payload).toEqual({ ok: true, job });
    expect(from).toHaveBeenCalledWith('background_jobs');
    expect(insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      job_type: 'pdf_export',
      payload: { format: 'pdf' },
    });
    expect(select).toHaveBeenCalledWith('id, job_type, status, created_at');
  });

  it('persists offline actions idempotently for the authenticated user', async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn(() => ({ upsert }));
    getSupabaseAdmin.mockReturnValue({ from });

    const { default: handler } = await import('../api/sync/offline-actions');
    const response = await handler(new Request('http://localhost/api/sync/offline-actions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-idempotency-key': 'offline-123',
      },
      body: JSON.stringify({
        id: 'offline-123',
        type: 'workout.completed',
        payload: { workoutId: 'workout-1' },
        createdAt: 1_700_000_000_000,
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true, synced: true, actionId: 'offline-123' });
    expect(from).toHaveBeenCalledWith('offline_sync_actions');
    expect(upsert).toHaveBeenCalledWith({
      user_id: 'user-1',
      client_action_id: 'offline-123',
      action_type: 'workout.completed',
      payload: {
        workoutId: 'workout-1',
        clientCreatedAt: '2023-11-14T22:13:20.000Z',
      },
      processed_at: expect.any(String),
    }, { onConflict: 'user_id,client_action_id' });
  });

  it('records native health sync jobs and integration status', async () => {
    const job = {
      id: 'sync-1',
      provider: 'apple_health',
      status: 'completed',
      summary: { dataMode: 'native', steps: 1200 },
    };
    const jobSingle = vi.fn().mockResolvedValue({ data: job, error: null });
    const jobSelect = vi.fn(() => ({ single: jobSingle }));
    const jobInsert = vi.fn(() => ({ select: jobSelect }));
    const integrationUpsert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn((table: string) => {
      if (table === 'health_sync_jobs') return { insert: jobInsert };
      if (table === 'health_integrations') return { upsert: integrationUpsert };
      throw new Error(`Unexpected table: ${table}`);
    });
    getSupabaseAdmin.mockReturnValue({ from });

    const { default: handler } = await import('../api/health/sync');
    const response = await handler(new Request('http://localhost/api/health/sync', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        provider: 'apple_health',
        summary: { steps: 1200 },
        scopes: ['steps'],
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true, dataMode: 'native', job });
    expect(from).toHaveBeenCalledWith('health_sync_jobs');
    expect(from).toHaveBeenCalledWith('health_integrations');
    expect(from).not.toHaveBeenCalledWith('health_integration_tokens');
    expect(jobInsert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'user-1',
      provider: 'apple_health',
      status: 'completed',
      requested_by: 'user',
      summary: { dataMode: 'native', steps: 1200 },
    }));
    expect(integrationUpsert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'user-1',
      provider: 'apple_health',
      status: 'connected',
      data_mode: 'native',
      scopes: ['steps'],
      error_message: null,
    }), { onConflict: 'user_id,provider' });
  });
});
