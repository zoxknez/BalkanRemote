#!/usr/bin/env tsx
/**
 * Hybrid/Onsite Jobs Scraper za Balkanske izvore
 * 
 * Prikuplja hybrid i onsite poslove sa sledećih izvora:
 * - Halo Oglasi (Srbija)
 * - Infostud/Poslovi.infostud.com (Srbija)
 * - NSZ - Nacionalna služba za zapošljavanje (Srbija)
 * - MojPosao.net (Hrvatska)
 * - Posao.ba (BiH)
 * - MojeDelo.com (Slovenija)
 * - MojaPlata.mk (Severna Makedonija)
 * 
 * Usage:
 *   npm run sync:hybrid-jobs
 *   DRY_RUN=1 npm run sync:hybrid-jobs  (test mode, no DB writes)
 */

import './env'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import axios from 'axios'
import * as cheerio from 'cheerio'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const isDryRun = process.env.DRY_RUN === '1'

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

interface HybridJobInsert {
  external_id: string
  source_name: string
  title: string
  company_name: string | null
  location: string | null
  work_type: 'hybrid' | 'onsite' | 'flexible' | 'remote-optional'
  country_code: string | null
  region: string | null
  category: string | null
  description: string | null
  application_url: string | null
  source_website: string | null
  experience_level: string | null
  employment_type: string | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: string | null
  skills: string[] | null
  technologies: string[] | null
  posted_date: string
  scraped_at: string
  quality_score?: number
}

interface ScraperSource {
  id: string
  name: string
  country: string
  countryCode: string
  baseUrl: string
  scrapeUrl: string
  enabled: boolean
  scraper: (source: ScraperSource) => Promise<HybridJobInsert[]>
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function normalizeWorkType(text: string): 'hybrid' | 'onsite' | 'flexible' | 'remote-optional' {
  const lower = text.toLowerCase()
  
  if (lower.includes('hibrid') || lower.includes('hybrid')) return 'hybrid'
  if (lower.includes('flexibil') || lower.includes('flexible')) return 'flexible'
  if (lower.includes('remote opciono') || lower.includes('remote optional')) return 'remote-optional'
  
  return 'onsite' // default
}

function extractSalary(text: string): { min: number | null; max: number | null; currency: string | null } {
  const result = { min: null as number | null, max: null as number | null, currency: null as string | null }
  
  // Match patterns like: "1000-1500 EUR", "800€", "$2000-3000", "RSD 120,000"
  const patterns = [
    /(\d{1,3}(?:[,.\s]?\d{3})*)\s*-\s*(\d{1,3}(?:[,.\s]?\d{3})*)\s*(EUR|€|USD|\$|RSD|BAM|HRK|MKD)/i,
    /(\d{1,3}(?:[,.\s]?\d{3})*)\s*(EUR|€|USD|\$|RSD|BAM|HRK|MKD)/i
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      if (match[2] && match[3]) {
        // Range pattern
        result.min = parseInt(match[1].replace(/[,.\s]/g, ''))
        result.max = parseInt(match[2].replace(/[,.\s]/g, ''))
        result.currency = normalizeCurrency(match[3])
      } else if (match[1] && match[2]) {
        // Single value pattern
        result.min = parseInt(match[1].replace(/[,.\s]/g, ''))
        result.currency = normalizeCurrency(match[2])
      }
      break
    }
  }
  
  return result
}

function normalizeCurrency(curr: string): string {
  if (curr === '€') return 'EUR'
  if (curr === '$') return 'USD'
  return curr.toUpperCase()
}

function extractExperienceLevel(text: string): string | null {
  const lower = text.toLowerCase()
  
  if (lower.includes('junior') || lower.includes('entry')) return 'junior'
  if (lower.includes('senior') || lower.includes('lead')) return 'senior'
  if (lower.includes('mid') || lower.includes('intermediate')) return 'mid'
  
  return null
}

function calculateQualityScore(job: HybridJobInsert): number {
  let score = 50 // base score
  
  if (job.salary_min && job.salary_max) score += 15
  if (job.company_name) score += 10
  if (job.description && job.description.length > 100) score += 10
  if (job.skills && job.skills.length > 0) score += 10
  if (job.experience_level) score += 5
  
  return Math.min(100, score)
}

// ============================================================================
// SCRAPERS BY SOURCE
// ============================================================================

async function scrapeInfostud(source: ScraperSource): Promise<HybridJobInsert[]> {
  logger.event('scraper_start', { source: source.id })
  const jobs: HybridJobInsert[] = []
  
  try {
    // Infostud poslovi.infostud.com hybrid/onsite poslovi
    // NOTE: Ovo je MOCK implementacija - potrebno je implementirati pravi scraper
    // sa respektovanjem robots.txt i rate limiting-a
    
    logger.warn('Infostud scraper not yet implemented - returning mock data')
    
    // Mock data za demonstraciju
    jobs.push({
      external_id: `infostud-${Date.now()}-1`,
      source_name: source.name,
      title: 'Senior Frontend Developer',
      company_name: 'Tech Company Serbia',
      location: 'Beograd, Srbija',
      work_type: 'hybrid',
      country_code: 'RS',
      region: 'BALKAN',
      category: 'software-engineering',
      description: 'Tražimo iskusnog frontend developera sa znanjem React-a i TypeScript-a.',
      application_url: 'https://poslovi.infostud.com/posao/Senior-Frontend-Developer/12345',
      source_website: source.baseUrl,
      experience_level: 'senior',
      employment_type: 'full-time',
      salary_min: 1500,
      salary_max: 2500,
      salary_currency: 'EUR',
      skills: ['React', 'TypeScript', 'CSS'],
      technologies: ['React', 'Next.js', 'TailwindCSS'],
      posted_date: new Date().toISOString(),
      scraped_at: new Date().toISOString(),
      quality_score: 80
    })
    
  } catch (error) {
    logger.error(`Failed to scrape ${source.id}`, error)
  }
  
  logger.event('scraper_complete', { source: source.id, count: jobs.length })
  return jobs
}

async function scrapeHaloOglasi(source: ScraperSource): Promise<HybridJobInsert[]> {
  logger.event('scraper_start', { source: source.id })
  const jobs: HybridJobInsert[] = []
  
  try {
    // Halo Oglasi - https://www.halooglasi.com/poslovi
    // NOTE: Mock implementacija
    
    logger.warn('Halo Oglasi scraper not yet implemented - returning mock data')
    
    jobs.push({
      external_id: `halooglasi-${Date.now()}-1`,
      source_name: source.name,
      title: 'Backend Developer - Node.js',
      company_name: 'IT Solutions Belgrade',
      location: 'Beograd, Srbija',
      work_type: 'onsite',
      country_code: 'RS',
      region: 'BALKAN',
      category: 'software-engineering',
      description: 'Backend developer pozicija sa radom u Node.js i PostgreSQL okruženju.',
      application_url: 'https://www.halooglasi.com/poslovi/backend-developer-nodejs/54321',
      source_website: source.baseUrl,
      experience_level: 'mid',
      employment_type: 'full-time',
      salary_min: 1200,
      salary_max: 1800,
      salary_currency: 'EUR',
      skills: ['Node.js', 'PostgreSQL', 'REST API'],
      technologies: ['Node.js', 'Express', 'PostgreSQL'],
      posted_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      scraped_at: new Date().toISOString(),
      quality_score: 75
    })
    
  } catch (error) {
    logger.error(`Failed to scrape ${source.id}`, error)
  }
  
  logger.event('scraper_complete', { source: source.id, count: jobs.length })
  return jobs
}

async function scrapeMojPosao(source: ScraperSource): Promise<HybridJobInsert[]> {
  logger.event('scraper_start', { source: source.id })
  const jobs: HybridJobInsert[] = []
  
  try {
    // MojPosao.net (Hrvatska)
    logger.warn('MojPosao scraper not yet implemented - returning mock data')
    
    jobs.push({
      external_id: `mojposao-${Date.now()}-1`,
      source_name: source.name,
      title: 'Full Stack Developer',
      company_name: 'Croatian Tech Startup',
      location: 'Zagreb, Hrvatska',
      work_type: 'hybrid',
      country_code: 'HR',
      region: 'BALKAN',
      category: 'software-engineering',
      description: 'Potreban full stack developer za rad na inovativnim projektima.',
      application_url: 'https://www.mojposao.net/oglas/full-stack-developer/67890',
      source_website: source.baseUrl,
      experience_level: 'mid',
      employment_type: 'full-time',
      salary_min: 1400,
      salary_max: 2000,
      salary_currency: 'EUR',
      skills: ['React', 'Node.js', 'MongoDB'],
      technologies: ['React', 'Node.js', 'MongoDB', 'Docker'],
      posted_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      scraped_at: new Date().toISOString(),
      quality_score: 78
    })
    
  } catch (error) {
    logger.error(`Failed to scrape ${source.id}`, error)
  }
  
  logger.event('scraper_complete', { source: source.id, count: jobs.length })
  return jobs
}

async function scrapePosaoBa(source: ScraperSource): Promise<HybridJobInsert[]> {
  logger.event('scraper_start', { source: source.id })
  const jobs: HybridJobInsert[] = []
  
  try {
    // Posao.ba (BiH)
    logger.warn('Posao.ba scraper not yet implemented - returning mock data')
    
    jobs.push({
      external_id: `posaoba-${Date.now()}-1`,
      source_name: source.name,
      title: 'DevOps Engineer',
      company_name: 'BH Tech Solutions',
      location: 'Sarajevo, BiH',
      work_type: 'hybrid',
      country_code: 'BA',
      region: 'BALKAN',
      category: 'software-engineering',
      description: 'DevOps pozicija sa radom na AWS infrastrukturi.',
      application_url: 'https://posao.ba/oglas/devops-engineer/11111',
      source_website: source.baseUrl,
      experience_level: 'senior',
      employment_type: 'full-time',
      salary_min: 1600,
      salary_max: 2400,
      salary_currency: 'EUR',
      skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
      technologies: ['AWS', 'Docker', 'Kubernetes', 'Jenkins'],
      posted_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      scraped_at: new Date().toISOString(),
      quality_score: 85
    })
    
  } catch (error) {
    logger.error(`Failed to scrape ${source.id}`, error)
  }
  
  logger.event('scraper_complete', { source: source.id, count: jobs.length })
  return jobs
}

async function scrapeMojeDelo(source: ScraperSource): Promise<HybridJobInsert[]> {
  logger.event('scraper_start', { source: source.id })
  const jobs: HybridJobInsert[] = []
  
  try {
    // MojeDelo.com (Slovenija)
    logger.warn('MojeDelo scraper not yet implemented - returning mock data')
    
    jobs.push({
      external_id: `mojedelo-${Date.now()}-1`,
      source_name: source.name,
      title: 'Software Engineer',
      company_name: 'Slovenian Tech Company',
      location: 'Ljubljana, Slovenija',
      work_type: 'onsite',
      country_code: 'SI',
      region: 'BALKAN',
      category: 'software-engineering',
      description: 'Software engineer pozicija za rad u Ljubljani.',
      application_url: 'https://www.mojedelo.com/oglas/software-engineer/22222',
      source_website: source.baseUrl,
      experience_level: 'mid',
      employment_type: 'full-time',
      salary_min: 2000,
      salary_max: 3000,
      salary_currency: 'EUR',
      skills: ['Java', 'Spring Boot', 'PostgreSQL'],
      technologies: ['Java', 'Spring', 'PostgreSQL', 'Microservices'],
      posted_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      scraped_at: new Date().toISOString(),
      quality_score: 82
    })
    
  } catch (error) {
    logger.error(`Failed to scrape ${source.id}`, error)
  }
  
  logger.event('scraper_complete', { source: source.id, count: jobs.length })
  return jobs
}

// ============================================================================
// SOURCE DEFINITIONS
// ============================================================================

const HYBRID_JOB_SOURCES: ScraperSource[] = [
  {
    id: 'infostud-rs',
    name: 'Poslovi Infostud',
    country: 'Srbija',
    countryCode: 'RS',
    baseUrl: 'https://poslovi.infostud.com',
    scrapeUrl: 'https://poslovi.infostud.com/poslovi',
    enabled: true,
    scraper: scrapeInfostud
  },
  {
    id: 'halooglasi-rs',
    name: 'Halo Oglasi',
    country: 'Srbija',
    countryCode: 'RS',
    baseUrl: 'https://www.halooglasi.com',
    scrapeUrl: 'https://www.halooglasi.com/poslovi',
    enabled: true,
    scraper: scrapeHaloOglasi
  },
  {
    id: 'mojposao-hr',
    name: 'MojPosao.net',
    country: 'Hrvatska',
    countryCode: 'HR',
    baseUrl: 'https://www.mojposao.net',
    scrapeUrl: 'https://www.mojposao.net/poslovi',
    enabled: true,
    scraper: scrapeMojPosao
  },
  {
    id: 'posaoba-ba',
    name: 'Posao.ba',
    country: 'BiH',
    countryCode: 'BA',
    baseUrl: 'https://posao.ba',
    scrapeUrl: 'https://posao.ba/poslovi',
    enabled: true,
    scraper: scrapePosaoBa
  },
  {
    id: 'mojedelo-si',
    name: 'MojeDelo.com',
    country: 'Slovenija',
    countryCode: 'SI',
    baseUrl: 'https://www.mojedelo.com',
    scrapeUrl: 'https://www.mojedelo.com/prosta-delovna-mesta',
    enabled: true,
    scraper: scrapeMojeDelo
  }
]

// ============================================================================
// MAIN SYNC LOGIC
// ============================================================================

async function upsertHybridJobs(jobs: HybridJobInsert[]): Promise<number> {
  if (isDryRun) {
    logger.warn('DRY RUN - skipping database upsert')
    return 0
  }
  
  if (jobs.length === 0) {
    logger.warn('No jobs to upsert')
    return 0
  }
  
  // Calculate quality scores
  jobs.forEach(job => {
    job.quality_score = calculateQualityScore(job)
  })
  
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

  const inserted = data?.length || 0
  logger.event('hybrid_jobs_upsert_success', { 
    inserted,
    sources: [...new Set(jobs.map(j => j.source_name))]
  })
  
  return inserted
}

async function main() {
  const t0 = Date.now()
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔄 Hybrid/Onsite Jobs Scraper')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Mode: ${isDryRun ? 'DRY RUN (no DB writes)' : 'LIVE'}`)
  console.log(`Sources: ${HYBRID_JOB_SOURCES.filter(s => s.enabled).length} enabled`)
  console.log('')
  
  logger.event('hybrid_sync_start', { 
    sources: HYBRID_JOB_SOURCES.filter(s => s.enabled).map(s => s.id),
    dryRun: isDryRun
  })
  
  const allJobs: HybridJobInsert[] = []
  const results: { source: string; count: number; error?: string }[] = []
  
  // Scrape all enabled sources
  for (const source of HYBRID_JOB_SOURCES) {
    if (!source.enabled) {
      console.log(`⏭️  Skipping ${source.name} (disabled)`)
      continue
    }
    
    console.log(`\n🔍 Scraping ${source.name} (${source.country})...`)
    
    try {
      const jobs = await source.scraper(source)
      allJobs.push(...jobs)
      results.push({ source: source.name, count: jobs.length })
      console.log(`✅ ${source.name}: ${jobs.length} jobs found`)
    } catch (error) {
      const errorMsg = (error as Error)?.message || 'Unknown error'
      results.push({ source: source.name, count: 0, error: errorMsg })
      console.error(`❌ ${source.name}: ${errorMsg}`)
    }
    
    // Rate limiting - wait 2 seconds between sources
    if (source !== HYBRID_JOB_SOURCES[HYBRID_JOB_SOURCES.length - 1]) {
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 Summary')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  results.forEach(r => {
    const status = r.error ? '❌' : '✅'
    const info = r.error || `${r.count} jobs`
    console.log(`${status} ${r.source.padEnd(25)} ${info}`)
  })
  
  console.log('\n📦 Total jobs collected:', allJobs.length)
  
  // Upsert to database
  if (allJobs.length > 0) {
    console.log('\n💾 Upserting to database...')
    try {
      const inserted = await upsertHybridJobs(allJobs)
      console.log(`✅ Successfully upserted ${inserted} jobs`)
    } catch (error) {
      console.error('❌ Database upsert failed:', (error as Error)?.message)
      process.exitCode = 1
    }
  } else {
    console.log('\n⚠️  No jobs to upsert')
  }
  
  const dt = Date.now() - t0
  console.log(`\n⏱️  Total time: ${(dt / 1000).toFixed(2)}s`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  logger.event('hybrid_sync_complete', { 
    totalJobs: allJobs.length,
    sources: results,
    durationMs: dt,
    dryRun: isDryRun
  })
}

// Run
void main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})

export {}
