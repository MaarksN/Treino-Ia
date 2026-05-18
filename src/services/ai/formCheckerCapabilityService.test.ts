import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  FORM_CHECKER_DISCLAIMER,
  getFormCheckerCapabilities,
  getFormCheckerStatus,
  hasCameraSupport,
  hasMediaPipeEngine,
} from './formCheckerCapabilityService';

describe('formCheckerCapabilityService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('detects camera absence', () => {
    vi.stubGlobal('navigator', {});
    expect(hasCameraSupport()).toBe(false);
  });

  it('detects camera support when getUserMedia exists', () => {
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn() },
    });

    expect(hasCameraSupport()).toBe(true);
  });

  it('reports MediaPipe engine as absent', () => {
    expect(hasMediaPipeEngine()).toBe(false);
  });

  it('detects MediaPipe engine only when a real runtime hook is present', () => {
    vi.stubGlobal('__TREINO_IA_MEDIAPIPE_FORM_ENGINE__', { version: 'test-runtime' });

    expect(hasMediaPipeEngine()).toBe(true);
  });

  it('returns 4 capability checks', () => {
    const caps = getFormCheckerCapabilities();
    expect(caps).toHaveLength(4);
    expect(caps.map(c => c.id)).toEqual(['camera', 'camera_permission', 'mediapipe', 'processing']);
  });

  it('marks MediaPipe as unavailable', () => {
    const caps = getFormCheckerCapabilities();
    const mp = caps.find(c => c.id === 'mediapipe');
    expect(mp?.status).toBe('unavailable');
  });

  it('returns canAnalyze=false without engine', () => {
    const status = getFormCheckerStatus();
    expect(status.canAnalyze).toBe(false);
    expect(status.reason).toContain('indisponível');
  });

  it('has a disclaimer about no real analysis', () => {
    expect(FORM_CHECKER_DISCLAIMER).toContain('Não substitui');
    expect(FORM_CHECKER_DISCLAIMER.length).toBeGreaterThan(20);
  });
});
