import { useQuery } from '@tanstack/react-query';
import { fetchGamificationState, ServerGamificationState } from '../services/gamificationService';
import { queryKeys } from './queryKeys';

export function useGamification(userId: string = 'local') {
  return useQuery<ServerGamificationState | null>({
    queryKey: queryKeys.gamification(userId),
    queryFn: async () => {
      try {
        return await fetchGamificationState();
      } catch {
        // Fallback or ignore error if not logged in
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: true,
  });
}
