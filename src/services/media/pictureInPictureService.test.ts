import { beforeEach, describe, expect, it } from 'vitest';
import { getPipStatus, PIP_DISCLAIMER } from './pictureInPictureService';

describe('pictureInPictureService', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('detects when browser does not support PiP', () => {
    const status = getPipStatus();
    // jsdom doesn't support PiP
    expect(status.browserSupported).toBe(false);
    expect(status.availability).toBe('unsupported');
    expect(status.message).toContain('não suporta');
  });

  it('detects no real media when no video elements exist', () => {
    // Even if we could fake PiP support, no video = no_media
    expect(getPipStatus().hasRealMedia).toBe(false);
  });

  it('has a disclaimer explaining no fake players', () => {
    expect(PIP_DISCLAIMER.length).toBeGreaterThan(20);
    expect(PIP_DISCLAIMER).toContain('simulado');
  });
});
