import { describe, expect, it } from 'vitest';
import { classifyRpeLoad, shouldSuggestDayOff } from './recoveryModeService';

describe('recoveryModeService', () => {
  it('classifies load bands', () => {
    expect(classifyRpeLoad(60)).toBe('leve');
    expect(classifyRpeLoad(170)).toBe('alta');
    expect(shouldSuggestDayOff(170, 2)).toBe(true);
  });
});
