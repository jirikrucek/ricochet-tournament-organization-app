-- Seed a local dev admin user for Supabase Auth
-- This creates an auth user and adds them to admin_users for local development.
-- Email: admin@ricochet.local / Password: admin123

-- Insert into auth.users (local dev only - uses known test UUID)
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  raw_app_meta_data,
  raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin@ricochet.local',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '{"provider": "email", "providers": ["email"]}',
  '{}'
) on conflict (id) do nothing;

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

-- Add to admin_users allowlist
insert into admin_users (user_id, email)
values ('00000000-0000-0000-0000-000000000001', 'admin@ricochet.local')
on conflict (user_id) do nothing;
