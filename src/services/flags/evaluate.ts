import { FeatureFlagKey, isFeatureEnabled as getLocalFlag } from '../../config/featureFlags';

export function evaluateFlag(
  flag: FeatureFlagKey,
  context?: { userId?: string; environment?: string },
): boolean {
  // Em um cenário real, poderíamos chamar uma API se houvesse backend.
  // Por enquanto, resolvemos localmente com base no fallback.
  const localValue = getLocalFlag(flag);

  // Kill switch manual para production
  if (context?.environment === 'production' && flag === 'typed_router') {
    return false;
  }

  return localValue;
}
