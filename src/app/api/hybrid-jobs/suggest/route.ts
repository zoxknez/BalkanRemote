import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabaseClient'
import { redisCache, cacheKeys, CACHE_TTL } from '@/lib/redis-cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// In-memory cache for suggestions
type CacheEntry = { expires: number; value: string[] }
const memory = new Map<string, CacheEntry>()
const TTL_MS = 30_000 // 30s cache
const RATE_LIMIT_WINDOW_MS = (parseInt(process.env.HYBRID_SUGGEST_RATE_WINDOW_SEC || '60', 10)) * 1000
const RATE_LIMIT_MAX = parseInt(process.env.HYBRID_SUGGEST_RATE_MAX || '60', 10)

type Bucket = { count: number; expires: number }
const buckets = new Map<string, Bucket>()

function getCache(key: string): string[] | null {
  const hit = memory.get(key)
  if (!hit) return null
  if (hit.expires < Date.now()) { 
    memory.delete(key)
    return null 
  }
  return hit.value
}

function setCache(key: string, value: string[]): void {
  memory.set(key, { value, expires: Date.now() + TTL_MS })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || null
  
  // Rate limiting
  if (ip) {
    const now = Date.now()
    let bucket = buckets.get(ip)
    if (!bucket || bucket.expires < now) {
      bucket = { count: 0, expires: now + RATE_LIMIT_WINDOW_MS }
      buckets.set(ip, bucket)
    }
    bucket.count += 1
    if (bucket.count > RATE_LIMIT_MAX) {
      return NextResponse.json({ 
        success: false, 
        suggestions: [], 
        error: 'Rate limit exceeded' 
      }, { 
        status: 429, 
        headers: { 'Cache-Control': 'no-store' } 
      })
    }
  }

  const qRaw = (searchParams.get('q') || '').trim()
  
  if (!qRaw || qRaw.length < 2) {
    return NextResponse.json({ 
      success: true, 
      suggestions: [] 
    }, { 
      headers: { 'Cache-Control': 'public, max-age=5' } 
    })
  }

  // Sanitize input
  const safe = qRaw.replace(/[^a-zA-Z0-9+._\-\s]/g, '').slice(0, 40)
  if (!safe) {
    return NextResponse.json({ 
      success: true, 
      suggestions: [] 
    }, { 
      headers: { 'Cache-Control': 'public, max-age=5' } 
    })
  }

  const cacheKey = cacheKeys.hybridJobSuggestions(safe.toLowerCase())
  
  // Try Redis cache first
  const redisCached = redisCache.get(cacheKey)
  if (redisCached) {
    return NextResponse.json({ 
      success: true, 
      suggestions: redisCached, 
      cached: true 
    }, { 
      headers: { 'Cache-Control': 'public, max-age=10' } 
    })
  }
  
  // Fallback to in-memory cache
  const cached = getCache(cacheKey)
  if (cached) {
    return NextResponse.json({ 
      success: true, 
      suggestions: cached, 
      cached: true 
    }, { 
      headers: { 'Cache-Control': 'public, max-age=10' } 
    })
  }

  const hasSupabaseCreds = Boolean(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) && 
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  
  if (!hasSupabaseCreds) {
    return NextResponse.json({ 
      success: true, 
      suggestions: [] 
    }, { 
      headers: { 'Cache-Control': 'public, max-age=5' } 
    })
  }

  try {
    const supabase = createSupabaseServer()
    const pattern = `%${safe}%`
    
    // Fetch suggestions from hybrid_jobs table
    const [titles, companies] = await Promise.all([
      supabase
        .from('hybrid_jobs')
        .select('title')
        .ilike('title', pattern)
        .limit(10),
      supabase
        .from('hybrid_jobs')
        .select('company')
        .ilike('company', pattern)
        .limit(10),
    ])

    const titleSet = new Set<string>()
    ;((titles.data as { title?: string }[] | null) || [])
      .forEach(r => { if (r.title) titleSet.add(r.title) })
    
    const companySet = new Set<string>()
    ;((companies.data as { company?: string }[] | null) || [])
      .forEach(r => { if (r.company) companySet.add(r.company) })

    const merged = Array.from(new Set([ 
      ...Array.from(titleSet), 
      ...Array.from(companySet) 
    ]))
      .filter(s => s.toLowerCase().includes(safe.toLowerCase()))
      .slice(0, 12)

    // Cache in both in-memory and Redis
    setCache(cacheKey, merged)
    redisCache.set(cacheKey, merged, CACHE_TTL.SHORT)
    
    return NextResponse.json({ 
      success: true, 
      suggestions: merged 
    }, {
      headers: {
        'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=60'
      }
    })
  } catch (err) {
    console.error('Hybrid jobs suggest error:', err)
    return NextResponse.json({ 
      success: true, 
      suggestions: [] 
    }, { 
      headers: { 'Cache-Control': 'public, max-age=5' } 
    })
  }
}
