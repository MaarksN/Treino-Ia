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

export interface ServerGamificationState {
  profile: ServerGamificationProfile;
  events: ServerGamificationEvent[];
}

export type ServerGamificationEventType =
  | 'login'
  | 'checkin'
  | 'workout_completed'
  | 'daily_checkin'
  | 'mission_claimed'
  | 'cosmetic_purchased'
  | 'loot_box_opened'
  | 'season_reward_claimed'
  | 'clan_joined'
  | 'clan_contribution';

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
