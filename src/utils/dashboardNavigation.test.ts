import { describe, expect, it } from 'vitest';
import {
  DASHBOARD_MOBILE_SECTIONS,
  getDashboardMobileSections,
  getDashboardSectionByTarget,
} from './dashboardNavigation';

describe('dashboard mobile navigation', () => {
  it('exposes all real dashboard sections when training data exists', () => {
    expect(getDashboardMobileSections(true).map(section => section.id)).toEqual([
      'overview',
      'nutrition',
      'plan',
      'history',
      'reports',
    ]);
  });

  it('keeps navigation minimal before the dashboard has training data', () => {
    expect(getDashboardMobileSections(false)).toEqual([DASHBOARD_MOBILE_SECTIONS[0]]);
  });

  it('resolves unknown targets to the overview section', () => {
    expect(getDashboardSectionByTarget('dashboard-history').id).toBe('history');
    expect(getDashboardSectionByTarget('missing-section').id).toBe('overview');
  });
});
