import { useQuery } from '@tanstack/react-query';
import { DatabaseService } from '../services/database';
import { queryKeys } from './queryKeys';
import type { UserProfile } from '../services/database';

export function useUserProfile(userId: string = 'local') {
  return useQuery<UserProfile | null>({
    queryKey: queryKeys.userProfile(userId),
    queryFn: async () => {
      return await DatabaseService.getProfile();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  });
}
