#!/usr/bin/env tsx
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('./env.cjs')
import { createSupabaseServer } from '@/lib/supabaseClient'

async function checkTable(name: string) {
  const supabase = createSupabaseServer()
  const { error, count } = await supabase
    .from(name)
    .select('*', { count: 'exact', head: true })

  if (error) {
    return { ok: false, error: error.message }
  }
  return { ok: true, count }
}

async function main() {
  const tables = ['job_portal_listings', 'job_feed_stats']
  for (const t of tables) {
    try {
      const res = await checkTable(t)
      if (res.ok) {
        console.log(`[table:${t}] OK, count=${res.count}`)
      } else {
        console.log(`[table:${t}] ERROR: ${res.error}`)
      }
    } catch (err) {
      console.log(`[table:${t}] EXCEPTION: ${(err as Error).message}`)
    }
  }
}

main().catch((err) => {
  console.error('check failed', (err as Error).message)
  process.exitCode = 1
})
