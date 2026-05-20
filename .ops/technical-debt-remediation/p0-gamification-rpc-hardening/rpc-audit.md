# Gamification RPC Audit
## Audit Findings

File: `supabase/migrations/20260512000000_gamification.sql`

RPCs identified:
1. `apply_gamification_event`
2. `purchase_gamification_item`
3. `open_loot_box`

**Security issues observed in current definitions:**
- `security definer` is used.
- `search_path` is not explicitly set (`set search_path = public`).
- Execution is not explicitly revoked from `public`, `anon`, `authenticated`.
- Without `revoke execute`, these RPCs can be called directly by clients via Supabase's auto-generated REST API using PostgREST.
- Since they are `security definer` and lack `search_path`, they could be subject to search path hijacking attacks, and because they don't revoke public access, they allow any client to grant themselves arbitrary points or execute logic intended only for server-side processing.

**Action Plan for Migration:**
Create a new migration `20260515000000_gamification_rpc_hardening.sql` that alters these functions to:
1. Explicitly set `search_path = public` on the function.
2. `REVOKE EXECUTE ON FUNCTION <func> FROM public, anon, authenticated;`
3. `GRANT EXECUTE ON FUNCTION <func> TO service_role;`
