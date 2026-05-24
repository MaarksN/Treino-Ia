import { useQuery } from '@tanstack/react-query';
import { DatabaseService } from '../services/database';
import { queryKeys } from './queryKeys';
import type { TrainingPlan } from '../services/database';

export function useWorkoutPlan(userId: string = 'local') {
  return useQuery<TrainingPlan | null>({
    queryKey: queryKeys.workoutPlan(userId),
    queryFn: async () => {
      // In a real app with userId, we'd pass it or the service would use it implicitly
      return await DatabaseService.getCurrentPlan();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
}
