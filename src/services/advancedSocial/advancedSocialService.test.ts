import { describe, it, expect } from 'vitest';
import {
  requestGeoGuildConsent,
  findFairRivalPlaceholder,
  generateReplayDataAbstraction,
  calculateLocalSkillTree,
  applySocialBlurPolicy
} from './advancedSocialService';

describe('Advanced Social Service', () => {
  it('Item 71 - valida consentimento de guilda por geolocalização', () => {
    expect(() => requestGeoGuildConsent({ userId: '1', agreedToLocationSharing: true })).toThrow('Localização é obrigatória se consentida.');
    const consent = requestGeoGuildConsent({ userId: '1', agreedToLocationSharing: true, latitude: 10, longitude: 20 });
    expect(consent.agreedToLocationSharing).toBe(true);
  });

  it('Item 72 - cria rival justo local', () => {
    const rival = findFairRivalPlaceholder('u1', 5);
    expect(rival.rivalLevel).toBe(5);
    expect(rival.rivalId).toBe('placeholder-rival-u1');
  });

  it('Item 73 - cria abstração de replay holográfico', () => {
    const replay = generateReplayDataAbstraction('w1', 'u1', 300);
    expect(replay.durationSeconds).toBe(300);
    expect(replay.trajectoryData).toHaveLength(2);
  });

  it('Item 74 - calcula skill-tree baseada em métricas', () => {
    const tree = calculateLocalSkillTree({ strength: 25, endurance: 15, mobility: 35 });
    expect(tree.find(t => t.id === 'str')?.currentLevel).toBe(2);
    expect(tree.find(t => t.id === 'end')?.currentLevel).toBe(1);
    expect(tree.find(t => t.id === 'mob')?.currentLevel).toBe(3);
  });

  it('Item 75 - aplica política de blur social', () => {
    expect(applySocialBlurPolicy('c1', true, 16).isBlurred).toBe(true);
    expect(applySocialBlurPolicy('c2', true, 20).isBlurred).toBe(false);
    expect(applySocialBlurPolicy('c3', false, 16).isBlurred).toBe(false);
  });
});
