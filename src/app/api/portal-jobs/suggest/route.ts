import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabaseClient'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Very small in-memory per-process cache to smooth bursts.
type CacheEntry = { expires: number; value: string[] }
const memory = new Map<string, CacheEntry>()
const TTL_MS = 30_000 // 30s OK for suggestions
const RATE_LIMIT_WINDOW_MS = (parseInt(process.env.PORTAL_SUGGEST_RATE_WINDOW_SEC || '60', 10)) * 1000
const RATE_LIMIT_MAX = parseInt(process.env.PORTAL_SUGGEST_RATE_MAX || '60', 10)
type Bucket = { count: number; expires: number }
const buckets = new Map<string, Bucket>()

function getCache(key: string): string[] | null {
  const hit = memory.get(key)
  if (!hit) return null
  if (hit.expires < Date.now()) { memory.delete(key); return null }
  return hit.value
}
function setCache(key: string, value: string[]): void {
  memory.set(key, { value, expires: Date.now() + TTL_MS })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || null
  if (ip) {
    const now = Date.now()
    let bucket = buckets.get(ip)
    if (!bucket || bucket.expires < now) {
      bucket = { count: 0, expires: now + RATE_LIMIT_WINDOW_MS }
      buckets.set(ip, bucket)
    }
    bucket.count += 1
    if (bucket.count > RATE_LIMIT_MAX) {
      return NextResponse.json({ success: false, suggestions: [], error: 'Rate limit' }, { status: 429, headers: { 'Cache-Control': 'no-store' } })
    }
  }
  const qRaw = (searchParams.get('q') || '').trim()
  if (!qRaw) {
    return NextResponse.json({ success: true, suggestions: [] }, { headers: { 'Cache-Control': 'public, max-age=5' } })
  }
  if (qRaw.length < 2) {
    return NextResponse.json({ success: true, suggestions: [] }, { headers: { 'Cache-Control': 'public, max-age=5' } })
  }
  // Basic sanitation (letters, numbers, dash, plus, dot, space)
  const safe = qRaw.replace(/[^a-zA-Z0-9+._\-\s]/g, '').slice(0, 40)
  if (!safe) {
    return NextResponse.json({ success: true, suggestions: [] }, { headers: { 'Cache-Control': 'public, max-age=5' } })
  }
  const cacheKey = `s:${safe.toLowerCase()}`
  const cached = getCache(cacheKey)
  if (cached) {
    return NextResponse.json({ success: true, suggestions: cached, cached: true }, { headers: { 'Cache-Control': 'public, max-age=10' } })
  }

  const hasSupabaseCreds = Boolean((process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) && process.env.SUPABASE_SERVICE_ROLE_KEY)
  if (!hasSupabaseCreds) {
    return NextResponse.json({ success: true, suggestions: [] }, { headers: { 'Cache-Control': 'public, max-age=5' } })
  }

  try {
    const supabase = createSupabaseServer()
    // Strategy: fetch distinct titles and companies that start with or contain prefix.
    // Use ilike because suggestions should appear even before FTS threshold.
    const pattern = `%${safe}%`
    const [titles, companies] = await Promise.all([
      supabase
        .from('job_portal_listings')
        .select('title')
        .ilike('title', pattern)
        .limit(10),
      supabase
        .from('job_portal_listings')
        .select('company')
        .ilike('company', pattern)
        .limit(10),
    ])

    const titleSet = new Set<string>()
    ;((titles.data as { title?: string }[] | null) || []).forEach(r => { if (r.title) titleSet.add(r.title) })
    const companySet = new Set<string>()
    ;((companies.data as { company?: string }[] | null) || []).forEach(r => { if (r.company) companySet.add(r.company) })

    const merged = Array.from(new Set([ ...Array.from(titleSet), ...Array.from(companySet) ]))
      .filter(s => s.toLowerCase().includes(safe.toLowerCase()))
      .slice(0, 12)

    setCache(cacheKey, merged)
    return NextResponse.json({ success: true, suggestions: merged }, {
      headers: {
        'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=60'
      }
    })
  } catch {
    return NextResponse.json({ success: true, suggestions: [] }, { headers: { 'Cache-Control': 'public, max-age=5' } })
  }
}
