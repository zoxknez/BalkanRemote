-- QUICK FIX SQL - Run this in Supabase SQL Editor first

-- Add missing search_vector columns
alter table public.job_scraped_listings 
  add column if not exists search_vector tsvector;

alter table public.job_portal_listings 
  add column if not exists search_vector tsvector;

-- Create search vector functions
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

-- Add triggers
drop trigger if exists job_scraped_listings_search_vector on public.job_scraped_listings;
create trigger job_scraped_listings_search_vector
  before insert or update on public.job_scraped_listings
  for each row execute function public.job_scraped_listings_update_search_vector();

drop trigger if exists job_portal_listings_search_vector on public.job_portal_listings;  
create trigger job_portal_listings_search_vector
  before insert or update on public.job_portal_listings
  for each row execute function public.job_portal_listings_update_search_vector();

-- Add critical performance indexes
create index if not exists idx_job_scraped_search 
  on public.job_scraped_listings using gin(search_vector);

create index if not exists job_portal_search_idx 
  on public.job_portal_listings using gin(search_vector);

-- Populate search vectors for existing records (first 100)
update public.job_portal_listings 
set updated_at = now() 
where id in (
  select id from public.job_portal_listings 
  where search_vector is null 
  limit 100
);

update public.job_scraped_listings 
set updated_at = now() 
where id in (
  select id from public.job_scraped_listings 
  where search_vector is null 
  limit 100
);

-- Add missing columns to scrape_runs
alter table public.scrape_runs add column if not exists duration_ms integer;
alter table public.scrape_runs add column if not exists items_processed integer default 0;

-- Notify PostgREST
notify pgrst, 'reload schema';