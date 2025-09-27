import { NextResponse, NextRequest } from 'next/server'

import { fetchPortalJobs } from '@/lib/job-portal-repository'
import type { PortalJobContractType } from '@/types/jobs'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

    const limit = Math.min(parseInt(searchParams.get('limit') || '24', 10), 100)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const remote = parseBoolean(searchParams.get('remote'))
    const contractType = parseList(searchParams.getAll('contractType')) as PortalJobContractType[] | undefined
    const category = searchParams.get('category') || undefined
    const experienceLevel = parseList(searchParams.getAll('experience'))
    const search = searchParams.get('search') || undefined

    const { rows, total, globalFacets } = await fetchPortalJobs({
      limit,
      offset,
      remote,
      contractType,
      category: category ?? null,
      experienceLevel,
      search,
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
    })
  } catch (error) {
    logger.error('Failed to fetch portal jobs', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portal jobs' },
      { status: 500 },
    )
  }
}
