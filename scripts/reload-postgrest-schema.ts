#!/usr/bin/env tsx
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('./env.cjs')
import { createSupabaseServer } from '@/lib/supabaseClient'

async function main() {
  const supabase = createSupabaseServer()
  const { error } = await supabase.rpc('reload_postgrest_schema')
  if (error) {
    console.error('RPC reload_postgrest_schema error:', error.message)
    process.exitCode = 1
    return
  }
  console.log('Requested PostgREST schema reload via NOTIFY')
}

main()
