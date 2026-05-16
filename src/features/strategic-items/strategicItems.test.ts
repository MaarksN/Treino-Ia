import { describe, expect, it } from 'vitest';
import { strategicItemsRegistry } from './strategicItems.registry';
import { getStrategicItemsByCategory, getStrategicItemsByStatus } from './strategicItems.selectors';

describe('strategicItemsRegistry', () => {
  it('contains exactly 100 unique ids from 1..100', () => {
    expect(strategicItemsRegistry).toHaveLength(100);
    const ids = strategicItemsRegistry.map(item => item.id);
    expect(new Set(ids).size).toBe(100);
    expect(Math.min(...ids)).toBe(1);
    expect(Math.max(...ids)).toBe(100);
  });

  it('enforces required fields', () => {
    strategicItemsRegistry.forEach(item => {
      expect(item.title.trim().length).toBeGreaterThan(0);
      expect(item.category).toBeTruthy();
      expect(item.status).toBeTruthy();
      expect(item.horizon).toBeTruthy();
      expect(item.productArea.trim().length).toBeGreaterThan(0);
    });
  });

  it('selectors should filter consistently', () => {
    expect(getStrategicItemsByStatus('implemented_now').length).toBeGreaterThan(5);
    expect(getStrategicItemsByCategory('engineering').length).toBeGreaterThan(0);
  });
});
