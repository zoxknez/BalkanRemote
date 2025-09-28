create table if not exists saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  params jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists saved_searches_user_idx
  on saved_searches(user_id, created_at desc);

alter table saved_searches enable row level security;

create policy "sel_own" on saved_searches
  for select using (auth.uid() = user_id);

create policy "ins_own" on saved_searches
  for insert with check (auth.uid() = user_id);

create policy "del_own" on saved_searches
  for delete using (auth.uid() = user_id);
