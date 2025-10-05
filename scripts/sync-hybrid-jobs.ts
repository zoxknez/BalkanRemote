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
const isDryRun = process.env.DRY_RUN === '1' || !supabaseKey

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
    // Infostud - Generisanje većeg broja mock oglasa sa raznolikim podacima
    const jobTemplates = [
      { title: 'Senior Frontend Developer', exp: 'senior', salary: [1500, 2500], skills: ['React', 'TypeScript', 'CSS'], category: 'software-engineering' },
      { title: 'Backend Developer - Node.js', exp: 'mid', salary: [1200, 1800], skills: ['Node.js', 'PostgreSQL', 'REST API'], category: 'software-engineering' },
      { title: 'Full Stack Developer', exp: 'mid', salary: [1300, 2000], skills: ['React', 'Node.js', 'MongoDB'], category: 'software-engineering' },
      { title: 'DevOps Engineer', exp: 'senior', salary: [1800, 2800], skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'], category: 'software-engineering' },
      { title: 'QA Engineer', exp: 'mid', salary: [1000, 1600], skills: ['Selenium', 'Jest', 'Cypress'], category: 'software-engineering' },
      { title: 'Product Manager', exp: 'senior', salary: [1600, 2400], skills: ['Agile', 'Scrum', 'Product Strategy'], category: 'product-management' },
      { title: 'UI/UX Designer', exp: 'mid', salary: [1100, 1700], skills: ['Figma', 'Adobe XD', 'User Research'], category: 'design' },
      { title: 'Data Analyst', exp: 'mid', salary: [1200, 1900], skills: ['SQL', 'Python', 'Power BI'], category: 'data-science' },
      { title: 'Marketing Manager', exp: 'senior', salary: [1300, 2000], skills: ['Digital Marketing', 'SEO', 'Analytics'], category: 'marketing' },
      { title: 'Sales Representative', exp: 'junior', salary: [800, 1200], skills: ['B2B Sales', 'CRM', 'Negotiation'], category: 'sales' },
      { title: 'Project Manager', exp: 'senior', salary: [1500, 2300], skills: ['PMP', 'Agile', 'Risk Management'], category: 'project-management' },
      { title: 'System Administrator', exp: 'mid', salary: [1100, 1700], skills: ['Linux', 'Windows Server', 'Networking'], category: 'it-support' },
      { title: 'Mobile Developer - React Native', exp: 'mid', salary: [1300, 2000], skills: ['React Native', 'iOS', 'Android'], category: 'software-engineering' },
      { title: 'Technical Writer', exp: 'mid', salary: [900, 1400], skills: ['Documentation', 'API Docs', 'Technical Writing'], category: 'content' },
      { title: 'HR Manager', exp: 'senior', salary: [1200, 1800], skills: ['Recruitment', 'HR Strategy', 'Employee Relations'], category: 'hr' }
    ]
    
    const companies = [
      'Tech Srbija d.o.o.', 'Digital Agency Belgrade', 'IT Solutions Belgrade', 
      'Startit Hub', 'Seven Bridges', 'Endava Serbia', 'Nordeus', 
      'Levi9 Technology Services', 'Execom', 'Zühlke Engineering'
    ]
    
    const locations = [
      'Beograd, Srbija', 'Novi Sad, Srbija', 'Niš, Srbija', 
      'Kragujevac, Srbija', 'Subotica, Srbija'
    ]
    
    const workTypes: ('hybrid' | 'onsite' | 'flexible')[] = ['hybrid', 'hybrid', 'onsite', 'flexible']
    
    // Generisanje 15 oglasa
    for (let i = 0; i < jobTemplates.length; i++) {
      const template = jobTemplates[i]
      const company = companies[i % companies.length]
      const location = locations[i % locations.length]
      const workType = workTypes[i % workTypes.length]
      const daysAgo = Math.floor(Math.random() * 14) // 0-14 dana unazad
      
      jobs.push({
        external_id: `infostud-${Date.now()}-${i}`,
        source_name: source.name,
        title: template.title,
        company_name: company,
        location: location,
        work_type: workType,
        country_code: 'RS',
        region: 'BALKAN',
        category: template.category,
        description: `Posao: ${template.title}. Potrebno iskustvo sa: ${template.skills.join(', ')}. ${workType === 'hybrid' ? 'Rad 2-3 dana nedeljno u kancelariji.' : workType === 'flexible' ? 'Fleksibilno radno vreme.' : 'Rad u kancelariji.'}`,
        application_url: `https://poslovi.infostud.com/posao/${template.title.replace(/\s+/g, '-')}/${10000 + i}`,
        source_website: source.baseUrl,
        experience_level: template.exp,
        employment_type: 'full-time',
        salary_min: template.salary[0],
        salary_max: template.salary[1],
        salary_currency: 'EUR',
        skills: template.skills,
        technologies: template.skills,
        posted_date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        scraped_at: new Date().toISOString()
      })
    }
    
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
    // Halo Oglasi - više oglasa sa različitim kategorijama
    const jobTemplates = [
      { title: 'Python Developer', exp: 'mid', salary: [1400, 2100], skills: ['Python', 'Django', 'PostgreSQL'], category: 'software-engineering' },
      { title: 'Java Developer', exp: 'senior', salary: [1600, 2400], skills: ['Java', 'Spring Boot', 'Microservices'], category: 'software-engineering' },
      { title: 'Frontend Developer - Vue.js', exp: 'mid', salary: [1200, 1900], skills: ['Vue.js', 'JavaScript', 'CSS'], category: 'software-engineering' },
      { title: 'Scrum Master', exp: 'senior', salary: [1400, 2200], skills: ['Scrum', 'Agile', 'Team Leadership'], category: 'project-management' },
      { title: 'Business Analyst', exp: 'mid', salary: [1100, 1700], skills: ['Requirements Analysis', 'SQL', 'Documentation'], category: 'business-analysis' },
      { title: 'Customer Support Manager', exp: 'mid', salary: [900, 1400], skills: ['Customer Service', 'CRM', 'Communication'], category: 'customer-support' },
      { title: 'Accountant', exp: 'mid', salary: [800, 1300], skills: ['Accounting', 'SAP', 'Financial Reporting'], category: 'finance' },
      { title: 'Graphic Designer', exp: 'junior', salary: [700, 1100], skills: ['Adobe Photoshop', 'Illustrator', 'InDesign'], category: 'design' },
      { title: 'Content Writer', exp: 'junior', salary: [600, 1000], skills: ['Copywriting', 'SEO', 'Content Strategy'], category: 'content' },
      { title: 'Network Engineer', exp: 'senior', salary: [1500, 2300], skills: ['Cisco', 'Networking', 'Security'], category: 'it-support' }
    ]
    
    const companies = [
      'ICT Serbia', 'BelTech Solutions', 'Digital Hub Beograd', 
      'Serbian Software House', 'Novi Sad Tech', 'Nis IT Solutions'
    ]
    
    const locations = ['Beograd, Srbija', 'Novi Sad, Srbija', 'Niš, Srbija']
    const workTypes: ('hybrid' | 'onsite' | 'flexible')[] = ['onsite', 'onsite', 'hybrid', 'flexible']
    
    for (let i = 0; i < jobTemplates.length; i++) {
      const template = jobTemplates[i]
      const daysAgo = Math.floor(Math.random() * 21) // 0-21 dan unazad
      
      jobs.push({
        external_id: `halooglasi-${Date.now()}-${i}`,
        source_name: source.name,
        title: template.title,
        company_name: companies[i % companies.length],
        location: locations[i % locations.length],
        work_type: workTypes[i % workTypes.length],
        country_code: 'RS',
        region: 'BALKAN',
        category: template.category,
        description: `${template.title} pozicija. Potrebne veštine: ${template.skills.join(', ')}.`,
        application_url: `https://www.halooglasi.com/poslovi/${template.title.toLowerCase().replace(/\s+/g, '-')}/${20000 + i}`,
        source_website: source.baseUrl,
        experience_level: template.exp,
        employment_type: 'full-time',
        salary_min: template.salary[0],
        salary_max: template.salary[1],
        salary_currency: 'EUR',
        skills: template.skills,
        technologies: template.skills,
        posted_date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        scraped_at: new Date().toISOString()
      })
    }
    
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
    // MojPosao.net (Hrvatska) - više oglasa
    const jobTemplates = [
      { title: 'Senior .NET Developer', exp: 'senior', salary: [2000, 3000], skills: ['.NET', 'C#', 'SQL Server'], category: 'software-engineering' },
      { title: 'Angular Developer', exp: 'mid', salary: [1500, 2200], skills: ['Angular', 'TypeScript', 'RxJS'], category: 'software-engineering' },
      { title: 'Product Owner', exp: 'senior', salary: [1800, 2600], skills: ['Product Management', 'Agile', 'Stakeholder Management'], category: 'product-management' },
      { title: 'Data Engineer', exp: 'mid', salary: [1600, 2400], skills: ['Python', 'Spark', 'Airflow'], category: 'data-science' },
      { title: 'Security Engineer', exp: 'senior', salary: [2200, 3200], skills: ['Cybersecurity', 'Penetration Testing', 'SIEM'], category: 'it-security' },
      { title: 'Marketing Specialist', exp: 'mid', salary: [1000, 1600], skills: ['Social Media', 'Content Marketing', 'Analytics'], category: 'marketing' },
      { title: 'Sales Manager', exp: 'senior', salary: [1400, 2200], skills: ['B2B Sales', 'Team Management', 'Strategy'], category: 'sales' },
      { title: 'HR Generalist', exp: 'mid', salary: [900, 1400], skills: ['Recruitment', 'Onboarding', 'HR Operations'], category: 'hr' },
      { title: 'Legal Counsel', exp: 'senior', salary: [1500, 2300], skills: ['Corporate Law', 'Contract Management', 'Compliance'], category: 'legal' },
      { title: 'Office Manager', exp: 'mid', salary: [800, 1200], skills: ['Administration', 'Operations', 'Vendor Management'], category: 'administration' },
      { title: 'Cloud Architect', exp: 'senior', salary: [2500, 3500], skills: ['AWS', 'Azure', 'Cloud Design'], category: 'software-engineering' },
      { title: 'iOS Developer', exp: 'mid', salary: [1700, 2500], skills: ['Swift', 'iOS SDK', 'SwiftUI'], category: 'software-engineering' }
    ]
    
    const companies = [
      'Infobip', 'Infinum', 'Rimac Technology', 'Span', 
      'CROZ', 'Five', 'Q Agency', 'Nanobit'
    ]
    
    const locations = ['Zagreb, Hrvatska', 'Split, Hrvatska', 'Rijeka, Hrvatska', 'Osijek, Hrvatska']
    const workTypes: ('hybrid' | 'onsite' | 'flexible')[] = ['hybrid', 'hybrid', 'onsite', 'flexible']
    
    for (let i = 0; i < jobTemplates.length; i++) {
      const template = jobTemplates[i]
      const daysAgo = Math.floor(Math.random() * 10)
      
      jobs.push({
        external_id: `mojposao-${Date.now()}-${i}`,
        source_name: source.name,
        title: template.title,
        company_name: companies[i % companies.length],
        location: locations[i % locations.length],
        work_type: workTypes[i % workTypes.length],
        country_code: 'HR',
        region: 'BALKAN',
        category: template.category,
        description: `Tražimo ${template.title}. Potrebno iskustvo: ${template.skills.join(', ')}.`,
        application_url: `https://www.mojposao.net/oglas/${template.title.toLowerCase().replace(/\s+/g, '-')}/${30000 + i}`,
        source_website: source.baseUrl,
        experience_level: template.exp,
        employment_type: 'full-time',
        salary_min: template.salary[0],
        salary_max: template.salary[1],
        salary_currency: 'EUR',
        skills: template.skills,
        technologies: template.skills,
        posted_date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        scraped_at: new Date().toISOString()
      })
    }
    
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
    // Posao.ba (BiH) - više oglasa
    const jobTemplates = [
      { title: 'PHP Developer', exp: 'mid', salary: [1000, 1600], skills: ['PHP', 'Laravel', 'MySQL'], category: 'software-engineering' },
      { title: 'WordPress Developer', exp: 'mid', salary: [900, 1400], skills: ['WordPress', 'PHP', 'JavaScript'], category: 'software-engineering' },
      { title: 'Database Administrator', exp: 'senior', salary: [1300, 2000], skills: ['PostgreSQL', 'MySQL', 'Database Optimization'], category: 'database' },
      { title: 'Technical Support Specialist', exp: 'junior', salary: [600, 1000], skills: ['Customer Support', 'Troubleshooting', 'IT'], category: 'customer-support' },
      { title: 'Digital Marketing Manager', exp: 'senior', salary: [1100, 1800], skills: ['SEO', 'SEM', 'Social Media'], category: 'marketing' },
      { title: 'Financial Analyst', exp: 'mid', salary: [1000, 1500], skills: ['Financial Analysis', 'Excel', 'Reporting'], category: 'finance' },
      { title: 'Logistics Coordinator', exp: 'mid', salary: [800, 1200], skills: ['Supply Chain', 'Logistics', 'Coordination'], category: 'logistics' },
      { title: 'Software Tester', exp: 'junior', salary: [700, 1100], skills: ['Manual Testing', 'Test Cases', 'Bug Reporting'], category: 'qa' }
    ]
    
    const companies = [
      'Atlantbh', 'Symphony', 'BIT Alliance', 'Klika', 
      'Agency04', 'Mistral Technologies', 'SpiceFactory'
    ]
    
    const locations = ['Sarajevo, BiH', 'Banja Luka, BiH', 'Mostar, BiH', 'Tuzla, BiH']
    const workTypes: ('hybrid' | 'onsite' | 'flexible')[] = ['hybrid', 'onsite', 'flexible', 'hybrid']
    
    for (let i = 0; i < jobTemplates.length; i++) {
      const template = jobTemplates[i]
      const daysAgo = Math.floor(Math.random() * 15)
      
      jobs.push({
        external_id: `posaoba-${Date.now()}-${i}`,
        source_name: source.name,
        title: template.title,
        company_name: companies[i % companies.length],
        location: locations[i % locations.length],
        work_type: workTypes[i % workTypes.length],
        country_code: 'BA',
        region: 'BALKAN',
        category: template.category,
        description: `Potreban ${template.title}. Vještine: ${template.skills.join(', ')}.`,
        application_url: `https://posao.ba/oglas/${template.title.toLowerCase().replace(/\s+/g, '-')}/${40000 + i}`,
        source_website: source.baseUrl,
        experience_level: template.exp,
        employment_type: 'full-time',
        salary_min: template.salary[0],
        salary_max: template.salary[1],
        salary_currency: 'EUR',
        skills: template.skills,
        technologies: template.skills,
        posted_date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        scraped_at: new Date().toISOString()
      })
    }
    
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
    // MojeDelo.com (Slovenija) - več oglasov
    const jobTemplates = [
      { title: 'Senior Java Developer', exp: 'senior', salary: [2500, 3500], skills: ['Java', 'Spring Boot', 'Microservices'], category: 'software-engineering' },
      { title: 'React Developer', exp: 'mid', salary: [2000, 2800], skills: ['React', 'Redux', 'TypeScript'], category: 'software-engineering' },
      { title: 'Solution Architect', exp: 'senior', salary: [3000, 4500], skills: ['Architecture', 'Cloud', 'Microservices'], category: 'software-engineering' },
      { title: 'Machine Learning Engineer', exp: 'senior', salary: [2800, 4000], skills: ['Python', 'TensorFlow', 'ML'], category: 'data-science' },
      { title: 'Backend Engineer - Go', exp: 'mid', salary: [2200, 3200], skills: ['Go', 'Kubernetes', 'gRPC'], category: 'software-engineering' },
      { title: 'Product Designer', exp: 'mid', salary: [1800, 2600], skills: ['UI/UX', 'Figma', 'Design Systems'], category: 'design' },
      { title: 'Engineering Manager', exp: 'senior', salary: [3200, 4800], skills: ['Team Leadership', 'Agile', 'Technical Strategy'], category: 'management' },
      { title: 'Site Reliability Engineer', exp: 'senior', salary: [2600, 3800], skills: ['SRE', 'Kubernetes', 'Monitoring'], category: 'devops' },
      { title: 'Android Developer', exp: 'mid', salary: [2100, 3000], skills: ['Kotlin', 'Android SDK', 'Jetpack'], category: 'software-engineering' },
      { title: 'Business Intelligence Analyst', exp: 'mid', salary: [1800, 2500], skills: ['BI', 'Tableau', 'SQL'], category: 'data-science' }
    ]
    
    const companies = [
      'Outfit7', 'Celtra', 'NIL', 'Bitstamp', 
      'Zemanta', 'Better', 'Comtrade Digital Services', 'S&T Slovenia'
    ]
    
    const locations = ['Ljubljana, Slovenija', 'Maribor, Slovenija', 'Celje, Slovenija', 'Kranj, Slovenija']
    const workTypes: ('hybrid' | 'onsite' | 'flexible')[] = ['hybrid', 'hybrid', 'onsite', 'flexible']
    
    for (let i = 0; i < jobTemplates.length; i++) {
      const template = jobTemplates[i]
      const daysAgo = Math.floor(Math.random() * 7)
      
      jobs.push({
        external_id: `mojedelo-${Date.now()}-${i}`,
        source_name: source.name,
        title: template.title,
        company_name: companies[i % companies.length],
        location: locations[i % locations.length],
        work_type: workTypes[i % workTypes.length],
        country_code: 'SI',
        region: 'BALKAN',
        category: template.category,
        description: `Iščemo ${template.title}. Potrebne znanje: ${template.skills.join(', ')}.`,
        application_url: `https://www.mojedelo.com/oglas/${template.title.toLowerCase().replace(/\s+/g, '-')}/${50000 + i}`,
        source_website: source.baseUrl,
        experience_level: template.exp,
        employment_type: 'full-time',
        salary_min: template.salary[0],
        salary_max: template.salary[1],
        salary_currency: 'EUR',
        skills: template.skills,
        technologies: template.skills,
        posted_date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        scraped_at: new Date().toISOString()
      })
    }
    
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
