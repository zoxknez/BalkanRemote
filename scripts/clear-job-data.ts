#!/usr/bin/env tsx
import './env'
import { createSupabaseServer } from '@/lib/supabaseClient'

type ResetTarget = {
  table: string
  column: string
}

type SupabaseServerClient = ReturnType<typeof createSupabaseServer>

async function purgeTable(client: SupabaseServerClient, table: ResetTarget) {
  const { error } = await client
    .schema('public')
    .from(table.table)
    .delete()
    .not(table.column, 'is', null)

  if (error) {
    if (error.message?.includes('Could not find the table')) {
      console.warn(`   ⚠️  Tabela ${table.table} ne postoji (preskačem).`)
      return
    }
    throw new Error(`Greška pri brisanju ${table.table}: ${error.message}`)
  }
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Nedostaju Supabase kredencijali (NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL ili SUPABASE_SERVICE_ROLE_KEY)')
  }

  const tables: ResetTarget[] = [
    { table: 'job_portal_bookmarks', column: 'created_at' },
    { table: 'job_portal_listings', column: 'posted_at' },
    { table: 'job_feed_stats', column: 'source_id' },
    { table: 'job_scraped_listings', column: 'source_id' },
    { table: 'hybrid_jobs', column: 'id' },
    { table: 'jobs', column: 'stable_key' },
    { table: 'scrape_runs', column: 'id' },
  ]

  const supabase = createSupabaseServer()
  console.log('🧹 Brisanje Supabase tabela (REST delete)...')
  for (const target of tables) {
    console.log(` - ${target.table}`)
    await purgeTable(supabase, target)
  }
  console.log('✅ Tabele su uspešno ispražnjene.')
}

main().catch((err) => {
  console.error('❌ Neuspelo brisanje tabela:', (err as Error).message)
  process.exitCode = 1
})
