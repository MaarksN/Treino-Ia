import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveHydrationEntry } from '../services/healthService';
import { hydrationStateQueryKey } from './useHydrationStateQuery';

export function useSaveHydrationEntryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveHydrationEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hydrationStateQueryKey });
    },
  });
}
