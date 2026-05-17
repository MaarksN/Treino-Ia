import { describe, it, expect } from 'vitest';
import { checkSpotifyIntegrationGuard } from '../../src/services/externalAiIntegrations/spotifyGuard';
import { checkRpeFacialGuard } from '../../src/services/externalAiIntegrations/rpeFacialGuard';
import { checkEquipmentReplanningGuard, validateSafeEquipmentPhotoUpload } from '../../src/services/externalAiIntegrations/equipmentReplanningGuard';
import { checkSmartPantryGuard, addIngredientLocally } from '../../src/services/externalAiIntegrations/smartPantryGuard';
import { checkLongevityProjectionGuard } from '../../src/services/externalAiIntegrations/longevityProjectionGuard';

describe('External AI Integration Guards (Items 56-60)', () => {
  it('Item 56: should have spotify integration guard blocking fake integration', () => {
    const result = checkSpotifyIntegrationGuard();
    expect(result.isConnected).toBe(false);
    expect(result.status).toBe('blocked_external_dependency');
  });

  it('Item 57: should have RPE facial guard blocking fake integration', () => {
    const result = checkRpeFacialGuard();
    expect(result.isSupported).toBe(false);
    expect(result.status).toBe('deferred_high_risk');
  });

  it('Item 58: should provide safe upload guard for equipment replanning', () => {
    const guard = checkEquipmentReplanningGuard();
    expect(guard.hasSafeUploadFlow).toBe(true);
    expect(guard.status).toBe('foundation_created');

    // File validation tests
    expect(validateSafeEquipmentPhotoUpload(1 * 1024 * 1024, 'image/jpeg')).toBe(true); // 1MB jpeg
    expect(validateSafeEquipmentPhotoUpload(6 * 1024 * 1024, 'image/png')).toBe(false); // 6MB png (too big)
    expect(validateSafeEquipmentPhotoUpload(2 * 1024 * 1024, 'application/pdf')).toBe(false); // pdf (wrong type)
  });

  it('Item 59: should allow local manual smart pantry but block IoT', () => {
    const result = checkSmartPantryGuard();
    expect(result.isIoTConnected).toBe(false);
    expect(result.canUseLocalModel).toBe(true);
    expect(result.status).toBe('foundation_created');

    const ingredients = addIngredientLocally('apple');
    expect(ingredients).toContain('apple');
  });

  it('Item 60: should provide longevity projection guard for consistency without claims', () => {
    const consistentResult = checkLongevityProjectionGuard(85);
    expect(consistentResult.hasConsistencyIndicator).toBe(true);
    expect(consistentResult.canShowFitnessAge).toBe(false);

    const inconsistentResult = checkLongevityProjectionGuard(50);
    expect(inconsistentResult.hasConsistencyIndicator).toBe(false);
  });
});
