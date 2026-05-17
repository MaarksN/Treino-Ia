import { describe, it, expect, vi } from 'vitest';
import { speakSafely } from './voiceCoach';

describe('voiceCoach', () => {
  it('should not throw if speechSynthesis is missing', () => {
    // Window is undefined or doesn't have speechSynthesis in minimal test environments
    expect(() => speakSafely({ text: 'Test' })).not.toThrow();
  });
});
