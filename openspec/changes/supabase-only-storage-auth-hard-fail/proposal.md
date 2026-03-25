# Proposal: Supabase-Only Storage, Auth, and Runtime Hard-Fail

## Why

The application currently uses a dual-mode storage architecture (Supabase or localStorage), which increases branching complexity, test surface, and runtime ambiguity. This also allows write behavior to differ across environments and makes production behavior less deterministic.

The target product direction is now explicit:
- Domain data must be persisted only in Supabase
- Admin login must use real Supabase Auth with email/password
- Theme/language preference persistence in localStorage must remain
- The app must fail hard when Supabase is unavailable

## What Changes

- Remove localStorage fallback for tournament domain data (tournaments, players, matches)
- Remove runtime feature-flag style branching based on `isSupabaseConfigured` for domain persistence
- Implement Supabase Auth email/password login in the admin flow
- Update route protection to rely on Supabase session state, not `rpo_admin` localStorage flag
- Preserve localStorage usage for UI preferences only (theme and language)
- Introduce explicit fatal runtime behavior when Supabase env is missing or Supabase is unreachable
- Update tests and documentation to reflect Supabase-required architecture

## Capabilities

### New Capabilities
- `supabase-runtime-auth`: Deterministic Supabase-only runtime with email/password admin authentication and strict availability requirements

## Impact

- Affected runtime modules:
  - `src/lib/supabase.js`
  - `src/hooks/useAuth.tsx`
  - `src/App.jsx`
  - `src/pages/Login.jsx`
  - `src/contexts/TournamentContext.jsx`
  - `src/contexts/MatchesContext.jsx`
  - `src/hooks/usePlayers.js`
- Affected tests:
  - context, hooks, and auth tests that currently verify local fallback behavior
- Affected infrastructure:
  - Supabase migration(s) and policies for admin write authorization
- Affected docs:
  - README and architecture guidance that currently describe offline/local fallback for domain data
