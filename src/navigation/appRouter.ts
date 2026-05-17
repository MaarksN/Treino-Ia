export type AppRouteId = 'dashboard' | 'nutrition';

export interface AppRoute {
  id: AppRouteId;
  pathname: string;
  search: string;
  isKnownPath: boolean;
}

type LocationLike = Pick<Location, 'pathname' | 'search' | 'hash'>;

const DASHBOARD_PATHS = new Set(['', '/', '/dashboard']);

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

export function isKnownDashboardPath(pathname: string): boolean {
  return DASHBOARD_PATHS.has(normalizePathname(pathname));
}

export function parseAppRoute(location: LocationLike): AppRoute {
  const pathname = normalizePathname(location.pathname);
  const params = new URLSearchParams(location.search);
  const section = params.get('view') || location.hash.replace(/^#/, '');
  const isNutrition = section === 'nutrition';

  return {
    id: isNutrition ? 'nutrition' : 'dashboard',
    pathname,
    search: isNutrition ? '?view=nutrition' : '',
    isKnownPath: isKnownDashboardPath(pathname),
  };
}

export function buildAppRouteHref(routeId: AppRouteId): string {
  if (routeId === 'nutrition') return '/?view=nutrition';
  return '/';
}

export function getCurrentAppRoute(win: Window = window): AppRoute {
  return parseAppRoute(win.location);
}

export function replaceUnknownAppRoute(win: Window = window): boolean {
  const route = getCurrentAppRoute(win);
  if (route.isKnownPath) return false;

  win.history.replaceState({}, '', buildAppRouteHref(route.id));
  return true;
}

export function pushAppRoute(routeId: AppRouteId, win: Window = window): void {
  const href = buildAppRouteHref(routeId);
  const current = `${win.location.pathname}${win.location.search}`;
  if (current === href) return;

  win.history.pushState({}, '', href);
  win.dispatchEvent(new PopStateEvent('popstate'));
}

export function subscribeToAppRoute(
  listener: (route: AppRoute) => void,
  win: Window = window,
): () => void {
  const handleRouteChange = () => listener(getCurrentAppRoute(win));
  win.addEventListener('popstate', handleRouteChange);
  return () => win.removeEventListener('popstate', handleRouteChange);
}
