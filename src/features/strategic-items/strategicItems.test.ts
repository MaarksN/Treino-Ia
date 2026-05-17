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

  it('tracks batch 02 gamification and retention items only', () => {
    const batchIds = [41, 42, 44, 47, 50];
    const batchItems = strategicItemsRegistry.filter(item => batchIds.includes(item.id));

    expect(batchItems).toHaveLength(batchIds.length);
    expect(batchItems.map(item => item.id)).toEqual(batchIds);
    expect(batchItems.every(item => item.category === 'gamification_retention')).toBe(true);
    expect(batchItems.filter(item => item.status === 'implemented_now').map(item => item.id)).toEqual(batchIds);
  });

  it('tracks batch 07 workout authoring and media items only', () => {
    const batchIds = [20, 25, 26, 27, 28];
    const batchItems = strategicItemsRegistry.filter(item => batchIds.includes(item.id));

    expect(batchItems).toHaveLength(batchIds.length);
    expect(batchItems.map(item => item.id)).toEqual(batchIds);
    expect(batchItems.filter(item => item.status === 'implemented_now').map(item => item.id)).toEqual([20, 26, 27, 28]);
    expect(batchItems.filter(item => item.status !== 'implemented_now').map(item => item.id)).toEqual([25]);
  });

  it('tracks batch 06 UI accessibility and interaction items only', () => {
    const batchIds = [13, 14, 15, 18, 19];
    const batchItems = strategicItemsRegistry.filter(item => batchIds.includes(item.id));

    expect(batchItems).toHaveLength(batchIds.length);
    expect(batchItems.map(item => item.id)).toEqual(batchIds);
    expect(batchItems.filter(item => item.status === 'implemented_now').map(item => item.id)).toEqual([13, 14, 15, 18, 19]);
    expect(batchItems.filter(item => item.status === 'foundation_created').map(item => item.id)).toEqual([]);
  });

  it('tracks batch 09 quality, CI and data architecture items only', () => {
    const batchIds = [2, 5, 6, 7, 8];
    const batchItems = strategicItemsRegistry.filter(item => batchIds.includes(item.id));

    expect(batchItems).toHaveLength(batchIds.length);
    expect(batchItems.map(item => item.id)).toEqual(batchIds);
    expect(batchItems.filter(item => item.status === 'implemented_now').map(item => item.id)).toEqual([2, 5, 6, 7, 8]);
    expect(batchItems.filter(item => item.status === 'foundation_created').map(item => item.id)).toEqual([]);
  });
});
