import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export function createSupabaseBrowser(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) return null
  return createClient(url, anon)
}

export function createSupabaseServer(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) {
    throw new Error('Supabase URL is not configured. Set NEXT_PUBLIC_SUPABASE_URL.')
  }

  if (!serviceKey) {
    throw new Error('Supabase service role key missing. Set SUPABASE_SERVICE_ROLE_KEY.')
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'remote-balkan-job-sync',
      },
    },
  })
}
