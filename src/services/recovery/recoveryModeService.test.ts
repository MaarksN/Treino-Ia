import { describe, expect, it } from 'vitest';
import { buildRecoveryRecommendations } from './recoveryModeService';

describe('recoveryModeService', () => {
  it('returns baseline and sleep guidance', () => {
    const tips = buildRecoveryRecommendations({ history: [], pain: { createdAt: 0, notes: '', pain: { ombros:0,costas:0,joelhos:0,quadril:0,cotovelos:0,punhos:0,tornozelos:0 } }, caffeine: [], sleepCorrelation: -0.5 });
    expect(tips.length).toBeGreaterThan(3);
    expect(tips.join(' ')).toContain('Sono');
  });
});
