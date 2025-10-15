#!/usr/bin/env tsx
// Copies rows from job_scraped_listings between two Supabase projects (source -> destination) using service role keys.
// Usage examples (PowerShell):
//   $env:SOURCE_SUPABASE_URL="https://xyz.supabase.co"; $env:SOURCE_SUPABASE_SERVICE_ROLE_KEY="src_service_key";
//   $env:DEST_SUPABASE_URL="https://prod.supabase.co"; $env:DEST_SUPABASE_SERVICE_ROLE_KEY="dest_service_key";
//   tsx scripts/copy-scraped-jobs.ts --since 2025-09-01 --batch 500

import './env'
import { createClient } from '@supabase/supabase-js'

type Opts = {
  since?: string
  batch?: number
  dryRun?: boolean
}

function parseArgs(): Opts {
  const args = process.argv.slice(2)
  const out: Opts = {}
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--since') out.since = args[++i]
    else if (a === '--batch') out.batch = Number(args[++i])
    else if (a === '--dry-run') out.dryRun = true
  }
  return out
}

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) {
    console.error(`Missing required env var: ${name}`)
    process.exit(1)
  }
  return v
}

async function main() {
  const opts = parseArgs()
  const batchSize = Number.isFinite(opts.batch) && opts.batch! > 0 ? Math.min(opts.batch!, 1000) : 500

  const SRC_URL = process.env.SOURCE_SUPABASE_URL
    || process.env.SUPABASE_URL
    || process.env.NEXT_PUBLIC_SUPABASE_URL
  const SRC_KEY = process.env.SOURCE_SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!SRC_URL || !SRC_KEY) {
    console.error('Source Supabase is not configured. Set SOURCE_SUPABASE_URL and SOURCE_SUPABASE_SERVICE_ROLE_KEY, or ensure SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
    process.exit(1)
  }
  const DEST_URL = requireEnv('DEST_SUPABASE_URL')
  const DEST_KEY = requireEnv('DEST_SUPABASE_SERVICE_ROLE_KEY')

  const src = createClient(SRC_URL, SRC_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
  const dest = createClient(DEST_URL, DEST_KEY, { auth: { autoRefreshToken: false, persistSession: false } })

  let page = 0
  let totalCopied = 0

  console.log('Starting copy job: job_scraped_listings')
  console.log(`since=${opts.since ?? 'ALL'} batch=${batchSize} dryRun=${opts.dryRun ? 'yes' : 'no'}`)

  // Build base query with optional since filter
  const buildQuery = () => {
    let q = src
      .schema('public')
      .from('job_scraped_listings')
      .select('*')
      .order('updated_at', { ascending: true })
    if (opts.since) q = q.gte('updated_at', opts.since)
    return q
  }

  while (true) {
    const start = page * batchSize
    const end = start + batchSize - 1
    const { data, error } = await buildQuery().range(start, end)
    if (error) {
      console.error('Source fetch error:', error.message)
      process.exit(1)
    }
  const rows = data ?? []
    if (!rows.length) break

    console.log(`Fetched ${rows.length} rows [${start}-${end}]`)
    if (!opts.dryRun) {
      const { error: upErr } = await dest
        .schema('public')
        .from('job_scraped_listings')
        .upsert(rows, { onConflict: 'source_id,external_id' })
      if (upErr) {
        console.error('Destination upsert error:', upErr.message)
        process.exit(1)
      }
    }
    totalCopied += rows.length
    page += 1
  }

  console.log(`Done. Copied ${totalCopied} rows.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
