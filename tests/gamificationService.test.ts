import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fetchGamificationState,
  recordGamificationEvent,
} from '../src/services/gamificationService';
import { supabase } from '../src/services/supabaseClient';

vi.mock('../src/services/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

describe('gamificationService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          access_token: 'supabase-token',
        },
      },
      error: null,
    } as Awaited<ReturnType<typeof supabase.auth.getSession>>);
  });

  it('carrega estado de gamificação pelo backend autenticado', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        profile: {
          user_id: 'user-1',
          xp: 0,
          level: 1,
          coins: 0,
          login_streak: 0,
          last_login_at: null,
          last_checkin_at: null,
          active_title: 'Iniciante Consistente',
          season_xp: 0,
          season_level: 1,
          elite_pass_active: false,
        },
        events: [],
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const state = await fetchGamificationState();

    expect(fetchMock).toHaveBeenCalledWith('/api/gamification/state', {
      headers: {
        authorization: 'Bearer supabase-token',
      },
    });
    expect(state.profile.level).toBe(1);
  });

  it('registra check-in sem escrever localStorage', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        profile: {
          user_id: 'user-1',
          xp: 80,
          level: 1,
          coins: 20,
          login_streak: 0,
          last_login_at: null,
          last_checkin_at: '2026-05-10T12:00:00.000Z',
          active_title: 'Iniciante Consistente',
          season_xp: 80,
          season_level: 1,
          elite_pass_active: false,
        },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await recordGamificationEvent('checkin');

    expect(fetchMock).toHaveBeenCalledWith('/api/gamification/event', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        authorization: 'Bearer supabase-token',
        'content-type': 'application/json',
      }),
      body: JSON.stringify({ eventType: 'checkin' }),
    }));
    expect(result.profile?.xp).toBe(80);
  });
});

