export const CURRENT_STORAGE_VERSION = 1;

export type StorageEnvelope<T> = {
  version: number;
  updatedAt: string;
  data: T;
};

export const LEGACY_KEYS = {
  PROFILE: '@TreinoApp:profile',
  PLAN: '@TreinoApp:currentPlan',
  HISTORY: '@TreinoApp:history',
  IA_PROFILE: '@TreinoIA:profile',
  IA_PLAN: '@TreinoIA:currentPlan',
  IA_HISTORY: '@TreinoIA:history',
};

export const STORAGE_KEYS = {
  PROFILE: 'treino:v1:profile',
  PLAN: 'treino:v1:plan',
  HISTORY: 'treino:v1:history',
  SETTINGS: 'treino:v1:settings',
};
