-- Create admin_users allowlist table
create table if not exists admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  created_at timestamptz default now()
);

-- Enable RLS on admin_users
alter table admin_users enable row level security;

-- Only authenticated admins can read admin_users (for self-check)
create policy "Allow admin self-read" on admin_users
  for select to authenticated
  using (user_id = auth.uid());
