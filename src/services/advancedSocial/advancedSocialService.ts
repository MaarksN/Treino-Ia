export interface GeoGuildConsent {
  userId: string;
  agreedToLocationSharing: boolean;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}

export function requestGeoGuildConsent(consent: GeoGuildConsent): GeoGuildConsent {
  if (consent.agreedToLocationSharing && (consent.latitude === undefined || consent.longitude === undefined)) {
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

export function findFairRivalPlaceholder(userId: string, userLevel: number): RivalMatch {
  // Mock function for local matching based on user level to avoid global fake network
  return {
    userId,
    rivalId: `placeholder-rival-${userId}`,
    rivalName: 'Rival Local Desafiante',
    rivalLevel: userLevel,
    matchingScore: 0.95
  };
}

export interface WorkoutHoloReplay {
  workoutId: string;
  userId: string;
  trajectoryData: Record<string, any>[]; // Simplified trajectory abstraction
  durationSeconds: number;
}

export function generateReplayDataAbstraction(workoutId: string, userId: string, durationSeconds: number): WorkoutHoloReplay {
  return {
    workoutId,
    userId,
    trajectoryData: [{ time: 0, position: 'start' }, { time: durationSeconds, position: 'end' }],
    durationSeconds
  };
}

export interface SkillTreeAttribute {
  id: string;
  name: string;
  currentLevel: number;
  xpToNextLevel: number;
}

export function calculateLocalSkillTree(metrics: { strength: number, endurance: number, mobility: number }): SkillTreeAttribute[] {
  return [
    { id: 'str', name: 'Força', currentLevel: Math.floor(metrics.strength / 10), xpToNextLevel: 100 },
    { id: 'end', name: 'Resistência', currentLevel: Math.floor(metrics.endurance / 10), xpToNextLevel: 100 },
    { id: 'mob', name: 'Mobilidade', currentLevel: Math.floor(metrics.mobility / 10), xpToNextLevel: 100 },
  ];
}

export interface SocialBlurPolicy {
  contentId: string;
  isBlurred: boolean;
  reason?: string;
}

export function applySocialBlurPolicy(contentId: string, isSensitive: boolean, userAge: number): SocialBlurPolicy {
  if (isSensitive && userAge < 18) {
    return { contentId, isBlurred: true, reason: 'Restrição de idade para conteúdo sensível.' };
  }
  return { contentId, isBlurred: false };
}
