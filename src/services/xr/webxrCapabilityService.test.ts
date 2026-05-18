import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  checkImmersiveArSupport,
  getWebXRCapabilitySync,
  isWebXRApiPresent,
  WEBXR_DISCLAIMER,
} from './webxrCapabilityService';

describe('webxrCapabilityService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('detects WebXR API absence in jsdom', () => {
    expect(isWebXRApiPresent()).toBe(false);
  });

  it('returns sync capability status', () => {
    const status = getWebXRCapabilitySync();
    expect(status.apiPresent).toBe(false);
    expect(status.immersiveArSupported).toBe('unsupported');
    expect(status.reason).toContain('não disponível');
  });

  it('detects WebXR API presence when navigator.xr is available', async () => {
    vi.stubGlobal('navigator', {
      xr: { isSessionSupported: vi.fn().mockResolvedValue(true) },
    });

    expect(isWebXRApiPresent()).toBe(true);
    await expect(checkImmersiveArSupport()).resolves.toBe('supported');
  });

  it('returns unknown when immersive-ar support check rejects', async () => {
    vi.stubGlobal('navigator', {
      xr: { isSessionSupported: vi.fn().mockRejectedValue(new Error('blocked')) },
    });

    await expect(checkImmersiveArSupport()).resolves.toBe('unknown');
  });

  it('has disclaimer about experimental tech', () => {
    expect(WEBXR_DISCLAIMER).toContain('experimental');
    expect(WEBXR_DISCLAIMER).toContain('consentimento');
  });
});
