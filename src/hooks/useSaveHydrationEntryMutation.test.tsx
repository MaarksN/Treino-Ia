import { act, renderHook, waitFor } from '@testing-library/react';
import type { QueryClient } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { saveHydrationEntry } from '../services/healthService';
import { createQueryClientWrapper, createTestQueryClient } from '../test/queryClient';
import type { HydrationEntry } from '../types';
import { hydrationStateQueryKey } from './useHydrationStateQuery';
import { useSaveHydrationEntryMutation } from './useSaveHydrationEntryMutation';

vi.mock('../services/healthService', () => ({
  saveHydrationEntry: vi.fn(),
}));

type SaveHydrationEntryResult = Awaited<ReturnType<typeof saveHydrationEntry>>;

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

const mockEntry: HydrationEntry = {
  id: 'hydro-1',
  date: '2026-05-24',
  time: '14:30',
  amountMl: 500,
  type: 'água'
};

describe('useSaveHydrationEntryMutation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Prevent query cache leakage
    queryClient.clear();
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('calls the mocked save service and invalidates hydration state on success', async () => {
    const savedResult: SaveHydrationEntryResult = {
      data: mockEntry,
      dataMode: 'mock_dev_only',
      warning: 'mocked health storage',
    };
    vi.mocked(saveHydrationEntry).mockResolvedValue(savedResult);
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useSaveHydrationEntryMutation(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    let mutationResult: SaveHydrationEntryResult | undefined;
    await act(async () => {
      mutationResult = await result.current.mutateAsync(mockEntry);
    });

    expect(saveHydrationEntry).toHaveBeenCalledTimes(1);
    expect(vi.mocked(saveHydrationEntry).mock.calls[0]?.[0]).toEqual(mockEntry);
    expect(mutationResult).toEqual(savedResult);
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: hydrationStateQueryKey });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('moves through pending state while unresolved', async () => {
    const savedResult: SaveHydrationEntryResult = {
      data: mockEntry,
      dataMode: 'mock_dev_only',
    };
    const deferred = createDeferred<SaveHydrationEntryResult>();
    vi.mocked(saveHydrationEntry).mockReturnValue(deferred.promise);

    const { result } = renderHook(() => useSaveHydrationEntryMutation(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    let mutationPromise: Promise<SaveHydrationEntryResult> | undefined;
    act(() => {
      mutationPromise = result.current.mutateAsync(mockEntry);
    });

    await waitFor(() => expect(saveHydrationEntry).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.isPending).toBe(true));

    await act(async () => {
      deferred.resolve(savedResult);
      await mutationPromise;
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(savedResult);
  });

  it('keeps error visible and does not invalidate on failure', async () => {
    const error = new Error('save failed');
    vi.mocked(saveHydrationEntry).mockRejectedValue(error);
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useSaveHydrationEntryMutation(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    let caughtError: unknown;
    await act(async () => {
      try {
        await result.current.mutateAsync(mockEntry);
      } catch (caught) {
        caughtError = caught;
      }
    });

    expect(caughtError).toBe(error);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
    expect(invalidateQueries).not.toHaveBeenCalled();
  });
});
