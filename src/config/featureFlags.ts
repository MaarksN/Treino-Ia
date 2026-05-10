export type FeatureFlagKey =
  | 'block11.monetization'
  | 'block12.pwaMobile'
  | 'block13.nutrition'
  | 'block14.recovery'
  | 'block15.integrations'
  | 'block16.accessibility'
  | 'block17.security'
  | 'block18.education'
  | 'block19.aiPersonalization'
  | 'block20.devops';

export type FeatureFlagMap = Record<FeatureFlagKey, boolean>;

const STORAGE_KEY = '@TreinoApp:feature-flags';

export const DEFAULT_FEATURE_FLAGS: FeatureFlagMap = {
  'block11.monetization': true,
  'block12.pwaMobile': true,
  'block13.nutrition': true,
  'block14.recovery': true,
  'block15.integrations': true,
  'block16.accessibility': true,
  'block17.security': true,
  'block18.education': true,
  'block19.aiPersonalization': true,
  'block20.devops': true,
};

function hasStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadFeatureFlags(): FeatureFlagMap {
  if (!hasStorage()) return DEFAULT_FEATURE_FLAGS;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FEATURE_FLAGS;

    return {
      ...DEFAULT_FEATURE_FLAGS,
      ...(JSON.parse(raw) as Partial<FeatureFlagMap>),
    };
  } catch {
    return DEFAULT_FEATURE_FLAGS;
  }
}

export function saveFeatureFlags(flags: FeatureFlagMap) {
  if (!hasStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
}

export function setFeatureFlag(key: FeatureFlagKey, enabled: boolean): FeatureFlagMap {
  const next = {
    ...loadFeatureFlags(),
    [key]: enabled,
  };

  saveFeatureFlags(next);
  return next;
}

export function isFeatureEnabled(key: FeatureFlagKey) {
  return loadFeatureFlags()[key];
}
