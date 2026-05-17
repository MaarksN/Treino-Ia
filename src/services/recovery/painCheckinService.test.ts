import { beforeEach, describe, expect, it } from 'vitest';
import {
  clampPainLevel,
  createEmptyPainMap,
  getPainCheckin,
  PAIN_REGIONS,
  sanitizePainMap,
  savePainCheckin,
} from './painCheckinService';

describe('painCheckinService', () => {
  beforeEach(() => localStorage.clear());

  describe('clampPainLevel', () => {
    it('clamps values above 10', () => {
      expect(clampPainLevel(11)).toBe(10);
      expect(clampPainLevel(999)).toBe(10);
    });

    it('clamps values below 0', () => {
      expect(clampPainLevel(-1)).toBe(0);
      expect(clampPainLevel(-999)).toBe(0);
    });

    it('rounds floating point values', () => {
      expect(clampPainLevel(3.7)).toBe(4);
      expect(clampPainLevel(5.2)).toBe(5);
    });

    it('handles non-numeric input', () => {
      expect(clampPainLevel('abc')).toBe(0);
      expect(clampPainLevel(null)).toBe(0);
      expect(clampPainLevel(undefined)).toBe(0);
      expect(clampPainLevel(NaN)).toBe(0);
      expect(clampPainLevel(Infinity)).toBe(0);
    });
  });

  describe('createEmptyPainMap', () => {
    it('creates map with all regions at 0', () => {
      const map = createEmptyPainMap();
      for (const region of PAIN_REGIONS) {
        expect(map[region]).toBe(0);
      }
    });
  });

  describe('sanitizePainMap', () => {
    it('sanitizes partial input', () => {
      const result = sanitizePainMap({ ombros: 7, costas: 15 });
      expect(result.ombros).toBe(7);
      expect(result.costas).toBe(10); // clamped
      expect(result.joelhos).toBe(0); // default
    });

    it('handles null input', () => {
      const result = sanitizePainMap(null);
      expect(result.ombros).toBe(0);
    });

    it('handles undefined input', () => {
      const result = sanitizePainMap(undefined);
      expect(result.ombros).toBe(0);
    });
  });

  describe('persistence', () => {
    it('persists record locally', () => {
      savePainCheckin({ pain: { ombros: 7 } as never });
      expect(getPainCheckin().pain.ombros).toBe(7);
    });

    it('persists notes trimmed and capped at 240 chars', () => {
      const longNote = 'x'.repeat(500);
      savePainCheckin({ notes: longNote, pain: {} as never });
      expect(getPainCheckin().notes.length).toBe(240);
    });

    it('returns empty record when nothing saved', () => {
      const record = getPainCheckin();
      expect(record.createdAt).toBe(0);
      expect(record.notes).toBe('');
      expect(record.pain.ombros).toBe(0);
    });

    it('handles corrupted localStorage gracefully', () => {
      localStorage.setItem('@TreinoIA:recovery:pain-checkin', 'not-json');
      const record = getPainCheckin();
      expect(record.createdAt).toBe(0);
    });
  });
});
