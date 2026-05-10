import { BillingPlan } from '../types/billing';

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    planLimit: 2,
    aiRequests: 10,
    coachSeats: 0,
    features: ['2 planos de treino', 'IA limitada', 'Dashboard basico', 'Watermark em exportacoes'],
    entitlements: ['workouts.basic', 'analytics.basic'],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 29.9,
    annualPrice: 215.28,
    planLimit: 'unlimited',
    aiRequests: 'unlimited',
    coachSeats: 0,
    features: ['Planos ilimitados', 'IA ilimitada', 'PDF sem watermark', 'Nutricionismo IA'],
    entitlements: ['workouts.unlimited', 'ai.unlimited', 'export.clean', 'nutrition.ai'],
  },
  {
    id: 'coach',
    name: 'Coach',
    monthlyPrice: 79.9,
    annualPrice: 575.28,
    planLimit: 'unlimited',
    aiRequests: 'unlimited',
    coachSeats: 25,
    features: ['Tudo do Pro', 'Carteira de alunos', 'Cobrança por aluno', 'Console de coach'],
    entitlements: ['coach.students', 'coach.billing', 'coach.notes'],
  },
  {
    id: 'elite',
    name: 'Elite',
    monthlyPrice: 149.9,
    annualPrice: 1079.28,
    planLimit: 'unlimited',
    aiRequests: 'unlimited',
    coachSeats: 100,
    features: ['Tudo do Coach', 'Wearables avancados', 'Prioridade IA', 'Relatorios executivos'],
    entitlements: ['wearables.advanced', 'ai.priority', 'reports.executive'],
  },
];

export function getBillingPlan(planId: BillingPlan['id']) {
  return BILLING_PLANS.find(plan => plan.id === planId) ?? BILLING_PLANS[0];
}
