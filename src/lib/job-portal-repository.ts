import { createSupabaseServer } from '@/lib/supabaseClient'
import type { PortalJobInsert, PortalJobRecord } from '@/types/jobs'

export async function upsertPortalJobs(listings: PortalJobInsert[]): Promise<void> {
  if (!listings.length) return

  const supabase = createSupabaseServer()
  const { error } = await supabase
    .from('job_portal_listings')
    .upsert(listings, { onConflict: 'source_id,external_id' })

  if (error) {
    throw new Error(`Failed to upsert job portal listings: ${error.message}`)
  }
}

export async function markFeedSuccess(sourceId: string, count: number) {
  const supabase = createSupabaseServer()
  const { error } = await supabase
    .from('job_feed_stats')
    .upsert({
      source_id: sourceId,
      last_success_at: new Date().toISOString(),
      success_count: count,
    }, { onConflict: 'source_id' })

  if (error) {
    throw new Error(`Failed to mark feed success: ${error.message}`)
  }
}

export async function markFeedError(sourceId: string, message: string) {
  const supabase = createSupabaseServer()
  const { error } = await supabase
    .from('job_feed_stats')
    .upsert({
      source_id: sourceId,
      last_error_at: new Date().toISOString(),
      failure_count: 1,
      metadata: { message },
    }, { onConflict: 'source_id' })

  if (error) {
    throw new Error(`Failed to mark feed error: ${error.message}`)
  }
}

export async function fetchPortalJobs(params: {
  limit: number
  offset: number
  remote?: boolean
  contractType?: string[]
  category?: string | null
  experienceLevel?: string[]
  search?: string | null
  orderBy?: 'posted_at' | 'created_at'
  withGlobalFacets?: boolean
}): Promise<{ rows: PortalJobRecord[]; total: number; globalFacets?: {
  contractType: Record<string, number>
  experienceLevel: Record<string, number>
  category: Record<string, number>
} }> {
  const { limit, offset, remote, contractType, category, experienceLevel, search, orderBy = 'posted_at', withGlobalFacets } = params
  const supabase = createSupabaseServer()

  let query = supabase
    .from('job_portal_listings')
    .select('*', { count: 'exact' })
    .order(orderBy, { ascending: false })
    .range(offset, offset + limit - 1)

  if (remote !== undefined) {
    query = query.eq('is_remote', remote)
  }

  if (contractType && contractType.length > 0) {
    query = query.in('type', contractType)
  }

  if (category) {
    query = query.eq('category', category)
  }

  if (experienceLevel && experienceLevel.length > 0) {
    query = query.in('experience_level', experienceLevel)
  }

  if (search) {
    query = query.or(
      [
        `title.ilike.%${search}%`,
        `company.ilike.%${search}%`,
        `location.ilike.%${search}%`,
        `tags.cs.{${search}}`,
      ].join(',')
    )
  }

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch job portal listings: ${error.message}`)
  }

  const baseResult = { rows: data ?? [], total: count ?? 0 }

  if (!withGlobalFacets) return baseResult

  // Build facet queries separately (ignoring pagination) but respecting filters except pagination/limit
  // We perform three aggregate queries; if performance becomes an issue we can create a materialized view.
  const facetFilters = (qb: any) => {
    if (remote !== undefined) qb = qb.eq('is_remote', remote)
    if (contractType && contractType.length > 0) qb = qb.in('type', contractType)
    if (category) qb = qb.eq('category', category)
    if (experienceLevel && experienceLevel.length > 0) qb = qb.in('experience_level', experienceLevel)
    if (search) {
      qb = qb.or([
        `title.ilike.%${search}%`,
        `company.ilike.%${search}%`,
        `location.ilike.%${search}%`,
        `tags.cs.{${search}}`,
      ].join(','))
    }
    return qb
  }

  const [typeAgg, expAgg, catAgg] = await Promise.all([
    facetFilters(supabase.from('job_portal_listings').select('type')).then((r: any) => r.data as PortalJobRecord[] | null),
    facetFilters(supabase.from('job_portal_listings').select('experience_level')).then((r: any) => r.data as PortalJobRecord[] | null),
    facetFilters(supabase.from('job_portal_listings').select('category')).then((r: any) => r.data as PortalJobRecord[] | null),
  ])

  const contractTypeCounts: Record<string, number> = {}
  ;(typeAgg || []).forEach((r: Partial<PortalJobRecord>) => { if (r.type) contractTypeCounts[r.type] = (contractTypeCounts[r.type] || 0) + 1 })
  const experienceCounts: Record<string, number> = {}
  ;(expAgg || []).forEach((r: Partial<PortalJobRecord>) => { if (r.experience_level) experienceCounts[r.experience_level] = (experienceCounts[r.experience_level] || 0) + 1 })
  const categoryCounts: Record<string, number> = {}
  ;(catAgg || []).forEach((r: Partial<PortalJobRecord>) => { if (r.category) categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1 })

  return { ...baseResult, globalFacets: {
    contractType: contractTypeCounts,
    experienceLevel: experienceCounts,
    category: categoryCounts,
  }}
}
