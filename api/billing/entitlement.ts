import { getServerEntitlement } from '../_lib/billing-entitlements';
import { handleApiError, json } from '../_lib/http';
import { requireSupabaseUser } from '../_lib/server-supabase';
import { getEntitlementsForPlan } from '../_lib/billing';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') return json({ ok: true });
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  try {
    const user = await requireSupabaseUser(request);

    // Fallback if not configured properly
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
       return json({
         planId: 'free',
         billingStatus: 'free',
         isPremium: false,
         entitlements: getEntitlementsForPlan('free'),
         subscription: null,
         usage: {
           aiRequestsThisMonth: 0,
           exportsThisMonth: 0,
           prCount: 0,
           bestStreak: 0,
         },
         dataMode: 'not_configured'
       });
    }

    const entitlement = await getServerEntitlement(user.id);
    return json(entitlement);
  } catch (error) {
    if ((error as any).status === 500 && (error as any).message?.includes('not configured')) {
        return json({
           planId: 'free',
           billingStatus: 'free',
           isPremium: false,
           entitlements: getEntitlementsForPlan('free'),
           subscription: null,
           usage: {
             aiRequestsThisMonth: 0,
             exportsThisMonth: 0,
             prCount: 0,
             bestStreak: 0,
           },
           dataMode: 'not_configured'
        });
    }
    return handleApiError(error);
  }
}
