import { describe, expect, it } from 'vitest';
import {
  createRestTimerState,
  formatRestSeconds,
  getRestRemainingSeconds,
  parsePersistedRestTimerState,
  sanitizeRestDuration,
} from './restTimerEngine';

describe('restTimerEngine', () => {
  it('sanitizes rest duration correctly', () => {
    expect(sanitizeRestDuration(120)).toBe(120);
    expect(sanitizeRestDuration(0)).toBe(90);
    expect(sanitizeRestDuration(-10)).toBe(90);
    expect(sanitizeRestDuration(NaN)).toBe(90);
    expect(sanitizeRestDuration(10.5)).toBe(11); // Rounds
  });

  it('creates valid timer state', () => {
    const now = 1000000;
    const state = createRestTimerState(60, now);
    expect(state.startedAt).toBe(1000000);
    expect(state.duration).toBe(60);
    expect(state.endAt).toBe(1000000 + 60000);
  });

  it('parses valid persisted state', () => {
    const validJson = JSON.stringify({
      endAt: 1060000,
      duration: 60,
      startedAt: 1000000,
    });
    const parsed = parsePersistedRestTimerState(validJson);
    expect(parsed).toEqual({
      endAt: 1060000,
      duration: 60,
      startedAt: 1000000,
    });
  });

  it('returns null for invalid persisted state', () => {
    expect(parsePersistedRestTimerState(null)).toBeNull();
    expect(parsePersistedRestTimerState('')).toBeNull();
    expect(parsePersistedRestTimerState('invalid json')).toBeNull();
    expect(parsePersistedRestTimerState(JSON.stringify({ endAt: 100, startedAt: 200, duration: 60 }))).toBeNull(); // endAt <= startedAt
    expect(parsePersistedRestTimerState(JSON.stringify({ endAt: 200, startedAt: 100, duration: -10 }))).toBeNull(); // duration <= 0
  });

  it('calculates remaining seconds', () => {
    const state = {
      endAt: 1060000,
      duration: 60,
      startedAt: 1000000,
    };
    expect(getRestRemainingSeconds(state, 1000000)).toBe(60);
    expect(getRestRemainingSeconds(state, 1030000)).toBe(30);
    expect(getRestRemainingSeconds(state, 1060000)).toBe(0);
    expect(getRestRemainingSeconds(state, 1070000)).toBe(0); // Cannot be negative
  });

  it('formats seconds to mm:ss', () => {
    expect(formatRestSeconds(90)).toBe('1:30');
    expect(formatRestSeconds(60)).toBe('1:00');
    expect(formatRestSeconds(45)).toBe('0:45');
    expect(formatRestSeconds(0)).toBe('0:00');
    expect(formatRestSeconds(-10)).toBe('0:00');
    expect(formatRestSeconds(NaN)).toBe('0:00');
  });
});
