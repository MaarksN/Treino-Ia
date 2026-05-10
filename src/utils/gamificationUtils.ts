import {
  AvatarState,
  ClanState,
  CosmeticItem,
  GamificationMission,
  GamificationState,
  MissionMetric,
  MissionType,
  Rarity,
  SeasonalLeaderboardEntry,
  SeasonPassState,
  SeasonReward,
  XpEvent,
} from '../types';

const STORAGE_KEY = '@TreinoApp:gamification-state';
const DAY_MS = 24 * 60 * 60 * 1000;

function now(): number {
  return Date.now();
}

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function startOfToday(): number {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function isSameDay(a?: number, b = now()): boolean {
  if (!a) return false;
  return new Date(a).toDateString() === new Date(b).toDateString();
}

function isYesterday(timestamp?: number): boolean {
  if (!timestamp) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return new Date(timestamp).toDateString() === yesterday.toDateString();
}

export function xpForLevel(level: number): number {
  return Math.round(100 * Math.pow(level, 1.45));
}

export function calculateLevel(totalXp: number): number {
  let level = 1;
  let remaining = totalXp;

  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }

  return level;
}

export function xpIntoCurrentLevel(totalXp: number): {
  level: number;
  current: number;
  required: number;
  percent: number;
} {
  const level = calculateLevel(totalXp);
  let spent = 0;

  for (let i = 1; i < level; i += 1) {
    spent += xpForLevel(i);
  }

  const current = totalXp - spent;
  const required = xpForLevel(level);

  return {
    level,
    current,
    required,
    percent: Math.min(100, Math.round((current / required) * 100)),
  };
}

export function getAvatarArchetype(level: number): AvatarState['archetype'] {
  if (level >= 80) return 'immortal';
  if (level >= 50) return 'legend';
  if (level >= 25) return 'champion';
  if (level >= 10) return 'warrior';
  return 'rookie';
}

export function getAvatarEmoji(archetype: AvatarState['archetype']): string {
  const map: Record<AvatarState['archetype'], string> = {
    rookie: '🥉',
    warrior: '⚔️',
    champion: '🏆',
    legend: '🦁',
    immortal: '🔥',
  };

  return map[archetype];
}

export function getRarityClass(rarity: Rarity): string {
  const map: Record<Rarity, string> = {
    common: 'bg-white/10 text-white border-white/20',
    rare: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    epic: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    legendary: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
    mythic: 'bg-brand-neon/10 text-brand-neon border-brand-neon/30',
  };

  return map[rarity];
}

export function createDefaultCosmetics(): CosmeticItem[] {
  return [
    {
      id: 'title_rookie',
      type: 'title',
      name: 'Iniciante Consistente',
      description: 'Titulo inicial para quem comecou a jornada.',
      emoji: '🌱',
      rarity: 'common',
      price: 0,
      unlocked: true,
      equipped: true,
    },
    {
      id: 'title_warrior',
      type: 'title',
      name: 'Guerreiro da Semana',
      description: 'Desbloqueado por manter consistencia.',
      emoji: '⚔️',
      rarity: 'rare',
      price: 250,
      unlocked: false,
    },
    {
      id: 'frame_neon',
      type: 'frame',
      name: 'Moldura Neon',
      description: 'Frame premium visual para o avatar.',
      emoji: '🟢',
      rarity: 'epic',
      price: 600,
      unlocked: false,
    },
    {
      id: 'badge_beast',
      type: 'badge',
      name: 'Beast Mode',
      description: 'Badge para treinos pesados.',
      emoji: '🦍',
      rarity: 'legendary',
      price: 1000,
      unlocked: false,
    },
    {
      id: 'effect_fire',
      type: 'effect',
      name: 'Aura de Fogo',
      description: 'Efeito visual de alto nivel.',
      emoji: '🔥',
      rarity: 'mythic',
      price: 1500,
      unlocked: false,
    },
  ];
}

export function createSeasonRewards(): SeasonReward[] {
  return Array.from({ length: 20 }, (_, index) => {
    const level = index + 1;

    return {
      level,
      freeReward: {
        label: level % 5 === 0 ? 'Caixa simbolica' : `${50 + level * 10} XP`,
        xp: 50 + level * 10,
        coins: level % 5 === 0 ? 80 : 20,
      },
      eliteReward: {
        label: level % 4 === 0 ? 'Cosmetico sazonal' : `${120 + level * 15} XP`,
        xp: 120 + level * 15,
        coins: level % 4 === 0 ? 150 : 50,
        cosmeticId: level === 20 ? 'effect_fire' : undefined,
      },
      claimedFree: false,
      claimedElite: false,
    };
  });
}

export function createDefaultSeason(): SeasonPassState {
  const startsAt = startOfToday();
  const endsAt = startsAt + 90 * DAY_MS;

  return {
    id: 'season_founders',
    name: 'Temporada Fundadores',
    theme: 'Forca, consistencia e evolucao premium',
    startsAt,
    endsAt,
    seasonXp: 0,
    seasonLevel: 1,
    eliteActive: false,
    rewards: createSeasonRewards(),
  };
}

export function createMission(type: MissionType, input: {
  title: string;
  description: string;
  metric: MissionMetric;
  target: number;
  xpReward: number;
  coinReward?: number;
  durationDays: number;
}): GamificationMission {
  return {
    id: uid(type),
    type,
    title: input.title,
    description: input.description,
    metric: input.metric,
    target: input.target,
    progress: 0,
    xpReward: input.xpReward,
    coinReward: input.coinReward ?? 0,
    status: 'active',
    createdAt: now(),
    expiresAt: startOfToday() + input.durationDays * DAY_MS,
  };
}

export function createDailyMissions(): GamificationMission[] {
  return [
    createMission('daily', {
      title: 'Complete 3 exercicios',
      description: 'Finalize 3 exercicios do treino de hoje.',
      metric: 'exercise_completed',
      target: 3,
      xpReward: 120,
      coinReward: 25,
      durationDays: 1,
    }),
    createMission('daily', {
      title: 'Registre RPE',
      description: 'Informe RPE em pelo menos 4 series.',
      metric: 'rpe_logged',
      target: 4,
      xpReward: 100,
      coinReward: 20,
      durationDays: 1,
    }),
    createMission('daily', {
      title: 'Check-in premiado',
      description: 'Faca o check-in diario de energia, sono ou humor.',
      metric: 'checkin',
      target: 1,
      xpReward: 80,
      coinReward: 20,
      durationDays: 1,
    }),
  ];
}

export function createWeeklyMissions(): GamificationMission[] {
  return [
    createMission('weekly', {
      title: 'Semana consistente',
      description: 'Complete 4 treinos nesta semana.',
      metric: 'workouts',
      target: 4,
      xpReward: 500,
      coinReward: 120,
      durationDays: 7,
    }),
    createMission('weekly', {
      title: 'Volume de elite',
      description: 'Some 12.000kg de volume total semanal.',
      metric: 'volume',
      target: 12000,
      xpReward: 650,
      coinReward: 150,
      durationDays: 7,
    }),
  ];
}

export function createFlashMission(): GamificationMission {
  return createMission('flash', {
    title: 'Missao relampago',
    description: 'Complete 1 exercicio nos proximos 90 minutos.',
    metric: 'exercise_completed',
    target: 1,
    xpReward: 180,
    coinReward: 35,
    durationDays: 1,
  });
}

export function createWeekendEventMission(): GamificationMission {
  return createMission('weekend', {
    title: 'Evento de fim de semana',
    description: 'Treine no sabado ou domingo para ganhar XP extra.',
    metric: 'workouts',
    target: 1,
    xpReward: 250,
    coinReward: 70,
    durationDays: 3,
  });
}

export function createBossMission(): GamificationMission {
  return createMission('boss', {
    title: 'Boss Challenge Mensal',
    description: 'Cause 10.000 pontos de dano com volume, treinos e streak.',
    metric: 'group_contribution',
    target: 10000,
    xpReward: 1400,
    coinReward: 400,
    durationDays: 30,
  });
}

export function createDefaultClan(): ClanState {
  return {
    id: uid('clan'),
    name: 'Neon Warriors',
    tag: 'NW',
    memberCount: 1,
    weeklyXp: 0,
    bossDamage: 0,
  };
}

export function createDefaultState(userId = 'local-user'): GamificationState {
  const createdAt = now();

  return {
    userId,
    xp: 0,
    level: 1,
    coins: 100,
    loginStreak: 0,
    titlesUnlocked: ['Iniciante Consistente'],
    activeTitle: 'Iniciante Consistente',
    missions: [
      ...createDailyMissions(),
      ...createWeeklyMissions(),
      createBossMission(),
    ],
    cosmetics: createDefaultCosmetics(),
    season: createDefaultSeason(),
    avatar: {
      archetype: 'rookie',
      equippedTitle: 'title_rookie',
    },
    clan: createDefaultClan(),
    xpEvents: [],
    lootBoxesOpened: 0,
    createdAt,
    updatedAt: createdAt,
  };
}

export function loadGamificationState(): GamificationState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      const initial = createDefaultState();
      saveGamificationState(initial);
      return initial;
    }

    return normalizeState(JSON.parse(raw) as GamificationState);
  } catch {
    const initial = createDefaultState();
    saveGamificationState(initial);
    return initial;
  }
}

export function saveGamificationState(state: GamificationState): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...state,
      updatedAt: now(),
    }),
  );
}

export function normalizeState(state: GamificationState): GamificationState {
  const level = calculateLevel(state.xp);
  const cosmetics = state.cosmetics?.length ? state.cosmetics : createDefaultCosmetics();
  const season = state.season ?? createDefaultSeason();

  const next: GamificationState = {
    ...state,
    level,
    cosmetics,
    season: {
      ...season,
      rewards: season.rewards?.length ? season.rewards : createSeasonRewards(),
    },
    avatar: {
      ...state.avatar,
      archetype: getAvatarArchetype(level),
    },
    clan: state.clan ?? createDefaultClan(),
    missions: refreshExpiredMissions(state.missions ?? []),
    xpEvents: state.xpEvents ?? [],
    lootBoxesOpened: state.lootBoxesOpened ?? 0,
    updatedAt: now(),
  };

  saveGamificationState(next);
  return next;
}

export function refreshExpiredMissions(missions: GamificationMission[]): GamificationMission[] {
  const active = missions.filter(mission => {
    if (mission.status === 'claimed') return true;
    return mission.expiresAt > now();
  });

  const hasDaily = active.some(mission => mission.type === 'daily' && mission.expiresAt > now());
  const hasWeekly = active.some(mission => mission.type === 'weekly' && mission.expiresAt > now());
  const hasBoss = active.some(mission => mission.type === 'boss' && mission.expiresAt > now());

  return [
    ...active,
    ...(hasDaily ? [] : createDailyMissions()),
    ...(hasWeekly ? [] : createWeeklyMissions()),
    ...(hasBoss ? [] : [createBossMission()]),
  ];
}

export function addXp(source: string, amount: number, label: string): GamificationState {
  const state = loadGamificationState();

  const event: XpEvent = {
    id: uid('xp'),
    source,
    amount,
    label,
    occurredAt: now(),
  };

  const nextXp = state.xp + amount;
  const nextSeasonXp = state.season.seasonXp + amount;
  const nextLevel = calculateLevel(nextXp);
  const nextSeasonLevel = Math.max(1, Math.floor(nextSeasonXp / 300) + 1);

  const next: GamificationState = {
    ...state,
    xp: nextXp,
    level: nextLevel,
    season: {
      ...state.season,
      seasonXp: nextSeasonXp,
      seasonLevel: nextSeasonLevel,
    },
    avatar: {
      ...state.avatar,
      archetype: getAvatarArchetype(nextLevel),
    },
    xpEvents: [event, ...state.xpEvents].slice(0, 100),
    updatedAt: now(),
  };

  saveGamificationState(next);
  unlockTitlesByLevel(nextLevel);

  return loadGamificationState();
}

export function addCoins(amount: number): GamificationState {
  const state = loadGamificationState();

  const next = {
    ...state,
    coins: state.coins + amount,
    updatedAt: now(),
  };

  saveGamificationState(next);
  return next;
}

export function recordLogin(): GamificationState {
  const state = loadGamificationState();

  if (isSameDay(state.lastLoginAt)) {
    return state;
  }

  const loginStreak = isYesterday(state.lastLoginAt)
    ? state.loginStreak + 1
    : 1;

  const next: GamificationState = {
    ...state,
    loginStreak,
    lastLoginAt: now(),
    updatedAt: now(),
  };

  saveGamificationState(next);

  const bonus = Math.min(250, 50 + loginStreak * 10);
  addXp('login_streak', bonus, `Login streak: ${loginStreak} dias`);
  addCoins(Math.min(100, 10 + loginStreak * 3));

  return loadGamificationState();
}

export function dailyCheckin(): GamificationState {
  const state = loadGamificationState();

  if (isSameDay(state.lastCheckinAt)) {
    return state;
  }

  const next: GamificationState = {
    ...state,
    lastCheckinAt: now(),
    updatedAt: now(),
  };

  saveGamificationState(next);
  updateMissionProgress('checkin', 1);
  addXp('daily_checkin', 80, 'Check-in premiado');

  return loadGamificationState();
}

export function updateMissionProgress(metric: MissionMetric, amount: number): GamificationState {
  const state = loadGamificationState();

  const missions = state.missions.map(mission => {
    if (mission.metric !== metric || mission.status !== 'active') {
      return mission;
    }

    const progress = Math.min(mission.target, mission.progress + amount);

    return {
      ...mission,
      progress,
      status: progress >= mission.target ? 'completed' as const : mission.status,
    };
  });

  const next: GamificationState = {
    ...state,
    missions,
    updatedAt: now(),
  };

  saveGamificationState(next);

  if (metric === 'group_contribution' && state.clan) {
    updateClanBossDamage(amount);
  }

  return loadGamificationState();
}

export function claimMission(missionId: string): GamificationState {
  const state = loadGamificationState();
  const mission = state.missions.find(item => item.id === missionId);

  if (!mission || mission.status !== 'completed') {
    return state;
  }

  const missions = state.missions.map(item =>
    item.id === missionId
      ? { ...item, status: 'claimed' as const }
      : item,
  );

  const next: GamificationState = {
    ...state,
    missions,
    coins: state.coins + (mission.coinReward ?? 0),
    updatedAt: now(),
  };

  saveGamificationState(next);
  addXp(`mission_${mission.type}`, mission.xpReward, mission.title);

  return loadGamificationState();
}

export function unlockTitlesByLevel(level: number): GamificationState {
  const state = loadGamificationState();

  const titles = new Set(state.titlesUnlocked);

  if (level >= 5) titles.add('Atleta Disciplinado');
  if (level >= 10) titles.add('Guerreiro da Rotina');
  if (level >= 25) titles.add('Campeao de Volume');
  if (level >= 50) titles.add('Lenda da Consistencia');
  if (level >= 80) titles.add('Imortal do Treino');

  const next: GamificationState = {
    ...state,
    titlesUnlocked: [...titles],
    updatedAt: now(),
  };

  saveGamificationState(next);
  return next;
}

export function equipTitle(title: string): GamificationState {
  const state = loadGamificationState();

  if (!state.titlesUnlocked.includes(title)) return state;

  const next = {
    ...state,
    activeTitle: title,
    updatedAt: now(),
  };

  saveGamificationState(next);
  return next;
}

export function buyCosmetic(cosmeticId: string): {
  ok: boolean;
  message: string;
  state: GamificationState;
} {
  const state = loadGamificationState();
  const item = state.cosmetics.find(cosmetic => cosmetic.id === cosmeticId);

  if (!item) {
    return { ok: false, message: 'Item nao encontrado.', state };
  }

  if (item.unlocked) {
    return { ok: false, message: 'Item ja desbloqueado.', state };
  }

  if (state.coins < item.price) {
    return { ok: false, message: 'Moedas insuficientes.', state };
  }

  const next: GamificationState = {
    ...state,
    coins: state.coins - item.price,
    cosmetics: state.cosmetics.map(cosmetic =>
      cosmetic.id === cosmeticId
        ? { ...cosmetic, unlocked: true }
        : cosmetic,
    ),
    updatedAt: now(),
  };

  saveGamificationState(next);

  return {
    ok: true,
    message: `${item.name} desbloqueado.`,
    state: next,
  };
}

export function equipCosmetic(cosmeticId: string): GamificationState {
  const state = loadGamificationState();
  const item = state.cosmetics.find(cosmetic => cosmetic.id === cosmeticId);

  if (!item || !item.unlocked) {
    return state;
  }

  const cosmetics = state.cosmetics.map(cosmetic => ({
    ...cosmetic,
    equipped:
      cosmetic.type === item.type
        ? cosmetic.id === item.id
        : cosmetic.equipped,
  }));

  const avatar: AvatarState = {
    ...state.avatar,
  };

  if (item.type === 'avatar_skin') avatar.equippedSkin = item.id;
  if (item.type === 'frame') avatar.equippedFrame = item.id;
  if (item.type === 'badge') avatar.equippedBadge = item.id;
  if (item.type === 'title') avatar.equippedTitle = item.id;
  if (item.type === 'effect') avatar.equippedEffect = item.id;

  const next: GamificationState = {
    ...state,
    cosmetics,
    avatar,
    updatedAt: now(),
  };

  saveGamificationState(next);
  return next;
}

export function openSymbolicLootBox(): {
  reward: CosmeticItem | { coins: number; xp: number };
  state: GamificationState;
} {
  const state = loadGamificationState();
  const locked = state.cosmetics.filter(item => !item.unlocked);

  if (locked.length && Math.random() > 0.45) {
    const reward = locked[Math.floor(Math.random() * locked.length)];

    const next: GamificationState = {
      ...state,
      lootBoxesOpened: state.lootBoxesOpened + 1,
      cosmetics: state.cosmetics.map(item =>
        item.id === reward.id ? { ...item, unlocked: true } : item,
      ),
      updatedAt: now(),
    };

    saveGamificationState(next);

    return {
      reward,
      state: next,
    };
  }

  const reward = {
    coins: 80 + Math.floor(Math.random() * 180),
    xp: 100 + Math.floor(Math.random() * 250),
  };

  const next: GamificationState = {
    ...state,
    lootBoxesOpened: state.lootBoxesOpened + 1,
    coins: state.coins + reward.coins,
    updatedAt: now(),
  };

  saveGamificationState(next);
  addXp('loot_box', reward.xp, 'Loot box simbolica');

  return {
    reward,
    state: loadGamificationState(),
  };
}

export function activateElitePass(): GamificationState {
  const state = loadGamificationState();

  const next: GamificationState = {
    ...state,
    season: {
      ...state.season,
      eliteActive: true,
    },
    updatedAt: now(),
  };

  saveGamificationState(next);
  return next;
}

export function claimSeasonReward(level: number, track: 'free' | 'elite'): GamificationState {
  const state = loadGamificationState();
  const reward = state.season.rewards.find(item => item.level === level);

  if (!reward) return state;
  if (level > state.season.seasonLevel) return state;
  if (track === 'elite' && !state.season.eliteActive) return state;
  if (track === 'free' && reward.claimedFree) return state;
  if (track === 'elite' && reward.claimedElite) return state;

  const payload = track === 'free' ? reward.freeReward : reward.eliteReward;

  if (!payload) return state;

  if (payload.xp) {
    addXp(`season_${track}`, payload.xp, payload.label);
  }

  if (payload.coins) {
    addCoins(payload.coins);
  }

  if (payload.cosmeticId) {
    const current = loadGamificationState();

    saveGamificationState({
      ...current,
      cosmetics: current.cosmetics.map(item =>
        item.id === payload.cosmeticId
          ? { ...item, unlocked: true }
          : item,
      ),
    });
  }

  const current = loadGamificationState();

  const updatedRewards = current.season.rewards.map(item =>
    item.level === level
      ? {
          ...item,
          claimedFree: track === 'free' ? true : item.claimedFree,
          claimedElite: track === 'elite' ? true : item.claimedElite,
        }
      : item,
  );

  const finalState: GamificationState = {
    ...current,
    season: {
      ...current.season,
      rewards: updatedRewards,
    },
    updatedAt: now(),
  };

  saveGamificationState(finalState);
  return finalState;
}

export function updateClanBossDamage(amount: number): GamificationState {
  const state = loadGamificationState();

  const clan = state.clan ?? createDefaultClan();

  const next: GamificationState = {
    ...state,
    clan: {
      ...clan,
      bossDamage: clan.bossDamage + amount,
      weeklyXp: clan.weeklyXp + Math.round(amount / 10),
    },
    updatedAt: now(),
  };

  saveGamificationState(next);
  return next;
}

export function createSeasonalLeaderboard(state = loadGamificationState()): SeasonalLeaderboardEntry[] {
  return [
    {
      userId: state.userId,
      displayName: 'Voce',
      level: state.level,
      seasonXp: state.season.seasonXp,
      streak: state.loginStreak,
      clanTag: state.clan?.tag,
    },
    {
      userId: 'rival_1',
      displayName: 'Ana Power',
      level: Math.max(2, state.level + 2),
      seasonXp: state.season.seasonXp + 900,
      streak: state.loginStreak + 3,
      clanTag: 'AP',
    },
    {
      userId: 'rival_2',
      displayName: 'Bruno Iron',
      level: Math.max(2, state.level + 1),
      seasonXp: state.season.seasonXp + 500,
      streak: Math.max(1, state.loginStreak - 1),
      clanTag: 'BI',
    },
    {
      userId: 'rival_3',
      displayName: 'Carla Fit',
      level: Math.max(2, state.level - 1),
      seasonXp: Math.max(0, state.season.seasonXp - 100),
      streak: state.loginStreak + 1,
      clanTag: 'CF',
    },
  ].sort((a, b) => b.seasonXp - a.seasonXp);
}

export function simulateWorkoutCompleted(): GamificationState {
  updateMissionProgress('workouts', 1);
  updateMissionProgress('exercise_completed', 3);
  updateMissionProgress('sets', 12);
  updateMissionProgress('volume', 3500);
  updateMissionProgress('group_contribution', 3500);

  addXp('workout_completed', 250, 'Treino concluido');
  addCoins(50);

  return loadGamificationState();
}

export function simulateRpeLogged(count = 4): GamificationState {
  updateMissionProgress('rpe_logged', count);
  addXp('rpe_logged', 60, 'RPE registrado');

  return loadGamificationState();
}

export function triggerFlashMission(): GamificationState {
  const state = loadGamificationState();

  const hasActiveFlash = state.missions.some(
    mission => mission.type === 'flash' && mission.status === 'active',
  );

  if (hasActiveFlash) return state;

  const next: GamificationState = {
    ...state,
    missions: [createFlashMission(), ...state.missions],
    updatedAt: now(),
  };

  saveGamificationState(next);
  return next;
}

export function triggerWeekendEvent(): GamificationState {
  const state = loadGamificationState();

  const hasActiveWeekend = state.missions.some(
    mission => mission.type === 'weekend' && mission.status === 'active',
  );

  if (hasActiveWeekend) return state;

  const next: GamificationState = {
    ...state,
    missions: [createWeekendEventMission(), ...state.missions],
    updatedAt: now(),
  };

  saveGamificationState(next);
  return next;
}
