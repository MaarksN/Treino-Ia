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
  | 'block20.devops'
  | 'smart_progression_engine'
  | 'react_query_server_state'
  | 'posthog_analytics'
  | 'typed_router';

export type FeatureFlagMap = Record<FeatureFlagKey, boolean>;
export type ProductSurfaceStatus = 'core' | 'beta' | 'internal' | 'off';
export type ProductFeatureAudience = 'user' | 'beta' | 'internal';

export type ProductSurfaceFeatureKey =
  | 'auth.login'
  | 'anamnesis'
  | 'trainingPlan'
  | 'todayWorkout'
  | 'activeWorkout'
  | 'setLogging'
  | 'history'
  | 'evolution'
  | 'aiRecommendation.simple'
  | 'billing'
  | 'nutrition.simple'
  | 'recovery.simple'
  | 'workoutImport.manual'
  | 'social'
  | 'wearables'
  | 'marketplace'
  | 'gamification.advanced'
  | 'platformHubs'
  | 'premiumIntegrations'
  | 'premiumUx'
  | 'advancedAccessibility'
  | 'advancedAi'
  | 'advancedWellness'
  | 'mediaEnhancements'
  | 'ocr'
  | 'cameraFormCheck'
  | 'webxr'
  | 'partnerTokens'
  | 'biometricScanners'
  | 'nutrition.photoAnalysis';

export interface ProductSurfaceFeature {
  label: string;
  status: ProductSurfaceStatus;
  note: string;
}

const STORAGE_KEY = '@TreinoApp:feature-flags';
const PRODUCT_SURFACE_OVERRIDES_KEY = '@TreinoApp:product-surface-overrides';
const PRODUCT_FEATURE_AUDIENCE_KEY = '@TreinoApp:feature-audience';

export const DEFAULT_FEATURE_FLAGS: FeatureFlagMap = {
  'block11.monetization': true,
  'block12.pwaMobile': true,
  'block13.nutrition': false,
  'block14.recovery': false,
  'block15.integrations': false,
  'block16.accessibility': false,
  'block17.security': true,
  'block18.education': false,
  'block19.aiPersonalization': false,
  'block20.devops': false,
  smart_progression_engine: true,
  react_query_server_state: false,
  posthog_analytics: false,
  typed_router: false,
};

export const PRODUCT_SURFACE_FEATURES: Record<ProductSurfaceFeatureKey, ProductSurfaceFeature> = {
  'auth.login': {
    label: 'Cadastro e login',
    status: 'core',
    note: 'Fluxo essencial de conta e sincronizacao.',
  },
  anamnesis: {
    label: 'Anamnese',
    status: 'core',
    note: 'Coleta inicial para gerar o plano.',
  },
  trainingPlan: {
    label: 'Plano atual',
    status: 'core',
    note: 'Geracao, edicao leve e visualizacao do plano.',
  },
  todayWorkout: {
    label: 'Treino de hoje',
    status: 'core',
    note: 'Primeiro bloco apos o cadastro completo.',
  },
  activeWorkout: {
    label: 'Execucao do treino',
    status: 'core',
    note: 'Modo ativo para conduzir a sessao.',
  },
  setLogging: {
    label: 'Registro de series',
    status: 'core',
    note: 'Carga, repeticoes, RPE e conclusao de series.',
  },
  history: {
    label: 'Historico',
    status: 'core',
    note: 'Sessoes finalizadas e recomendacoes associadas.',
  },
  evolution: {
    label: 'Evolucao',
    status: 'core',
    note: 'Resumo mensal/anual baseado no historico real.',
  },
  'aiRecommendation.simple': {
    label: 'Recomendacao simples da IA',
    status: 'core',
    note: 'Texto e sugestao de plano quando existe recomendacao pendente.',
  },
  billing: {
    label: 'Assinatura e limites',
    status: 'core',
    note: 'Pode aparecer quando billing estiver habilitado sem previews de marketplace.',
  },
  'nutrition.simple': {
    label: 'Nutricao simples',
    status: 'beta',
    note: 'Aparece apenas para audiencia beta ou override local.',
  },
  'recovery.simple': {
    label: 'Recuperacao simples',
    status: 'beta',
    note: 'Readiness e recuperacao manual ficam fora do fluxo final por padrao.',
  },
  'workoutImport.manual': {
    label: 'Importacao manual de ficha',
    status: 'beta',
    note: 'Preparo local de arquivo sem OCR; escondido para usuario comum.',
  },
  social: {
    label: 'Social e comunidade',
    status: 'internal',
    note: 'Feeds, perfis publicos, grupos e moderacao ficam internos.',
  },
  wearables: {
    label: 'Wearables e integracoes externas',
    status: 'internal',
    note: 'Depende de OAuth, hardware ou providers reais.',
  },
  marketplace: {
    label: 'Marketplace',
    status: 'internal',
    note: 'Catalogos e planos de terceiros ainda nao fazem parte do beta final.',
  },
  'gamification.advanced': {
    label: 'Gamificacao avancada',
    status: 'internal',
    note: 'Badges, missoes, ranking e paineis remotos ficam fora do core.',
  },
  platformHubs: {
    label: 'Hubs operacionais',
    status: 'internal',
    note: 'Centros de plataforma, devops e operacao sao superficie interna.',
  },
  premiumIntegrations: {
    label: 'Integracoes premium',
    status: 'internal',
    note: 'Recursos comerciais experimentais ficam fora da experiencia principal.',
  },
  premiumUx: {
    label: 'Premium UX',
    status: 'internal',
    note: 'Temas e previews premium aguardam validacao de billing/entitlements.',
  },
  advancedAccessibility: {
    label: 'Acessibilidade avancada',
    status: 'internal',
    note: 'Paineis de auditoria e protocolos avancados ficam internos.',
  },
  advancedAi: {
    label: 'IA avancada',
    status: 'internal',
    note: 'Personalizacao, memoria, replanejamento por foto e paineis preditivos ficam internos.',
  },
  advancedWellness: {
    label: 'Bem-estar avancado',
    status: 'internal',
    note: 'Biohacking, longevidade, sustentabilidade e retrospectivas ficam internos.',
  },
  mediaEnhancements: {
    label: 'Midia e audio no treino',
    status: 'internal',
    note: 'PiP, sons retro e midia offline ficam fora do beta core.',
  },
  ocr: {
    label: 'OCR de ficha',
    status: 'off',
    note: 'Nao aparece ate existir engine real integrado.',
  },
  cameraFormCheck: {
    label: 'Camera e form check',
    status: 'internal',
    note: 'Analise de postura por camera (WASM/Local).',
  },
  webxr: {
    label: 'WebXR/AR',
    status: 'off',
    note: 'Nao aparece na UI final enquanto for apenas preview/capability guard.',
  },
  partnerTokens: {
    label: 'Tokens de parceiros',
    status: 'off',
    note: 'Nao aparece sem backend real de parceiros e QR codes.',
  },
  biometricScanners: {
    label: 'Scanners biometricos',
    status: 'off',
    note: 'Camera, urina, HRV facial e sensores sem hardware validado ficam ocultos.',
  },
  'nutrition.photoAnalysis': {
    label: 'Analise nutricional por foto',
    status: 'off',
    note: 'Nao aparece ate a integracao visual estar validada.',
  },
};

export type ProductSurfaceOverrideMap = Partial<Record<ProductSurfaceFeatureKey, boolean>>;

function hasStorage() {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
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

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
  } catch {}
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

function normalizeAudience(value: unknown): ProductFeatureAudience | null {
  return value === 'beta' || value === 'internal' || value === 'user' ? value : null;
}

export function getProductFeatureAudience(): ProductFeatureAudience {
  if (hasStorage()) {
    const storedAudience = normalizeAudience(
      window.localStorage.getItem(PRODUCT_FEATURE_AUDIENCE_KEY),
    );
    if (storedAudience) return storedAudience;
  }

  const envAudience = normalizeAudience(import.meta.env.VITE_FEATURE_AUDIENCE);
  return envAudience ?? 'user';
}

export function setProductFeatureAudience(audience: ProductFeatureAudience) {
  if (!hasStorage()) return;

  try {
    window.localStorage.setItem(PRODUCT_FEATURE_AUDIENCE_KEY, audience);
  } catch {}
}

export function loadProductSurfaceOverrides(): ProductSurfaceOverrideMap {
  if (!hasStorage()) return {};

  try {
    const raw = window.localStorage.getItem(PRODUCT_SURFACE_OVERRIDES_KEY);
    if (!raw) return {};

    return JSON.parse(raw) as ProductSurfaceOverrideMap;
  } catch {
    return {};
  }
}

export function saveProductSurfaceOverrides(overrides: ProductSurfaceOverrideMap) {
  if (!hasStorage()) return;

  try {
    window.localStorage.setItem(PRODUCT_SURFACE_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {}
}

export function setProductSurfaceOverride(
  key: ProductSurfaceFeatureKey,
  enabled: boolean,
): ProductSurfaceOverrideMap {
  const next = {
    ...loadProductSurfaceOverrides(),
    [key]: enabled,
  };

  saveProductSurfaceOverrides(next);
  return next;
}

export function getProductFeaturesByStatus(
  status: ProductSurfaceStatus,
): ProductSurfaceFeatureKey[] {
  return (Object.keys(PRODUCT_SURFACE_FEATURES) as ProductSurfaceFeatureKey[]).filter(
    (key) => PRODUCT_SURFACE_FEATURES[key].status === status,
  );
}

export function isProductFeatureVisible(
  key: ProductSurfaceFeatureKey,
  context?: {
    audience?: ProductFeatureAudience;
    overrides?: ProductSurfaceOverrideMap;
  },
): boolean {
  const feature = PRODUCT_SURFACE_FEATURES[key];
  const audience = context?.audience ?? getProductFeatureAudience();
  const overrides = context?.overrides ?? loadProductSurfaceOverrides();
  const override = overrides[key];

  if (feature.status === 'off') return false;
  if (feature.status === 'core') return override !== false;
  if (feature.status === 'beta') {
    return override === true || audience === 'beta' || audience === 'internal';
  }

  return audience === 'internal' && override !== false;
}
