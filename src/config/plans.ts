import { BillingPlanCatalogItem } from '../types/billing';

export const BILLING_PLAN_CATALOG: BillingPlanCatalogItem[] = [
  {
    id: 'free',
    tier: 'free',
    name: 'Free',
    price: 0,
    billingInterval: 'month',
    stripePriceIdEnv: null,
    planLimit: 2,
    aiRequests: 10,
    coachSeats: 0,
    features: ['2 planos de treino', 'IA limitada', 'Dashboard basico', 'Watermark em exportacoes'],
    entitlements: ['workouts.basic', 'analytics.basic'],
  },
  {
    id: 'pro_monthly',
    tier: 'pro',
    name: 'Pro',
    price: 29.9,
    billingInterval: 'month',
    stripePriceIdEnv: 'STRIPE_PRICE_PRO_MONTHLY',
    planLimit: 'unlimited',
    aiRequests: 'unlimited',
    coachSeats: 0,
    features: ['Planos ilimitados', 'IA ilimitada', 'PDF sem watermark', 'Nutricionismo IA'],
    entitlements: ['workouts.unlimited', 'ai.unlimited', 'export.clean', 'nutrition.ai'],
  },
  {
    id: 'pro_yearly',
    tier: 'pro',
    name: 'Pro (Anual)',
    price: 215.28,
    billingInterval: 'year',
    stripePriceIdEnv: 'STRIPE_PRICE_PRO_YEARLY',
    planLimit: 'unlimited',
    aiRequests: 'unlimited',
    coachSeats: 0,
    features: ['Tudo do Pro mensal', 'Bundle anual com desconto'],
    entitlements: ['workouts.unlimited', 'ai.unlimited', 'export.clean', 'nutrition.ai', 'bundle.annual'],
  },
  {
    id: 'coach',
    tier: 'coach',
    name: 'Coach',
    price: 79.9,
    billingInterval: 'month',
    stripePriceIdEnv: 'STRIPE_PRICE_COACH_MONTHLY',
    planLimit: 'unlimited',
    aiRequests: 'unlimited',
    coachSeats: 25,
    features: ['Tudo do Pro', 'Carteira de alunos', 'Cobrança por aluno', 'Console de coach'],
    entitlements: ['coach.students', 'coach.billing', 'coach.notes'],
  },
  {
    id: 'elite',
    tier: 'elite',
    name: 'Elite',
    price: 149.9,
    billingInterval: 'month',
    stripePriceIdEnv: 'STRIPE_PRICE_ELITE_MONTHLY',
    planLimit: 'unlimited',
    aiRequests: 'unlimited',
    coachSeats: 100,
    features: ['Tudo do Coach', 'Wearables avancados', 'Prioridade IA', 'Relatorios executivos'],
    entitlements: ['wearables.advanced', 'ai.priority', 'reports.executive'],
  },
];

export const BILLING_PLANS = BILLING_PLAN_CATALOG.filter(
  plan => plan.id === 'free' || plan.id === 'pro_monthly' || plan.id === 'coach' || plan.id === 'elite',
).map(plan => ({
  id: plan.tier,
  name: plan.name,
  monthlyPrice: plan.billingInterval === 'month' ? plan.price : 0,
  annualPrice: plan.tier === 'pro'
    ? (BILLING_PLAN_CATALOG.find(item => item.id === 'pro_yearly')?.price ?? plan.price * 12)
    : plan.price * 12,
  planLimit: plan.planLimit,
  aiRequests: plan.aiRequests,
  coachSeats: plan.coachSeats,
  features: plan.features,
  entitlements: plan.entitlements,
}));


export function getBillingPlan(tier: 'free' | 'pro' | 'coach' | 'elite') {
  return BILLING_PLANS.find(plan => plan.id === tier) ?? BILLING_PLANS[0];
}
