import { act, renderHook, waitFor } from '@testing-library/react';
import type { QueryClient } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { saveDailyCheckin } from '../services/healthService';
import { createDeferred } from '../test/deferred';
import { mockDailyCheckin } from '../test/healthFixtures';
import { createQueryClientWrapper, createTestQueryClient } from '../test/queryClient';
import { dailyCheckinsQueryKey } from './useDailyCheckinsQuery';
import { useSaveDailyCheckinMutation } from './useSaveDailyCheckinMutation';

vi.mock('../services/healthService', () => ({
  loadDailyCheckins: vi.fn(),
  saveDailyCheckin: vi.fn(),
}));

type SaveDailyCheckinResult = Awaited<ReturnType<typeof saveDailyCheckin>>;

describe('useSaveDailyCheckinMutation', () => {
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

  it('calls the mocked save service with the payload and invalidates daily checkins on success', async () => {
    const savedResult: SaveDailyCheckinResult = {
      data: mockDailyCheckin,
      dataMode: 'mock_dev_only',
      warning: 'mocked health storage',
    };
    vi.mocked(saveDailyCheckin).mockResolvedValue(savedResult);
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useSaveDailyCheckinMutation(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    let mutationResult: SaveDailyCheckinResult | undefined;
    await act(async () => {
      mutationResult = await result.current.mutateAsync(mockDailyCheckin);
    });

    expect(saveDailyCheckin).toHaveBeenCalledTimes(1);
    expect(vi.mocked(saveDailyCheckin).mock.calls[0]?.[0]).toEqual(mockDailyCheckin);
    expect(mutationResult).toEqual(savedResult);
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: dailyCheckinsQueryKey });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isSuccess).toBe(true);
  });

  it('moves through pending state while the mocked save service is unresolved', async () => {
    const savedResult: SaveDailyCheckinResult = {
      data: mockDailyCheckin,
      dataMode: 'mock_dev_only',
    };
    const deferred = createDeferred<SaveDailyCheckinResult>();
    vi.mocked(saveDailyCheckin).mockReturnValue(deferred.promise);

    const { result } = renderHook(() => useSaveDailyCheckinMutation(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    let mutationPromise: Promise<SaveDailyCheckinResult> | undefined;
    act(() => {
      mutationPromise = result.current.mutateAsync(mockDailyCheckin);
    });

    await waitFor(() => expect(saveDailyCheckin).toHaveBeenCalledTimes(1));
    expect(vi.mocked(saveDailyCheckin).mock.calls[0]?.[0]).toEqual(mockDailyCheckin);
    await waitFor(() => expect(result.current.isPending).toBe(true));

    await act(async () => {
      deferred.resolve(savedResult);
      await mutationPromise;
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(savedResult);
  });

  it('keeps the original error visible and does not invalidate daily checkins on failure', async () => {
    const error = new Error('save failed');
    vi.mocked(saveDailyCheckin).mockRejectedValue(error);
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useSaveDailyCheckinMutation(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    let caughtError: unknown;
    await act(async () => {
      try {
        await result.current.mutateAsync(mockDailyCheckin);
      } catch (caught) {
        caughtError = caught;
      }
    });

    expect(caughtError).toBe(error);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(error);
    expect(invalidateQueries).not.toHaveBeenCalled();
  });
});
