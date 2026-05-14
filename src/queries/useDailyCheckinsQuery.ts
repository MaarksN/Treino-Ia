import { useQuery } from '@tanstack/react-query';
import { loadDailyCheckins } from '../services/healthService';

export function useDailyCheckinsQuery(userId: string | null | undefined) {
  return useQuery({
    queryKey: ['daily-checkins', userId],
    enabled: Boolean(userId), // Only fetch if user is somewhat defined (auth handled in loadDailyCheckins, but user state presence implies auth state known)
    queryFn: () => loadDailyCheckins(),
  });
}
