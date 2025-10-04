-- Public view over jobs without raw/internal columns
create or replace view jobs_public_v as
  select stable_key, source_id, source_name, title, company, location, remote,
         salary_min, salary_max, salary_currency, posted_at, apply_url
  from jobs;

-- Principle of least privilege: revoke broad anon access to table and grant to view
revoke all on table jobs from anon;
grant select on jobs_public_v to anon;
