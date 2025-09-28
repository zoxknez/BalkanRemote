import { useState, useEffect, useCallback, useRef } from 'react'

import type { PortalJobRecord, PortalJobContractType } from '@/types/jobs'
import { logger } from '@/lib/logger'

export interface PortalJobFilters {
  limit?: number
  offset?: number
  remote?: boolean
  contractType?: PortalJobContractType[]
  category?: string | null
  experience?: string[]
  search?: string | null
  order?: 'posted' | 'created'
  mode?: 'all' | 'bookmarks'
}

export interface PortalJobFacets {
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
    facets: PortalJobFacets
    summary?: { newToday: number; remotePct: number | null; totalRemote: number | null; sources?: { id: string; name: string; count: number; pct: number }[] }
  }
  error?: string
}

export const usePortalJobs = (initialFilters: PortalJobFilters = {}) => {
  const [jobs, setJobs] = useState<PortalJobRecord[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<PortalJobFilters>(initialFilters)
  const [facets, setFacets] = useState<PortalJobFacets | null>(null)
  const [meta, setMeta] = useState<{ notice?: string; supabaseEnv?: string } | null>(null)
  const [summary, setSummary] = useState<{ newToday: number; remotePct: number | null; totalRemote: number | null; sources?: { id: string; name: string; count: number; pct: number }[] } | null>(null)

  const abortRef = useRef<AbortController | null>(null)
  const initialFiltersRef = useRef(initialFilters)
  const filtersRef = useRef(filters)

  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  const fetchJobs = useCallback(async (overrides?: PortalJobFilters, { append } = { append: false }) => {
    if (abortRef.current) {
      abortRef.current.abort()
    }

    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    const nextFilters = overrides ?? filtersRef.current
    const params = new URLSearchParams()

    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, String(v)))
      } else {
        params.append(key, String(value))
      }
    })

    const query = params.toString()

    try {
  const basePath = nextFilters.mode === 'bookmarks' ? '/api/portal-jobs/bookmarks' : '/api/portal-jobs'
  const response = await fetch(`${basePath}${query ? `?${query}` : ''}`, { signal: controller.signal })
  const notice = response.headers.get('x-notice') || undefined
  const supabaseEnv = response.headers.get('x-supabase-env') || undefined
  setMeta({ notice, supabaseEnv })
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`)
      }

      const payload = (await response.json()) as PortalJobResponse
      // Dev debug logging – only when ?debug=1 present in URL (cheap check) and not in production
      if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
        const sp = new URLSearchParams(window.location.search)
        if (sp.get('debug') === '1') {
          // eslint-disable-next-line no-console
            console.log('[usePortalJobs] raw payload', { payload, notice, supabaseEnv, filters: nextFilters })
        }
      }
      if (!payload.success) {
        throw new Error(payload.error || 'Failed to fetch portal jobs')
      }

  const shouldAppend = nextFilters.mode === 'bookmarks' ? false : (append || ((nextFilters.offset ?? 0) > 0))

      setJobs((prev) => {
        if (!shouldAppend) {
          return payload.data.jobs
        }
        const existingIds = new Set(prev.map((job) => job.id))
        const incoming = payload.data.jobs.filter((job) => !existingIds.has(job.id))
        return [...prev, ...incoming]
      })
  setTotal(payload.data.total)
  if (payload.data.summary) setSummary(payload.data.summary)
  if ('facets' in payload.data) setFacets(payload.data.facets)
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') {
        return
      }
      logger.error('Error fetching portal jobs', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch portal jobs')
      setJobs([])
      setFacets(null)
      setTotal(0)
      setMeta(null)
  setSummary(null)
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null
        setLoading(false)
      }
    }
  }, [])

  const updateFilters = useCallback((partial: Partial<PortalJobFilters>, options?: { append?: boolean }) => {
    setFilters((prev) => {
      const next = { ...prev, ...partial }
      const nextOffset = next.offset ?? 0
      const prevOffset = prev.offset ?? 0
      const shouldAppend = options?.append ?? (nextOffset > prevOffset)
      fetchJobs(next, { append: shouldAppend }).catch((error) => logger.error(error))
      return next
    })
  }, [fetchJobs])

  const resetFilters = useCallback(() => {
    const base = { ...initialFiltersRef.current, offset: 0 }
    setFilters(base)
    fetchJobs(base).catch((error) => logger.error(error))
  }, [fetchJobs])

  const refreshJobs = useCallback(() => {
    const base = { ...filters, offset: 0 }
    setFilters(base)
    fetchJobs(base).catch((error) => logger.error(error))
  }, [fetchJobs, filters])

  const loadMore = useCallback(() => {
    setFilters((prev) => {
      const limit = prev.limit ?? initialFiltersRef.current.limit ?? 20
      const nextOffset = (prev.offset ?? 0) + limit
      const next = { ...prev, offset: nextOffset }
      fetchJobs(next, { append: true }).catch((error) => logger.error(error))
      return next
    })
  }, [fetchJobs])

  // Initial load – we capture the initialFiltersRef to avoid re-fetch loops if parent passes new object references.
  useEffect(() => {
    fetchJobs(initialFiltersRef.current).catch((error) => logger.error(error))
    return () => { abortRef.current?.abort() }
  }, [fetchJobs])

  return {
    jobs,
    total,
    loading,
    error,
    filters,
    facets,
    meta,
  summary,
    updateFilters,
    resetFilters,
    refreshJobs,
    loadMore,
    hasMore: jobs.length < total,
  }
}
