## Migration Summary

**File Created:** `supabase/migrations/20260515000000_gamification_rpc_hardening.sql`

**RPCs Protected:**
1. `apply_gamification_event`
2. `purchase_gamification_item`
3. `open_loot_box`

**Actions Applied for Each RPC:**
- `SET search_path = public`: Prevents search path hijacking in `security definer` execution.
- `REVOKE EXECUTE ... FROM PUBLIC, anon, authenticated`: Removes the ability for external clients (web/mobile) to execute these functions directly via PostgREST/Supabase Data APIs, enforcing that gamification logic must only be triggered explicitly by the trusted backend.
- `GRANT EXECUTE ... TO service_role`: Retains the ability for the trusted backend (using `getSupabaseAdmin()`) to execute the gamification logic.
