#!/usr/bin/env tsx
/**
 * Script za scraping hybrid/onsite poslova sa Balkanskih izvora
 * Popunjava hybrid_jobs tabelu
 */

import './env'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase env vars')
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

interface HybridJobInsert {
  external_id: string
  source_name: string  // Changed from source_id to match table schema
  title: string
  company_name: string | null
  location: string | null
  work_type: 'hybrid' | 'onsite' | 'flexible' | 'remote-optional'
  country_code: string | null
  region: string | null
  description: string | null
  application_url: string | null  // Changed from url
  source_website: string | null   // Changed from source_url
  experience_level: string | null
  employment_type: string | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: string | null
  skills: string[] | null
  technologies: string[] | null
  posted_date: string  // Changed from posted_at to match table schema
  scraped_at: string
  quality_score?: number  // Added for view visibility
}

// Privremeno mock data dok ne implementiramo pravi scraper
const MOCK_HYBRID_JOBS: HybridJobInsert[] = [
  {
    external_id: 'mjob-rs-001',
    source_name: 'MJob.rs',
    title: 'Frontend Developer - React',
    company_name: 'Tech Srbija d.o.o.',
    location: 'Beograd, Srbija',
    work_type: 'hybrid',
    country_code: 'RS',
    region: 'BALKAN',
    description: 'Tražimo junior/mid frontend developera sa poznavanjem React-a. Rad u kancelariji 2 dana nedeljno.',
    application_url: 'https://www.mjob.rs/poslovi/frontend-developer-001',
    source_website: 'https://www.mjob.rs',
    experience_level: 'mid',
    employment_type: 'full-time',
    salary_min: 1200,
    salary_max: 1800,
    salary_currency: 'EUR',
    skills: ['React', 'JavaScript', 'CSS', 'HTML'],
    technologies: ['React', 'Next.js', 'TailwindCSS'],
    posted_date: new Date().toISOString(),
    scraped_at: new Date().toISOString(),
    quality_score: 75
  },
  {
    external_id: 'mojedelo-si-001',
    source_name: 'MojeDelo.com',
    title: 'Backend Developer - Node.js',
    company_name: 'Slovenian Tech Solutions',
    location: 'Ljubljana, Slovenia',
    work_type: 'onsite',
    country_code: 'SI',
    region: 'BALKAN',
    description: 'Iščemo backend razvijalca z izkušnjami v Node.js in PostgreSQL. Delo v pisarni v Ljubljani.',
    application_url: 'https://www.mojedelo.com/oglasi/backend-developer-001',
    source_website: 'https://www.mojedelo.com',
    experience_level: 'senior',
    employment_type: 'full-time',
    salary_min: 2500,
    salary_max: 3500,
    salary_currency: 'EUR',
    skills: ['Node.js', 'PostgreSQL', 'TypeScript', 'API Design'],
    technologies: ['Node.js', 'Express', 'PostgreSQL', 'Docker'],
    posted_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    scraped_at: new Date().toISOString(),
    quality_score: 80
  },
  {
    external_id: 'mojaplata-mk-001',
    source_name: 'MojaPlata.mk',
    title: 'Full Stack Developer',
    company_name: 'Macedonian IT Company',
    location: 'Skopje, North Macedonia',
    work_type: 'flexible',
    country_code: 'MK',
    region: 'BALKAN',
    description: 'Потребен full stack програмер со искуство во React и Node.js. Хибриден модел на работа.',
    application_url: 'https://mojaplata.mk/oglasi/fullstack-001',
    source_website: 'https://mojaplata.mk',
    experience_level: 'mid',
    employment_type: 'full-time',
    salary_min: 1000,
    salary_max: 1500,
    salary_currency: 'EUR',
    skills: ['React', 'Node.js', 'MongoDB', 'Express'],
    technologies: ['React', 'Node.js', 'MongoDB', 'REST API'],
    posted_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    scraped_at: new Date().toISOString(),
    quality_score: 70
  },
  {
    external_id: 'posao-ba-hybrid-001',
    source_name: 'Posao.ba',
    title: 'DevOps Engineer',
    company_name: 'BH Tech Solutions',
    location: 'Sarajevo, Bosnia and Herzegovina',
    work_type: 'hybrid',
    country_code: 'BA',
    region: 'BALKAN',
    description: 'Tražimo DevOps inženjera sa iskustvom u AWS i Docker-u. Rad u kancelariji 3 dana sedmično.',
    application_url: 'https://posao.ba/oglasi/devops-engineer-001',
    source_website: 'https://posao.ba',
    experience_level: 'senior',
    employment_type: 'full-time',
    salary_min: 1500,
    salary_max: 2200,
    salary_currency: 'EUR',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
    technologies: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform'],
    posted_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    scraped_at: new Date().toISOString(),
    quality_score: 85
  },
  {
    external_id: 'mjob-rs-002',
    source_name: 'MJob.rs',
    title: 'Marketing Coordinator',
    company_name: 'Digital Agency Belgrade',
    location: 'Beograd, Srbija',
    work_type: 'onsite',
    country_code: 'RS',
    region: 'BALKAN',
    description: 'Potreban marketing koordinator za digitalnu agenciju. Rad u kancelariji, full time.',
    application_url: 'https://www.mjob.rs/poslovi/marketing-coordinator-002',
    source_website: 'https://www.mjob.rs',
    experience_level: 'junior',
    employment_type: 'full-time',
    salary_min: 800,
    salary_max: 1200,
    salary_currency: 'EUR',
    skills: ['Digital Marketing', 'Social Media', 'Content Creation', 'Analytics'],
    technologies: ['Google Analytics', 'Facebook Ads', 'Instagram', 'Canva'],
    posted_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    scraped_at: new Date().toISOString(),
    quality_score: 65
  }
]

async function upsertHybridJobs(jobs: HybridJobInsert[]) {
  logger.event('hybrid_jobs_upsert_start', { count: jobs.length })
  
  const { data, error } = await supabase
    .from('hybrid_jobs')
    .upsert(jobs, { 
      onConflict: 'external_id,source_name',
      ignoreDuplicates: false 
    })
    .select()

  if (error) {
    logger.error('Failed to upsert hybrid jobs', error)
    throw error
  }

  logger.event('hybrid_jobs_upsert_success', { 
    inserted: data?.length || 0,
    sources: [...new Set(jobs.map(j => j.source_name))]
  })
  
  return data
}

async function main() {
  const t0 = Date.now()
  console.log('[hybrid-scraper] Starting hybrid jobs scraping...')
  
  try {
    // Za sada ubacujemo mock data
    // U budućnosti ovde ide pravi scraper
    console.log('[hybrid-scraper] Inserting mock hybrid jobs...')
    const inserted = await upsertHybridJobs(MOCK_HYBRID_JOBS)
    
    const dt = Date.now() - t0
    console.log(`[hybrid-scraper] Done in ${dt}ms`)
    console.log(`[hybrid-scraper] Inserted ${inserted?.length || 0} jobs`)
    console.log('[hybrid-scraper] Sources:', [...new Set(MOCK_HYBRID_JOBS.map(j => j.source_name))])
  } catch (err) {
    console.error('[hybrid-scraper] FAILED:', (err as Error)?.message || err)
    process.exitCode = 1
  }
}

void main()

export {}
