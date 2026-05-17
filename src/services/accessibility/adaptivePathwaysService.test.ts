import { beforeEach, describe, expect, it } from 'vitest';
import {
  getAllPathways,
  getPathwayById,
  getSelectedPathways,
  sanitizePathwayId,
  saveSelectedPathways,
} from './adaptivePathwaysService';

describe('adaptivePathwaysService', () => {
  beforeEach(() => localStorage.clear());

  it('returns all 6 pathways', () => {
    expect(getAllPathways()).toHaveLength(6);
  });

  it('retrieves pathway by valid id', () => {
    const pathway = getPathwayById('absolute_beginner');
    expect(pathway).not.toBeNull();
    expect(pathway!.title).toBe('Iniciante absoluto');
    expect(pathway!.disclaimer.length).toBeGreaterThan(0);
  });

  it('returns null for invalid id', () => {
    expect(getPathwayById('invalid' as never)).toBeNull();
  });

  it('sanitizes pathway ids', () => {
    expect(sanitizePathwayId('low_impact')).toBe('low_impact');
    expect(sanitizePathwayId(42)).toBeNull();
    expect(sanitizePathwayId(null)).toBeNull();
    expect(sanitizePathwayId('fake')).toBeNull();
  });

  it('saves and loads selected pathways', () => {
    const saved = saveSelectedPathways(['seated_training', 'low_impact', 'fake' as never]);
    expect(saved).toEqual(['seated_training', 'low_impact']);
    expect(getSelectedPathways()).toEqual(['seated_training', 'low_impact']);
  });

  it('deduplicates selected pathways', () => {
    const saved = saveSelectedPathways(['low_impact', 'low_impact', 'low_impact']);
    expect(saved).toEqual(['low_impact']);
  });

  it('returns empty when nothing saved', () => {
    expect(getSelectedPathways()).toEqual([]);
  });

  it('each pathway has a disclaimer', () => {
    for (const pathway of getAllPathways()) {
      expect(pathway.disclaimer.length).toBeGreaterThan(10);
    }
  });
});
