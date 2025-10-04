-- Recreate hybrid_jobs_public view with correct filtering

DROP VIEW IF EXISTS public.hybrid_jobs_public CASCADE;

CREATE OR REPLACE VIEW public.hybrid_jobs_public AS
SELECT 
  id,
  title,
  description,
  company_name,
  company_website,
  location,
  country_code,
  region,
  work_type,
  salary_min,
  salary_max,
  salary_currency,
  experience_level,
  employment_type,
  category,
  skills,
  technologies,
  application_url,
  application_email,
  external_id,
  source_name,
  source_website,
  scraped_at,
  posted_date,
  expires_at,
  is_verified,
  quality_score,
  view_count,
  bookmark_count,
  created_at,
  updated_at
FROM public.hybrid_jobs
WHERE quality_score >= 50 -- Only show quality jobs (50+)
  AND (expires_at IS NULL OR expires_at > now()) -- Only show non-expired jobs
ORDER BY posted_date DESC NULLS LAST;

-- Grant permissions
GRANT SELECT ON public.hybrid_jobs_public TO anon, authenticated;

COMMENT ON VIEW public.hybrid_jobs_public IS 'Public view of hybrid/onsite jobs with quality filtering (score >= 50)';
