-- Migration for creating hybrid/onsite jobs table
-- This table will store job postings that are not fully remote (hybrid, onsite, flexible)

-- Create table for hybrid/onsite jobs from Balkan region (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.hybrid_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic job information
  title TEXT NOT NULL,
  description TEXT,
  company_name TEXT,
  company_website TEXT,
  
  -- Location and work type
  location TEXT,
  country_code VARCHAR(2),
  region VARCHAR(10), -- 'BALKAN', 'EU', etc.
  work_type VARCHAR(20) NOT NULL CHECK (work_type IN ('hybrid', 'onsite', 'flexible', 'remote-optional')),
  
  -- Job details
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency VARCHAR(3) DEFAULT 'EUR',
  experience_level VARCHAR(20) CHECK (experience_level IN ('junior', 'mid', 'senior', 'lead', 'executive')),
  employment_type VARCHAR(20) CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship')),
  
  -- Categories and skills
  category VARCHAR(30),
  skills TEXT[], -- Array of required skills
  technologies TEXT[], -- Array of technologies
  
  -- Application details
  application_url TEXT,
  application_email TEXT,
  external_id TEXT, -- ID from source job board
  
  -- Source and tracking
  source_name TEXT NOT NULL,
  source_website TEXT,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  posted_date TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Quality and validation
  is_verified BOOLEAN DEFAULT false,
  quality_score INTEGER DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
  view_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  UNIQUE(external_id, source_name), -- Prevent duplicates from same source
  CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max)
);

-- Create indexes for performance (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_hybrid_jobs_location') THEN
    CREATE INDEX idx_hybrid_jobs_location ON public.hybrid_jobs(location);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_hybrid_jobs_country') THEN
    CREATE INDEX idx_hybrid_jobs_country ON public.hybrid_jobs(country_code);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_hybrid_jobs_work_type') THEN
    CREATE INDEX idx_hybrid_jobs_work_type ON public.hybrid_jobs(work_type);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_hybrid_jobs_category') THEN
    CREATE INDEX idx_hybrid_jobs_category ON public.hybrid_jobs(category);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_hybrid_jobs_posted_date') THEN
    CREATE INDEX idx_hybrid_jobs_posted_date ON public.hybrid_jobs(posted_date DESC);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_hybrid_jobs_scraped_at') THEN
    CREATE INDEX idx_hybrid_jobs_scraped_at ON public.hybrid_jobs(scraped_at DESC);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_hybrid_jobs_source') THEN
    CREATE INDEX idx_hybrid_jobs_source ON public.hybrid_jobs(source_name);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_hybrid_jobs_quality') THEN
    CREATE INDEX idx_hybrid_jobs_quality ON public.hybrid_jobs(quality_score DESC);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_hybrid_jobs_skills') THEN
    CREATE INDEX idx_hybrid_jobs_skills ON public.hybrid_jobs USING GIN(skills);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_hybrid_jobs_technologies') THEN
    CREATE INDEX idx_hybrid_jobs_technologies ON public.hybrid_jobs USING GIN(technologies);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_hybrid_jobs_search') THEN
    CREATE INDEX idx_hybrid_jobs_search ON public.hybrid_jobs USING GIN(
      to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(company_name, ''))
    );
  END IF;
END $$;

-- Create functions
CREATE OR REPLACE FUNCTION update_hybrid_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_hybrid_jobs_updated_at') THEN
    CREATE TRIGGER trigger_hybrid_jobs_updated_at
      BEFORE UPDATE ON public.hybrid_jobs
      FOR EACH ROW
      EXECUTE FUNCTION update_hybrid_jobs_updated_at();
  END IF;
END $$;

-- Create utility functions
CREATE OR REPLACE FUNCTION increment_hybrid_job_views(job_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.hybrid_jobs 
  SET view_count = view_count + 1 
  WHERE id = job_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION toggle_hybrid_job_bookmark(job_id UUID, increment BOOLEAN DEFAULT true)
RETURNS void AS $$
BEGIN
  IF increment THEN
    UPDATE public.hybrid_jobs 
    SET bookmark_count = bookmark_count + 1 
    WHERE id = job_id;
  ELSE
    UPDATE public.hybrid_jobs 
    SET bookmark_count = GREATEST(bookmark_count - 1, 0)
    WHERE id = job_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS)
ALTER TABLE public.hybrid_jobs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow read access to hybrid jobs" ON public.hybrid_jobs;
  DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.hybrid_jobs;
  DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.hybrid_jobs;
EXCEPTION WHEN others THEN
  NULL; -- Ignore errors if policies don't exist
END $$;

-- Create policies
CREATE POLICY "Allow read access to hybrid jobs" ON public.hybrid_jobs
  FOR SELECT USING (true);

CREATE POLICY "Allow insert for authenticated users" ON public.hybrid_jobs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update for authenticated users" ON public.hybrid_jobs
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create or replace view for public API
CREATE OR REPLACE VIEW public.hybrid_jobs_public AS
SELECT 
  id,
  title,
  description,
  company_name,
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
  source_name,
  posted_date,
  quality_score,
  view_count,
  bookmark_count,
  created_at
FROM public.hybrid_jobs
WHERE quality_score >= 50 -- Only show quality jobs
  AND (expires_at IS NULL OR expires_at > now()) -- Only show non-expired jobs
ORDER BY posted_date DESC;

COMMENT ON TABLE public.hybrid_jobs IS 'Table for storing hybrid, onsite and flexible job postings from Balkan region';
COMMENT ON VIEW public.hybrid_jobs_public IS 'Public view of hybrid jobs with quality filtering';