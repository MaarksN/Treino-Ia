import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fetchGamificationState, recordGamificationEvent } from './gamificationService';

// Mock the network calls
global.fetch = vi.fn();

vi.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'fake-token' } },
        error: null,
      }),
    },
  },
  isSupabaseConfigured: true,
}));

describe('gamificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches gamification state successfully', async () => {
    const mockResponse = {
      profile: { xp: 100, level: 1, coins: 50 },
      events: [],
      missions: [],
      cosmetics: [],
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const state = await fetchGamificationState();
    expect(state.profile.xp).toBe(100);
    expect(global.fetch).toHaveBeenCalledWith('/api/gamification/state', expect.any(Object));
  });

  it('records an event successfully', async () => {
    const mockResponse = {
      profile: { xp: 150, coins: 60 },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await recordGamificationEvent('mission_completed' as any);
    expect(result.profile?.xp).toBe(150);
    expect(global.fetch).toHaveBeenCalledWith('/api/gamification/event', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ eventType: 'mission_completed' as any }),
    }));
  });

  it('handles API errors correctly', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Insufficient funds' }),
    });

    await expect(recordGamificationEvent('item_purchased' as any)).rejects.toThrow('Insufficient funds');
  });
});
