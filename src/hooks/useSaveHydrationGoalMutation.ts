import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveHydrationGoal } from '../services/healthService';
import { hydrationStateQueryKey } from './useHydrationStateQuery';

export function useSaveHydrationGoalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveHydrationGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hydrationStateQueryKey });
    },
  });
}
