import { Challenge } from '../types';

const CHALLENGE_KEY = '@TreinoApp:challenges';

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function loadChallenges(): Challenge[] {
  return safeRead<Challenge[]>(CHALLENGE_KEY, []);
}

export function saveChallenges(challenges: Challenge[]) {
  localStorage.setItem(CHALLENGE_KEY, JSON.stringify(challenges));
}

export function generateWeeklyChallenges(): Challenge[] {
  const today = new Date();
  const start = today.toISOString().slice(0, 10);
  const end = new Date(today.getTime() + 6 * 86400000).toISOString().slice(0, 10);

  return [
    {
      id: `wc-sessions-${start}`,
      name: 'Treinos na semana',
      description: 'Complete 4 treinos esta semana',
      emoji: '🏋️',
      type: 'weekly',
      target: 4,
      current: 0,
      unit: 'treinos',
      startDate: start,
      endDate: end,
      completed: false,
      reward: 'Badge Semana Forte',
    },
    {
      id: `wc-volume-${start}`,
      name: 'Volume semanal',
      description: 'Levante 5.000kg esta semana',
      emoji: '💪',
      type: 'weekly',
      target: 5000,
      current: 0,
      unit: 'kg',
      startDate: start,
      endDate: end,
      completed: false,
      reward: '+10 XP',
    },
    {
      id: `wc-checkin-${start}`,
      name: 'Check-ins da semana',
      description: 'Faça check-in 5 dias esta semana',
      emoji: '✅',
      type: 'weekly',
      target: 5,
      current: 0,
      unit: 'check-ins',
      startDate: start,
      endDate: end,
      completed: false,
      reward: 'Badge Consciente',
    },
  ];
}

export function generateMonthlyChallenges(): Challenge[] {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);

  return [
    {
      id: `mc-sessions-${startStr}`,
      name: 'Mês consistente',
      description: 'Complete 14 treinos no mês',
      emoji: '📅',
      type: 'monthly',
      target: 14,
      current: 0,
      unit: 'treinos',
      startDate: startStr,
      endDate: endStr,
      completed: false,
      reward: 'Badge Mês Consistente',
    },
    {
      id: `mc-volume-${startStr}`,
      name: 'Volume mensal',
      description: 'Levante 25.000kg no mês',
      emoji: '⚖️',
      type: 'monthly',
      target: 25000,
      current: 0,
      unit: 'kg',
      startDate: startStr,
      endDate: endStr,
      completed: false,
      reward: '+50 XP',
    },
  ];
}

export function updateChallenge(id: string, increment: number): Challenge | null {
  const challenges = loadChallenges();
  const index = challenges.findIndex(challenge => challenge.id === id && !challenge.completed);
  if (index === -1) return null;

  challenges[index].current = Math.min(challenges[index].current + increment, challenges[index].target);
  if (challenges[index].current >= challenges[index].target) {
    challenges[index].completed = true;
  }

  saveChallenges(challenges);
  return challenges[index];
}

export function getOrCreateWeeklyChallenges(): Challenge[] {
  const existing = loadChallenges();
  const today = new Date().toISOString().slice(0, 10);
  const active = existing.filter(challenge => challenge.type === 'weekly' && challenge.endDate >= today);
  if (active.length) return active;

  const generated = generateWeeklyChallenges();
  saveChallenges([...existing, ...generated]);
  return generated;
}

export function getOrCreateMonthlyChallenges(): Challenge[] {
  const existing = loadChallenges();
  const today = new Date().toISOString().slice(0, 10);
  const active = existing.filter(challenge => challenge.type === 'monthly' && challenge.endDate >= today);
  if (active.length) return active;

  const generated = generateMonthlyChallenges();
  saveChallenges([...existing, ...generated]);
  return generated;
}

export function syncChallengeProgress(sessions: number, volume: number, checkins: number): Challenge[] {
  const all = loadChallenges();
  const activeGenerated = [...getOrCreateWeeklyChallenges(), ...getOrCreateMonthlyChallenges()];
  const activeMap = new Map([...all, ...activeGenerated].map(challenge => [challenge.id, challenge]));

  const synced = [...activeMap.values()].map(challenge => {
    let current = challenge.current;
    if (challenge.unit === 'treinos') current = sessions;
    if (challenge.unit === 'kg') current = volume;
    if (challenge.unit === 'check-ins') current = checkins;
    return {
      ...challenge,
      current: Math.min(current, challenge.target),
      completed: current >= challenge.target || challenge.completed,
    };
  });

  saveChallenges(synced);
  return synced;
}
