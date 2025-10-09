-- Enhanced scraper improvements and optimizations

-- Update job_scraped_listings with better constraints and indexes
do $$ 
begin
  if not exists (select 1 from pg_constraint where conname = 'job_scraped_salary_check') then
    alter table public.job_scraped_listings 
      add constraint job_scraped_salary_check 
      check (salary_min is null or salary_max is null or salary_min <= salary_max);
  end if;
  
  if not exists (select 1 from pg_constraint where conname = 'job_scraped_currency_check') then
    alter table public.job_scraped_listings 
      add constraint job_scraped_currency_check 
      check (currency in ('USD', 'EUR', 'RSD', 'GBP', 'CHF', 'CHF', 'CAD', 'AUD'));
  end if;
end $$;

-- Add missing columns if they don't exist
alter table public.job_scraped_listings 
  add column if not exists search_vector tsvector;

-- Enhanced indexes for job_scraped_listings
create index if not exists idx_job_scraped_compound_date_remote on public.job_scraped_listings(posted_at desc, is_remote);
create index if not exists idx_job_scraped_compound_type_exp on public.job_scraped_listings(type, experience_level) where type is not null and experience_level is not null;
create index if not exists idx_job_scraped_salary on public.job_scraped_listings(salary_max desc) where salary_max is not null;
create index if not exists idx_job_scraped_featured on public.job_scraped_listings(featured, posted_at desc) where featured = true;
-- Removed deadline index with now() - not immutable
-- create index if not exists idx_job_scraped_deadline on public.job_scraped_listings(deadline) where deadline is not null and deadline > now();

-- Full-text search for scraped listings
create index if not exists idx_job_scraped_search on public.job_scraped_listings using gin(search_vector) where search_vector is not null;
create index if not exists idx_job_scraped_tags on public.job_scraped_listings using gin(tags) where tags is not null and array_length(tags, 1) > 0;

-- Trigram indexes for better ILIKE performance
create index if not exists idx_job_scraped_title_trgm on public.job_scraped_listings using gin(title gin_trgm_ops);
create index if not exists idx_job_scraped_company_trgm on public.job_scraped_listings using gin(company gin_trgm_ops);

-- Search vector update function for scraped listings
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

-- Updated_at trigger for scraped listings
create or replace function public.set_job_scraped_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply triggers to scraped listings
drop trigger if exists job_scraped_listings_search_vector on public.job_scraped_listings;
create trigger job_scraped_listings_search_vector
  before insert or update on public.job_scraped_listings
  for each row execute function public.job_scraped_listings_update_search_vector();

drop trigger if exists job_scraped_set_updated_at on public.job_scraped_listings;
create trigger job_scraped_set_updated_at
  before update on public.job_scraped_listings
  for each row execute function public.set_job_scraped_updated_at();

-- Enhanced scrape_runs table with better tracking
alter table public.scrape_runs 
  add column if not exists duration_ms integer;

alter table public.scrape_runs 
  add column if not exists items_processed integer default 0;

alter table public.scrape_runs 
  add column if not exists items_skipped integer default 0;

-- Better indexes for scrape_runs monitoring
create index if not exists idx_scrape_runs_status_date on public.scrape_runs(status, started_at desc);
create index if not exists idx_scrape_runs_duration on public.scrape_runs(duration_ms desc) where duration_ms is not null;
create index if not exists idx_scrape_runs_items on public.scrape_runs(items_inserted desc, started_at desc);

-- Function to automatically calculate scrape run duration
create or replace function public.calculate_scrape_duration()
returns trigger as $$
begin
  if new.ended_at is not null and new.started_at is not null then
    new.duration_ms = extract(epoch from (new.ended_at - new.started_at)) * 1000;
  end if;
  return new;
end;
$$ language plpgsql;

-- Apply duration calculation trigger
drop trigger if exists scrape_runs_calculate_duration on public.scrape_runs;
create trigger scrape_runs_calculate_duration
  before update on public.scrape_runs
  for each row execute function public.calculate_scrape_duration();

-- RLS for scraped tables (public read access)
alter table public.job_scraped_listings enable row level security;
alter table public.scrape_runs enable row level security;

drop policy if exists "read scraped listings" on public.job_scraped_listings;
create policy "read scraped listings" 
  on public.job_scraped_listings 
  for select 
  using (true);

drop policy if exists "read scrape runs" on public.scrape_runs;
create policy "read scrape runs" 
  on public.scrape_runs 
  for select 
  using (true);

-- Grants for scraped tables
grant select on table public.job_scraped_listings to anon, authenticated;
grant select, insert, update, delete on table public.job_scraped_listings to service_role;

grant select on table public.scrape_runs to anon, authenticated;
grant select, insert, update, delete on table public.scrape_runs to service_role;