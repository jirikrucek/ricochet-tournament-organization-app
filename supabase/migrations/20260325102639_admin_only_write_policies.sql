-- Drop existing overly-permissive write policies
drop policy if exists "Allow authenticated all tournaments" on tournaments;
drop policy if exists "Allow authenticated all players" on players;
drop policy if exists "Allow authenticated all matches" on matches;

-- Recreate write policies requiring admins membership

-- Tournaments: admin-only insert
create policy "Allow admin insert tournaments" on tournaments
  for insert to authenticated
  with check (exists (select 1 from admins where admins.user_id = auth.uid()));

-- Tournaments: admin-only update
create policy "Allow admin update tournaments" on tournaments
  for update to authenticated
  using (exists (select 1 from admins where admins.user_id = auth.uid()));

-- Tournaments: admin-only delete
create policy "Allow admin delete tournaments" on tournaments
  for delete to authenticated
  using (exists (select 1 from admins where admins.user_id = auth.uid()));

-- Players: admin-only insert
create policy "Allow admin insert players" on players
  for insert to authenticated
  with check (exists (select 1 from admins where admins.user_id = auth.uid()));

-- Players: admin-only update
create policy "Allow admin update players" on players
  for update to authenticated
  using (exists (select 1 from admins where admins.user_id = auth.uid()));

-- Players: admin-only delete
create policy "Allow admin delete players" on players
  for delete to authenticated
  using (exists (select 1 from admins where admins.user_id = auth.uid()));

-- Matches: admin-only insert
create policy "Allow admin insert matches" on matches
  for insert to authenticated
  with check (exists (select 1 from admins where admins.user_id = auth.uid()));

-- Matches: admin-only update
create policy "Allow admin update matches" on matches
  for update to authenticated
  using (exists (select 1 from admins where admins.user_id = auth.uid()));

-- Matches: admin-only delete
create policy "Allow admin delete matches" on matches
  for delete to authenticated
  using (exists (select 1 from admins where admins.user_id = auth.uid()));
