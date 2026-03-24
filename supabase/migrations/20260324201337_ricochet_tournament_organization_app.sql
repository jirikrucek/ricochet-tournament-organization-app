-- Create Tournaments Table
create table if not exists tournaments (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text,
  date timestamptz default now(),
  status text check (status in ('setup', 'live', 'finished')) default 'setup',
  created_at timestamptz default now()
);

-- Create Players Table
create table if not exists players (
  id uuid default gen_random_uuid() primary key,
  tournament_id uuid references tournaments(id) on delete cascade not null,
  full_name text not null,
  country text,
  elo int default 0,
  created_at timestamptz default now()
);

-- Create Matches Table (Composite PK)
create table if not exists matches (
  tournament_id uuid references tournaments(id) on delete cascade not null,
  id text not null, -- stores 'wb-r1-m1', etc.
  bracket_type text,
  round_id int,
  player1_id uuid references players(id),
  player2_id uuid references players(id),
  score1 int,
  score2 int,
  micro_points jsonb,
  winner_id uuid references players(id),
  status text,
  court text,
  created_at timestamptz default now(),
  
  primary key (tournament_id, id)
);

alter table tournaments enable row level security;
alter table players enable row level security;
alter table matches enable row level security;

-- Allow public read access
create policy "Allow public read tournaments" on tournaments for select using (true);
create policy "Allow public read players" on players for select using (true);
create policy "Allow public read matches" on matches for select using (true);

-- Allow authenticated insert/update/delete access
create policy "Allow authenticated all tournaments" on tournaments for all to authenticated using (true);
create policy "Allow authenticated all players" on players for all to authenticated using (true);
create policy "Allow authenticated all matches" on matches for all to authenticated using (true);