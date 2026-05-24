import { act, renderHook, waitFor } from '@testing-library/react';
import type { QueryClient } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadDailyCheckins } from '../services/healthService';
import { createQueryClientWrapper, createTestQueryClient } from '../test/queryClient';
import type { DailyCheckin } from '../types';
import { dailyCheckinsQueryKey, useDailyCheckinsQuery } from './useDailyCheckinsQuery';

vi.mock('../services/healthService', () => ({
  loadDailyCheckins: vi.fn(),
}));

type DailyCheckinsResult = Awaited<ReturnType<typeof loadDailyCheckins>>;

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

const dailyCheckin: DailyCheckin = {
  id: 'checkin-1',
  date: '2026-05-24',
  sleepHours: 7.5,
  sleepQuality: 4,
  stressLevel: 3,
  sorenessMap: { Pernas: 2 },
  energyLevel: 8,
  hydrationGlasses: 9,
  sleepGoalHours: 8,
  notes: 'Treino leve',
  timestamp: 1779600000000,
};

describe('useDailyCheckinsQuery', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('starts in a loading state and resolves mocked daily checkins into the query cache', async () => {
    const mockedResult: DailyCheckinsResult = {
      data: [dailyCheckin],
      dataMode: 'mock_dev_only',
      warning: 'mocked health storage',
    };
    const deferred = createDeferred<DailyCheckinsResult>();
    vi.mocked(loadDailyCheckins).mockReturnValue(deferred.promise);

    const { result } = renderHook(() => useDailyCheckinsQuery(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    expect(dailyCheckinsQueryKey).toEqual(['health', 'daily-checkins']);
    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe('fetching');
    expect(loadDailyCheckins).toHaveBeenCalledTimes(1);

    await act(async () => {
      deferred.resolve(mockedResult);
      await deferred.promise;
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockedResult);
    expect(queryClient.getQueryData(dailyCheckinsQueryKey)).toEqual(mockedResult);
  });

  it('exposes a mocked service error without retrying or falling through to real services', async () => {
    const error = new Error('health service unavailable');
    vi.mocked(loadDailyCheckins).mockRejectedValue(error);

    const { result } = renderHook(() => useDailyCheckinsQuery(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBe(error);
    expect(loadDailyCheckins).toHaveBeenCalledTimes(1);
  });
});
