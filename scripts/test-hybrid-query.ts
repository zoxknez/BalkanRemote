#!/usr/bin/env tsx
import './env'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testQueries() {
  console.log('\n=== Test 1: Query hybrid_jobs table directly ===')
  const { data: directData, error: directError } = await supabase
    .from('hybrid_jobs')
    .select('*')
    .limit(5)
  
  console.log('Direct table results:', directData?.length || 0)
  if (directError) console.error('Error:', directError)
  if (directData) console.log('Sample:', directData[0])

  console.log('\n=== Test 2: Query hybrid_jobs_public view ===')
  const { data: viewData, error: viewError } = await supabase
    .from('hybrid_jobs_public')
    .select('*')
    .limit(5)
  
  console.log('View results:', viewData?.length || 0)
  if (viewError) console.error('Error:', viewError)
  if (viewData) console.log('Sample:', viewData[0])

  console.log('\n=== Test 3: Check quality scores ===')
  const { data: qualityData, error: qualityError } = await supabase
    .from('hybrid_jobs')
    .select('id, title, quality_score, posted_date, expires_at')
    .limit(10)
  
  console.log('Quality check:')
  qualityData?.forEach(job => {
    console.log(`- ${job.title}: quality=${job.quality_score}, posted=${job.posted_date}, expires=${job.expires_at}`)
  })
}

void testQueries()

export {}
