import { useMemo } from 'react';
import { FeatureFlagKey } from '../config/featureFlags';
import { evaluateFlag } from '../services/flags/evaluate';
import { env } from '../config/env';

export function useFeatureFlag(flag: FeatureFlagKey, context?: { userId?: string }) {
  return useMemo(() => {
    return evaluateFlag(flag, {
      ...context,
      environment: env.isProduction ? 'production' : 'development',
    });
  }, [flag, context?.userId]);
}
