-- Hotfix for missing search_vector column
alter table public.job_scraped_listings 
  add column if not exists search_vector tsvector;

-- Now add the index
create index if not exists idx_job_scraped_search 
  on public.job_scraped_listings using gin(search_vector) 
  where search_vector is not null;