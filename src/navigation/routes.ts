export type AppRoute =
  | 'today'
  | 'plan'
  | 'history'
  | 'account'
  | 'nutrition'
  | 'social'
  | 'coach'
  | 'profile'
  | 'active-workout';

export const routes = {
  today: '/hoje',
  plan: '/plano',
  history: '/historico',
  account: '/conta',
  dashboard: '/dashboard',
  nutrition: '/nutricao',
  social: '/social',
  coach: '/coach',
  profile: '/profile',
  activeWorkout: '/treino/ativo',
} as const;

export function buildRoute(route: keyof typeof routes): string {
  return routes[route];
}
