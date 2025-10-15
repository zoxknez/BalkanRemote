#!/usr/bin/env tsx
import './env'
import { createClient } from '@supabase/supabase-js'

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log('\n📊 Analiza trenutnog stanja baze:\n')

  const hybrid = await supabase.from('hybrid_jobs').select('*', { count: 'exact', head: true })
  console.log(`hybrid_jobs (OnSite): ${hybrid.count || 0}`)

  const portal = await supabase.from('job_portal_listings').select('*', { count: 'exact', head: true })
  console.log(`job_portal_listings (RSS feeds): ${portal.count || 0}`)

  const jobs = await supabase.from('jobs').select('*', { count: 'exact', head: true })
  console.log(`jobs (official APIs): ${jobs.count || 0}`)

  console.log(`\n📌 UKUPNO Remote/Hybrid: ${(portal.count || 0) + (jobs.count || 0)}`)
  console.log(`📌 UKUPNO OnSite: ${hybrid.count || 0}\n`)

  // Detaljnija analiza hybrid_jobs
  const { data: hybridJobs } = await supabase
    .from('hybrid_jobs')
    .select('source_name, work_type, posted_date')
    .order('posted_date', { ascending: false })
    .limit(10)

  console.log('🔍 Poslednji OnSite oglasi:')
  for (const job of hybridJobs || []) {
    console.log(`  - ${job.source_name} | ${job.work_type} | ${job.posted_date}`)
  }

  // Provera Python scraper rezultata
  console.log('\n🐍 Python scraper storage:')
  const fs = await import('fs')
  const path = await import('path')
  
  const storagePath = path.join(process.cwd(), 'storage')
  if (fs.existsSync(storagePath)) {
    const files = fs.readdirSync(storagePath, { recursive: true }) as string[]
    const ndjsonFiles = files.filter((f: string) => f.endsWith('.ndjson'))
    console.log(`  Pronađeno ${ndjsonFiles.length} NDJSON fajlova`)
    
    for (const file of ndjsonFiles.slice(0, 5)) {
      const fullPath = path.join(storagePath, file)
      const content = fs.readFileSync(fullPath, 'utf-8')
      const lines = content.trim().split('\n').length
      console.log(`  - ${file}: ${lines} oglasa`)
    }
  } else {
    console.log('  ⚠️  Storage folder ne postoji')
  }
}

main().catch(console.error)
