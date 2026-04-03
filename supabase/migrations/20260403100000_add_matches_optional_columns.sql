-- Ensure optional match scheduling/result metadata columns exist
alter table if exists matches
  add column if not exists manual_order int,
  add column if not exists finished_at bigint;