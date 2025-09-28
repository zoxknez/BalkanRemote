import { NextResponse, NextRequest } from 'next/server'
import { z } from 'zod'

import { fetchPortalJobs } from '@/lib/job-portal-repository'
import type { PortalJobContractType, ScraperSource } from '@/types/jobs'
import { logger } from '@/lib/logger'
import crypto from 'node:crypto'

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

// (removed: legacy parsers now replaced with schema validation)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Graceful fallback if Supabase credentials are not available (e.g., local dev without envs)
    // We now also allow SUPABASE_URL (without NEXT_PUBLIC_) as a fallback to avoid silent empty data when only server vars are set.
    const hasSupabaseCreds = Boolean((process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) && process.env.SUPABASE_SERVICE_ROLE_KEY)
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

    const schema = z.object({
      limit: z.coerce.number().int().min(1).max(100).default(24),
      offset: z.coerce.number().int().min(0).default(0),
      remote: z.enum(['true', 'false']).optional(),
      contractType: z
        .array(z.enum(['full-time','part-time','contract','freelance','internship']))
        .optional(),
      category: z.string().min(1).max(100).optional(),
      experience: z.array(z.string().min(1).max(50)).optional(),
      search: z.string().min(1).max(64).optional(),
      order: z.enum(['posted','created']).optional(),
    })

    const parsed = schema.safeParse({
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
      remote: searchParams.get('remote') ?? undefined,
      contractType: searchParams.getAll('contractType') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      experience: searchParams.getAll('experience') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      order: (searchParams.get('order') || 'posted').toLowerCase(),
    })
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 422 })
    }

    const { limit, offset, category, search } = parsed.data
    const remote = parsed.data.remote === undefined ? undefined : parsed.data.remote === 'true'
    const contractType = parsed.data.contractType as PortalJobContractType[] | undefined
    const experienceLevel = parsed.data.experience
    const orderBy = parsed.data.order === 'created' ? 'created_at' : 'posted_at'

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
    // Additional lightweight global summary (unfiltered) – only compute on first page to save RPS.
  let summary: { newToday: number; remotePct: number | null; totalRemote: number | null; sources?: { id: string; name: string; count: number; pct: number }[] } | undefined
    if (offset === 0) {
      try {
        const supabaseUrlPresent = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)
        if (supabaseUrlPresent) {
          // dynamic import to avoid circular
          const { createSupabaseServer } = await import('@/lib/supabaseClient')
          const supabase = createSupabaseServer()
          const sinceIso = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
          const [newTodayRes, remoteRes, sourcesRes] = await Promise.all([
            supabase.schema('public').from('job_portal_listings').select('*', { head: true, count: 'exact' }).gte('posted_at', sinceIso),
            supabase.schema('public').from('job_portal_listings').select('*', { head: true, count: 'exact' }).eq('is_remote', true),
            supabase.schema('public').from('job_portal_listings').select('source_id')
          ])
          const newToday = newTodayRes.count || 0
            const totalRemote = remoteRes.count || 0
          // Aggregate sources (top 12)
          const sourceCounts: Record<string, number> = {}
          ;(((sourcesRes.data as Array<{ source_id?: string | null }> | null) || []))
            .forEach(r => { if (r.source_id) sourceCounts[r.source_id] = (sourceCounts[r.source_id] || 0) + 1 })
          const entries = Object.entries(sourceCounts).sort((a,b)=>b[1]-a[1]).slice(0,12)
          // Map to include friendly name if possible (lazy import of scraper sources list)
          let nameMap: Record<string,string> = {}
          try {
            const mod = await import('@/data/job-scraper-sources')
            nameMap = ((mod.jobScraperSources || []) as ScraperSource[])
              .reduce((acc: Record<string,string>, s) => { acc[s.id] = s.name || s.id; return acc }, {})
          } catch {/* ignore */}
          const sources = entries.map(([id,count]) => ({ id, name: nameMap[id] || id, count, pct: total>0? Math.round((count/total)*1000)/10 : 0 }))
          summary = {
            newToday,
            remotePct: total > 0 ? Math.round((totalRemote / total) * 1000) / 10 : null,
            totalRemote,
            sources,
          }
        }
      } catch {
        // ignore summary errors
      }
    }
    const payload: {
      success: true,
      data: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
        jobs: ReturnType<typeof fetchPortalJobs> extends Promise<infer R> ? R extends { rows: infer U } ? U : never : never;
        facets: { contractType: Record<string, number>; experienceLevel: Record<string, number>; category: Record<string, number> };
        summary?: { newToday: number; remotePct: number | null; totalRemote: number | null; sources?: { id: string; name: string; count: number; pct: number }[] };
      }
    } = {
      success: true,
      data: {
        total,
        limit,
        offset,
        hasMore: offset + rows.length < total,
        jobs: rows,
        facets,
      },
    }
    if (summary) payload.data.summary = summary

    // Compute a weak ETag based on stable serialization of response payload.
    // NOTE: For now we hash the entire JSON payload. In future we could optimize by leveraging
    // a last_modified timestamp or materialized view revision to avoid re-fetching rows.
    const etagSource = JSON.stringify(payload)
    const etag = 'W/"' + crypto.createHash('sha1').update(etagSource).digest('base64').slice(0, 27) + '"'

    const ifNoneMatch = request.headers.get('if-none-match')
    if (ifNoneMatch && ifNoneMatch === etag) {
      const notModified = new NextResponse(null, {
        status: 304,
        headers: {
          'ETag': etag,
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          'CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          'Vercel-CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
        }
      })
      notModified.headers.set('X-Cache-Hit', 'etag')
      notModified.headers.set('X-Supabase-Env', [
        process.env.NEXT_PUBLIC_SUPABASE_URL ? 'pub-url' : '',
        process.env.SUPABASE_URL ? 'srv-url' : '',
        process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service' : '',
      ].filter(Boolean).join(','))
      return notModified
    }

    const json = NextResponse.json(payload, {
      headers: {
        'ETag': etag,
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })
    json.headers.set('X-Total', String(total))
    json.headers.set('X-Result-Count', String(rows.length))
    json.headers.set('X-Supabase-Env', [
      process.env.NEXT_PUBLIC_SUPABASE_URL ? 'pub-url' : '',
      process.env.SUPABASE_URL ? 'srv-url' : '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service' : '',
    ].filter(Boolean).join(','))
    return json
  } catch (error: unknown) {
    const errObj = error as { message?: string; code?: string } | undefined
    const msg = typeof errObj?.message === 'string' ? errObj.message : String(error)
    const code = typeof errObj?.code === 'string' ? errObj.code : undefined
    // Graceful fallback for missing table/schema cache errors
    if (
      /relation\s+"?job_portal_listings"?\s+does not exist/i.test(msg)
      || /table\s+job_portal_listings\s+does not exist/i.test(msg)
      || /Could not find the table 'public\.job_portal_listings' in the schema cache/i.test(msg)
      || code === 'PGRST205'
    ) {
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
      res.headers.set('X-Notice', 'job_portal_listings table missing; returning empty listings')
      res.headers.set('Cache-Control', 'public, max-age=15, s-maxage=30, stale-while-revalidate=60')
      return res
    }
    logger.error('Failed to fetch portal jobs', error)
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
    res.headers.set('X-Error', 'portal-jobs-error')
    res.headers.set('Cache-Control', 'public, max-age=15, s-maxage=30, stale-while-revalidate=60')
    return res
  }
}
