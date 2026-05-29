import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { retroSoundService } from '../../src/pages/Dashboard/services/socialContent/retroSoundService';

describe('retroSoundService', () => {
  beforeAll(() => {
    (global as any).AudioContext = vi.fn().mockImplementation(function() { return {
      createOscillator: vi.fn().mockReturnValue({
        type: 'sine',
        frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      }),
      createGain: vi.fn().mockReturnValue({
        gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
      }),
      destination: {},
      currentTime: 0,
      state: 'running',
      resume: vi.fn().mockResolvedValue(undefined),
    }; });
    (global as any).webkitAudioContext = (global as any).AudioContext;
  });

  afterAll(() => {
    delete (global as any).AudioContext;
    delete (global as any).webkitAudioContext;
  });

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
