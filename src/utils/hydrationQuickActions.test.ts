import { describe, expect, it } from 'vitest';
import {
  buildHydrationQuickAddUrl,
  HYDRATION_QUICK_ADD_PARAM,
  parseHydrationQuickAddUrl,
} from './hydrationQuickActions';

describe('hydrationQuickActions', () => {
  it('parses valid quick-add hydration urls', () => {
    const detail = parseHydrationQuickAddUrl('/?view=nutrition&quickHydrationMl=350&source=notification');

    expect(detail).toEqual({
      amountMl: 350,
      source: 'notification',
    });
  });

  it('rejects impossible quick-add amounts', () => {
    expect(parseHydrationQuickAddUrl('/?quickHydrationMl=20')).toBeNull();
    expect(parseHydrationQuickAddUrl('/?quickHydrationMl=3000')).toBeNull();
    expect(parseHydrationQuickAddUrl('/?quickHydrationMl=abc')).toBeNull();
  });

  it('builds app-scoped quick-add urls', () => {
    const url = buildHydrationQuickAddUrl(500, 'shortcut');

    expect(url).toContain(`${HYDRATION_QUICK_ADD_PARAM}=500`);
    expect(url).toContain('source=shortcut');
    expect(url).toContain('view=nutrition');
  });
});
