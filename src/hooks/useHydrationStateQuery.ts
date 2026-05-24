import { useQuery } from '@tanstack/react-query';
import { loadHydrationState } from '../services/healthService';

export const hydrationStateQueryKey = ['health', 'hydration-state'] as const;
export type HydrationStateQueryResult = Awaited<ReturnType<typeof loadHydrationState>>;

export function useHydrationStateQuery() {
  return useQuery({
    queryKey: hydrationStateQueryKey,
    queryFn: loadHydrationState,
  });
}
