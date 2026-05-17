import { beforeEach, describe, expect, it } from 'vitest';
import {
  getAllProtocols,
  getProtocolById,
  getSelectedProtocols,
  PCD_DISCLAIMER,
  sanitizeProtocolId,
  saveSelectedProtocols,
} from './adaptiveProtocolsService';

describe('adaptiveProtocolsService', () => {
  beforeEach(() => localStorage.clear());

  it('returns all 7 protocols', () => {
    expect(getAllProtocols()).toHaveLength(7);
  });

  it('retrieves protocol by valid id', () => {
    const protocol = getProtocolById('seated');
    expect(protocol).not.toBeNull();
    expect(protocol!.title).toBe('Treino sentado');
    expect(protocol!.disclaimer.length).toBeGreaterThan(0);
    expect(protocol!.recommendations.length).toBeGreaterThan(0);
    expect(protocol!.contraindications.length).toBeGreaterThan(0);
  });

  it('returns null for invalid id', () => {
    expect(getProtocolById('fake' as never)).toBeNull();
  });

  it('sanitizes protocol ids', () => {
    expect(sanitizeProtocolId('seated')).toBe('seated');
    expect(sanitizeProtocolId('post_injury')).toBe('post_injury');
    expect(sanitizeProtocolId(42)).toBeNull();
    expect(sanitizeProtocolId('fake')).toBeNull();
  });

  it('saves and loads selected protocols', () => {
    const saved = saveSelectedProtocols(['seated', 'low_impact', 'fake' as never]);
    expect(saved).toEqual(['seated', 'low_impact']);
    expect(getSelectedProtocols()).toEqual(['seated', 'low_impact']);
  });

  it('deduplicates selected protocols', () => {
    const saved = saveSelectedProtocols(['seated', 'seated']);
    expect(saved).toEqual(['seated']);
  });

  it('returns empty when nothing saved', () => {
    expect(getSelectedProtocols()).toEqual([]);
  });

  it('every protocol has disclaimer and contraindications', () => {
    for (const protocol of getAllProtocols()) {
      expect(protocol.disclaimer.length).toBeGreaterThan(10);
      expect(protocol.contraindications.length).toBeGreaterThan(0);
    }
  });

  it('has a global PCD disclaimer', () => {
    expect(PCD_DISCLAIMER).toContain('profissionais');
  });
});
