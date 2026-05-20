# Tenancy Decision Needed

## Current State
The project currently assumes a single-user SaaS model. Most tables (e.g., `billing_subscriptions`, `gamification_profiles`) use a direct `user_id uuid primary key references auth.users(id)`.

## Risks of current model for B2B
If B2B features (like white-labeling, coaching groups, or enterprise deployments) are required, the current schema is risky. There is no concept of a "workspace" or "tenant". This means all users exist in a single global scope. It is difficult to isolate data per customer organization or manage permissions efficiently for B2B2C structures (e.g., a gym managing its students).

## Pending Decision
**Single-User SaaS vs B2B / B2B2C**
The product team must decide if the platform will remain strictly B2C (Direct to Consumer) or if it requires multi-tenant isolation for B2B/B2B2C use cases.

## Impact by Area
* **Billing:** B2B requires organization-level billing rather than per-user.
* **Audit:** Audit logs need tenant context.
* **Webhooks:** Need routing per tenant.
* **Jobs/Workers:** Background processing must be tenant-aware.
* **Health/Nutrition/Retention:** Metrics and dashboards need aggregation per workspace for coaches/admins.
* **Social:** Content may need to be isolated to a tenant's specific community rather than a global feed.

**Conclusion:** Multi-tenancy will not be implemented in this sprint, but the decision is critical before finalizing the data model.
