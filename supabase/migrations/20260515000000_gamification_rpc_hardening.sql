-- Harden Gamification RPCs
-- Adds search_path and revokes public execution to prevent unauthorized gamification abuse

-- 1. apply_gamification_event
ALTER FUNCTION public.apply_gamification_event(uuid, text, text, int, int, jsonb) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.apply_gamification_event(uuid, text, text, int, int, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_gamification_event(uuid, text, text, int, int, jsonb) TO service_role;

-- 2. purchase_gamification_item
ALTER FUNCTION public.purchase_gamification_item(uuid, text, int) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.purchase_gamification_item(uuid, text, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purchase_gamification_item(uuid, text, int) TO service_role;

-- 3. open_loot_box
ALTER FUNCTION public.open_loot_box(uuid, int) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.open_loot_box(uuid, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.open_loot_box(uuid, int) TO service_role;
