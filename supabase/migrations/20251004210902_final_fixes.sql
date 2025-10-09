-- Final fixes and schema validation

-- Add missing constraints and indexes that might have been missed

-- Ensure jobs table is properly optimized (from original migrations)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'jobs_salary_check' 
    AND table_name = 'jobs'
  ) THEN
    ALTER TABLE public.jobs 
    ADD CONSTRAINT jobs_salary_check 
    CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max);
  END IF;
END $$;

-- Add EUR conversion function for salary normalization
create or replace function public.convert_to_eur(
  amount numeric,
  from_currency text,
  rate_date date default current_date
)
returns numeric as $$
declare
  eur_amount numeric;
  conversion_rate numeric;
begin
  -- Simple currency conversion (in production, you'd use live rates)
  case from_currency
    when 'USD' then conversion_rate = 0.92;
    when 'EUR' then conversion_rate = 1.0;
    when 'RSD' then conversion_rate = 0.0085;
    when 'GBP' then conversion_rate = 1.15;
    when 'CHF' then conversion_rate = 1.02;
    when 'CAD' then conversion_rate = 0.68;
    when 'AUD' then conversion_rate = 0.61;
    else conversion_rate = 1.0; -- fallback
  end case;
  
  return amount * conversion_rate;
end;
$$ language plpgsql immutable;

-- Update jobs table with EUR columns if missing
alter table public.jobs 
  add column if not exists salary_min_eur numeric generated always as (
    case 
      when salary_min is not null and salary_currency is not null 
      then convert_to_eur(salary_min, salary_currency)
      else null 
    end
  ) stored;

alter table public.jobs 
  add column if not exists salary_max_eur numeric generated always as (
    case 
      when salary_max is not null and salary_currency is not null 
      then convert_to_eur(salary_max, salary_currency)
      else null 
    end
  ) stored;

-- Recreate jobs_public_v view to include EUR columns
create or replace view public.jobs_public_v as
select
  stable_key, 
  source_id, 
  source_name, 
  title, 
  company, 
  location, 
  remote,
  salary_min, 
  salary_max, 
  salary_currency,
  salary_min_eur, 
  salary_max_eur,
  posted_at, 
  apply_url
from public.jobs;

-- Grant access to the view
grant select on public.jobs_public_v to anon, authenticated;

-- Create notification function for PostgREST schema reload
create or replace function public.reload_postgrest_schema()
returns void as $$
begin
  notify pgrst, 'reload schema';
end;
$$ language plpgsql;

grant execute on function public.reload_postgrest_schema() to authenticated, anon, service_role;

-- Ensure proper grants on sequence objects
grant usage, select on all sequences in schema public to anon, authenticated, service_role;

-- Create comprehensive database health check function
create or replace function public.database_health_check()
returns table(
  table_name text,
  row_count bigint,
  index_count bigint,
  last_analyze timestamptz,
  table_size_mb numeric
) as $$
begin
  return query
  select 
    schemaname||'.'||tablename as table_name,
    n_tup_ins + n_tup_upd as row_count,
    (select count(*) from pg_indexes where schemaname = 'public' and tablename = pg_stat_user_tables.relname) as index_count,
    last_analyze,
    round((pg_total_relation_size(schemaname||'.'||tablename)::numeric / (1024*1024)), 2) as table_size_mb
  from pg_stat_user_tables 
  where schemaname = 'public'
  and relname in ('job_portal_listings', 'job_scraped_listings', 'jobs', 'scrape_runs', 'job_feed_stats', 'job_portal_bookmarks')
  order by table_size_mb desc;
end;
$$ language plpgsql;

grant execute on function public.database_health_check() to service_role;

-- Analyze all tables to update statistics
analyze public.job_portal_listings;
analyze public.job_scraped_listings;
analyze public.jobs;
analyze public.scrape_runs;
analyze public.job_feed_stats;