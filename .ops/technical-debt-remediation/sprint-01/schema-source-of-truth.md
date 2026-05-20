# Schema Source of Truth Decision

## Overview
We audited the following SQL schema definitions:
1. `supabase/migrations/20260511120000_platform_blocks_11_20_core.sql`
2. `supabase/migrations/20260512000000_gamification.sql`
3. `supabase/billing-gamification-schema.sql`
4. `supabase/social-schema.sql`

## Findings
The `supabase/migrations/` directory is currently incomplete compared to the usage in the `src/` and `api/` directories.
The standalone files `billing-gamification-schema.sql` and `social-schema.sql` contain the actual `CREATE TABLE` and `CREATE FUNCTION` statements that define tables like `billing_subscriptions`, `stripe_webhook_events`, `social_profiles`, etc.

The `schema-inventory.md` report shows 59 tables missing from official versioned migrations. The vast majority of these missing tables are defined in the standalone files or simply not defined anywhere in the repository (mocked schema or relying on uncommitted schema definitions).

## Decisions
1. **Source of Truth:** The `supabase/migrations/` directory MUST be the single official source of truth. All database definitions must exist as versioned, ordered migration files.
2. **Standalone Files:** The standalone SQL files (`billing-gamification-schema.sql` and `social-schema.sql`) should be treated as **legacy reference** and eventually deprecated/deleted once their contents are fully incorporated into the migration sequence.
3. **Future Work:** A comprehensive migration script must be created in a future sprint to properly consolidate all legacy definitions into the migration folder (creating a base snapshot schema or a series of migrations catching up the state).
