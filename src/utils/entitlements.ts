import { BillingTier } from '../types/billing';
import { BILLING_PLANS } from '../config/plans';

export function getEntitlementsForTier(tier: BillingTier): string[] {
  const selectedIndex = BILLING_PLANS.findIndex(plan => plan.id === tier);
  const unlocked = BILLING_PLANS.slice(0, Math.max(1, selectedIndex + 1));
  return Array.from(new Set(unlocked.flatMap(plan => plan.entitlements)));
}

export function canAccessEntitlement(tier: BillingTier, entitlement: string) {
  return getEntitlementsForTier(tier).includes(entitlement);
}

export function getPlanLimit(tier: BillingTier) {
  return BILLING_PLANS.find(plan => plan.id === tier)?.planLimit ?? 2;
}
