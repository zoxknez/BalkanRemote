-- Ensure trigram extension and helpful indexes for better ilike/or queries
create extension if not exists pg_trgm;

create index if not exists jobs_title_trgm_idx
  on jobs using gin (title gin_trgm_ops);

create index if not exists jobs_company_trgm_idx
  on jobs using gin (company gin_trgm_ops);

create index if not exists jobs_location_trgm_idx
  on jobs using gin (location gin_trgm_ops);

-- Stable pagination sort: by posted_at then stable_key
create index if not exists jobs_posted_at_stable_idx
  on jobs (posted_at desc, stable_key);
