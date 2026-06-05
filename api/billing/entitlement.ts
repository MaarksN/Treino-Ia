import {
  getFreeServerEntitlementFallback,
  getServerEntitlement,
  isBillingSupabaseConfigured,
} from '../_lib/billing-entitlements';
import { guardApiMethod, handleApiError, json } from '../_lib/http';
import { requireSupabaseUser } from '../_lib/server-supabase';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(request: Request) {
  const methodResponse = guardApiMethod(request, 'GET');
  if (methodResponse) return methodResponse;

  try {
    const user = await requireSupabaseUser(request);

    // Fallback if not configured properly
    if (!isBillingSupabaseConfigured()) {
      return json(getFreeServerEntitlementFallback(), 200, request);
    }

    const entitlement = await getServerEntitlement(user.id);
    return json(entitlement, 200, request);
  } catch (error) {
    if ((error as any).status === 500 && (error as any).message?.includes('not configured')) {
      return json(getFreeServerEntitlementFallback(), 200, request);
    }
    return handleApiError(error, request);
  }
}
