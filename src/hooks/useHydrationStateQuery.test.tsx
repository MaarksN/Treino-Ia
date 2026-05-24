import { act, renderHook, waitFor } from '@testing-library/react';
import type { QueryClient } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadHydrationState } from '../services/healthService';
import { createQueryClientWrapper, createTestQueryClient } from '../test/queryClient';
import { hydrationStateQueryKey, useHydrationStateQuery } from './useHydrationStateQuery';

vi.mock('../services/healthService', () => ({
  loadHydrationState: vi.fn(),
}));

type HydrationStateResult = Awaited<ReturnType<typeof loadHydrationState>>;

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

describe('useHydrationStateQuery', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Ensures no query cache leakage between tests
    queryClient.clear();
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('starts in a loading state and resolves mocked hydration state into the query cache', async () => {
    const mockedResult: HydrationStateResult = {
      data: {
        entries: [{ id: '1', date: '2026-05-24', time: '10:00', amountMl: 250, type: 'água' }],
        goal: { dailyMl: 2500, remindEveryMinutes: 60 }
      },
      dataMode: 'mock_dev_only',
      warning: 'mocked health storage',
    };
    const deferred = createDeferred<HydrationStateResult>();
    vi.mocked(loadHydrationState).mockReturnValue(deferred.promise);

    const { result } = renderHook(() => useHydrationStateQuery(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    expect(hydrationStateQueryKey).toEqual(['health', 'hydration-state']);
    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe('fetching');
    expect(loadHydrationState).toHaveBeenCalledTimes(1);

    await act(async () => {
      deferred.resolve(mockedResult);
      await deferred.promise;
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockedResult);
    expect(queryClient.getQueryData(hydrationStateQueryKey)).toEqual(mockedResult);
  });

  it('exposes a mocked service error without retrying', async () => {
    const error = new Error('health service unavailable');
    vi.mocked(loadHydrationState).mockRejectedValue(error);

    const { result } = renderHook(() => useHydrationStateQuery(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBe(error);
    expect(loadHydrationState).toHaveBeenCalledTimes(1);
  });
});
