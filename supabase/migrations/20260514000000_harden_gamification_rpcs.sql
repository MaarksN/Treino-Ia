-- Harden Gamification RPCs

-- 1. apply_gamification_event
CREATE OR REPLACE FUNCTION apply_gamification_event(
  p_user_id uuid,
  p_event_type text,
  p_source_id text,
  p_xp_delta int,
  p_coin_delta int,
  p_metadata jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile record;
  v_new_level int;
  v_ledger_id uuid;
BEGIN
  -- Reusing existing logic but securing the function wrapper
  -- 1. Ensure profile exists and lock it
  SELECT * INTO v_profile FROM gamification_profiles WHERE user_id = p_user_id FOR UPDATE;

  IF v_profile IS NULL THEN
    INSERT INTO gamification_profiles (user_id, xp, level, coins)
    VALUES (p_user_id, 0, 1, 0)
    RETURNING * INTO v_profile;
  END IF;

  -- 2. Insert into ledger
  INSERT INTO gamification_ledger (user_id, event_type, source_id, xp_delta, coin_delta, metadata)
  VALUES (p_user_id, p_event_type, p_source_id, p_xp_delta, p_coin_delta, p_metadata)
  RETURNING id INTO v_ledger_id;

  -- 3. Update profile totals
  UPDATE gamification_profiles
  SET
    xp = xp + p_xp_delta,
    coins = coins + p_coin_delta,
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING * INTO v_profile;

  -- 4. Simple level up logic (every 1000 XP)
  v_new_level := (v_profile.xp / 1000) + 1;
  IF v_new_level > v_profile.level THEN
    UPDATE gamification_profiles
    SET level = v_new_level
    WHERE user_id = p_user_id
    RETURNING * INTO v_profile;
  END IF;

  RETURN row_to_json(v_profile);
END;
$$;

-- Revoke default execute from public
REVOKE EXECUTE ON FUNCTION apply_gamification_event(uuid, text, text, int, int, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION apply_gamification_event(uuid, text, text, int, int, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION apply_gamification_event(uuid, text, text, int, int, jsonb) FROM authenticated;

-- Grant to service_role only
GRANT EXECUTE ON FUNCTION apply_gamification_event(uuid, text, text, int, int, jsonb) TO service_role;


-- 2. purchase_gamification_item
CREATE OR REPLACE FUNCTION purchase_gamification_item(
  p_user_id uuid,
  p_item_id text,
  p_cost int
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile record;
  v_ledger_id uuid;
BEGIN
  SELECT * INTO v_profile FROM gamification_profiles WHERE user_id = p_user_id FOR UPDATE;

  IF v_profile IS NULL OR v_profile.coins < p_cost THEN
    RAISE EXCEPTION 'Insufficient coins';
  END IF;

  INSERT INTO gamification_ledger (user_id, event_type, source_id, xp_delta, coin_delta, metadata)
  VALUES (p_user_id, 'purchase', p_item_id, 0, -p_cost, jsonb_build_object('item_id', p_item_id))
  RETURNING id INTO v_ledger_id;

  UPDATE gamification_profiles
  SET coins = coins - p_cost, updated_at = now()
  WHERE user_id = p_user_id
  RETURNING * INTO v_profile;

  RETURN row_to_json(v_profile);
END;
$$;

REVOKE EXECUTE ON FUNCTION purchase_gamification_item(uuid, text, int) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION purchase_gamification_item(uuid, text, int) FROM anon;
REVOKE EXECUTE ON FUNCTION purchase_gamification_item(uuid, text, int) FROM authenticated;
GRANT EXECUTE ON FUNCTION purchase_gamification_item(uuid, text, int) TO service_role;


-- 3. open_loot_box
CREATE OR REPLACE FUNCTION open_loot_box(
  p_user_id uuid,
  p_cost int
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile record;
  v_ledger_id uuid;
  v_xp_reward int;
  v_coin_reward int;
BEGIN
  SELECT * INTO v_profile FROM gamification_profiles WHERE user_id = p_user_id FOR UPDATE;

  IF v_profile IS NULL OR v_profile.coins < p_cost THEN
    RAISE EXCEPTION 'Insufficient coins';
  END IF;

  -- Random rewards logic... (simple for now to preserve behavior)
  v_xp_reward := floor(random() * 500 + 50)::int;
  v_coin_reward := floor(random() * 100 + 10)::int;

  INSERT INTO gamification_ledger (user_id, event_type, source_id, xp_delta, coin_delta, metadata)
  VALUES (p_user_id, 'loot_box', gen_random_uuid()::text, v_xp_reward, -p_cost + v_coin_reward, jsonb_build_object('cost', p_cost, 'xp_reward', v_xp_reward, 'coin_reward', v_coin_reward))
  RETURNING id INTO v_ledger_id;

  UPDATE gamification_profiles
  SET
    xp = xp + v_xp_reward,
    coins = coins - p_cost + v_coin_reward,
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING * INTO v_profile;

  RETURN row_to_json(v_profile);
END;
$$;

REVOKE EXECUTE ON FUNCTION open_loot_box(uuid, int) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION open_loot_box(uuid, int) FROM anon;
REVOKE EXECUTE ON FUNCTION open_loot_box(uuid, int) FROM authenticated;
GRANT EXECUTE ON FUNCTION open_loot_box(uuid, int) TO service_role;
