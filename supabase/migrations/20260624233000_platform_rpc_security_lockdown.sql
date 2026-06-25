-- SECURITY HARDENING: Lockdown SECURITY DEFINER functions
-- This migration ensures that all critical RPC functions have restricted search paths and revoked public execution rights.

DO $$
DECLARE
    func_name TEXT;
BEGIN
    -- Iterate over SECURITY DEFINER functions in public schema
    FOR func_name IN
        SELECT routine_name
        FROM information_schema.routines
        WHERE routine_schema = 'public'
          AND routine_type = 'FUNCTION'
          AND routine_name IN ('deduct_balance', 'award_xp', 'process_purchase', 'claim_streak_freeze')
    LOOP
        -- 1. Set explicit search_path = public to prevent path hijacking
        EXECUTE format('ALTER FUNCTION public.%I() SET search_path = public', func_name);

        -- 2. Revoke execute from PUBLIC and anonymous users
        EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I() FROM PUBLIC', func_name);
        EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I() FROM anon', func_name);

        -- 3. Grant execute strictly to authenticated users (or service_role if needed)
        EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I() TO authenticated', func_name);
    END LOOP;
END $$;
