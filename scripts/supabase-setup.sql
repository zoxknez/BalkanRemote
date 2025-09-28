-- Enable extensions if needed
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- Questions table
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  user_email text,
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.questions enable row level security;

-- Select: everyone can read
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'questions' and policyname = 'read questions'
  ) then
    create policy "read questions" on public.questions for select using (true);
  end if;
end $$;

-- Utility: function to reload PostgREST schema cache (callable via RPC)
create or replace function public.reload_postgrest_schema()
returns void
language plpgsql
security definer
as $$
begin
  perform pg_notify('pgrst', 'reload schema');
end;
$$;

grant execute on function public.reload_postgrest_schema() to authenticated, anon, service_role;

-- Insert: only authenticated users can insert
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'questions' and policyname = 'insert own question'
  ) then
    create policy "insert own question" on public.questions for insert with check (auth.role() = 'authenticated');
  end if;
end $$;

-- Job portal listings (aggregated feeds)
create table if not exists public.job_portal_listings (
  id uuid primary key default gen_random_uuid(),
  source_id text not null,
  external_id text not null,
  title text not null,
  company text not null,
  company_logo text,
  location text,
  type text,
  category text,
  description text,
  requirements text[],
  benefits text[],
  salary_min numeric,
  salary_max numeric,
  currency text,
  is_remote boolean not null default true,
  remote_type text,
  experience_level text,
  posted_at timestamptz not null default now(),
  deadline timestamptz,
  url text not null,
  source_url text,
  featured boolean not null default false,
  tags text[] default array[]::text[],
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists job_portal_unique_source_external on public.job_portal_listings(source_id, external_id);
create index if not exists job_portal_posted_at_idx on public.job_portal_listings (posted_at desc);
create index if not exists job_portal_category_idx on public.job_portal_listings (category);
create index if not exists job_portal_type_idx on public.job_portal_listings (type);
create index if not exists job_portal_experience_level_idx on public.job_portal_listings (experience_level);
create index if not exists job_portal_is_remote_idx on public.job_portal_listings (is_remote);

-- Full‑text search support (safe to re-run)
alter table public.job_portal_listings add column if not exists search_vector tsvector;

-- Improved weighted full-text vector (A highest → D lowest):
--  A: title
--  B: company name + tags
--  C: category
--  D: description (long form)
-- We keep 'simple' config for now; can be switched to 'english' or custom dictionary later.
-- Prefix matching is enabled in queries via ':*' (handled application-side when building plainto_tsquery/phraseto_tsquery if needed).

create or replace function public.job_portal_listings_update_search_vector()
returns trigger as $$
begin
  new.search_vector :=
    setweight(to_tsvector('simple', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.company,'') || ' ' || coalesce(array_to_string(new.tags,' '),'')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.category,'')), 'C') ||
    setweight(to_tsvector('simple', coalesce(new.description,'')), 'D');
  return new;
end;
$$ language plpgsql;

drop trigger if exists job_portal_listings_search_vector on public.job_portal_listings;
create trigger job_portal_listings_search_vector
before insert or update on public.job_portal_listings
for each row execute function public.job_portal_listings_update_search_vector();

create index if not exists job_portal_listings_search_idx on public.job_portal_listings using GIN (search_vector);
create index if not exists job_portal_listings_tags_gin on public.job_portal_listings using GIN (tags);

-- trigger to keep updated_at fresh
create or replace function public.set_job_portal_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists job_portal_set_updated_at on public.job_portal_listings;
create trigger job_portal_set_updated_at
before update on public.job_portal_listings
for each row execute function public.set_job_portal_updated_at();

alter table public.job_portal_listings enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'job_portal_listings' and policyname = 'read job portal listings'
  ) then
    create policy "read job portal listings" on public.job_portal_listings for select using (true);
  end if;
end $$;

-- Grants: make sure roles have the right privileges
-- Allow API roles to use the public schema
grant usage on schema public to anon, authenticated, service_role;

-- Public read of listings (via anon/authenticated) through RLS policy above
grant select on table public.job_portal_listings to anon, authenticated;

-- Service role full DML on listings (bypasses RLS)
grant select, insert, update, delete on table public.job_portal_listings to service_role;

-- Feed stats (observability for job feed sync)
create table if not exists public.job_feed_stats (
  source_id text primary key,
  last_success_at timestamptz,
  last_error_at timestamptz,
  success_count integer not null default 0,
  failure_count integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Ensure metadata column exists (for storing last error message etc.)
alter table public.job_feed_stats add column if not exists metadata jsonb;

create or replace function public.set_job_feed_stats_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists job_feed_stats_set_updated_at on public.job_feed_stats;
create trigger job_feed_stats_set_updated_at
before update on public.job_feed_stats
for each row execute function public.set_job_feed_stats_updated_at();

alter table public.job_feed_stats enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'job_feed_stats' and policyname = 'read job feed stats'
  ) then
    create policy "read job feed stats" on public.job_feed_stats for select using (true);
  end if;
end $$;

-- Service role full DML on feed stats (observability writes from server)
grant select, insert, update, delete on table public.job_feed_stats to service_role;

-- User bookmarks for listings
create table if not exists public.job_portal_bookmarks (
  user_id uuid not null,
  listing_id uuid not null references public.job_portal_listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

alter table public.job_portal_bookmarks enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='job_portal_bookmarks' and policyname='select own bookmarks'
  ) then
    create policy "select own bookmarks" on public.job_portal_bookmarks for select using (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='job_portal_bookmarks' and policyname='insert own bookmarks'
  ) then
    create policy "insert own bookmarks" on public.job_portal_bookmarks for insert with check (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='job_portal_bookmarks' and policyname='delete own bookmarks'
  ) then
    create policy "delete own bookmarks" on public.job_portal_bookmarks for delete using (auth.uid() = user_id);
  end if;
end $$;

grant select, insert, delete on table public.job_portal_bookmarks to authenticated;
grant select on table public.job_portal_bookmarks to service_role; -- service_role inherently bypasses RLS

create index if not exists job_portal_bookmarks_listing_idx on public.job_portal_bookmarks(listing_id);
