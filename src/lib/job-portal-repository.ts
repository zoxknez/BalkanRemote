import { createSupabaseServer } from '@/lib/supabaseClient'
import { logger } from '@/lib/logger'
import type { PortalJobInsert, PortalJobRecord } from '@/types/jobs'

function isSchemaCacheError(err: unknown): boolean {
  const msg = (err as { message?: string })?.message || ''
  // PostgREST can respond with PGRST205 and the above string
  return /could not find the table '?.*'?.*schema cache/i.test(msg) || /PGRST205/i.test(msg)
}

async function withSchemaCacheRetry<T>(fn: () => PromiseLike<T>, label: string, maxRetries = 4): Promise<T> {
  let attempt = 0
  let lastErr: unknown
  while (attempt <= maxRetries) {
    try {
      if (attempt > 0) {
        const delay = Math.min(1000 * attempt, 5000)
        await new Promise((r) => setTimeout(r, delay))
      }
      return await fn()
    } catch (err) {
      lastErr = err
      if (isSchemaCacheError(err)) {
        logger.warn(`[schema-cache-retry] ${label} attempt ${attempt + 1} failed; will retry`)
        attempt += 1
        continue
      }
      throw err
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(`Unknown error during ${label}`)
}

async function primeTable(table: string): Promise<void> {
  try {
    const supabase = createSupabaseServer()
    const res = await supabase
      .schema('public')
      .from(table)
      .select('*', { head: true, count: 'exact' })
    // Narrow error check without using any
    const maybeErr = (res as unknown as { error?: { message?: string } }).error
    if (maybeErr && isSchemaCacheError(maybeErr)) {
      // ignore; cache will warm up on retries
    }
  } catch {
    // ignore
  }
}

export async function upsertPortalJobs(listings: PortalJobInsert[]): Promise<void> {
  if (!listings.length) return

  const supabase = createSupabaseServer()
  await primeTable('job_portal_listings')
  // Retry on schema cache errors returned in the error payload
  let attempt = 0
  while (true) {
    const { error } = await withSchemaCacheRetry(
      () => supabase
        .schema('public')
        .from('job_portal_listings')
        .upsert(listings, { onConflict: 'source_id,external_id' })
        .select(),
      'upsert job_portal_listings'
    ) as { error: { message: string } | null }
    if (!error) break
    if (isSchemaCacheError(error)) {
      attempt += 1
      if (attempt > 4) {
        throw new Error(`Failed to upsert job portal listings after retries: ${error.message}. If you just created tables, run NOTIFY pgrst, 'reload schema'; and retry.`)
      }
      const delay = Math.min(1000 * attempt, 5000)
      logger.warn(`[schema-cache-loop] upsert job_portal_listings returned schema cache error; retrying in ${delay}ms`)
      await new Promise((r) => setTimeout(r, delay))
      continue
    }
    throw new Error(`Failed to upsert job portal listings: ${error.message}`)
  }
}

export async function markFeedSuccess(sourceId: string) {
  const supabase = createSupabaseServer()
  // increment success_count safely
  await primeTable('job_feed_stats')
  let existingCount: number | undefined
  {
    const res = await supabase
      .schema('public')
      .from('job_feed_stats')
      .select('success_count')
      .eq('source_id', sourceId)
      .maybeSingle()
    if (!res.error) {
      existingCount = (res.data as { success_count?: number } | null)?.success_count
    } else if (!isSchemaCacheError(res.error)) {
      const msg = res.error.message || ''
      // Gracefully ignore 0-row/maybeSingle coercion issues
      if (!/cannot coerce the result to a single json object/i.test(msg) && res.status !== 406) {
        throw new Error(res.error.message)
      }
    }
  }

  const nextCount = (existingCount || 0) + 1

  {
    let attempt = 0
    while (true) {
      const { error } = await withSchemaCacheRetry(
        () => supabase
          .schema('public')
          .from('job_feed_stats')
          .upsert({
            source_id: sourceId,
            last_success_at: new Date().toISOString(),
            success_count: nextCount,
          }, { onConflict: 'source_id' })
          .select(),
        `markFeedSuccess:${sourceId}`
      ) as { error: { message: string } | null }
      if (!error) break
      if (isSchemaCacheError(error)) {
        attempt += 1
        if (attempt > 2) {
          throw new Error(`Failed to mark feed success: ${error.message}`)
        }
        const delay = Math.min(1000 * attempt, 5000)
        logger.warn(`[schema-cache-loop] markFeedSuccess ${sourceId} schema cache; retrying in ${delay}ms`)
        await new Promise((r) => setTimeout(r, delay))
        continue
      }
      throw new Error(`Failed to mark feed success: ${error.message}`)
    }
  }
}

export async function markFeedError(sourceId: string, message: string) {
  const supabase = createSupabaseServer()
  await primeTable('job_feed_stats')
  let existingFailures: number | undefined
  let existingMeta: Record<string, unknown> | undefined
  {
    const res = await supabase
      .schema('public')
      .from('job_feed_stats')
      .select('failure_count, metadata')
      .eq('source_id', sourceId)
      .maybeSingle()
    if (!res.error) {
      existingFailures = (res.data as { failure_count?: number } | null)?.failure_count
      existingMeta = (res.data as { metadata?: Record<string, unknown> } | null)?.metadata as Record<string, unknown> | undefined
    } else if (!isSchemaCacheError(res.error)) {
      const msg = res.error.message || ''
      if (!/cannot coerce the result to a single json object/i.test(msg) && res.status !== 406) {
        throw new Error(res.error.message)
      }
    }
  }

  const nextFailures = (existingFailures || 0) + 1
  const mergedMeta = { ...(existingMeta || {}), lastErrorMessage: message }

  {
    let attempt = 0
    while (true) {
      const { error } = await withSchemaCacheRetry(
        () => supabase
          .schema('public')
          .from('job_feed_stats')
          .upsert({
            source_id: sourceId,
            last_error_at: new Date().toISOString(),
            failure_count: nextFailures,
            metadata: mergedMeta,
          }, { onConflict: 'source_id' })
          .select(),
        `markFeedError:${sourceId}`
      ) as { error: { message: string } | null }
      if (!error) break
      if (isSchemaCacheError(error)) {
        attempt += 1
        if (attempt > 2) {
          throw new Error(`Failed to mark feed error: ${error.message}`)
        }
        const delay = Math.min(1000 * attempt, 5000)
        logger.warn(`[schema-cache-loop] markFeedError ${sourceId} schema cache; retrying in ${delay}ms`)
        await new Promise((r) => setTimeout(r, delay))
        continue
      }
      throw new Error(`Failed to mark feed error: ${error.message}`)
    }
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
  const debugRepo = process.env.PORTAL_JOBS_DEBUG === '1'
  if (debugRepo) logger.info('[fetchPortalJobs] start', { params })

  const applyFilters = (qb: any) => {
    if (remote !== undefined) qb = qb.eq('is_remote', remote)
    if (contractType && contractType.length > 0) qb = qb.in('type', contractType)
    if (category) qb = qb.eq('category', category)
    if (experienceLevel && experienceLevel.length > 0) qb = qb.in('experience_level', experienceLevel)
    if (search) qb = applySearch(qb, search)
    return qb
  }

  const applySearch = (qb: any, term: string) => {
    const trimmed = term.trim()
    if (!trimmed) return qb
    const fallback = () => qb.or([
      `title.ilike.%${trimmed}%`,
      `company.ilike.%${trimmed}%`,
      `location.ilike.%${trimmed}%`,
      `tags.cs.{${trimmed}}`,
    ].join(','))
    if (trimmed.length > 2 && typeof (qb as any).textSearch === 'function') {
      try {
        return (qb as any).textSearch('search_vector', trimmed, { type: 'plain' })
      } catch {
        return fallback()
      }
    }
    return fallback()
  }

  const enableRank = process.env.FTS_RANK === '1'
  const searchTerm = search?.trim() || ''
  const shouldRank = enableRank && searchTerm.length > 2
  const escaped = searchTerm.replace(/'/g, "''")
  // Prefix-friendly query building: convert spaces to & and append :*
  // Example: "react senior" -> plainto_tsquery can't add :*, so we manually join tokens.
  const tokens = escaped.split(/\s+/).filter(Boolean)
  const prefixQuery = tokens.map(t => `${t}:*`).join(' & ')
  const tsQuery = prefixQuery || escaped
  // Weighted rank & tighter headline options.
  const baseSelect = shouldRank
    ? `*,rank:ts_rank_cd(search_vector, to_tsquery('simple','${tsQuery}')),headline:ts_headline('simple', coalesce(description,''), to_tsquery('simple','${tsQuery}'), 'MaxFragments=1, MaxWords=20, MinWords=4, ShortWord=2, HighlightAll=FALSE, StartSel=<mark>, StopSel=</mark>')`
    : '*'

  let listingQuery = supabase
    .schema('public')
    .from('job_portal_listings')
    .select(baseSelect as any, { count: 'exact' })
    .range(offset, offset + limit - 1)

  if (shouldRank) {
    listingQuery = listingQuery
      .order('rank' as any, { ascending: false, nullsFirst: false })
      .order(orderBy, { ascending: false })
  } else {
    listingQuery = listingQuery.order(orderBy, { ascending: false })
  }

  listingQuery = applyFilters(listingQuery)

  const { data, error, count } = await listingQuery
  if (error) throw new Error(`Failed to fetch portal jobs: ${error.message}`)
  const rows = (data as unknown as PortalJobRecord[] | null) || []
  const baseResult = { rows, total: count || 0 }
  if (!withGlobalFacets) {
    if (debugRepo) logger.info('[fetchPortalJobs] done', { rows: baseResult.rows.length, total: baseResult.total })
    return baseResult
  }

  // Facet queries: must call select() FIRST so that filter methods (eq, in) exist on returned PostgrestFilterBuilder
  const facetQuery = (column: string) => {
    let q = supabase
      .schema('public')
      .from('job_portal_listings')
      .select(column)
    q = applyFilters(q)
    return q
  }

  const [typeAgg, expAgg, catAgg] = await Promise.all([
    facetQuery('type'),
    facetQuery('experience_level'),
    facetQuery('category'),
  ])

  const contractTypeCounts: Record<string, number> = {}
  ;(((typeAgg.data as PortalJobRecord[] | null) || []))
    .forEach(r => { if (r.type) contractTypeCounts[r.type] = (contractTypeCounts[r.type] || 0) + 1 })
  const experienceCounts: Record<string, number> = {}
  ;(((expAgg.data as PortalJobRecord[] | null) || []))
    .forEach(r => { if (r.experience_level) experienceCounts[r.experience_level] = (experienceCounts[r.experience_level] || 0) + 1 })
  const categoryCounts: Record<string, number> = {}
  ;(((catAgg.data as PortalJobRecord[] | null) || []))
    .forEach(r => { if (r.category) categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1 })

  const result = { ...baseResult, globalFacets: {
    contractType: contractTypeCounts,
    experienceLevel: experienceCounts,
    category: categoryCounts,
  } }
  if (debugRepo) logger.info('[fetchPortalJobs] done', { rows: result.rows.length, total: result.total })
  return result
}
