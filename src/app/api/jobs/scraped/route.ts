import { NextRequest, NextResponse } from 'next/server'
import { jobScraperEngine } from '@/lib/job-scraper-engine'
import type { JobCategory } from '@/types/jobs'
import { fetchScrapedFacets, fetchScrapedJobs } from '@/lib/scraped-jobs-repository'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Mirror of /api/scraper/jobs under /api/jobs/scraped (path family known to route fine)
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20')))
  const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0'))
  const keywords = url.searchParams.get('keywords') || undefined
  const category = (url.searchParams.get('category') || undefined) as JobCategory | undefined
  const remoteParam = url.searchParams.get('remote')
  const remote = remoteParam === null ? undefined : (remoteParam === 'true' ? true : remoteParam === 'false' ? false : undefined)
  const location = url.searchParams.get('location') || undefined
  const minSalary = url.searchParams.get('minSalary') ? Number(url.searchParams.get('minSalary')) : undefined
  const maxSalary = url.searchParams.get('maxSalary') ? Number(url.searchParams.get('maxSalary')) : undefined
  const seniority = url.searchParams.getAll('seniority')
  const contractType = url.searchParams.getAll('contractType')
  const sourceSite = url.searchParams.getAll('sourceSite')

  const hasSupabase = Boolean((process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) && process.env.SUPABASE_SERVICE_ROLE_KEY)

  if (hasSupabase) {
    try {
      const facetPromise = fetchScrapedFacets({
        keywords,
        category,
        remote,
        location,
        seniority: seniority.length ? seniority : undefined,
        contractType: contractType.length ? contractType : undefined,
        sourceSite: sourceSite.length ? sourceSite : undefined,
      })
      const jobsPromise = fetchScrapedJobs({
        limit,
        offset,
        keywords,
        category,
        remote,
        location,
        minSalary,
        maxSalary,
        seniority: seniority.length ? seniority : undefined,
        contractType: contractType.length ? contractType : undefined,
        sourceSite: sourceSite.length ? sourceSite : undefined,
      })
      const [{ rows, total }, facetsDb] = await Promise.all([jobsPromise, facetPromise])
      return NextResponse.json({
        success: true,
        data: {
          jobs: rows,
          total,
          facets: facetsDb,
          limit,
          offset,
          hasMore: offset + rows.length < total,
        },
      }, {
        headers: { 'Cache-Control': 'public, max-age=15, s-maxage=60, stale-while-revalidate=120' }
      })
    } catch {}
  }

  const { jobs, total, facets } = jobScraperEngine.getJobs({
    limit,
    offset,
    keywords,
    category,
    remote,
    location,
    minSalary,
    maxSalary,
    seniority: seniority.length ? seniority : undefined,
    contractType: contractType.length ? contractType : undefined,
    sourceSite: sourceSite.length ? sourceSite : undefined,
  })

  return NextResponse.json({
    success: true,
    data: {
      jobs,
      total,
      facets,
      limit,
      offset,
      hasMore: offset + jobs.length < total,
    },
  }, {
    headers: { 'Cache-Control': 'public, max-age=15, s-maxage=60, stale-while-revalidate=120' }
  })
}
