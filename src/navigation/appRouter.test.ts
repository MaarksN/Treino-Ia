import { describe, expect, it } from 'vitest';
import {
  buildAppRouteHref,
  isKnownDashboardPath,
  parseAppRoute,
} from './appRouter';

describe('appRouter', () => {
  it('normalizes dashboard paths without replacing the current architecture', () => {
    expect(isKnownDashboardPath('/')).toBe(true);
    expect(isKnownDashboardPath('/dashboard/')).toBe(true);
    expect(isKnownDashboardPath('/unknown')).toBe(false);
  });

  it('parses the nutrition deep link from querystring or hash', () => {
    expect(parseAppRoute({ pathname: '/', search: '?view=nutrition', hash: '' }).id).toBe('nutrition');
    expect(parseAppRoute({ pathname: '/dashboard', search: '', hash: '#nutrition' }).id).toBe('nutrition');
    expect(parseAppRoute({ pathname: '/', search: '', hash: '' }).id).toBe('dashboard');
  });

  it('builds stable incremental hrefs', () => {
    expect(buildAppRouteHref('dashboard')).toBe('/');
    expect(buildAppRouteHref('nutrition')).toBe('/?view=nutrition');
  });
});
