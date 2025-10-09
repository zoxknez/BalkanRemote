-- Core job portal tables and functions
-- This replaces and consolidates setup from scripts/supabase-setup.sql

-- Extensions
create extension if not exists pg_trgm;

-- Main job portal listings table
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
  currency text default 'USD',
  is_remote boolean not null default true,
  remote_type text default 'fully-remote',
  experience_level text,
  posted_at timestamptz not null default now(),
  deadline timestamptz,
  url text not null,
  source_url text,
  featured boolean not null default false,
  tags text[] default array[]::text[],
  metadata jsonb default '{}'::jsonb,
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Constraints
  constraint job_portal_listings_source_external_key unique (source_id, external_id),
  constraint job_portal_listings_salary_check check (salary_min is null or salary_max is null or salary_min <= salary_max),
  constraint job_portal_listings_type_check check (type in ('full-time', 'part-time', 'contract', 'freelance', 'internship', 'temporary')),
  constraint job_portal_listings_experience_check check (experience_level in ('entry', 'mid', 'senior', 'lead', 'executive')),
  constraint job_portal_listings_remote_type_check check (remote_type in ('fully-remote', 'hybrid', 'office-based')),
  constraint job_portal_listings_currency_check check (currency in ('USD', 'EUR', 'RSD', 'GBP', 'CHF', 'CAD', 'AUD'))
);

-- Optimized indexes for job portal listings
create index if not exists job_portal_posted_at_idx on public.job_portal_listings (posted_at desc);
create index if not exists job_portal_category_idx on public.job_portal_listings (category) where category is not null;
create index if not exists job_portal_type_idx on public.job_portal_listings (type) where type is not null;
create index if not exists job_portal_experience_idx on public.job_portal_listings (experience_level) where experience_level is not null;
create index if not exists job_portal_remote_idx on public.job_portal_listings (is_remote);
create index if not exists job_portal_source_idx on public.job_portal_listings (source_id);
create index if not exists job_portal_featured_idx on public.job_portal_listings (featured) where featured = true;
create index if not exists job_portal_deadline_idx on public.job_portal_listings (deadline) where deadline is not null;

-- Full-text search indexes
create index if not exists job_portal_search_idx on public.job_portal_listings using gin (search_vector);
create index if not exists job_portal_tags_idx on public.job_portal_listings using gin (tags);
create index if not exists job_portal_title_trgm_idx on public.job_portal_listings using gin (title gin_trgm_ops);
create index if not exists job_portal_company_trgm_idx on public.job_portal_listings using gin (company gin_trgm_ops);

-- Composite indexes for common queries
create index if not exists job_portal_remote_posted_idx on public.job_portal_listings (is_remote, posted_at desc);
create index if not exists job_portal_type_posted_idx on public.job_portal_listings (type, posted_at desc) where type is not null;
create index if not exists job_portal_category_posted_idx on public.job_portal_listings (category, posted_at desc) where category is not null;

-- Search vector update function
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

-- Updated_at trigger function
create or replace function public.set_job_portal_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers
drop trigger if exists job_portal_listings_search_vector on public.job_portal_listings;
create trigger job_portal_listings_search_vector
  before insert or update on public.job_portal_listings
  for each row execute function public.job_portal_listings_update_search_vector();

drop trigger if exists job_portal_set_updated_at on public.job_portal_listings;
create trigger job_portal_set_updated_at
  before update on public.job_portal_listings
  for each row execute function public.set_job_portal_updated_at();

-- Job feed stats table
create table if not exists public.job_feed_stats (
  source_id text primary key,
  last_success_at timestamptz,
  last_error_at timestamptz,
  success_count integer not null default 0,
  failure_count integer not null default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Constraints
  constraint job_feed_stats_counts_check check (success_count >= 0 and failure_count >= 0)
);

-- Feed stats indexes
create index if not exists job_feed_stats_success_idx on public.job_feed_stats (last_success_at desc) where last_success_at is not null;
create index if not exists job_feed_stats_error_idx on public.job_feed_stats (last_error_at desc) where last_error_at is not null;

-- Feed stats updated_at trigger
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

-- User bookmarks table
create table if not exists public.job_portal_bookmarks (
  user_id uuid not null,
  listing_id uuid not null references public.job_portal_listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  
  primary key (user_id, listing_id)
);

-- Bookmark indexes
create index if not exists job_portal_bookmarks_user_idx on public.job_portal_bookmarks (user_id, created_at desc);
create index if not exists job_portal_bookmarks_listing_idx on public.job_portal_bookmarks (listing_id);