-- EUR columns (nullable)
alter table jobs
  add column if not exists salary_min_eur numeric,
  add column if not exists salary_max_eur numeric;

-- Sort by EUR values (optional but useful)
create index if not exists jobs_salary_eur_desc_idx
  on jobs (salary_max_eur desc, posted_at desc);

-- Public view now includes *_eur and excludes raw/internal columns
create or replace view jobs_public_v as
select
  stable_key, source_id, source_name, title, company, location, remote,
  salary_min, salary_max, salary_currency,
  salary_min_eur, salary_max_eur,
  posted_at, apply_url
from jobs;
