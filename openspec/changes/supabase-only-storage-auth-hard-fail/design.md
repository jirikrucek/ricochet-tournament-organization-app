# Design: Supabase-Only Runtime with Admin Email/Password Auth

## Context

The codebase currently supports dual-mode persistence:
- Supabase path
- localStorage fallback path

This is implemented in multiple providers/hooks and creates split behavior across environments. Admin authentication is currently local and separate from Supabase Auth.

The requested direction is to converge on Supabase-only domain persistence and Supabase Auth for admin login, while preserving localStorage only for theme/language preferences.

## Goals / Non-Goals

**Goals**
- Domain data persistence uses Supabase exclusively
- Admin login uses Supabase email/password
- Writes are authorized by database policy for admin users only
- App hard-fails when Supabase env is missing or service is unreachable
- Theme/language localStorage behavior remains unchanged

**Non-Goals**
- Reworking UI styling or navigation structure
- Removing localStorage for theme/language
- Adding anonymous write paths
- Maintaining offline domain-data operation

## Architecture

### Runtime Overview

1. App starts and initializes Supabase client.
2. A startup health check validates required env and Supabase reachability.
3. If unavailable, app enters fatal unavailable state and blocks normal flow.
4. If available, providers load domain data from Supabase.
5. Admin users sign in via Supabase email/password.
6. RLS permits writes only for authorized admins.

### Data Persistence Boundaries

- Supabase only:
  - tournaments
  - players
  - matches
  - admin authentication/session
- localStorage retained:
  - theme (`ricochet_theme`)
  - i18n language detection/cache

### Auth and Authorization

#### Authentication

- Use Supabase Auth email/password via `signInWithPassword`.
- Maintain auth state with `onAuthStateChange` subscription.
- Route guards consume hook/session state, not localStorage flags.

#### Authorization

A database-backed admin allowlist is required to prevent all authenticated users from writing.

Proposed table:
- `admin_users`
  - `user_id uuid primary key references auth.users(id) on delete cascade`
  - `email text unique`
  - `created_at timestamptz default now()`

Policy strategy:
- Public read policies remain unchanged.
- Write policies on `tournaments`, `players`, `matches` require:
  - authenticated role
  - `exists (select 1 from admin_users where admin_users.user_id = auth.uid())`

## Failure Semantics

### Missing Env

If `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` is missing:
- Show fatal configuration error screen
- Do not proceed with normal app providers/routes

### Supabase Unreachable

If startup health check fails:
- Show fatal service-unavailable screen
- Disable tournament features until reload/retry succeeds

This intentionally replaces silent local fallback.

## Test Strategy

- Remove tests validating local fallback behavior for domain data.
- Add tests for:
  - fatal config state
  - fatal unavailable state
  - Supabase Auth login success/failure
  - protected route behavior based on session
- Keep existing theme/language localStorage behavior tests where applicable.

## Rollout Plan

1. Introduce admin authorization schema and policies.
2. Migrate auth hook and login page to Supabase Auth.
3. Remove local fallback branches in tournament/players/matches modules.
4. Add startup hard-fail checks and fatal UI.
5. Update tests and docs.

## Risks and Mitigations

- Risk: accidental lockout after policy tightening.
  - Mitigation: seed at least one admin user in local/dev environments.
- Risk: transient outage blocks all users.
  - Mitigation: clear fatal messaging and retry action.
- Risk: regressions from removing fallback branches.
  - Mitigation: focused provider/hook integration tests.
