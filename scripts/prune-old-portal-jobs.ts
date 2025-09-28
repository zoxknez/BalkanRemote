#!/usr/bin/env tsx
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('./env.cjs')
import { createSupabaseServer } from '@/lib/supabaseClient'
import { logger } from '@/lib/logger'

async function main() {
  const days = parseInt(process.env.JOB_PRUNE_MAX_AGE_DAYS || '60', 10)
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  logger.event('job_prune_start', { days, cutoff })

  const supabase = createSupabaseServer()

  // Delete and return count
  const { error, count } = await supabase
    .from('job_portal_listings')
    .delete({ count: 'exact' })
    .lt('posted_at', cutoff)
    .select('id')

  if (error) {
    logger.event('job_prune_error', { error: error.message })
    throw error
  }

  logger.event('job_prune_complete', { removed: count || 0 })
}

main().catch((err) => {
  logger.event('job_prune_fatal', { error: (err as Error).message })
  process.exitCode = 1
})
