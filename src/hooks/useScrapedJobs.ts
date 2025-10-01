import { useState, useEffect, useCallback, useRef } from 'react'

import type { PortalJobRecord, PortalJobContractType } from '@/types/jobs'
import type { ScrapedJobRow } from '@/lib/scraped-jobs-repository'
import { logger } from '@/lib/logger'

export interface ScrapedJobFilters {
  limit?: number
  offset?: number
  remote?: boolean
  contractType?: PortalJobContractType[]
  category?: string | null
  experience?: string[]
  search?: string | null
}

export interface ScrapedJobFacets {
  contractType: Record<string, number>
  experienceLevel: Record<string, number>
  category: Record<string, number>
}

interface ScrapedJobsResponse {
  success: boolean
  data: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
    jobs: ScrapedJobRow[]
    facets: { contractType: Record<string, number>; seniority: Record<string, number>; category: Record<string, number> }
  }
  error?: string
}

export const useScrapedJobs = (initialFilters: ScrapedJobFilters = {}) => {
  const [jobs, setJobs] = useState<PortalJobRecord[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ScrapedJobFilters>(initialFilters)
  const [facets, setFacets] = useState<ScrapedJobFacets | null>(null)

  const abortRef = useRef<AbortController | null>(null)
  const initialFiltersRef = useRef(initialFilters)
  const filtersRef = useRef(filters)

  useEffect(() => { filtersRef.current = filters }, [filters])

  const fetchJobs = useCallback(async (overrides?: ScrapedJobFilters, { append } = { append: false }) => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setError(null)

    const nextFilters = overrides ?? filtersRef.current
    const params = new URLSearchParams()

    // Map UI filters to API params
    if (nextFilters.limit != null) params.set('limit', String(nextFilters.limit))
    if (nextFilters.offset != null) params.set('offset', String(nextFilters.offset))
    if (nextFilters.search) params.set('keywords', nextFilters.search)
    if (nextFilters.category) params.set('category', nextFilters.category)
    if (nextFilters.remote !== undefined) params.set('remote', String(nextFilters.remote))
    nextFilters.contractType?.forEach(ct => params.append('contractType', String(ct)))
    nextFilters.experience?.forEach(exp => params.append('seniority', String(exp)))

    const query = params.toString()

    try {
      const response = await fetch(`/api/scraper/jobs${query ? `?${query}` : ''}`, { signal: controller.signal })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const payload = (await response.json()) as ScrapedJobsResponse
      if (!payload.success) throw new Error(payload.error || 'Failed to fetch scraped jobs')

      // Cast rows to PortalJobRecord-compatible shape
      const rows = payload.data.jobs as unknown as PortalJobRecord[]

      setJobs(prev => {
        if (append || ((nextFilters.offset ?? 0) > 0)) {
          const existing = new Set(prev.map(j => j.id))
          const incoming = rows.filter(j => !existing.has(j.id))
          return [...prev, ...incoming]
        }
        return rows
      })
      setTotal(payload.data.total)
      setFacets({
        contractType: payload.data.facets.contractType || {},
        experienceLevel: payload.data.facets.seniority || {},
        category: payload.data.facets.category || {},
      })
    } catch (err) {
      // Ignore abort errors triggered by rapid filter changes or unmounts
      if ((err as DOMException)?.name === 'AbortError') {
        return
      }
      logger.error('Error fetching scraped jobs', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch scraped jobs')
      setJobs([])
      setFacets(null)
      setTotal(0)
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null
        setLoading(false)
      }
    }
  }, [])

  const updateFilters = useCallback((partial: Partial<ScrapedJobFilters>, options?: { append?: boolean }) => {
    setFilters(prev => {
      const next = { ...prev, ...partial }
      const shouldAppend = options?.append ?? ((next.offset ?? 0) > (prev.offset ?? 0))
      fetchJobs(next, { append: shouldAppend }).catch((e) => logger.error(e))
      return next
    })
  }, [fetchJobs])

  const resetFilters = useCallback(() => {
    const base = { ...initialFiltersRef.current, offset: 0 }
    setFilters(base)
    fetchJobs(base).catch((e) => logger.error(e))
  }, [fetchJobs])

  const loadMore = useCallback(() => {
    setFilters(prev => {
      const limit = prev.limit ?? initialFiltersRef.current.limit ?? 20
      const next = { ...prev, offset: (prev.offset ?? 0) + limit }
      fetchJobs(next, { append: true }).catch((e) => logger.error(e))
      return next
    })
  }, [fetchJobs])

  useEffect(() => {
    fetchJobs(initialFiltersRef.current).catch((e) => logger.error(e))
    return () => { abortRef.current?.abort() }
  }, [fetchJobs])

  return {
    jobs,
    total,
    loading,
    error,
    filters,
    facets,
    updateFilters,
    resetFilters,
    loadMore,
    hasMore: jobs.length < total,
  }
}
