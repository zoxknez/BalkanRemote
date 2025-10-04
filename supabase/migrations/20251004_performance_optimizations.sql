-- Performance optimizations and materialized views

-- Create materialized view for job analytics
create materialized view if not exists public.job_portal_analytics as
select 
  date_trunc('day', posted_at) as day,
  source_id,
  category,
  type,
  experience_level,
  is_remote,
  count(*) as job_count,
  count(*) filter (where featured = true) as featured_count,
  avg(salary_max) as avg_salary_max,
  percentile_cont(0.5) within group (order by salary_max) as median_salary_max
from public.job_portal_listings
where posted_at >= current_date - interval '90 days'
group by 1, 2, 3, 4, 5, 6;

-- Index on materialized view
create unique index if not exists job_portal_analytics_unique_idx 
  on public.job_portal_analytics(day, source_id, category, type, experience_level, is_remote);

-- Function to refresh analytics
create or replace function public.refresh_job_analytics()
returns void as $$
begin
  refresh materialized view concurrently public.job_portal_analytics;
end;
$$ language plpgsql;

-- Grant access to analytics
grant select on public.job_portal_analytics to anon, authenticated, service_role;
grant execute on function public.refresh_job_analytics() to service_role;

-- Create index on commonly filtered job portal columns for faster facet queries
create index if not exists job_portal_facet_combo_idx 
  on public.job_portal_listings(type, category, experience_level, is_remote, posted_at desc)
  where type is not null and category is not null and experience_level is not null;

-- Partial index for recent active jobs only
create index if not exists job_portal_recent_active_idx 
  on public.job_portal_listings(posted_at desc, id)
  where posted_at >= current_date - interval '30 days'
  and (deadline is null or deadline > now());

-- Function to cleanup old job listings
create or replace function public.cleanup_old_job_listings()
returns void as $$
declare
  deleted_count integer;
begin
  -- Delete job portal listings older than 6 months
  delete from public.job_portal_listings 
  where posted_at < current_date - interval '6 months';
  
  get diagnostics deleted_count = row_count;
  
  -- Log the cleanup operation
  insert into public.scrape_runs (
    source_id, 
    status, 
    notes, 
    items_processed
  ) values (
    'cleanup', 
    'ok', 
    'Cleaned up old job portal listings',
    deleted_count
  );
  
  -- Delete scraped listings older than 3 months
  delete from public.job_scraped_listings 
  where posted_at < current_date - interval '3 months';
  
  get diagnostics deleted_count = row_count;
  
  -- Log the cleanup operation
  insert into public.scrape_runs (
    source_id, 
    status, 
    notes, 
    items_processed
  ) values (
    'cleanup_scraped', 
    'ok', 
    'Cleaned up old scraped listings',
    deleted_count
  );
  
  -- Refresh analytics after cleanup
  perform public.refresh_job_analytics();
end;
$$ language plpgsql;

-- Grant cleanup function to service role only
grant execute on function public.cleanup_old_job_listings() to service_role;

-- Create function for fast job search with rankings
create or replace function public.search_jobs(
  search_query text default null,
  job_type text default null,
  job_category text default null,
  job_experience text default null,
  remote_only boolean default null,
  limit_count integer default 20,
  offset_count integer default 0
)
returns table(
  id uuid,
  title text,
  company text,
  location text,
  type text,
  category text,
  is_remote boolean,
  posted_at timestamptz,
  salary_max numeric,
  rank real
) as $$
begin
  return query
  select 
    jpl.id,
    jpl.title,
    jpl.company,
    jpl.location,
    jpl.type,
    jpl.category,
    jpl.is_remote,
    jpl.posted_at,
    jpl.salary_max,
    case 
      when search_query is not null then 
        ts_rank_cd(jpl.search_vector, plainto_tsquery('simple', search_query))
      else 0.5
    end as rank
  from public.job_portal_listings jpl
  where 
    (search_query is null or jpl.search_vector @@ plainto_tsquery('simple', search_query))
    and (job_type is null or jpl.type = job_type)
    and (job_category is null or jpl.category = job_category)
    and (job_experience is null or jpl.experience_level = job_experience)
    and (remote_only is null or (remote_only = true and jpl.is_remote = true))
    and jpl.posted_at >= current_date - interval '90 days'
  order by 
    case when search_query is not null then rank else 0 end desc,
    jpl.featured desc,
    jpl.posted_at desc
  limit limit_count
  offset offset_count;
end;
$$ language plpgsql;

-- Grant search function to all roles
grant execute on function public.search_jobs(text, text, text, text, boolean, integer, integer) 
  to anon, authenticated, service_role;