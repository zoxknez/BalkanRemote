-- Migration for creating hybrid/onsite jobs table
-- This table will store job postings that are not fully remote (hybrid, onsite, flexible)

-- Create table for hybrid/onsite jobs from Balkan region
CREATE TABLE public.hybrid_jobs (
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

-- Create indexes for performance
CREATE INDEX idx_hybrid_jobs_location ON public.hybrid_jobs(location);
CREATE INDEX idx_hybrid_jobs_country ON public.hybrid_jobs(country_code);
CREATE INDEX idx_hybrid_jobs_work_type ON public.hybrid_jobs(work_type);
CREATE INDEX idx_hybrid_jobs_category ON public.hybrid_jobs(category);
CREATE INDEX idx_hybrid_jobs_posted_date ON public.hybrid_jobs(posted_date DESC);
CREATE INDEX idx_hybrid_jobs_scraped_at ON public.hybrid_jobs(scraped_at DESC);
CREATE INDEX idx_hybrid_jobs_source ON public.hybrid_jobs(source_name);
CREATE INDEX idx_hybrid_jobs_quality ON public.hybrid_jobs(quality_score DESC);
CREATE INDEX idx_hybrid_jobs_skills ON public.hybrid_jobs USING GIN(skills);
CREATE INDEX idx_hybrid_jobs_technologies ON public.hybrid_jobs USING GIN(technologies);

-- Full text search index
CREATE INDEX idx_hybrid_jobs_search ON public.hybrid_jobs USING GIN(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(company_name, ''))
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_hybrid_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_hybrid_jobs_updated_at
  BEFORE UPDATE ON public.hybrid_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_hybrid_jobs_updated_at();

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_hybrid_job_views(job_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.hybrid_jobs 
  SET view_count = view_count + 1 
  WHERE id = job_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to toggle bookmark
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

-- Policy for reading hybrid jobs (allow all)
CREATE POLICY "Allow read access to hybrid jobs" ON public.hybrid_jobs
  FOR SELECT USING (true);

-- Policy for inserting hybrid jobs (allow authenticated users)
CREATE POLICY "Allow insert for authenticated users" ON public.hybrid_jobs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy for updating hybrid jobs (allow authenticated users to update their own data)
CREATE POLICY "Allow update for authenticated users" ON public.hybrid_jobs
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create view for public API
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
  AND expires_at > now() -- Only show non-expired jobs
ORDER BY posted_date DESC;

COMMENT ON TABLE public.hybrid_jobs IS 'Table for storing hybrid, onsite and flexible job postings from Balkan region';
COMMENT ON VIEW public.hybrid_jobs_public IS 'Public view of hybrid jobs with quality filtering';