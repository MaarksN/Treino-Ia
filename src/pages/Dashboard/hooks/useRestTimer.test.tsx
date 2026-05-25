import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { REST_TIMER_STORAGE_KEY } from '../services/restTimerEngine';
import { useRestTimer } from './useRestTimer';

const now = new Date('2026-05-25T12:00:00.000Z');

describe('useRestTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('starts, persists and expires a rest timer using fake timers', () => {
    const { result } = renderHook(() => useRestTimer(30));

    act(() => {
      result.current.startRest(45);
    });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.remainingSeconds).toBe(45);
    expect(result.current.formatted).toBe('0:45');
    expect(JSON.parse(localStorage.getItem(REST_TIMER_STORAGE_KEY) ?? '{}')).toMatchObject({
      duration: 45,
      startedAt: now.getTime(),
      endAt: now.getTime() + 45_000,
    });

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(result.current.remainingSeconds).toBe(44);
    expect(result.current.formatted).toBe('0:44');

    act(() => {
      vi.advanceTimersByTime(44_000);
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.isExpired).toBe(true);
    expect(result.current.remainingSeconds).toBe(0);
    expect(localStorage.getItem(REST_TIMER_STORAGE_KEY)).toBeNull();
  });

  it('hydrates a running timer from localStorage on mount', () => {
    localStorage.setItem(
      REST_TIMER_STORAGE_KEY,
      JSON.stringify({
        duration: 20,
        startedAt: now.getTime() - 10_000,
        endAt: now.getTime() + 10_000,
      }),
    );

    const { result } = renderHook(() => useRestTimer(30));

    expect(result.current.isRunning).toBe(true);
    expect(result.current.remainingSeconds).toBe(10);
    expect(result.current.formatted).toBe('0:10');
  });

  it('removes invalid persisted timer state and remains idle', () => {
    localStorage.setItem(
      REST_TIMER_STORAGE_KEY,
      JSON.stringify({
        duration: -20,
        startedAt: now.getTime(),
        endAt: now.getTime() - 1,
      }),
    );

    const { result } = renderHook(() => useRestTimer(30));

    expect(result.current.isRunning).toBe(false);
    expect(result.current.isExpired).toBe(false);
    expect(result.current.remainingSeconds).toBe(0);
    expect(result.current.formatted).toBe('0:00');
    expect(localStorage.getItem(REST_TIMER_STORAGE_KEY)).toBeNull();
  });

  it('resets to the default duration and stop clears storage', () => {
    const { result } = renderHook(() => useRestTimer(75));

    act(() => {
      result.current.startRest(15);
      result.current.resetRest();
    });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.remainingSeconds).toBe(75);
    expect(result.current.formatted).toBe('1:15');

    act(() => {
      result.current.stopRest();
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.isExpired).toBe(false);
    expect(result.current.remainingSeconds).toBe(0);
    expect(localStorage.getItem(REST_TIMER_STORAGE_KEY)).toBeNull();
  });
});
