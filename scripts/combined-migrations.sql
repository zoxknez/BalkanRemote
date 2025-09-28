-- Combined Supabase migrations for RemoteBalkan
-- Order matters: core -> view -> indexes -> more indexes -> EUR -> saved_searches

-- 1) Core tables
-- File: supabase/migrations/20250928_scrape_core.sql
create table if not exists scrape_runs (
  id uuid primary key default gen_random_uuid(),
  source_id text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  status text check (status in ('ok','error')) default 'ok',
  attempts int default 0,
  successes int default 0,
  errors int default 0,
  items_inserted int default 0,
  mean_latency_ms int,
  notes text,
  meta jsonb
);
create index if not exists idx_scrape_runs_source_started on scrape_runs(source_id, started_at desc);

-- Harden security: enable RLS on scrape_runs; only service_role should write.
alter table scrape_runs enable row level security;
-- Read policy for observability (optional): allow read to anon/authenticated if desired
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='scrape_runs' and policyname='read_scrape_runs'
  ) then
    create policy "read_scrape_runs" on public.scrape_runs for select using (true);
  end if;
end $$;

create table if not exists jobs (
  stable_key text primary key,
  source_id text not null,
  source_name text not null,
  title text not null,
  company text not null,
  location text,
  remote boolean not null default true,
  salary_min numeric,
  salary_max numeric,
  salary_currency text,
  posted_at timestamptz not null,
  apply_url text not null,
  raw jsonb
);

-- 2) Public view
-- File: supabase/migrations/20250928_jobs_public_view.sql
create or replace view jobs_public_v as
  select stable_key, source_id, source_name, title, company, location, remote,
         salary_min, salary_max, salary_currency, posted_at, apply_url
  from jobs;

revoke all on table jobs from anon;
grant select on jobs_public_v to anon;

-- 3) Indexes
-- File: supabase/migrations/20250928_jobs_indexes.sql
create index if not exists jobs_posted_at_desc_idx on jobs (posted_at desc);
create extension if not exists pg_trgm;
create index if not exists jobs_title_company_trgm_idx on jobs using gin ((title || ' ' || company) gin_trgm_ops);

-- 4) More indexes
-- File: supabase/migrations/20250928_jobs_indexes_more.sql
create extension if not exists pg_trgm;
create index if not exists jobs_title_trgm_idx on jobs using gin (title gin_trgm_ops);
create index if not exists jobs_company_trgm_idx on jobs using gin (company gin_trgm_ops);
create index if not exists jobs_location_trgm_idx on jobs using gin (location gin_trgm_ops);
create index if not exists jobs_posted_at_stable_idx on jobs (posted_at desc, stable_key);

-- File: supabase/migrations/20250928_jobs_eur.sql
-- EUR kolone na jobs (idempotentno)
alter table jobs
  add column if not exists salary_min_eur numeric,
  add column if not exists salary_max_eur numeric;

create index if not exists jobs_salary_eur_desc_idx
  on jobs (salary_max_eur desc, posted_at desc);

-- Drop & recreate view sa novim kolonama
drop view if exists jobs_public_v;

create view jobs_public_v as
select
  stable_key, source_id, source_name, title, company, location, remote,
  salary_min, salary_max, salary_currency,
  salary_min_eur, salary_max_eur,
  posted_at, apply_url
from jobs;

grant select on jobs_public_v to anon;

-- Refresh PostgREST schema cache
notify pgrst, 'reload schema';

-- 6) Saved searches with RLS
-- File: supabase/migrations/20250928_saved_searches.sql
create table if not exists saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  params jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists saved_searches_user_idx on saved_searches(user_id, created_at desc);

alter table saved_searches enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'saved_searches' and policyname = 'sel_own'
  ) then
    create policy "sel_own" on public.saved_searches
      for select using (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'saved_searches' and policyname = 'ins_own'
  ) then
    create policy "ins_own" on public.saved_searches
      for insert with check (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'saved_searches' and policyname = 'del_own'
  ) then
    create policy "del_own" on public.saved_searches
      for delete using (auth.uid() = user_id);
  end if;
end $$;

-- 7) Ask PostgREST to reload its schema cache (run if you have permissions)
-- If this errors in SQL Editor, you can ignore and instead hit your PostgREST reload endpoint, or run our script
notify pgrst, 'reload schema';
