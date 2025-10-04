-- Complete database initialization and consolidation
-- This replaces all previous migrations with a clean, optimized structure

-- Required extensions
create extension if not exists pg_trgm;

-- Core scrape tracking table
create table if not exists public.scrape_runs (
  id uuid primary key default gen_random_uuid(),
  source_id text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  status text check (status in ('ok','error')) default 'ok',
  attempts int default 0,
  successes int default 0,
  errors int default 0,
  items_inserted int default 0,
  items_processed int default 0,
  items_skipped int default 0,
  mean_latency_ms int,
  duration_ms int,
  notes text,
  meta jsonb default '{}'::jsonb
);

create index if not exists idx_scrape_runs_source_started on public.scrape_runs(source_id, started_at desc);
create index if not exists idx_scrape_runs_status_date on public.scrape_runs(status, started_at desc);

-- Jobs table (official feeds)
create table if not exists public.jobs (
  stable_key text primary key,
  source_id text not null,
  source_name text not null,
  title text not null,
  company text not null,
  location text,
  remote boolean not null default true,
  salary_min numeric,
  salary_max numeric,
  salary_currency text default 'USD',
  salary_min_eur numeric,
  salary_max_eur numeric,
  posted_at timestamptz not null,
  apply_url text not null,
  raw jsonb default '{}'::jsonb,
  
  constraint jobs_salary_check check (salary_min is null or salary_max is null or salary_min <= salary_max)
);

-- Jobs indexes
create index if not exists jobs_posted_at_desc_idx on public.jobs (posted_at desc);
create index if not exists jobs_salary_eur_desc_idx on public.jobs (salary_max_eur desc, posted_at desc) where salary_max_eur is not null;
create index if not exists jobs_title_company_trgm_idx on public.jobs using gin ((title || ' ' || company) gin_trgm_ops);
create index if not exists jobs_title_trgm_idx on public.jobs using gin (title gin_trgm_ops);
create index if not exists jobs_company_trgm_idx on public.jobs using gin (company gin_trgm_ops);
create index if not exists jobs_location_trgm_idx on public.jobs using gin (location gin_trgm_ops);
create index if not exists jobs_posted_at_stable_idx on public.jobs (posted_at desc, stable_key);

-- Jobs public view
create or replace view public.jobs_public_v as
select
  stable_key, source_id, source_name, title, company, location, remote,
  salary_min, salary_max, salary_currency,
  salary_min_eur, salary_max_eur,
  posted_at, apply_url
from public.jobs;

-- Saved searches table
create table if not exists public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  params jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists saved_searches_user_idx on public.saved_searches(user_id, created_at desc);

-- Job scraped listings table (comprehensive version)
create table if not exists public.job_scraped_listings (
  id uuid primary key default gen_random_uuid(),
  source_id text not null,
  source_name text,
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
  currency text default 'USD',
  is_remote boolean not null default true,
  remote_type text default 'fully-remote',
  experience_level text,
  posted_at timestamptz not null,
  deadline timestamptz,
  url text not null,
  source_url text,
  featured boolean default false,
  tags text[] default array[]::text[],
  metadata jsonb default '{}'::jsonb,
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  constraint job_scraped_listings_unique unique (source_id, external_id),
  constraint job_scraped_salary_check check (salary_min is null or salary_max is null or salary_min <= salary_max),
  constraint job_scraped_currency_check check (currency in ('USD', 'EUR', 'RSD', 'GBP', 'CHF', 'CAD', 'AUD'))
);

-- Job scraped listings indexes
create index if not exists idx_job_scraped_posted_at on public.job_scraped_listings(posted_at desc);
create index if not exists idx_job_scraped_remote on public.job_scraped_listings(is_remote);
create index if not exists idx_job_scraped_type on public.job_scraped_listings(type) where type is not null;
create index if not exists idx_job_scraped_experience on public.job_scraped_listings(experience_level) where experience_level is not null;
create index if not exists idx_job_scraped_category on public.job_scraped_listings(category) where category is not null;
create index if not exists idx_job_scraped_source on public.job_scraped_listings(source_id);
create index if not exists idx_job_scraped_search on public.job_scraped_listings using gin(search_vector) where search_vector is not null;
create index if not exists idx_job_scraped_tags on public.job_scraped_listings using gin(tags) where tags is not null;
create index if not exists idx_job_scraped_title_trgm on public.job_scraped_listings using gin(title gin_trgm_ops);
create index if not exists idx_job_scraped_company_trgm on public.job_scraped_listings using gin(company gin_trgm_ops);