import { useState, useEffect, useCallback, useRef } from 'react'

import type { PortalJobRecord, PortalJobContractType } from '@/types/jobs'
import { logger } from '@/lib/logger'

export interface CombinedJobFilters {
  limit?: number
  offset?: number
  remote?: boolean
  contractType?: PortalJobContractType[]
  category?: string | null
  experience?: string[]
  search?: string | null
  order?: 'posted' | 'created'
}

export interface CombinedFacets {
  contractType: Record<string, number>
  experienceLevel: Record<string, number>
  category: Record<string, number>
}

interface PortalJobResponse {
  success: boolean
  data: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
    jobs: PortalJobRecord[]
    facets: CombinedFacets
    summary?: { newToday: number; remotePct: number | null; totalRemote: number | null; sources?: { id: string; name: string; count: number; pct: number }[] }
  }
  error?: string
}

interface ScrapedJobResponse {
  success: boolean
  data: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
    jobs: PortalJobRecord[]
    facets: { contractType: Record<string, number>; seniority: Record<string, number>; category: Record<string, number> }
  }
  error?: string
}

function buildParams(filters: CombinedJobFilters) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (Array.isArray(value)) {
      value.forEach(v => params.append(key, String(v)))
    } else {
      params.append(key, String(value))
    }
  })
  return params
}

function parseDate(job: PortalJobRecord): number {
  // Prefer posted_at then created_at then updated_at
  const p = job.posted_at ? Date.parse(job.posted_at) : NaN
  if (!Number.isNaN(p)) return p
  const c = job.created_at ? Date.parse(job.created_at) : NaN
  if (!Number.isNaN(c)) return c
  const u = job.updated_at ? Date.parse(job.updated_at) : NaN
  if (!Number.isNaN(u)) return u
  return 0
}

export const useCombinedJobs = (initialFilters: CombinedJobFilters = {}) => {
  const [jobs, setJobs] = useState<PortalJobRecord[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [facets, setFacets] = useState<CombinedFacets | null>(null)
  const [summary, setSummary] = useState<{ newToday: number; remotePct: number | null; totalRemote: number | null; sources?: { id: string; name: string; count: number; pct: number }[] } | null>(null)
  const [filters, setFilters] = useState<CombinedJobFilters>(initialFilters)

  const abortRef = useRef<AbortController | null>(null)
  const initialFiltersRef = useRef(initialFilters)
  const filtersRef = useRef(filters)
  useEffect(() => { filtersRef.current = filters }, [filters])

  const fetchJobs = useCallback(async (overrides?: CombinedJobFilters) => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setError(null)

    const f = overrides ?? filtersRef.current
    const limit = f.limit ?? 20
    const pageIndex = Math.floor((f.offset ?? 0) / limit)
    const fetchLimit = Math.min(limit * (pageIndex + 1), 200) // cap to keep requests sane

    // Build params for both endpoints; for scraped rename experience->seniority
    const base: CombinedJobFilters = { ...f, offset: 0, limit: fetchLimit }
    const portalParams = buildParams(base)
    const scrapedParams = new URLSearchParams()
    Object.entries(base).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      const k = key === 'search' ? 'keywords' : key
      if (Array.isArray(value)) {
        (value as Array<string | number>).forEach(v => {
          const kk = k === 'experience' ? 'seniority' : k
          scrapedParams.append(kk, String(v))
        })
      } else {
        const kk = k === 'experience' ? 'seniority' : k
        scrapedParams.append(kk, String(value))
      }
    })

    try {
      const [portalRes, scrapedRes] = await Promise.allSettled([
        fetch(`/api/portal-jobs?${portalParams.toString()}`, { signal: controller.signal }),
        fetch(`/api/scraper/jobs?${scrapedParams.toString()}`, { signal: controller.signal })
      ])

      let portal: PortalJobResponse | null = null
      let scraped: ScrapedJobResponse | null = null

      if (portalRes.status === 'fulfilled' && portalRes.value.ok) {
        const parsed = await portalRes.value.json() as PortalJobResponse
        if (!parsed.success) throw new Error(parsed.error || 'Failed to fetch portal jobs')
        portal = parsed
      }
      if (scrapedRes.status === 'fulfilled' && scrapedRes.value.ok) {
        const parsed = await scrapedRes.value.json() as ScrapedJobResponse
        if (!parsed.success) throw new Error(parsed.error || 'Failed to fetch scraped jobs')
        scraped = parsed
      }

      if (!portal && !scraped) {
        throw new Error('Nije moguće učitati oglase (portal/scraped)')
      }

      const portalJobs = portal?.data.jobs ?? []
      const scrapedJobs = (scraped?.data.jobs as unknown as PortalJobRecord[]) ?? []

      // Merge + sort by selected order (posted default)
      const merged = [...portalJobs, ...scrapedJobs]
      const seen = new Set<string>()
      const deduped: PortalJobRecord[] = []
      for (const j of merged) {
        if (seen.has(j.id)) continue
        seen.add(j.id)
        deduped.push(j)
      }
  deduped.sort((a, b) => parseDate(b) - parseDate(a))

      // Slice to requested page window
      const start = pageIndex * limit
      const pageItems = deduped.slice(start, start + limit)
      setJobs(pageItems)

      const totalCombined = (portal?.data.total ?? 0) + (scraped?.data.total ?? 0)
      setTotal(totalCombined)
      if (portal?.data.summary) setSummary(portal.data.summary)

      // Merge facets
      const ct: Record<string, number> = {}
      const ex: Record<string, number> = {}
      const cat: Record<string, number> = {}
      const addCounts = (src?: Record<string, number>, target?: Record<string, number>) => {
        if (!src || !target) return
        for (const [k, v] of Object.entries(src)) {
          target[k] = (target[k] || 0) + (v || 0)
        }
      }
      addCounts(portal?.data.facets?.contractType, ct)
      addCounts(scraped?.data.facets?.contractType, ct)
      addCounts(portal?.data.facets?.experienceLevel, ex)
      addCounts(scraped?.data.facets?.seniority, ex) // map to experienceLevel name
      addCounts(portal?.data.facets?.category, cat)
      addCounts(scraped?.data.facets?.category, cat)
      setFacets({ contractType: ct, experienceLevel: ex, category: cat })

    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return
      logger.error('Error fetching combined jobs', err)
      setError(err instanceof Error ? err.message : 'Greška pri učitavanju oglasa')
      setJobs([])
      setTotal(0)
      setFacets(null)
      setSummary(null)
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null
        setLoading(false)
      }
    }
  }, [])

  const updateFilters = useCallback((partial: Partial<CombinedJobFilters>) => {
    setFilters(prev => {
      const next = { ...prev, ...partial }
      // normalize offset when limit changes
      if (partial.limit && (prev.limit ?? 0) !== partial.limit) {
        next.offset = 0
      }
      fetchJobs(next).catch(e => logger.error(e))
      return next
    })
  }, [fetchJobs])

  const resetFilters = useCallback(() => {
    const base = { ...initialFiltersRef.current, offset: 0 }
    setFilters(base)
    fetchJobs(base).catch(e => logger.error(e))
  }, [fetchJobs])

  const refreshJobs = useCallback(() => {
    const base = { ...filters, offset: 0 }
    setFilters(base)
    fetchJobs(base).catch(e => logger.error(e))
  }, [fetchJobs, filters])

  useEffect(() => {
    fetchJobs(initialFiltersRef.current).catch(e => logger.error(e))
    return () => abortRef.current?.abort()
  }, [fetchJobs])

  return {
    jobs,
    total,
    loading,
    error,
    filters,
    facets,
    summary,
    updateFilters,
    resetFilters,
    refreshJobs,
    hasMore: jobs.length < total,
  }
}
