# Frontend State and Data Architecture

This document describes the architectural standard for managing state and data in the React frontend application.

## Overview

We distinguish between two types of state:
1.  **Global UI / Domain State:** Handled by **Zustand**.
2.  **Server / Remote Data State:** Handled by **TanStack Query (React Query)**.

## 1. Zustand (Global UI / Local Domain State)

**Path:** `src/stores/`

Use Zustand for state that lives entirely on the client, is synchronous, or represents temporary UI interactions across different components.

**What goes in Zustand:**
*   Current view/route (if not using React Router).
*   Theme preferences (dark mode).
*   Language.
*   Sidebar/Modal/Onboarding open/close states.
*   Draft forms or local non-persisted application flow state.

**Example:** `src/stores/appViewStore.ts`

## 2. TanStack Query (Server State)

**Path:** `src/queries/`

Use TanStack Query to manage asynchronous operations, data fetching, caching, synchronization, and updating server state.

**What goes in Queries:**
*   Fetching data from Supabase (e.g., user profiles, daily check-ins, history).
*   Mutations (saving check-ins, creating workouts).
*   Invalidating cache after a mutation to automatically refetch.

**Example:**
*   `useDailyCheckinsQuery.ts` (Fetching)
*   `useSaveDailyCheckinMutation.ts` (Mutating)

## 3. Actions / Use Cases

**Path:** `src/actions/` or `src/use-cases/`

Actions or Use Cases are responsible for orchestrating complex business logic flows that might involve calling multiple services, updating local stores, and triggering queries. They encapsulate the "what happens when a user clicks this button" logic.

## 4. Services

**Path:** `src/services/`

Services are low-level modules responsible for I/O operations. They should be agnostic of React hooks or global state.

**What goes in Services:**
*   Supabase client calls (`supabase.from(...)`).
*   External API calls (AI, Storage).
*   Local device APIs (Capacitor plugins).
*   Mock/dev fallbacks.

## Migration Rules for Future Phases

1.  **Do not use `useEffect` for data fetching.** Create a TanStack Query hook instead.
2.  **Do not put server data into Zustand.** Let TanStack Query manage the cache.
3.  **Refactor incrementally.** Move state and queries out of `App.tsx` into their respective domains bit by bit.
