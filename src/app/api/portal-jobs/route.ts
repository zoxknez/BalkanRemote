import { NextResponse, NextRequest } from 'next/server'

import { fetchPortalJobs } from '@/lib/job-portal-repository'
import type { PortalJobContractType } from '@/types/jobs'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Simple in-memory rate limiting (best-effort; per-instance)
const RATE_LIMIT_WINDOW_MS = (parseInt(process.env.PORTAL_JOBS_RATE_WINDOW_SEC || '60', 10)) * 1000
const RATE_LIMIT_MAX = parseInt(process.env.PORTAL_JOBS_RATE_MAX || '60', 10)
type Bucket = { count: number; expires: number }
const buckets = new Map<string, Bucket>()

function rateLimit(ip: string | null): boolean {
  if (!ip) return false
  const now = Date.now()
  let bucket = buckets.get(ip)
  if (!bucket || bucket.expires < now) {
    bucket = { count: 0, expires: now + RATE_LIMIT_WINDOW_MS }
    buckets.set(ip, bucket)
  }
  bucket.count += 1
  return bucket.count > RATE_LIMIT_MAX
}

const parseBoolean = (value: string | null): boolean | undefined => {
  if (value === null) return undefined
  if (value === 'true') return true
  if (value === 'false') return false
  return undefined
}

const parseList = (values: string[]): string[] | undefined => {
  if (!values || values.length === 0) return undefined
  const normalized = values
    .map((value) => value.trim())
    .filter(Boolean)
  return normalized.length ? normalized : undefined
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Graceful fallback if Supabase credentials are not available (e.g., local dev without envs)
    const hasSupabaseCreds = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
    if (!hasSupabaseCreds) {
      const res = NextResponse.json({
        success: true,
        data: {
          total: 0,
          limit: 0,
          offset: 0,
          hasMore: false,
          jobs: [],
          facets: { contractType: {}, experienceLevel: {}, category: {} },
        },
      })
      res.headers.set('Cache-Control', 'public, max-age=15, s-maxage=30, stale-while-revalidate=60')
      res.headers.set('X-Notice', 'Supabase credentials missing; returning empty listings')
      return res
    }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null
    if (rateLimit(ip)) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429, headers: {
        'Cache-Control': 'no-store'
      } })
    }

    const limit = Math.min(parseInt(searchParams.get('limit') || '24', 10), 100)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const remote = parseBoolean(searchParams.get('remote'))
    const contractType = parseList(searchParams.getAll('contractType')) as PortalJobContractType[] | undefined
    const category = searchParams.get('category') || undefined
    const experienceLevel = parseList(searchParams.getAll('experience'))
    const search = searchParams.get('search') || undefined

    const orderParam = (searchParams.get('order') || '').toLowerCase()
    const orderBy = orderParam === 'created' ? 'created_at' : 'posted_at'

    const { rows, total, globalFacets } = await fetchPortalJobs({
      limit,
      offset,
      remote,
      contractType,
      category: category ?? null,
      experienceLevel,
      search,
      orderBy,
      withGlobalFacets: true,
    })

    const facets = globalFacets ?? { contractType: {}, experienceLevel: {}, category: {} }

    return NextResponse.json({
      success: true,
      data: {
        total,
        limit,
        offset,
        hasMore: offset + rows.length < total,
        jobs: rows,
        facets,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })
  } catch (error) {
    logger.error('Failed to fetch portal jobs', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portal jobs' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
