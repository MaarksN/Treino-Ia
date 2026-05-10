import {
  EntitlementState,
  PremiumCoupon,
  PremiumFeature,
  SubscriptionPlan,
  SubscriptionPlanId,
} from '../types';

const PREMIUM_KEY = '@TreinoApp:premium-entitlement';
const PREMIUM_EVENTS_KEY = '@TreinoApp:premium-events';

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_MS = 30 * DAY_MS;
const YEAR_MS = 365 * DAY_MS;

export const PREMIUM_FEATURE_LABELS: Record<PremiumFeature, string> = {
  premium_theme: 'Tema premium',
  export_data: 'Exportação premium',
  unlimited_ai: 'IA ilimitada',
  wearable_sync: 'Wearables',
  pose_detection: 'Análise de postura',
  premium_community: 'Comunidade premium',
  exclusive_badge: 'Badge exclusivo',
  advanced_analytics: 'Analytics avançado',
  priority_coach: 'Coach prioritário',
  periodization_lab: 'Periodização avançada',
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    subtitle: 'Para começar a treinar com inteligência.',
    price: 0,
    billing: 'none',
    features: [
      '1 plano ativo',
      'Analytics básico',
      'Tema básico',
      'IA com limite mensal',
      'Comunidade limitada',
    ],
    unlockedFeatures: [],
  },
  {
    id: 'premium_monthly',
    name: 'Premium Mensal',
    subtitle: 'Mais IA, performance e retenção.',
    price: 29.9,
    billing: 'month',
    highlighted: true,
    badge: 'Mais escolhido',
    features: [
      'Planos ilimitados',
      'IA ilimitada',
      'Exportação de dados',
      'Tema premium',
      'Wearables',
      'Pose detection',
      'Comunidade premium',
      'Badge premium',
    ],
    unlockedFeatures: [
      'premium_theme',
      'export_data',
      'unlimited_ai',
      'wearable_sync',
      'pose_detection',
      'premium_community',
      'exclusive_badge',
      'advanced_analytics',
      'periodization_lab',
    ],
  },
  {
    id: 'premium_yearly',
    name: 'Premium Anual',
    subtitle: 'Melhor custo-benefício para evolução contínua.',
    price: 199.9,
    billing: 'year',
    badge: 'Economize 44%',
    features: [
      'Tudo do mensal',
      'Economia anual',
      'Badges exclusivos',
      'Temas premium',
      'Analytics avançado',
      'Prioridade em recursos novos',
    ],
    unlockedFeatures: [
      'premium_theme',
      'export_data',
      'unlimited_ai',
      'wearable_sync',
      'pose_detection',
      'premium_community',
      'exclusive_badge',
      'advanced_analytics',
      'priority_coach',
      'periodization_lab',
    ],
  },
];

export const PREMIUM_COUPONS: PremiumCoupon[] = [
  {
    code: 'BIRTHUB30',
    label: '30% OFF no primeiro mês',
    discountPercent: 30,
    durationMonths: 1,
  },
  {
    code: 'FOUNDER50',
    label: '50% OFF fundador',
    discountPercent: 50,
    durationMonths: 3,
  },
];

export function createDefaultEntitlement(): EntitlementState {
  const now = Date.now();

  return {
    planId: 'free',
    billingStatus: 'free',
    isPremium: false,
    unlockedFeatures: [],
    usage: {
      aiRequestsThisMonth: 0,
      exportsThisMonth: 0,
      prCount: 0,
      bestStreak: 0,
      lastUsageResetAt: now,
    },
    createdAt: now,
    updatedAt: now,
  };
}

export function loadEntitlement(): EntitlementState {
  try {
    const raw = localStorage.getItem(PREMIUM_KEY);

    if (!raw) {
      const initial = createDefaultEntitlement();
      saveEntitlement(initial);
      return initial;
    }

    const parsed = JSON.parse(raw) as EntitlementState;
    return normalizeEntitlement(parsed);
  } catch {
    const initial = createDefaultEntitlement();
    saveEntitlement(initial);
    return initial;
  }
}

export function saveEntitlement(state: EntitlementState): void {
  localStorage.setItem(
    PREMIUM_KEY,
    JSON.stringify({
      ...state,
      updatedAt: Date.now(),
    }),
  );
}

export function normalizeEntitlement(state: EntitlementState): EntitlementState {
  const now = Date.now();
  const trialActive =
    state.billingStatus === 'trialing' &&
    typeof state.trialEndsAt === 'number' &&
    state.trialEndsAt > now;

  const paidActive =
    state.billingStatus === 'active' &&
    typeof state.currentPeriodEnd === 'number' &&
    state.currentPeriodEnd > now;

  const isPremium = trialActive || paidActive;

  const plan = getPlanById(state.planId);

  const resetUsage =
    now - state.usage.lastUsageResetAt > MONTH_MS
      ? {
          ...state.usage,
          aiRequestsThisMonth: 0,
          exportsThisMonth: 0,
          lastUsageResetAt: now,
        }
      : state.usage;

  const normalized: EntitlementState = {
    ...state,
    billingStatus: isPremium
      ? state.billingStatus
      : state.planId === 'free'
        ? 'free'
        : 'canceled',
    isPremium,
    unlockedFeatures: isPremium ? plan.unlockedFeatures : [],
    usage: resetUsage,
    updatedAt: now,
  };

  saveEntitlement(normalized);
  return normalized;
}

export function getPlanById(planId: SubscriptionPlanId): SubscriptionPlan {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId) ?? SUBSCRIPTION_PLANS[0];
}

export function getCurrentPlan(): SubscriptionPlan {
  return getPlanById(loadEntitlement().planId);
}

export function startSevenDayTrial(): EntitlementState {
  const now = Date.now();
  const plan = getPlanById('premium_monthly');

  const next: EntitlementState = {
    ...loadEntitlement(),
    planId: 'premium_monthly',
    billingStatus: 'trialing',
    isPremium: true,
    trialStartedAt: now,
    trialEndsAt: now + 7 * DAY_MS,
    unlockedFeatures: plan.unlockedFeatures,
    updatedAt: now,
  };

  saveEntitlement(next);
  trackPremiumEvent('trial_started', { planId: 'premium_monthly' });
  return next;
}

export function activatePlan(planId: SubscriptionPlanId): EntitlementState {
  const now = Date.now();
  const plan = getPlanById(planId);

  if (planId === 'free') {
    return cancelPremium();
  }

  const period =
    plan.billing === 'year'
      ? YEAR_MS
      : MONTH_MS;

  const next: EntitlementState = {
    ...loadEntitlement(),
    planId,
    billingStatus: 'active',
    isPremium: true,
    currentPeriodEnd: now + period,
    unlockedFeatures: plan.unlockedFeatures,
    updatedAt: now,
  };

  saveEntitlement(next);
  trackPremiumEvent('plan_activated', { planId });
  return next;
}

export function cancelPremium(): EntitlementState {
  const next: EntitlementState = {
    ...loadEntitlement(),
    planId: 'free',
    billingStatus: 'free',
    isPremium: false,
    currentPeriodEnd: undefined,
    trialEndsAt: undefined,
    unlockedFeatures: [],
    updatedAt: Date.now(),
  };

  saveEntitlement(next);
  trackPremiumEvent('plan_canceled', {});
  return next;
}

export function applyCoupon(code: string): {
  ok: boolean;
  message: string;
  coupon?: PremiumCoupon;
} {
  const normalized = code.trim().toUpperCase();
  const coupon = PREMIUM_COUPONS.find(item => item.code === normalized);

  if (!coupon) {
    return {
      ok: false,
      message: 'Cupom inválido.',
    };
  }

  if (coupon.validUntil && coupon.validUntil < Date.now()) {
    return {
      ok: false,
      message: 'Cupom expirado.',
    };
  }

  const next = {
    ...loadEntitlement(),
    activeCoupon: coupon.code,
    updatedAt: Date.now(),
  };

  saveEntitlement(next);
  trackPremiumEvent('coupon_applied', { code: coupon.code });

  return {
    ok: true,
    message: `${coupon.label} aplicado com sucesso.`,
    coupon,
  };
}

export function getDiscountedPrice(plan: SubscriptionPlan): number {
  const entitlement = loadEntitlement();

  if (!entitlement.activeCoupon || plan.price === 0) {
    return plan.price;
  }

  const coupon = PREMIUM_COUPONS.find(item => item.code === entitlement.activeCoupon);

  if (!coupon) {
    return plan.price;
  }

  return Number((plan.price * (1 - coupon.discountPercent / 100)).toFixed(2));
}

export function hasFeature(feature: PremiumFeature): boolean {
  const entitlement = loadEntitlement();
  return entitlement.isPremium && entitlement.unlockedFeatures.includes(feature);
}

export function canUseFeature(feature: PremiumFeature): {
  allowed: boolean;
  reason?: string;
} {
  const entitlement = loadEntitlement();

  if (hasFeature(feature)) {
    return { allowed: true };
  }

  if (feature === 'unlimited_ai') {
    const freeLimit = 10;

    if (entitlement.usage.aiRequestsThisMonth < freeLimit) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: 'Limite mensal de IA atingido no plano Free.',
    };
  }

  if (feature === 'export_data') {
    const freeLimit = 1;

    if (entitlement.usage.exportsThisMonth < freeLimit) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: 'Limite de exportação atingido no plano Free.',
    };
  }

  return {
    allowed: false,
    reason: `${PREMIUM_FEATURE_LABELS[feature]} é um recurso premium.`,
  };
}

export function incrementAiUsage(): EntitlementState {
  const state = loadEntitlement();

  const next: EntitlementState = {
    ...state,
    usage: {
      ...state.usage,
      aiRequestsThisMonth: state.usage.aiRequestsThisMonth + 1,
    },
    updatedAt: Date.now(),
  };

  saveEntitlement(next);
  return next;
}

export function incrementExportUsage(): EntitlementState {
  const state = loadEntitlement();

  const next: EntitlementState = {
    ...state,
    usage: {
      ...state.usage,
      exportsThisMonth: state.usage.exportsThisMonth + 1,
    },
    updatedAt: Date.now(),
  };

  saveEntitlement(next);
  return next;
}

export function recordPersonalRecord(): EntitlementState {
  const state = loadEntitlement();

  const next: EntitlementState = {
    ...state,
    usage: {
      ...state.usage,
      prCount: state.usage.prCount + 1,
    },
    updatedAt: Date.now(),
  };

  saveEntitlement(next);
  return next;
}

export function recordStreak(streak: number): EntitlementState {
  const state = loadEntitlement();

  const next: EntitlementState = {
    ...state,
    usage: {
      ...state.usage,
      bestStreak: Math.max(state.usage.bestStreak, streak),
    },
    updatedAt: Date.now(),
  };

  saveEntitlement(next);
  return next;
}

export function shouldShowPaywallAfterPr(): boolean {
  const state = loadEntitlement();

  if (state.isPremium) return false;
  if (state.usage.prCount < 1) return false;

  const alreadyShownRecently =
    state.prPaywallShownAt &&
    Date.now() - state.prPaywallShownAt < 7 * DAY_MS;

  return !alreadyShownRecently;
}

export function markPrPaywallShown(): void {
  const state = loadEntitlement();

  saveEntitlement({
    ...state,
    prPaywallShownAt: Date.now(),
  });

  trackPremiumEvent('paywall_after_pr_shown', {});
}

export function shouldShowPaywallAfterStreak(streak: number): boolean {
  const state = loadEntitlement();

  if (state.isPremium) return false;
  if (streak < 7) return false;

  const alreadyShownRecently =
    state.streakPaywallShownAt &&
    Date.now() - state.streakPaywallShownAt < 7 * DAY_MS;

  return !alreadyShownRecently;
}

export function markStreakPaywallShown(): void {
  const state = loadEntitlement();

  saveEntitlement({
    ...state,
    streakPaywallShownAt: Date.now(),
  });

  trackPremiumEvent('paywall_after_streak_shown', {});
}

export function getPremiumThemeClass(): string {
  return hasFeature('premium_theme')
    ? 'bg-[radial-gradient(circle_at_top,#1f3d1f_0,#0d0d0d_42%)]'
    : 'bg-brand-dark';
}

export function getExclusiveBadge(): string | null {
  return hasFeature('exclusive_badge') ? '👑 Atleta Premium' : null;
}

export function exportPremiumJson(filename: string, data: unknown): {
  ok: boolean;
  message: string;
} {
  const permission = canUseFeature('export_data');

  if (!permission.allowed) {
    return {
      ok: false,
      message: permission.reason ?? 'Exportação premium bloqueada.',
    };
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
  incrementExportUsage();

  return {
    ok: true,
    message: 'Exportação concluída.',
  };
}

export function getTrialDaysLeft(): number {
  const state = loadEntitlement();

  if (!state.trialEndsAt) return 0;

  return Math.max(0, Math.ceil((state.trialEndsAt - Date.now()) / DAY_MS));
}

export function trackPremiumEvent(event: string, payload: Record<string, unknown>): void {
  try {
    const raw = localStorage.getItem(PREMIUM_EVENTS_KEY);
    const events = raw ? JSON.parse(raw) : [];

    events.push({
      event,
      payload,
      occurredAt: new Date().toISOString(),
    });

    localStorage.setItem(PREMIUM_EVENTS_KEY, JSON.stringify(events.slice(-200)));
  } catch {
    // não quebra a experiência do usuário
  }
}
