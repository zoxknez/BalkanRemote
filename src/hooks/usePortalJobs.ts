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

  const abortRef = useRef<AbortController | null>(null)
  const initialFiltersRef = useRef(initialFilters)

  const fetchJobs = useCallback(async (overrides?: PortalJobFilters, { append } = { append: false }) => {
    if (abortRef.current) {
      abortRef.current.abort()
    }

    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    const nextFilters = overrides ?? filters
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
      const response = await fetch(`/api/portal-jobs${query ? `?${query}` : ''}`, { signal: controller.signal })
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`)
      }

      const payload = (await response.json()) as PortalJobResponse
      if (!payload.success) {
        throw new Error(payload.error || 'Failed to fetch portal jobs')
      }

      const shouldAppend = append || ((nextFilters.offset ?? 0) > 0)

      setJobs((prev) => {
        if (!shouldAppend) {
          return payload.data.jobs
        }
        const existingIds = new Set(prev.map((job) => job.id))
        const incoming = payload.data.jobs.filter((job) => !existingIds.has(job.id))
        return [...prev, ...incoming]
      })
      setTotal(payload.data.total)
      setFacets(payload.data.facets)
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') {
        return
      }
      logger.error('Error fetching portal jobs', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch portal jobs')
      setJobs([])
      setFacets(null)
      setTotal(0)
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null
        setLoading(false)
      }
    }
  }, [filters])

  const updateFilters = useCallback((partial: Partial<PortalJobFilters>) => {
    setFilters((prev) => {
      const next = { ...prev, ...partial }
      const shouldAppend = (partial.offset ?? 0) > 0
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
    updateFilters,
    resetFilters,
    refreshJobs,
    hasMore: jobs.length < total,
  }
}
