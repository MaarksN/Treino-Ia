import { describe, it, expect, vi } from 'vitest';
import { retroSoundService } from '../../src/pages/Dashboard/services/socialContent/retroSoundService';

describe('retroSoundService', () => {
  beforeEach(() => {
    // Mock window.AudioContext and window.webkitAudioContext
    class MockAudioContext {
      destination = {};
      currentTime = 0;
      createOscillator() {
        return {
          type: '',
          frequency: {
            setValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        };
      }
      createGain() {
        return {
          gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
          connect: vi.fn(),
        };
      }
    }

    // @ts-ignore
    window.AudioContext = MockAudioContext;
    // @ts-ignore
    window.webkitAudioContext = MockAudioContext;
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
