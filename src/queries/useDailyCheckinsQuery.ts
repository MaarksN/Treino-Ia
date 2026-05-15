import { useQuery } from '@tanstack/react-query';
import { loadDailyCheckins } from '../services/healthService';

export function useDailyCheckinsQuery(userId: string | null | undefined) {
  return useQuery({
    queryKey: ['daily-checkins', userId],
    enabled: Boolean(userId),
    queryFn: () => loadDailyCheckins(),
  });
}
