import { beforeEach, describe, expect, it } from 'vitest';
import {
  getPantryItemLabel,
  getPantryItems,
  PANTRY_DISCLAIMER,
  PANTRY_ITEMS,
  sanitizePantryItemId,
  savePantryItems,
  suggestMeals,
} from './pantryPlannerService';

describe('pantryPlannerService', () => {
  beforeEach(() => localStorage.clear());

  it('has at least 10 pantry items', () => {
    expect(PANTRY_ITEMS.length).toBeGreaterThanOrEqual(10);
  });

  it('sanitizes valid pantry ids', () => {
    expect(sanitizePantryItemId('ovos')).toBe('ovos');
    expect(sanitizePantryItemId('fake')).toBeNull();
    expect(sanitizePantryItemId(42)).toBeNull();
  });

  it('saves and loads pantry items', () => {
    savePantryItems(['ovos', 'arroz', 'fake' as never]);
    expect(getPantryItems()).toEqual(['ovos', 'arroz']);
  });

  it('returns empty when nothing saved', () => {
    expect(getPantryItems()).toEqual([]);
  });

  it('suggests meals when ingredients match', () => {
    const meals = suggestMeals(['ovos', 'queijo', 'legumes']);
    expect(meals.length).toBeGreaterThan(0);
    expect(meals[0].name).toContain('Omelete');
  });

  it('returns no meals for empty pantry', () => {
    expect(suggestMeals([])).toEqual([]);
  });

  it('returns no meals when ingredients dont match', () => {
    expect(suggestMeals(['mel'])).toEqual([]);
  });

  it('returns labels for all items', () => {
    for (const id of PANTRY_ITEMS) {
      expect(getPantryItemLabel(id).length).toBeGreaterThan(0);
    }
  });

  it('has disclaimer about no IoT', () => {
    expect(PANTRY_DISCLAIMER).toContain('geladeira inteligente');
    expect(PANTRY_DISCLAIMER).toContain('nutricionista');
  });
});
