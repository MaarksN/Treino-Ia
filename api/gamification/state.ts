import { handleApiError, json } from '../_lib/http';
import { getSupabaseAdmin, requireSupabaseUser } from '../_lib/server-supabase';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return json({ ok: true });
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  try {
    const user = await requireSupabaseUser(request);
    const supabase = getSupabaseAdmin();

    const { data: profile, error: profileError } = await supabase
      .from('gamification_profiles')
      .upsert({ user_id: user.id }, { onConflict: 'user_id' })
      .select('*')
      .single();

    if (profileError) {
      throw new Error(`Failed to load gamification profile: ${profileError.message}`);
    }

    const { data: events, error: eventsError } = await supabase
      .from('gamification_ledger')
      .select('id,event_type,source_id,xp_delta,coin_delta,metadata,created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (eventsError) {
      throw new Error(`Failed to load gamification ledger: ${eventsError.message}`);
    }

    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      return json({
        profile,
        events: events ?? [],
        missions: [],
        cosmetics: [],
        season: null,
        clan: null,
        avatar: { archetype: 'rookie', equippedTitle: profile.active_title },
      });
    }

    const mockMissions = [
      { id: 'm1', type: 'daily', title: 'Treino de hoje', description: 'Complete 1 treino', metric: 'workouts', target: 1, progress: 0, xpReward: 50, coinReward: 10, status: 'active', expiresAt: Date.now() + 86400000, createdAt: Date.now() },
      { id: 'm2', type: 'weekly', title: 'Atleta Consistente', description: 'Faça 4 treinos na semana', metric: 'workouts', target: 4, progress: 1, xpReward: 200, coinReward: 50, status: 'active', expiresAt: Date.now() + 86400000 * 7, createdAt: Date.now() },
      { id: 'm3', type: 'boss', title: 'Chefão Mensal', description: 'Volume total de 10.000kg', metric: 'volume', target: 10000, progress: 1500, xpReward: 500, coinReward: 200, status: 'active', expiresAt: Date.now() + 86400000 * 30, createdAt: Date.now() },
    ];

    const mockCosmetics = [
      { id: 'c1', type: 'title', name: 'Aprendiz', description: 'Iniciando a jornada.', emoji: '🌱', rarity: 'common', price: 0, unlocked: true, equipped: profile.active_title === 'Aprendiz' },
      { id: 'c2', type: 'title', name: 'Monstro', description: 'Ninguém segura.', emoji: '🦍', rarity: 'epic', price: 50, unlocked: false },
      { id: 'c3', type: 'avatar_skin', name: 'Guerreiro de Aço', description: 'A armadura brilha.', emoji: '🛡️', rarity: 'rare', price: 300, unlocked: false },
    ];

    const mockSeason = {
      id: 'season_1',
      name: 'Temporada Beta',
      theme: 'Origens',
      startsAt: Date.now() - 86400000 * 10,
      endsAt: Date.now() + 86400000 * 20,
      seasonXp: profile.season_xp,
      seasonLevel: profile.season_level,
      eliteActive: profile.elite_pass_active,
      rewards: [
        { level: 1, freeReward: { label: '50 Moedas', coins: 50 }, eliteReward: { label: 'Título VIP', cosmeticId: 'c2' }, claimedFree: false, claimedElite: false },
        { level: 2, freeReward: { label: 'Skin Básica', cosmeticId: 'c3' }, eliteReward: { label: '100 Moedas', coins: 100 }, claimedFree: false, claimedElite: false },
      ]
    };

    const mockClan = {
      id: 'clan_1',
      name: 'Levantadores do Sul',
      tag: 'LDS',
      memberCount: 12,
      weeklyXp: 4500,
      bossDamage: 85000,
    };

    const mockAvatar = {
      archetype: 'warrior',
      equippedTitle: profile.active_title,
    };

    return json({
      profile,
      events: events ?? [],
      missions: mockMissions,
      cosmetics: mockCosmetics,
      season: mockSeason,
      clan: mockClan,
      avatar: mockAvatar,
      dataMode: 'mock_dev_only',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
