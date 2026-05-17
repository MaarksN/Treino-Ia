import { describe, expect, it } from 'vitest';
import { findMicronutrient, MICRONUTRIENTS, PERIODIC_TABLE_EMPTY_MESSAGE } from './PeriodicTable.data';

describe('PeriodicTable', () => {
  it('keeps the educational empty-state instruction', () => {
    expect(PERIODIC_TABLE_EMPTY_MESSAGE).toContain('Selecione um micronutriente');
  });

  it('includes iron details in the micronutrient catalog', () => {
    expect(findMicronutrient('Fe')).toEqual({
      symbol: 'Fe',
      name: 'Ferro',
      category: 'mineral',
      description: 'Transporte de oxigênio e metabolismo energético.',
    });
  });

  it('keeps a compact catalog for vitamins and minerals', () => {
    expect(MICRONUTRIENTS).toHaveLength(8);
    expect(MICRONUTRIENTS.some(nutrient => nutrient.category === 'vitamina')).toBe(true);
    expect(MICRONUTRIENTS.some(nutrient => nutrient.category === 'mineral')).toBe(true);
  });
});
