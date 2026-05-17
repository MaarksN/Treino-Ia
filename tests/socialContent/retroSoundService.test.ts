import { describe, it, expect, vi } from 'vitest';
import { retroSoundService } from '../../src/pages/Dashboard/services/socialContent/retroSoundService';

describe('retroSoundService', () => {
  it('initializes as muted', () => {
    expect(retroSoundService.getMuted()).toBe(true);
  });

  it('toggles mute state correctly', () => {
    retroSoundService.setMuted(true);
    expect(retroSoundService.toggleMute()).toBe(false);
    expect(retroSoundService.toggleMute()).toBe(true);
  });

  it('does not crash when playing beep', () => {
    retroSoundService.setMuted(false);
    expect(() => retroSoundService.playBeep()).not.toThrow();
  });
});
