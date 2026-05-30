import { beforeEach, describe, expect, it } from 'vitest';
import {
  getProductFeaturesByStatus,
  isProductFeatureVisible,
  setProductFeatureAudience,
  setProductSurfaceOverride,
} from './featureFlags';

describe('product surface flags for private beta', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('keeps the core surface explicit', () => {
    expect(getProductFeaturesByStatus('core')).toEqual([
      'auth.login',
      'anamnesis',
      'trainingPlan',
      'todayWorkout',
      'activeWorkout',
      'setLogging',
      'history',
      'evolution',
      'aiRecommendation.simple',
      'billing',
    ]);
  });

  it('hides beta, internal and off surfaces from regular users by default', () => {
    expect(isProductFeatureVisible('nutrition.simple')).toBe(false);
    expect(isProductFeatureVisible('social')).toBe(false);
    expect(isProductFeatureVisible('cameraFormCheck')).toBe(false);
  });

  it('allows beta users to see beta surfaces but not internal/off surfaces', () => {
    setProductFeatureAudience('beta');

    expect(isProductFeatureVisible('nutrition.simple')).toBe(true);
    expect(isProductFeatureVisible('workoutImport.manual')).toBe(true);
    expect(isProductFeatureVisible('social')).toBe(false);
    expect(isProductFeatureVisible('webxr')).toBe(false);
  });

  it('allows internal users to see internal surfaces while off surfaces stay hidden', () => {
    setProductFeatureAudience('internal');

    expect(isProductFeatureVisible('gamification.advanced')).toBe(true);
    expect(isProductFeatureVisible('advancedAi')).toBe(true);
    expect(isProductFeatureVisible('partnerTokens')).toBe(false);
  });

  it('lets local overrides enable beta surfaces without enabling off surfaces', () => {
    setProductSurfaceOverride('recovery.simple', true);
    setProductSurfaceOverride('cameraFormCheck', true);

    expect(isProductFeatureVisible('recovery.simple')).toBe(true);
    expect(isProductFeatureVisible('cameraFormCheck')).toBe(false);
  });
});
