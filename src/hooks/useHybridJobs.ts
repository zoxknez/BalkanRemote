import { useState, useEffect, useCallback, useRef } from 'react'

export interface HybridJobFilters {
  limit?: number
  offset?: number
  workType?: string[] // hybrid, onsite, flexible
  contractType?: string[] // full-time, part-time, contract, etc.
  category?: string | null
  experience?: string[]
  search?: string | null
  country?: string | null
  order?: 'posted_date' | 'created_at'
}

export interface HybridJobFacets {
  workType: Record<string, number>
  contractType: Record<string, number>
  experienceLevel: Record<string, number>
  category: Record<string, number>
  country: Record<string, number>
}

export interface HybridJob {
  id: string
  title: string
  description: string | null
  company_name: string | null
  company_website: string | null
  location: string | null
  country_code: string | null
  region: string | null
  work_type: string
  salary_min: number | null
  salary_max: number | null
  salary_currency: string | null
  experience_level: string | null
  employment_type: string | null
  category: string | null
  skills: string[] | null
  technologies: string[] | null
  application_url: string | null
  application_email: string | null
  source_name: string
  source_website: string | null
  posted_date: string | null
  expires_at: string | null
  quality_score: number
  view_count: number
  bookmark_count: number
  created_at: string
  updated_at: string
}

interface HybridJobResponse {
  success: boolean
  data: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
    jobs: HybridJob[]
    facets: HybridJobFacets
    summary?: { 
      newToday: number
      totalHybrid: number
      sources?: { id: string; name: string; count: number }[]
    }
  }
  error?: string
}

export const useHybridJobs = (initialFilters: HybridJobFilters = {}) => {
  const [jobs, setJobs] = useState<HybridJob[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [facets, setFacets] = useState<HybridJobFacets | null>(null)
  const [summary, setSummary] = useState<{ newToday: number; totalHybrid: number; sources?: { id: string; name: string; count: number }[] } | null>(null)
  const [filters, setFilters] = useState<HybridJobFilters>(initialFilters)

  const abortRef = useRef<AbortController | null>(null)

  const fetchJobs = useCallback(async (overrides?: HybridJobFilters) => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setError(null)

    const f = overrides ?? filters
    const params = new URLSearchParams()

    if (f.limit) params.set('limit', f.limit.toString())
    if (f.offset) params.set('offset', f.offset.toString())
    if (f.search) params.set('search', f.search)
    if (f.category) params.set('category', f.category)
    if (f.country) params.set('country', f.country)
    if (f.order) params.set('order', f.order)

    // Work type filter (hybrid, onsite, flexible)
    f.workType?.forEach(type => params.append('workType', type))
    
    // Contract type filter
    f.contractType?.forEach(type => params.append('contractType', type))
    
    // Experience filter
    f.experience?.forEach(exp => params.append('experience', exp))

    try {
      const response = await fetch(`/api/hybrid-jobs?${params}`, {
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result: HybridJobResponse = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error')
      }

      setJobs(result.data.jobs)
      setTotal(result.data.total)
      setFacets(result.data.facets)
      if (result.data.summary) setSummary(result.data.summary)

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      console.error('Hybrid jobs fetch error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [filters])

  const updateFilters = useCallback((newFilters: Partial<HybridJobFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  // Fetch jobs when filters change
  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort()
    }
  }, [])

  return {
    jobs,
    total,
    loading,
    error,
    facets,
    summary,
    filters,
    updateFilters,
    resetFilters,
    refetch: fetchJobs,
    hasMore: filters.offset !== undefined && filters.limit !== undefined 
      ? (filters.offset + filters.limit) < total 
      : false
  }
}