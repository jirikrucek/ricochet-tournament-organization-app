# Tasks: Supabase-Only Storage, Auth, and Runtime Hard-Fail

## 1. Schema and Policy Updates

- [x] 1.1 Add migration creating `admin_users` table linked to `auth.users`
- [x] 1.2 Update write RLS policies for `tournaments`, `players`, and `matches` to require admin allowlist membership
- [x] 1.3 Add local development seed/setup for at least one admin auth user and matching `admin_users` row

## 2. Auth Migration (Email/Password)

- [x] 2.1 Refactor `useAuth` to use Supabase Auth session lifecycle
- [x] 2.2 Replace local credential checks in login page with `signInWithPassword`
- [x] 2.3 Remove `rpo_admin` localStorage dependency from route guards and auth flow

## 3. Supabase-Only Domain Persistence

- [x] 3.1 Remove local fallback from `TournamentContext`
- [x] 3.2 Remove local fallback from `MatchesContext`
- [x] 3.3 Remove local fallback from `usePlayers`
- [x] 3.4 Remove `isSupabaseConfigured` branching where it controls domain fallback behavior

## 4. Hard-Fail Runtime Behavior

- [x] 4.1 Add mandatory env validation for Supabase config
- [x] 4.2 Add startup reachability check for Supabase and propagate fatal state
- [x] 4.3 Implement fatal unavailable/configuration UI that blocks normal app flow

## 5. Preference Preservation

- [x] 5.1 Preserve theme localStorage behavior in layout
- [x] 5.2 Preserve language detection/cache localStorage behavior in i18n
- [x] 5.3 Ensure no domain-data persistence uses localStorage

## 6. Tests and Documentation

- [x] 6.1 Rewrite/remove tests tied to local fallback for domain data
- [x] 6.2 Add tests for Supabase-auth route protection and fatal startup states
- [x] 6.3 Update README and project docs to state Supabase-required architecture

## 7. Verification

- [x] 7.1 Verify local development works with `.env.local` and local Supabase stack
- [x] 7.2 Verify app hard-fails when Supabase is stopped/unreachable
- [x] 7.3 Verify admin writes succeed only for allowlisted admin accounts
