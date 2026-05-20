# Gamification RPC Audit

## Files Audited
- `supabase/migrations/20260512000000_gamification.sql`
- `supabase/billing-gamification-schema.sql`
- `api/gamification/event.ts`

## Findings

1. `apply_gamification_event`
   - **Type**: `security definer`
   - **Revoke/Grant**: Missing `revoke execute on function ... from public, anon, authenticated;`
   - **Search Path**: Missing `set search_path = ''` or explicit safe schema binding.
   - **Sensitive Parameters**: Accepts `p_xp_delta`, `p_coin_delta`, and `p_source_id` directly, which could allow arbitrary XP/Coin granting if called from the client by an authenticated user.
   - **Expected Callers**: Only the backend API (`service_role`).

2. `purchase_gamification_item`
   - **Type**: `security definer`
   - **Revoke/Grant**: Missing `revoke execute ...`
   - **Search Path**: Missing `set search_path`.
   - **Sensitive Parameters**: Accepts `p_cost`, which should ideally be derived server-side or only callable securely.

3. `open_loot_box`
   - **Type**: `security definer`
   - **Revoke/Grant**: Missing `revoke execute ...`
   - **Search Path**: Missing `set search_path`.
   - **Sensitive Parameters**: Accepts `p_cost`.

## Conclusion
The RPCs lack proper PostgreSQL hardening (no `search_path`, no `revoke execute`). This means they are currently vulnerable to abuse by authenticated users directly calling them via the Supabase client.
