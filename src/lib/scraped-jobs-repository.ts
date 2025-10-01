import { createSupabaseServer } from '@/lib/supabaseClient'

export type ScrapedJobRow = {
  id: string
  source_id: string
  source_name: string | null
  external_id: string
  title: string
  company: string
  company_logo: string | null
  location: string | null
  type: string | null
  category: string | null
  description: string | null
  requirements: string[] | null
  benefits: string[] | null
  salary_min: number | null
  salary_max: number | null
  currency: string | null
  is_remote: boolean
  remote_type: string | null
  experience_level: string | null
  posted_at: string
  deadline: string | null
  url: string
  source_url: string | null
  featured: boolean | null
  tags: string[] | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export async function upsertScrapedJobs(items: Array<{
  source_id: string
  external_id: string
  title: string
  company: string
  location?: string | null
  type?: string | null
  category?: string | null
  description?: string | null
  requirements?: string[] | null
  benefits?: string[] | null
  salary_min?: number | null
  salary_max?: number | null
  currency?: string | null
  is_remote: boolean
  remote_type?: string | null
  experience_level?: string | null
  posted_at: string
  deadline?: string | null
  url: string
  source_url?: string | null
  featured?: boolean | null
  tags?: string[] | null
  metadata?: Record<string, unknown> | null
}>): Promise<void> {
  if (!items.length) return

  // Deduplicate by (source_id, external_id) to avoid Postgres upsert error
  const uniqueMap = new Map<string, typeof items[number]>()
  for (const it of items) {
    const key = `${it.source_id}||${it.external_id}`
    uniqueMap.set(key, it) // last one wins
  }
  const dedupedItems = Array.from(uniqueMap.values())

  const supabase = createSupabaseServer()
  const { error } = await supabase
    .schema('public')
    .from('job_scraped_listings')
    .upsert(dedupedItems, { onConflict: 'source_id,external_id' })
    .select()
  if (error) throw new Error(error.message)
}

export async function fetchScrapedJobs(params: {
  limit: number
  offset: number
  keywords?: string
  category?: string
  remote?: boolean
  location?: string
  minSalary?: number
  maxSalary?: number
  seniority?: string[]
  contractType?: string[]
  sourceSite?: string[]
}): Promise<{ rows: ScrapedJobRow[]; total: number }> {
  const supabase = createSupabaseServer()
  let q = supabase.schema('public')
    .from('job_scraped_listings')
    .select('*', { count: 'exact' })
    .order('posted_at', { ascending: false })
    .range(params.offset, params.offset + params.limit - 1)

  const kw = params.keywords?.trim()
  if (kw) {
    const il = (f: string) => `${f}.ilike.%${kw}%`
    q = q.or([il('title'), il('company'), il('location')].join(','))
  }
  if (params.category) q = q.eq('category', params.category)
  if (typeof params.remote === 'boolean') q = q.eq('is_remote', params.remote)
  if (params.location) q = q.ilike('location', `%${params.location}%`)
  if (params.minSalary) q = q.gte('salary_min', params.minSalary)
  if (params.maxSalary) q = q.lte('salary_max', params.maxSalary)
  if (params.seniority?.length) q = q.in('experience_level', params.seniority)
  if (params.contractType?.length) q = q.in('type', params.contractType)
  if (params.sourceSite?.length) q = q.in('source_id', params.sourceSite)

  const { data, error, count } = await q
  if (error) throw new Error(error.message)
  return { rows: (data ?? []) as ScrapedJobRow[], total: count || 0 }
}

export async function fetchScrapedFacets(params: {
  keywords?: string
  category?: string
  remote?: boolean
  location?: string
  seniority?: string[]
  contractType?: string[]
  sourceSite?: string[]
}): Promise<{ contractType: Record<string, number>; seniority: Record<string, number>; category: Record<string, number>; remoteType: Record<string, number> }> {
  const supabase = createSupabaseServer()

  const kw = params.keywords?.trim()

  let typeQ = supabase.schema('public').from('job_scraped_listings').select('type')
  if (kw) typeQ = typeQ.or([`title.ilike.%${kw}%`, `company.ilike.%${kw}%`, `location.ilike.%${kw}%`].join(','))
  if (params.category) typeQ = typeQ.eq('category', params.category)
  if (typeof params.remote === 'boolean') typeQ = typeQ.eq('is_remote', params.remote)
  if (params.location) typeQ = typeQ.ilike('location', `%${params.location}%`)
  if (params.seniority?.length) typeQ = typeQ.in('experience_level', params.seniority)
  if (params.contractType?.length) typeQ = typeQ.in('type', params.contractType)
  if (params.sourceSite?.length) typeQ = typeQ.in('source_id', params.sourceSite)

  let expQ = supabase.schema('public').from('job_scraped_listings').select('experience_level')
  if (kw) expQ = expQ.or([`title.ilike.%${kw}%`, `company.ilike.%${kw}%`, `location.ilike.%${kw}%`].join(','))
  if (params.category) expQ = expQ.eq('category', params.category)
  if (typeof params.remote === 'boolean') expQ = expQ.eq('is_remote', params.remote)
  if (params.location) expQ = expQ.ilike('location', `%${params.location}%`)
  if (params.seniority?.length) expQ = expQ.in('experience_level', params.seniority)
  if (params.contractType?.length) expQ = expQ.in('type', params.contractType)
  if (params.sourceSite?.length) expQ = expQ.in('source_id', params.sourceSite)

  let catQ = supabase.schema('public').from('job_scraped_listings').select('category')
  if (kw) catQ = catQ.or([`title.ilike.%${kw}%`, `company.ilike.%${kw}%`, `location.ilike.%${kw}%`].join(','))
  if (params.category) catQ = catQ.eq('category', params.category)
  if (typeof params.remote === 'boolean') catQ = catQ.eq('is_remote', params.remote)
  if (params.location) catQ = catQ.ilike('location', `%${params.location}%`)
  if (params.seniority?.length) catQ = catQ.in('experience_level', params.seniority)
  if (params.contractType?.length) catQ = catQ.in('type', params.contractType)
  if (params.sourceSite?.length) catQ = catQ.in('source_id', params.sourceSite)

  let remoteTypeQ = supabase.schema('public').from('job_scraped_listings').select('remote_type')
  if (kw) remoteTypeQ = remoteTypeQ.or([`title.ilike.%${kw}%`, `company.ilike.%${kw}%`, `location.ilike.%${kw}%`].join(','))
  if (params.category) remoteTypeQ = remoteTypeQ.eq('category', params.category)
  if (typeof params.remote === 'boolean') remoteTypeQ = remoteTypeQ.eq('is_remote', params.remote)
  if (params.location) remoteTypeQ = remoteTypeQ.ilike('location', `%${params.location}%`)
  if (params.seniority?.length) remoteTypeQ = remoteTypeQ.in('experience_level', params.seniority)
  if (params.contractType?.length) remoteTypeQ = remoteTypeQ.in('type', params.contractType)
  if (params.sourceSite?.length) remoteTypeQ = remoteTypeQ.in('source_id', params.sourceSite)

  const [typeRes, expRes, catRes, remoteTypeRes] = await Promise.all([
    typeQ,
    expQ,
    catQ,
    remoteTypeQ,
  ])

  const toCounts = (rows: Array<Record<string, unknown>> | null | undefined, key: string) => {
    const out: Record<string, number> = {}
    for (const r of rows ?? []) {
      const v = r[key]
      if (typeof v === 'string') out[v] = (out[v] || 0) + 1
    }
    return out
  }

  return {
    contractType: toCounts(typeRes.data, 'type'),
    seniority: toCounts(expRes.data, 'experience_level'),
    category: toCounts(catRes.data, 'category'),
    remoteType: toCounts(remoteTypeRes.data, 'remote_type'),
  }
}
