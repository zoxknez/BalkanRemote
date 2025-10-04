-- MANUAL SQL TO RUN IN SUPABASE SQL EDITOR
-- Run this to add missing columns and optimizations

-- Add missing search_vector column to job_scraped_listings
alter table public.job_scraped_listings 
  add column if not exists search_vector tsvector;

-- Add missing columns to job_portal_listings if they don't exist
alter table public.job_portal_listings 
  add column if not exists search_vector tsvector;

-- Create the search vector update function for scraped listings
create or replace function public.job_scraped_listings_update_search_vector()
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

-- Create the search vector update function for portal listings
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

-- Apply triggers
drop trigger if exists job_scraped_listings_search_vector on public.job_scraped_listings;
create trigger job_scraped_listings_search_vector
  before insert or update on public.job_scraped_listings
  for each row execute function public.job_scraped_listings_update_search_vector();

drop trigger if exists job_portal_listings_search_vector on public.job_portal_listings;  
create trigger job_portal_listings_search_vector
  before insert or update on public.job_portal_listings
  for each row execute function public.job_portal_listings_update_search_vector();

-- Add key performance indexes
create index if not exists idx_job_scraped_search 
  on public.job_scraped_listings using gin(search_vector) 
  where search_vector is not null;

create index if not exists job_portal_search_idx 
  on public.job_portal_listings using gin (search_vector)
  where search_vector is not null;

-- Add missing constraints (using DO block for conditional creation)
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints 
    where constraint_name = 'job_portal_listings_salary_check' 
    and table_name = 'job_portal_listings'
  ) then
    alter table public.job_portal_listings 
      add constraint job_portal_listings_salary_check 
      check (salary_min is null or salary_max is null or salary_min <= salary_max);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints 
    where constraint_name = 'job_scraped_salary_check' 
    and table_name = 'job_scraped_listings'
  ) then
    alter table public.job_scraped_listings 
      add constraint job_scraped_salary_check 
      check (salary_min is null or salary_max is null or salary_min <= salary_max);
  end if;
end $$;

-- Update existing records to populate search vectors
update public.job_portal_listings set updated_at = now() where search_vector is null limit 100;
update public.job_scraped_listings set updated_at = now() where search_vector is null limit 100;

-- Create currency conversion function
create or replace function public.convert_to_eur(
  amount numeric,
  from_currency text,
  rate_date date default current_date
)
returns numeric as $$
declare
  conversion_rate numeric;
begin
  case from_currency
    when 'USD' then conversion_rate = 0.92;
    when 'EUR' then conversion_rate = 1.0;
    when 'RSD' then conversion_rate = 0.0085;
    when 'GBP' then conversion_rate = 1.15;
    when 'CHF' then conversion_rate = 1.02;
    when 'CAD' then conversion_rate = 0.68;
    when 'AUD' then conversion_rate = 0.61;
    else conversion_rate = 1.0;
  end case;
  
  return amount * conversion_rate;
end;
$$ language plpgsql immutable;

-- Add EUR columns to jobs if missing (using DO block)
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'jobs' and column_name = 'salary_min_eur'
  ) then
    alter table public.jobs add column salary_min_eur numeric;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'jobs' and column_name = 'salary_max_eur'
  ) then
    alter table public.jobs add column salary_max_eur numeric;
  end if;
end $$;

-- Update EUR values
update public.jobs 
set 
  salary_min_eur = convert_to_eur(salary_min, coalesce(salary_currency, 'USD')),
  salary_max_eur = convert_to_eur(salary_max, coalesce(salary_currency, 'USD'))
where salary_min_eur is null and (salary_min is not null or salary_max is not null);

-- Create job feed stats table if missing
create table if not exists public.job_feed_stats (
  source_id text primary key,
  last_success_at timestamptz,
  last_error_at timestamptz,
  success_count integer not null default 0,
  failure_count integer not null default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS on tables
alter table public.job_portal_listings enable row level security;
alter table public.job_scraped_listings enable row level security;
alter table public.job_feed_stats enable row level security;

-- Create basic RLS policies
drop policy if exists "read job portal listings" on public.job_portal_listings;
create policy "read job portal listings" 
  on public.job_portal_listings 
  for select using (true);

drop policy if exists "read scraped listings" on public.job_scraped_listings;
create policy "read scraped listings" 
  on public.job_scraped_listings 
  for select using (true);

drop policy if exists "read job feed stats" on public.job_feed_stats;
create policy "read job feed stats" 
  on public.job_feed_stats 
  for select using (true);

-- Grant permissions
grant select on table public.job_portal_listings to anon, authenticated;
grant select, insert, update, delete on table public.job_portal_listings to service_role;

grant select on table public.job_scraped_listings to anon, authenticated;  
grant select, insert, update, delete on table public.job_scraped_listings to service_role;

grant select on table public.job_feed_stats to anon, authenticated;
grant select, insert, update, delete on table public.job_feed_stats to service_role;

-- Notify PostgREST to reload schema
notify pgrst, 'reload schema';