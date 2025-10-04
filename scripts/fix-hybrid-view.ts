#!/usr/bin/env tsx
import './env'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const fixViewSQL = `
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
WHERE quality_score >= 50
  AND (expires_at IS NULL OR expires_at > now())
ORDER BY posted_date DESC NULLS LAST;

GRANT SELECT ON public.hybrid_jobs_public TO anon, authenticated;
`

async function fixView() {
  console.log('Fixing hybrid_jobs_public view...')
  
  const { data, error } = await supabase.rpc('exec_sql', { sql: fixViewSQL })
  
  if (error) {
    console.error('Error:', error)
    console.log('\n⚠️  RPC failed. You need to run this SQL manually in Supabase dashboard:')
    console.log(fixViewSQL)
  } else {
    console.log('✅ View fixed successfully!')
  }
}

void fixView()

export {}
