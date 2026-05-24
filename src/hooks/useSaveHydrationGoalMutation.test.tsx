import { act, renderHook, waitFor } from '@testing-library/react';
import type { QueryClient } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { saveHydrationGoal } from '../services/healthService';
import { createQueryClientWrapper, createTestQueryClient } from '../test/queryClient';
import type { HydrationGoal } from '../types';
import { hydrationStateQueryKey } from './useHydrationStateQuery';
import { useSaveHydrationGoalMutation } from './useSaveHydrationGoalMutation';

vi.mock('../services/healthService', () => ({
  saveHydrationGoal: vi.fn(),
}));

type SaveHydrationGoalResult = Awaited<ReturnType<typeof saveHydrationGoal>>;

const mockGoal: HydrationGoal = {
  dailyMl: 3000,
  remindEveryMinutes: 45,
};

describe('useSaveHydrationGoalMutation', () => {
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
    const savedResult: SaveHydrationGoalResult = {
      data: mockGoal,
      dataMode: 'mock_dev_only',
    };
    vi.mocked(saveHydrationGoal).mockResolvedValue(savedResult);
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useSaveHydrationGoalMutation(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync(mockGoal);
    });

    expect(saveHydrationGoal).toHaveBeenCalledTimes(1);
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: hydrationStateQueryKey });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('keeps error visible and does not invalidate on failure', async () => {
    const error = new Error('goal save failed');
    vi.mocked(saveHydrationGoal).mockRejectedValue(error);
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useSaveHydrationGoalMutation(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    let caughtError: unknown;
    await act(async () => {
      try {
        await result.current.mutateAsync(mockGoal);
      } catch (caught) {
        caughtError = caught;
      }
    });

    expect(caughtError).toBe(error);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateQueries).not.toHaveBeenCalled();
  });
});
