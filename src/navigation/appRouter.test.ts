import { describe, expect, it } from 'vitest';
import { buildAppRouteHref, isKnownDashboardPath, parseAppRoute } from './appRouter';

describe('appRouter', () => {
  it('normalizes core paths without replacing the current architecture', () => {
    expect(isKnownDashboardPath('/')).toBe(true);
    expect(isKnownDashboardPath('/dashboard/')).toBe(true);
    expect(isKnownDashboardPath('/hoje')).toBe(true);
    expect(isKnownDashboardPath('/plano')).toBe(true);
    expect(isKnownDashboardPath('/treino/ativo')).toBe(true);
    expect(isKnownDashboardPath('/historico')).toBe(true);
    expect(isKnownDashboardPath('/conta')).toBe(true);
    expect(isKnownDashboardPath('/unknown')).toBe(false);
  });

  it('parses canonical routes and legacy deep links', () => {
    expect(parseAppRoute({ pathname: '/hoje', search: '', hash: '' }).id).toBe('today');
    expect(parseAppRoute({ pathname: '/plano', search: '', hash: '' }).id).toBe('plan');
    expect(parseAppRoute({ pathname: '/treino/ativo', search: '', hash: '' }).id).toBe(
      'active-workout',
    );
    expect(parseAppRoute({ pathname: '/historico', search: '', hash: '' }).id).toBe('history');
    expect(parseAppRoute({ pathname: '/conta', search: '', hash: '' }).id).toBe('account');
    expect(parseAppRoute({ pathname: '/', search: '?view=nutrition', hash: '' }).id).toBe(
      'nutrition',
    );
    expect(parseAppRoute({ pathname: '/dashboard', search: '', hash: '#history' }).id).toBe(
      'history',
    );
    expect(parseAppRoute({ pathname: '/', search: '?view=workout', hash: '' }).id).toBe(
      'active-workout',
    );
    expect(parseAppRoute({ pathname: '/', search: '', hash: '' }).id).toBe('today');
  });

  it('builds stable incremental hrefs', () => {
    expect(buildAppRouteHref('today')).toBe('/hoje');
    expect(buildAppRouteHref('plan')).toBe('/plano');
    expect(buildAppRouteHref('active-workout')).toBe('/treino/ativo');
    expect(buildAppRouteHref('history')).toBe('/historico');
    expect(buildAppRouteHref('account')).toBe('/conta');
    expect(buildAppRouteHref('nutrition')).toBe('/nutricao');
  });
});
