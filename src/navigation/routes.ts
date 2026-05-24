export type AppRoute =
  | 'dashboard'
  | 'nutrition'
  | 'social'
  | 'coach'
  | 'profile'
  | 'active-workout';

export const routes = {
  dashboard: '/dashboard',
  nutrition: '/nutrition',
  social: '/social',
  coach: '/coach',
  profile: '/profile',
  activeWorkout: '/workout/active',
} as const;

export function buildRoute(route: keyof typeof routes): string {
  return routes[route];
}
