import { beforeEach, describe, expect, it } from 'vitest';
import {
  EQUIPMENT_PHOTO_GUARD,
  generateAdaptation,
  getSelectedEquipment,
  sanitizeEquipmentId,
  saveSelectedEquipment,
} from './equipmentReplanService';

describe('equipmentReplanService', () => {
  beforeEach(() => localStorage.clear());

  it('sanitizes valid equipment ids', () => {
    expect(sanitizeEquipmentId('halteres')).toBe('halteres');
    expect(sanitizeEquipmentId('barra')).toBe('barra');
    expect(sanitizeEquipmentId('fake')).toBeNull();
    expect(sanitizeEquipmentId(42)).toBeNull();
  });

  it('saves and loads selected equipment', () => {
    const saved = saveSelectedEquipment(['halteres', 'barra', 'fake' as never]);
    expect(saved).toEqual(['halteres', 'barra']);
    expect(getSelectedEquipment()).toEqual(['halteres', 'barra']);
  });

  it('deduplicates equipment', () => {
    const saved = saveSelectedEquipment(['barra', 'barra']);
    expect(saved).toEqual(['barra']);
  });

  it('returns empty when nothing saved', () => {
    expect(getSelectedEquipment()).toEqual([]);
  });

  it('generates adaptation for selected equipment', () => {
    const result = generateAdaptation(['halteres', 'peso_corporal']);
    expect(result.equipment).toEqual(['halteres', 'peso_corporal']);
    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.disclaimer).toContain('educacionais');
  });

  it('handles empty equipment list', () => {
    const result = generateAdaptation([]);
    expect(result.suggestions[0]).toContain('Selecione');
  });

  it('has photo guard disclaimer', () => {
    expect(EQUIPMENT_PHOTO_GUARD).toContain('referência visual');
  });
});
