import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { REST_TIMER_STORAGE_KEY } from '../services/restTimerEngine';
import { useRestTimer } from './useRestTimer';

describe('useRestTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-25T12:00:00.000Z'));
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('starts a rest timer, persists it, ticks down and expires cleanly', () => {
    const { result } = renderHook(() => useRestTimer(90));

    act(() => {
      result.current.startRest(2);
    });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.remainingSeconds).toBe(2);
    expect(result.current.formatted).toBe('0:02');
    expect(JSON.parse(localStorage.getItem(REST_TIMER_STORAGE_KEY) ?? '{}')).toMatchObject({
      duration: 2,
      startedAt: Date.parse('2026-05-25T12:00:00.000Z'),
      endAt: Date.parse('2026-05-25T12:00:02.000Z'),
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.remainingSeconds).toBe(1);
    expect(result.current.formatted).toBe('0:01');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.isExpired).toBe(true);
    expect(result.current.remainingSeconds).toBe(0);
    expect(localStorage.getItem(REST_TIMER_STORAGE_KEY)).toBeNull();
  });

  it('restores a valid persisted timer on mount', () => {
    localStorage.setItem(REST_TIMER_STORAGE_KEY, JSON.stringify({
      duration: 30,
      startedAt: Date.parse('2026-05-25T11:59:45.000Z'),
      endAt: Date.parse('2026-05-25T12:00:15.000Z'),
    }));

    const { result } = renderHook(() => useRestTimer(90));

    expect(result.current.isRunning).toBe(true);
    expect(result.current.remainingSeconds).toBe(15);
    expect(result.current.formatted).toBe('0:15');
  });

  it('removes invalid persisted state and supports stop/reset actions', () => {
    localStorage.setItem(REST_TIMER_STORAGE_KEY, 'not-json');

    const { result } = renderHook(() => useRestTimer(45));

    expect(result.current.isRunning).toBe(false);
    expect(localStorage.getItem(REST_TIMER_STORAGE_KEY)).toBeNull();

    act(() => {
      result.current.resetRest();
    });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.remainingSeconds).toBe(45);
    expect(JSON.parse(localStorage.getItem(REST_TIMER_STORAGE_KEY) ?? '{}')).toMatchObject({
      duration: 45,
    });

    act(() => {
      result.current.stopRest();
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.isExpired).toBe(false);
    expect(result.current.remainingSeconds).toBe(0);
    expect(localStorage.getItem(REST_TIMER_STORAGE_KEY)).toBeNull();
  });
});
