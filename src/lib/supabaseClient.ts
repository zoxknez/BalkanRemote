import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// NOTE: We previously only looked for NEXT_PUBLIC_SUPABASE_URL on the server too.
// Some setups define only SUPABASE_URL (without NEXT_PUBLIC_). We now gracefully
// fall back so that API routes do not silently return empty data.

let browserClientSingleton: SupabaseClient | null | undefined

export function createSupabaseBrowser(): SupabaseClient | null {
  // Only create a browser client in the browser.
  if (typeof window === 'undefined') return null
  // If a client is already stored globally (e.g., across HMR), reuse it
  const globalKey = '__rb_supabase__'
  const g = globalThis as unknown as Record<string, unknown>
  if (g[globalKey]) {
    browserClientSingleton = g[globalKey] as SupabaseClient
    return browserClientSingleton
  }
  if (browserClientSingleton !== undefined) return browserClientSingleton

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    browserClientSingleton = null
    return null
  }
  // Use a unique storageKey to avoid collisions and ensure stable reuse.
  browserClientSingleton = createClient(url, anon, {
    auth: {
      storageKey: 'remotebalkan-auth',
      autoRefreshToken: true,
      persistSession: true,
    },
    global: {
      headers: {
        'X-Client-Info': 'remote-balkan-web',
      },
    },
  })
  // Store on global to ensure singleton across HMR boundaries
  g[globalKey] = browserClientSingleton
  return browserClientSingleton
}

export function createSupabaseServer(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) {
    throw new Error('Supabase URL is not configured. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL.')
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
