export interface BinauralBeatSession {
  id: string;
  type: 'focus' | 'relaxation' | 'recovery';
  hz: number;
  isActive: boolean;
}

export const toggleBinauralBeat = (session: BinauralBeatSession | null, type: 'focus' | 'relaxation' | 'recovery'): BinauralBeatSession => {
  if (session && session.isActive && session.type === type) {
    return { ...session, isActive: false };
  }

  let hz = 14; // Default focus (beta)
  if (type === 'relaxation') hz = 8; // Alpha
  if (type === 'recovery') hz = 2; // Delta

  return {
    id: `binaural-${Date.now()}`,
    type,
    hz,
    isActive: true,
  };
};

export const getBinauralDisclaimer = (): string => {
  return "Nota: Sons binaurais são experimentais e não têm eficácia médica comprovada. Use com fones de ouvido para melhor experiência.";
};
