import { supabase } from './supabaseClient';

export interface ServerGamificationProfile {
  user_id: string;
  xp: number;
  level: number;
  coins: number;
  login_streak: number;
  last_login_at: string | null;
  last_checkin_at: string | null;
  active_title: string;
  season_xp: number;
  season_level: number;
  elite_pass_active: boolean;
}

export interface ServerGamificationEvent {
  id: string;
  event_type: string;
  source_id: string | null;
  xp_delta: number;
  coin_delta: number;
  metadata: Record<string, unknown>;
  created_at: string;
}


export interface GamificationMission {
  id: string;
  type: 'daily' | 'weekly' | 'flash' | 'boss' | 'weekend';
  title: string;
  description: string;
  metric: string;
  target: number;
  progress: number;
  xpReward: number;
  coinReward: number;
  status: 'active' | 'completed' | 'claimed' | 'expired';
  expiresAt: number;
  createdAt: number;
}

export interface CosmeticItem {
  id: string;
  type: 'avatar_skin' | 'frame' | 'badge' | 'title' | 'effect';
  name: string;
  description: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  price: number;
  unlocked: boolean;
  equipped?: boolean;
}

export interface SeasonReward {
  level: number;
  freeReward?: { label: string; xp?: number; coins?: number; cosmeticId?: string; };
  eliteReward?: { label: string; xp?: number; coins?: number; cosmeticId?: string; };
  claimedFree?: boolean;
  claimedElite?: boolean;
}

export interface SeasonPassState {
  id: string;
  name: string;
  theme: string;
  startsAt: number;
  endsAt: number;
  seasonXp: number;
  seasonLevel: number;
  eliteActive: boolean;
  rewards: SeasonReward[];
}

export interface AvatarState {
  archetype: string;
  equippedTitle?: string;
  equippedSkin?: string;
  equippedFrame?: string;
  equippedBadge?: string;
  equippedEffect?: string;
}

export interface ClanState {
  id: string;
  name: string;
  tag: string;
  memberCount: number;
  weeklyXp: number;
  bossDamage: number;
}

export interface ServerGamificationState {
  profile: ServerGamificationProfile;
  events: ServerGamificationEvent[];
  missions: GamificationMission[];
  cosmetics: CosmeticItem[];
  season: SeasonPassState;
  clan: ClanState;
  avatar: AvatarState;
  dataMode?: 'mock_dev_only';
}

export type ServerGamificationEventType = 'login' | 'checkin' | 'workout_completed';

async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session?.access_token) {
    throw new Error('Faça login para acessar gamificação.');
  }

  return data.session.access_token;
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
        ? body.error
        : 'Falha na API de gamificação.';
    throw new Error(message);
  }

  return body as T;
}

export async function fetchGamificationState(): Promise<ServerGamificationState> {
  const token = await getAccessToken();
  const response = await fetch('/api/gamification/state', {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  return parseApiResponse<ServerGamificationState>(response);
}

export async function recordGamificationEvent(
  eventType: ServerGamificationEventType,
  sourceId?: string,
) {
  const token = await getAccessToken();
  const response = await fetch('/api/gamification/event', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ eventType, sourceId }),
  });

  return parseApiResponse<{ profile?: ServerGamificationProfile; skipped?: boolean; reason?: string }>(response);
}
