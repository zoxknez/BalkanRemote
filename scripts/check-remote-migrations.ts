#!/usr/bin/env tsx
import './env'
import { createClient } from '@supabase/supabase-js'

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log('🔍 Provera remote migracija preko REST API...\n')

  const { data, error } = await supabase
    .schema('supabase_migrations')
    .from('schema_migrations')
    .select('*')
    .order('version', { ascending: true })

  if (error) {
    console.error('❌ Greška pri čitanju migracija:', error.message)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.log('⚠️  Nema zabeleženih migracija u remote bazi.')
    return
  }

  console.log('✅ Remote migracije (primenjene):')
  for (const row of data) {
    const version = (row as { version?: string }).version || 'N/A'
    const name = (row as { name?: string }).name || ''
    const applied = (row as { inserted_at?: string }).inserted_at || ''
    console.log(`  - ${version} ${name ? `(${name})` : ''} → ${applied}`)
  }
  console.log(`\nUkupno: ${data.length} migracija(e)`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
