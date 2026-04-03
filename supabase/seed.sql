-- Seed a local dev admin user for Supabase Auth
-- This creates an auth user and adds them to admins for local development.
-- Email: admin@ricochet.local / Password: admin123

-- Insert into auth.users (local dev only - uses known test UUID)
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_change,
  email_change_token_new,
  email_change_token_current,
  confirmation_token,
  recovery_token,
  phone,
  phone_change,
  phone_change_token,
  reauthentication_token,
  email_change_confirm_status,
  is_sso_user,
  is_anonymous,
  banned_until,
  deleted_at,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin@ricochet.local',
  crypt('admin123', gen_salt('bf')),
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  0,
  false,
  false,
  null,
  null,
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}'
) on conflict (id) do update set
  aud = excluded.aud,
  role = excluded.role,
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_change = excluded.email_change,
  email_change_token_new = excluded.email_change_token_new,
  email_change_token_current = excluded.email_change_token_current,
  confirmation_token = excluded.confirmation_token,
  recovery_token = excluded.recovery_token,
  phone = excluded.phone,
  phone_change = excluded.phone_change,
  phone_change_token = excluded.phone_change_token,
  reauthentication_token = excluded.reauthentication_token,
  email_change_confirm_status = excluded.email_change_confirm_status,
  is_sso_user = excluded.is_sso_user,
  is_anonymous = excluded.is_anonymous,
  banned_until = excluded.banned_until,
  deleted_at = excluded.deleted_at,
  email_confirmed_at = excluded.email_confirmed_at,
  updated_at = now(),
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data;

-- Also insert an identity record so email/password login works
insert into auth.identities (
  id,
  user_id,
  provider_id,
  provider,
  identity_data,
  last_sign_in_at,
  created_at,
  updated_at
) values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'admin@ricochet.local',
  'email',
  '{"sub": "00000000-0000-0000-0000-000000000001", "email": "admin@ricochet.local"}',
  now(),
  now(),
  now()
) on conflict (provider_id, provider) do nothing;

-- Add to admins allowlist
insert into admins (user_id)
values ('00000000-0000-0000-0000-000000000001')
on conflict (user_id) do nothing;
