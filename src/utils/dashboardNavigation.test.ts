import { describe, expect, it } from 'vitest';
import {
  DASHBOARD_MOBILE_SECTIONS,
  getDashboardMobileSections,
  getDashboardSectionByTarget,
} from './dashboardNavigation';

describe('dashboard mobile navigation', () => {
  it('exposes only core dashboard sections when training data exists', () => {
    expect(getDashboardMobileSections(true).map((section) => section.id)).toEqual([
      'overview',
      'plan',
      'history',
      'account',
    ]);
  });

  it('adds nutrition only when the beta flag is enabled by the caller', () => {
    expect(
      getDashboardMobileSections(true, { nutritionEnabled: true }).map((section) => section.id),
    ).toEqual(['overview', 'nutrition', 'plan', 'history', 'account']);
  });

  it('keeps navigation minimal before the dashboard has training data', () => {
    expect(getDashboardMobileSections(false)).toEqual([DASHBOARD_MOBILE_SECTIONS[0]]);
  });

  it('resolves unknown targets to the overview section', () => {
    expect(getDashboardSectionByTarget('dashboard-history').id).toBe('history');
    expect(getDashboardSectionByTarget('dashboard-account').id).toBe('account');
    expect(getDashboardSectionByTarget('dashboard-nutrition').id).toBe('nutrition');
    expect(getDashboardSectionByTarget('missing-section').id).toBe('overview');
  });
});
