export type AppRouteId = 'today' | 'plan' | 'active-workout' | 'history' | 'account' | 'nutrition';

export interface AppRoute {
  id: AppRouteId;
  pathname: string;
  search: string;
  targetId: string;
  isKnownPath: boolean;
}

type LocationLike = Pick<Location, 'pathname' | 'search' | 'hash'>;

const ROUTE_PATHS: Record<AppRouteId, string> = {
  today: '/hoje',
  plan: '/plano',
  'active-workout': '/treino/ativo',
  history: '/historico',
  account: '/conta',
  nutrition: '/nutricao',
};

const ROUTE_TARGETS: Record<AppRouteId, string> = {
  today: 'dashboard-overview',
  plan: 'dashboard-plan',
  'active-workout': 'dashboard-plan',
  history: 'dashboard-history',
  account: 'dashboard-account',
  nutrition: 'dashboard-nutrition',
};

const PATH_TO_ROUTE = new Map<string, AppRouteId>([
  ['', 'today'],
  ['/', 'today'],
  ['/dashboard', 'today'],
  ['/hoje', 'today'],
  ['/inicio', 'today'],
  ['/plano', 'plan'],
  ['/treino/ativo', 'active-workout'],
  ['/workout/active', 'active-workout'],
  ['/historico', 'history'],
  ['/conta', 'account'],
  ['/assinatura', 'account'],
  ['/nutricao', 'nutrition'],
  ['/nutrition', 'nutrition'],
]);

const LEGACY_VIEW_TO_ROUTE = new Map<string, AppRouteId>([
  ['dashboard', 'today'],
  ['home', 'today'],
  ['inicio', 'today'],
  ['today', 'today'],
  ['hoje', 'today'],
  ['checkin', 'today'],
  ['plan', 'plan'],
  ['plano', 'plan'],
  ['workout', 'active-workout'],
  ['active-workout', 'active-workout'],
  ['treino', 'active-workout'],
  ['history', 'history'],
  ['historico', 'history'],
  ['profile', 'account'],
  ['conta', 'account'],
  ['subscription', 'account'],
  ['assinatura', 'account'],
  ['nutrition', 'nutrition'],
  ['nutricao', 'nutrition'],
]);

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

export function isKnownDashboardPath(pathname: string): boolean {
  return PATH_TO_ROUTE.has(normalizePathname(pathname));
}

function parseLegacyView(location: LocationLike): AppRouteId | null {
  const params = new URLSearchParams(location.search);
  const view = params.get('view') || location.hash.replace(/^#/, '');
  if (!view) return null;
  return LEGACY_VIEW_TO_ROUTE.get(view.toLowerCase()) ?? null;
}

export function parseAppRoute(location: LocationLike): AppRoute {
  const pathname = normalizePathname(location.pathname);
  const routeId = parseLegacyView(location) ?? PATH_TO_ROUTE.get(pathname) ?? 'today';
  const isKnownPath = isKnownDashboardPath(pathname);

  return {
    id: routeId,
    pathname,
    search: location.search,
    targetId: ROUTE_TARGETS[routeId],
    isKnownPath,
  };
}

export function buildAppRouteHref(routeId: AppRouteId): string {
  return ROUTE_PATHS[routeId];
}

export function getAppRouteTargetId(routeId: AppRouteId): string {
  return ROUTE_TARGETS[routeId];
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
