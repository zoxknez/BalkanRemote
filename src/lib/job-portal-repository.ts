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

export async function fetchPortalJobs(params: {
  limit: number
  offset: number
  remote?: boolean
  contractType?: string[]
  category?: string | null
  experienceLevel?: string[]
  search?: string | null
  orderBy?: 'posted_at' | 'created_at'
}): Promise<{ rows: PortalJobRecord[]; total: number }> {
  const { limit, offset, remote, contractType, category, experienceLevel, search, orderBy = 'posted_at' } = params
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

  return {
    rows: data ?? [],
    total: count ?? 0,
  }
}
