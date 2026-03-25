-- Create admins allowlist table
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- Enable RLS on admins
alter table admins enable row level security;

-- Only authenticated admins can read admins (for self-check)
create policy "Allow admin self-read" on admins
  for select to authenticated
  using (user_id = auth.uid());
