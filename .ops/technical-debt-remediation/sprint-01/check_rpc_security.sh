#!/bin/bash

MIGRATION_FILE="supabase/migrations/20260514000000_harden_gamification_rpcs.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
  echo "Error: Hardening migration file not found!"
fi

FAIL=0

check_hardening() {
    func_name=$1
    echo "Checking $func_name..."

    # Extract the function block and look for SET search_path
    if ! awk "/CREATE OR REPLACE FUNCTION $func_name/,/AS \\$\\$/" "$MIGRATION_FILE" | grep -i "SET search_path" > /dev/null; then
        echo "FAIL: $func_name is missing SET search_path"
        FAIL=1
    fi

    if ! grep -i "REVOKE EXECUTE ON FUNCTION $func_name" "$MIGRATION_FILE" > /dev/null; then
        echo "FAIL: $func_name is missing REVOKE EXECUTE"
        FAIL=1
    fi
}

check_hardening "apply_gamification_event"
check_hardening "purchase_gamification_item"
check_hardening "open_loot_box"

if [ $FAIL -eq 0 ]; then
    echo "PASS: All checked RPCs are hardened."
else
    echo "FAIL: RPC hardening checks failed."
fi
