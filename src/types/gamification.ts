export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlockedAt?: number;
  unlocked: boolean;
  category: 'consistency' | 'volume' | 'pr' | 'nutrition' | 'recovery' | 'special';
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  type: 'weekly' | 'monthly' | 'custom';
  target: number;
  current: number;
  unit: string;
  startDate: string;
  endDate: string;
  completed: boolean;
  reward?: string;
}

export type MissionType =
  | 'daily'
  | 'weekly'
  | 'flash'
  | 'boss'
  | 'weekend';

export type MissionMetric =
  | 'workouts'
  | 'sets'
  | 'volume'
  | 'streak'
  | 'checkin'
  | 'rpe_logged'
  | 'exercise_completed'
  | 'group_contribution';

export type MissionStatus = 'active' | 'completed' | 'claimed' | 'expired';

export type CosmeticType =
  | 'avatar_skin'
  | 'frame'
  | 'badge'
  | 'title'
  | 'effect';

export type Rarity =
  | 'common'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic';

export interface XpEvent {
  id: string;
  source: string;
  amount: number;
  label: string;
  occurredAt: number;
}

export interface GamificationMission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  metric: MissionMetric;
  target: number;
  progress: number;
  xpReward: number;
  coinReward?: number;
  status: MissionStatus;
  expiresAt: number;
  createdAt: number;
}

export interface CosmeticItem {
  id: string;
  type: CosmeticType;
  name: string;
  description: string;
  emoji: string;
  rarity: Rarity;
  price: number;
  unlocked: boolean;
  equipped?: boolean;
}

export interface SeasonReward {
  level: number;
  freeReward?: {
    label: string;
    xp?: number;
    coins?: number;
    cosmeticId?: string;
  };
  eliteReward?: {
    label: string;
    xp?: number;
    coins?: number;
    cosmeticId?: string;
  };
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
  archetype: 'rookie' | 'warrior' | 'champion' | 'legend' | 'immortal';
  equippedSkin?: string;
  equippedFrame?: string;
  equippedBadge?: string;
  equippedTitle?: string;
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

export interface SeasonalLeaderboardEntry {
  userId: string;
  displayName: string;
  level: number;
  seasonXp: number;
  streak: number;
  clanTag?: string;
}

export interface GamificationState {
  userId: string;
  xp: number;
  level: number;
  coins: number;
  loginStreak: number;
  lastLoginAt?: number;
  lastCheckinAt?: number;
  titlesUnlocked: string[];
  activeTitle?: string;
  missions: GamificationMission[];
  cosmetics: CosmeticItem[];
  season: SeasonPassState;
  avatar: AvatarState;
  clan?: ClanState;
  xpEvents: XpEvent[];
  lootBoxesOpened: number;
  createdAt: number;
  updatedAt: number;
}
