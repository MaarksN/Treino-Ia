import { useQuery } from '@tanstack/react-query';
import { DatabaseService } from '../services/database';
import { queryKeys } from './queryKeys';
import type { WorkoutSession } from '../services/database';

export function useWorkoutHistory(userId: string = 'local') {
  return useQuery<WorkoutSession[]>({
    queryKey: queryKeys.workoutHistory(userId),
    queryFn: async () => {
      return await DatabaseService.getWorkoutHistory();
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
