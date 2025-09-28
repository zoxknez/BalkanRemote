#!/usr/bin/env tsx
import './env'
import { createClient } from '@supabase/supabase-js'

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
    process.exitCode = 1
    return
  }
  const supabase = createClient(url, key)

  const jobsHead = await supabase.from('jobs').select('*', { head: true, count: 'exact' })
  if (jobsHead.error) {
    console.error('jobs count error:', jobsHead.error.message)
  } else {
    console.log('jobs count:', jobsHead.count ?? 0)
  }

  const runs = await supabase
    .from('scrape_runs')
    .select('source_id, status, items_inserted, started_at, ended_at')
    .order('started_at', { ascending: false })
    .limit(10)
  if (runs.error) {
    console.error('scrape_runs error:', runs.error.message)
  } else {
    console.log('last runs:')
    for (const r of runs.data ?? []) {
      console.log(`  ${r.source_id} | ${r.status} | inserted=${r.items_inserted} | ${r.started_at} -> ${r.ended_at ?? ''}`)
    }
  }

  const sample = await supabase
    .from('jobs_public_v')
    .select('title, company, posted_at')
    .order('posted_at', { ascending: false })
    .limit(5)
  if (sample.error) {
    console.error('jobs_public_v error:', sample.error.message)
  } else {
    console.log('sample jobs:')
    for (const j of sample.data ?? []) {
      console.log(`  ${new Date(j.posted_at).toISOString()} | ${j.company} – ${j.title}`)
    }
  }
}

main().catch((err) => {
  console.error('verify failed:', (err as Error).message)
  process.exitCode = 1
})
