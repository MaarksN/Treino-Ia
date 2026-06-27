export interface GeoGuildConsent {
  userId: string;
  agreedToLocationSharing: boolean;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}

export function requestGeoGuildConsent(consent: GeoGuildConsent): GeoGuildConsent {
  if (
    consent.agreedToLocationSharing &&
    (consent.latitude === undefined || consent.longitude === undefined)
  ) {
    throw new Error('Localização é obrigatória se consentida.');
  }
  return consent;
}

export interface RivalMatch {
  userId: string;
  rivalId: string;
  rivalName: string;
  rivalLevel: number;
  matchingScore: number;
}

import { supabase } from '../database';

export async function findFairRival(userId: string, userLevel: string): Promise<RivalMatch> {
  try {
    // Busca um rival real no Supabase com mesmo nível, excluindo o próprio usuário
    const { data, error } = await supabase
      .from('training_user_profiles')
      .select('user_id, profile_json')
      .eq('profile_json->>level', userLevel)
      .neq('user_id', userId)
      .limit(1)
      .maybeSingle();

    if (error || !data) throw new Error('Nenhum rival encontrado');

    const profile = data.profile_json as any;
    return {
      userId,
      rivalId: data.user_id,
      rivalName: profile.name || 'Atleta Misterioso',
      rivalLevel: userLevel === 'iniciante' ? 1 : userLevel === 'intermediario' ? 5 : 10,
      matchingScore: 0.88 + Math.random() * 0.1,
    };
  } catch {
    // Fallback para manter a funcionalidade offline/sem dados
    return {
      userId,
      rivalId: `placeholder-rival-${userId}`,
      rivalName: 'Rival Local Desafiante',
      rivalLevel: userLevel === 'iniciante' ? 1 : userLevel === 'intermediario' ? 5 : 10,
      matchingScore: 0.95,
    };
  }
}

export interface WorkoutHoloReplay {
  workoutId: string;
  userId: string;
  trajectoryData: Record<string, any>[]; // Simplified trajectory abstraction
  durationSeconds: number;
}

export function generateReplayDataAbstraction(
  workoutId: string,
  userId: string,
  durationSeconds: number,
): WorkoutHoloReplay {
  return {
    workoutId,
    userId,
    trajectoryData: [
      { time: 0, position: 'start' },
      { time: durationSeconds, position: 'end' },
    ],
    durationSeconds,
  };
}

export interface SkillTreeAttribute {
  id: string;
  name: string;
  currentLevel: number;
  xpToNextLevel: number;
}

export function calculateLocalSkillTree(metrics: {
  strength: number;
  endurance: number;
  mobility: number;
}): SkillTreeAttribute[] {
  return [
    {
      id: 'str',
      name: 'Força',
      currentLevel: Math.floor(metrics.strength / 10),
      xpToNextLevel: 100,
    },
    {
      id: 'end',
      name: 'Resistência',
      currentLevel: Math.floor(metrics.endurance / 10),
      xpToNextLevel: 100,
    },
    {
      id: 'mob',
      name: 'Mobilidade',
      currentLevel: Math.floor(metrics.mobility / 10),
      xpToNextLevel: 100,
    },
  ];
}

export interface SocialBlurPolicy {
  contentId: string;
  isBlurred: boolean;
  reason?: string;
}

export function applySocialBlurPolicy(
  contentId: string,
  isSensitive: boolean,
  userAge: number,
): SocialBlurPolicy {
  if (isSensitive && userAge < 18) {
    return { contentId, isBlurred: true, reason: 'Restrição de idade para conteúdo sensível.' };
  }
  return { contentId, isBlurred: false };
}
