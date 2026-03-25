# Spec: Supabase Runtime and Admin Auth

## ADDED Requirements

### Requirement: Supabase-Only Domain Persistence

The application MUST persist tournament domain data exclusively in Supabase.

#### Scenario: Tournament data operations

- **WHEN** the application loads, creates, updates, or deletes tournaments
- **THEN** the operation uses Supabase
- **AND** no localStorage fallback is used for tournament domain data

#### Scenario: Player and match data operations

- **WHEN** the application loads, creates, updates, or deletes players and matches
- **THEN** the operations use Supabase
- **AND** no localStorage fallback is used for player or match domain data

### Requirement: Admin Authentication via Supabase Email/Password

The admin login flow MUST authenticate using Supabase Auth email/password.

#### Scenario: Valid admin credentials

- **WHEN** an admin submits valid email/password credentials
- **THEN** the user is authenticated through Supabase Auth
- **AND** the application treats the user as signed in based on Supabase session state

#### Scenario: Invalid credentials

- **WHEN** an admin submits invalid email/password credentials
- **THEN** authentication is rejected by Supabase Auth
- **AND** the login view displays an error state

### Requirement: Admin-Only Write Authorization

Write access to tournament domain tables MUST be restricted to allowlisted admins.

#### Scenario: Allowlisted admin writes data

- **WHEN** an authenticated user exists in the admin allowlist
- **THEN** inserts, updates, and deletes on tournament domain tables are permitted

#### Scenario: Non-admin authenticated user attempts write

- **WHEN** an authenticated user is not in the admin allowlist
- **THEN** inserts, updates, and deletes on tournament domain tables are denied

### Requirement: Runtime Hard-Fail Without Supabase Availability

The application MUST fail fast and block normal operation when Supabase configuration is missing or Supabase is unreachable.

#### Scenario: Missing Supabase environment variables

- **WHEN** required Supabase env variables are missing at runtime
- **THEN** the app enters a fatal configuration state
- **AND** normal application features are not rendered

#### Scenario: Supabase service unavailable

- **WHEN** Supabase is unreachable during startup checks
- **THEN** the app enters a fatal unavailable state
- **AND** normal application features are not rendered

### Requirement: Theme and Language LocalStorage Preservation

The application MUST preserve localStorage persistence for theme and language preferences.

#### Scenario: Theme preference

- **WHEN** a user toggles theme
- **THEN** theme preference is stored and restored via localStorage

#### Scenario: Language preference

- **WHEN** a user selects language
- **THEN** language preference is stored and restored via localStorage
