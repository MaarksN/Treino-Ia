import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveDailyCheckin } from '../services/healthService';

export function useSaveDailyCheckinMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveDailyCheckin,
    onSuccess: (data, variables) => {
      // Invalidate the checkins query to refetch the fresh data
      queryClient.invalidateQueries({ queryKey: ['daily-checkins'] });
    },
  });
}
