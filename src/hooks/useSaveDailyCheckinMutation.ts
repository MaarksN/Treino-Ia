import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveDailyCheckin } from '../services/healthService';
import { dailyCheckinsQueryKey } from './useDailyCheckinsQuery';

export function useSaveDailyCheckinMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveDailyCheckin,
    onSuccess: () => {
      // Invalidate the query to fetch the updated data
      queryClient.invalidateQueries({ queryKey: dailyCheckinsQueryKey });
    },
  });
}
