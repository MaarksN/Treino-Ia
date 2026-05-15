import { useQuery } from '@tanstack/react-query';
import { loadDailyCheckins } from '../services/healthService';

export const dailyCheckinsQueryKey = ['health', 'daily-checkins'] as const;
export type DailyCheckinsQueryResult = Awaited<ReturnType<typeof loadDailyCheckins>>;

export function useDailyCheckinsQuery() {
  return useQuery({
    queryKey: dailyCheckinsQueryKey,
    queryFn: loadDailyCheckins,
  });
}
