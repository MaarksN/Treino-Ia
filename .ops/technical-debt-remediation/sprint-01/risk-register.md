# Risk Register - Sprint 01

1. **Schema Source of Truth:** 59 tables and 3 RPCs are missing from official versioned migrations. The risk of schema drift or inability to reproduce the production environment is CRITICAL.
2. **Missing Dependencies:** During testing, we had to `npm install` because dependencies were missing. This indicates a potential issue with CI/CD or environment consistency.
3. **Missing Policies/RLS:** While RPCs were hardened, we did not verify RLS policies for all the missing tables. If these tables exist in production without RLS, it's a massive security hole.
4. **Tenancy:** If B2B is required, significant refactoring will be needed for almost every domain.
