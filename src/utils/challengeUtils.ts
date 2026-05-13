import { Challenge } from '../types';

export function loadChallenges(): Challenge[] {
  return [];
}

export function saveChallenges(_challenges: Challenge[]) {
  return;
}

export function generateWeeklyChallenges(): Challenge[] {
  const today = new Date();
  const start = today.toISOString().slice(0, 10);
  const end = new Date(today.getTime() + 6 * 86400000).toISOString().slice(0, 10);
  return [
    { id: `wc-sessions-${start}`, name: 'Treinos na semana', description: 'Complete 4 treinos esta semana', emoji: '🏋️', type: 'weekly', target: 4, current: 0, unit: 'treinos', startDate: start, endDate: end, completed: false, reward: 'server_driven' },
  ];
}

export function generateMonthlyChallenges(): Challenge[] {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
  return [
    { id: `mc-sessions-${start}`, name: 'Mês consistente', description: 'Complete 14 treinos no mês', emoji: '📅', type: 'monthly', target: 14, current: 0, unit: 'treinos', startDate: start, endDate: end, completed: false, reward: 'server_driven' },
  ];
}

export function updateChallenge(_id: string, _increment: number): Challenge | null {
  return null;
}

export function getOrCreateWeeklyChallenges(): Challenge[] { return generateWeeklyChallenges(); }
export function getOrCreateMonthlyChallenges(): Challenge[] { return generateMonthlyChallenges(); }

export function syncChallengeProgress(sessions: number, volume: number, checkins: number): Challenge[] {
  return [...generateWeeklyChallenges(), ...generateMonthlyChallenges()].map(challenge => {
    let current = challenge.current;
    if (challenge.unit === 'treinos') current = sessions;
    if (challenge.unit === 'kg') current = volume;
    if (challenge.unit === 'check-ins') current = checkins;
    return { ...challenge, current: Math.min(current, challenge.target), completed: current >= challenge.target };
  });
}
