-- Add posted_at column to hybrid_jobs table for consistency with job_portal_listings

ALTER TABLE public.hybrid_jobs 
ADD COLUMN IF NOT EXISTS posted_at TIMESTAMP WITH TIME ZONE;

-- Create index on posted_at
CREATE INDEX IF NOT EXISTS idx_hybrid_jobs_posted_at 
ON public.hybrid_jobs(posted_at DESC);

-- Update existing records to copy posted_date to posted_at
UPDATE public.hybrid_jobs 
SET posted_at = posted_date 
WHERE posted_at IS NULL AND posted_date IS NOT NULL;

-- Add default value for new records
ALTER TABLE public.hybrid_jobs 
ALTER COLUMN posted_at SET DEFAULT now();

-- Recreate the view to include posted_at
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
  posted_at,
  expires_at,
  is_verified,
  quality_score,
  view_count,
  bookmark_count,
  created_at,
  updated_at
FROM public.hybrid_jobs
WHERE is_verified = true OR quality_score >= 30;

-- Grant permissions
GRANT SELECT ON public.hybrid_jobs_public TO anon, authenticated;

COMMENT ON VIEW public.hybrid_jobs_public IS 'Public view of hybrid jobs with posted_at column';
