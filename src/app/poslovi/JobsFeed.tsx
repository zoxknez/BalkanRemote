"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RefreshCw, AlertCircle, Filter, RotateCcw, Clock, ArrowLeft, ArrowRight, ArrowUp, Search } from 'lucide-react'
import { InfoTooltip } from '@/components/info-tooltip'
import { COPY_LINK_TEXT, COPY_LINK_TITLE_FILTERS, COPY_LINK_TOOLTIP_FILTERS, COPY_LINK_COPIED, COPY_LINK_ERROR } from '@/data/ui-copy'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

import { usePortalJobs } from '@/hooks/usePortalJobs'
import { JobCard } from '@/components/job-card'
import { ClipboardButton, type ClipboardStatus } from '@/components/clipboard-button'
import { mockJobs } from '@/data/mock-data-new'
import type { Job } from '@/types'
import type { PortalJobRecord, PortalJobContractType, JobCategory } from '@/types/jobs'
import { useCurrentUrl } from '@/hooks/useCurrentUrl'

const skeletonItems = Array.from({ length: 6 }, (_, index) => index)

const CONTRACT_OPTIONS: PortalJobContractType[] = ['full-time', 'part-time', 'contract', 'freelance', 'internship']
const CONTRACT_LABELS: Record<PortalJobContractType, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  contract: 'Contract',
  freelance: 'Freelance',
  internship: 'Internship'
}

const EXPERIENCE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'entry', label: 'Junior' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'executive', label: 'Executive' }
]

const EXPERIENCE_TO_JOB_LEVEL: Record<string, Job['experienceLevel']> = {
  entry: 'entry',
  mid: 'mid',
  senior: 'senior',
  lead: 'lead',
  executive: 'lead'
}

const CATEGORY_OPTIONS: { label: string; value: JobCategory }[] = [
  { label: 'Inženjering', value: 'software-engineering' },
  { label: 'Data/AI', value: 'data-science' },
  { label: 'Dizajn', value: 'design' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Prodaja', value: 'sales' },
  { label: 'Customer Support', value: 'customer-support' },
  { label: 'Proizvod/PM', value: 'management' },
  { label: 'HR & Talent', value: 'hr' },
  { label: 'Finansije', value: 'finance' },
  { label: 'Operacije', value: 'operations' },
  { label: 'Ostalo', value: 'other' }
]

const CATEGORY_LABELS = CATEGORY_OPTIONS.reduce((acc, item) => {
  acc[item.value] = item.label
  return acc
}, {} as Record<JobCategory, string>)

function stripHtml(input?: string | null): string {
  if (!input) return 'Opis nije dostupan.'
  return input.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() || 'Opis nije dostupan.'
}

function formatLocation(job: PortalJobRecord): string {
  if (job.location) return job.location
  if (job.remote_type) {
    const label = job.remote_type.replace(/-/g, ' ')
    return `Remote (${label})`
  }
  return job.is_remote ? 'Remote' : 'Lokacija nije navedena'
}

function mapPortalJob(job: PortalJobRecord): Job {
  const postedAt = job.posted_at ? new Date(job.posted_at) : new Date()
  const deadline = job.deadline ? new Date(job.deadline) : undefined
  const experienceLevel = EXPERIENCE_TO_JOB_LEVEL[job.experience_level ?? 'mid'] ?? 'mid'

  return {
    id: job.id,
    title: job.title,
    company: job.company,
    companyLogo: job.company_logo || undefined,
    location: formatLocation(job),
    type: (job.type as Job['type']) ?? 'full-time',
    category: CATEGORY_LABELS[job.category as JobCategory] ?? 'Ostalo',
    description: stripHtml(job.description),
    requirements: Array.isArray(job.requirements) ? job.requirements : [],
    benefits: Array.isArray(job.benefits) ? job.benefits : [],
    salaryMin: job.salary_min ?? undefined,
    salaryMax: job.salary_max ?? undefined,
    currency: job.currency ?? 'USD',
    isRemote: job.is_remote,
    experienceLevel,
    postedAt: Number.isNaN(postedAt.getTime()) ? new Date() : postedAt,
    deadline: deadline && !Number.isNaN(deadline.getTime()) ? deadline : undefined,
    url: job.url || job.source_url || '#',
    featured: Boolean(job.featured) || job.remote_type === 'fully-remote',
    tags: Array.isArray(job.tags) ? job.tags : [],
  }
}

function JobCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-gray-200" />
          <div>
            <div className="h-4 w-40 rounded bg-gray-200" />
            <div className="mt-2 h-3 w-24 rounded bg-gray-100" />
          </div>
        </div>
        <div className="h-3 w-20 rounded bg-gray-100" />
      </div>
      <div className="mt-4 flex gap-4">
        <div className="h-3 w-24 rounded bg-gray-100" />
        <div className="h-3 w-28 rounded bg-gray-100" />
        <div className="h-3 w-16 rounded bg-gray-100" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-gray-100" />
        <div className="h-3 w-5/6 rounded bg-gray-100" />
        <div className="h-3 w-2/3 rounded bg-gray-100" />
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-gray-200" />
        <div className="h-9 w-24 rounded-lg bg-gray-200" />
      </div>
    </div>
  )
}

function buildPagination(currentPage: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 1) return [1]
  const candidates = new Set<number>([1, totalPages, currentPage])
  for (const delta of [-2, -1, 1, 2]) {
    const page = currentPage + delta
    if (page > 1 && page < totalPages) candidates.add(page)
  }
  const ordered = Array.from(candidates).sort((a, b) => a - b)
  const items: Array<number | 'ellipsis'> = []
  ordered.forEach((page) => {
    const last = items[items.length - 1]
    if (typeof last === 'number' && page - last > 1) {
      items.push('ellipsis')
    }
    items.push(page)
  })
  return items
}

export function JobsFeed() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const detailsRef = useRef<HTMLDivElement | null>(null)
  const [detailsHeight, setDetailsHeight] = useState(0)
  const [searchText, setSearchText] = useState('')
  // Clipboard: use shared hook to get current URL
  const currentUrl = useCurrentUrl()
  const [clearedVisited, setClearedVisited] = useState(false)
  const [clearedPreferences, setClearedPreferences] = useState(false)
  const [hideVisited, setHideVisited] = useState<boolean>(() => {
    try {
      const hv = params.get('hideVisited')
      if (hv === '1' || hv === 'true') return true
      if (hv === '0' || hv === 'false') return false
      const saved = typeof window !== 'undefined' ? localStorage.getItem('jobs:hideVisited') : null
      return saved === '1'
    } catch {
      return false
    }
  })
  const VISITED_TTL_DAYS = 7

  // Mark dependency so linter recognizes usage; also could be used for analytics
  useEffect(() => {
    if (clearedPreferences) {
      // placeholder for event/logging
    }
  }, [clearedPreferences])

  // Build initial filters from URL (one-time for this component mount)
  const initialLimit = (() => {
    const limitParam = params.get('limit')
    if (limitParam) {
      const l = parseInt(limitParam, 10)
      if (Number.isFinite(l) && l > 0 && l <= 50) return l
    }
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('jobs:pageSize') : null
      const n = saved ? parseInt(saved, 10) : NaN
      if (Number.isFinite(n) && n > 0 && n <= 50) return n
    } catch {}
    return 12
  })()
  const initialPage = (() => {
    const p = parseInt(params.get('page') || '1', 10)
    return Number.isFinite(p) && p > 0 ? p : 1
  })()
  const initialOffset = (() => {
    const off = parseInt(params.get('offset') || '', 10)
    if (Number.isFinite(off) && off >= 0) return off
    return (initialPage - 1) * initialLimit
  })()
  const initialRemote = (() => {
    const r = params.get('remote')
    if (r === 'false' || r === '0' || r === 'any') return undefined
    if (r === 'true' || r === '1') return true
    // Fallback to saved preference
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('jobs:remoteOnly') : null
      if (saved === 'any' || saved === '0') return undefined
      if (saved === '1' || saved === 'true') return true
    } catch {}
    return true // default to remote-only
  })()
  const initialContract = (() => {
    const values = params.getAll('contractType') as PortalJobContractType[]
    const valid = values.filter((v) => (CONTRACT_OPTIONS as string[]).includes(v))
    return valid.length ? valid : undefined
  })()
  const initialExperience = (() => {
    const values = params.getAll('experience')
    const valid = values.filter((v) => EXPERIENCE_OPTIONS.some((o) => o.value === v))
    return valid.length ? valid : undefined
  })()
  const initialCategory = (() => {
    const c = params.get('category') || undefined
    if (!c || c === 'all') return undefined
    const exists = CATEGORY_OPTIONS.some((o) => o.value === c)
    return exists ? (c as JobCategory) : undefined
  })()
  const initialSearch = (() => {
    const q = params.get('q') || params.get('search')
    return q && q.trim().length ? q.trim() : undefined
  })()

  const {
    jobs: portalJobs,
    loading,
    error,
    total,
    refreshJobs,
    filters,
    updateFilters,
    resetFilters,
    facets,
  } = usePortalJobs({
    limit: initialLimit,
    offset: initialOffset,
    remote: initialRemote,
    contractType: initialContract,
    experience: initialExperience,
    category: initialCategory,
    search: initialSearch,
  })

  const normalizedJobs = useMemo(() => portalJobs.map(mapPortalJob), [portalJobs])
  const hasRealData = normalizedJobs.length > 0

  const fallbackJobs = useMemo(() => {
    if (hasRealData || loading) {
      return [] as Job[]
    }
    return mockJobs.slice(0, 6)
  }, [hasRealData, loading])

  const isVisited = useCallback((id: string | number) => {
    try {
      const raw = localStorage.getItem(`visited:${id}`)
      if (!raw) return false
      try {
        const parsed = JSON.parse(raw) as { ts?: number } | null
        const ts = parsed?.ts ?? 0
        if (!ts) return raw === '1'
        const ageMs = Date.now() - ts
        const ttlMs = VISITED_TTL_DAYS * 24 * 60 * 60 * 1000
        return ageMs < ttlMs
      } catch {
        return raw === '1'
      }
    } catch {
      return false
    }
  }, [])

  const baseJobs = hasRealData ? normalizedJobs : fallbackJobs
  const visibleJobs = useMemo(() => {
    if (!hideVisited) return baseJobs
    return baseJobs.filter((j) => !isVisited(j.id))
  }, [baseJobs, hideVisited, isVisited])
  const hiddenOnPage = hideVisited ? Math.max(0, baseJobs.length - visibleJobs.length) : 0
  const pageSize = filters.limit ?? 12
  const currentOffset = filters.offset ?? 0
  const totalCount = hasRealData ? total : visibleJobs.length
  const currentPage = totalCount === 0 ? 1 : Math.floor(currentOffset / pageSize) + 1
  const totalPages = totalCount === 0 ? 1 : Math.max(1, Math.ceil(totalCount / pageSize))
  const startRecord = totalCount === 0 ? 0 : currentOffset + 1
  const endRecord = totalCount === 0 ? 0 : Math.min(totalCount, currentOffset + visibleJobs.length)

  const facetCounts = facets ?? { contractType: {}, experienceLevel: {}, category: {} }
  const selectedContracts = filters.contractType ?? []
  const selectedExperience = filters.experience ?? []
  const selectedCategory = filters.category as JobCategory | null | undefined
  const isRemoteOnly = filters.remote !== undefined ? filters.remote : true

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    if (!loading && hasRealData) {
      setLastUpdated(new Date())
    }
  }, [loading, hasRealData, portalJobs])

  // Keep local search input in sync with filters
  useEffect(() => {
    setSearchText((filters.search ?? '').toString())
  }, [filters.search])

  // Debounce search input to filters
  useEffect(() => {
    const t = setTimeout(() => {
      const q = searchText.trim()
      // Avoid redundant updates
      if ((filters.search ?? '') !== q) {
        updateFilters({ search: q || undefined, offset: 0 }, { append: false })
      }
    }, 300)
    return () => clearTimeout(t)
  }, [searchText, filters.search, updateFilters])

  const goToPage = useCallback((page: number) => {
    const limit = filters.limit ?? 12
    const bounded = Math.max(1, page)
    const nextOffset = (bounded - 1) * limit
    updateFilters({ offset: nextOffset }, { append: false })
    // Smooth scroll to top of jobs section after page change
    const top = sectionRef.current?.getBoundingClientRect().top ?? 0
    const absoluteTop = window.scrollY + top - 80 // leave some space below sticky header
    window.scrollTo({ top: Math.max(absoluteTop, 0), behavior: 'smooth' })
  }, [filters.limit, updateFilters])

  useEffect(() => {
    if (!loading && hasRealData) {
      const expectedTotalPages = Math.max(1, Math.ceil(total / (filters.limit ?? 12)))
      if (currentPage > expectedTotalPages) {
        goToPage(expectedTotalPages)
      }
    }
  }, [loading, hasRealData, currentPage, total, filters.limit, goToPage])

  const paginationItems = useMemo(() => buildPagination(currentPage, totalPages), [currentPage, totalPages])
  const showFallbackNotice = !loading && !hasRealData
  const showSkeletonOnly = loading && visibleJobs.length === 0

  const toggleContract = (contract: PortalJobContractType) => {
    const next = selectedContracts.includes(contract)
      ? selectedContracts.filter((value) => value !== contract)
      : [...selectedContracts, contract]
    updateFilters({ contractType: next.length > 0 ? next : undefined, offset: 0 }, { append: false })
    const top = sectionRef.current?.getBoundingClientRect().top ?? 0
    const absoluteTop = window.scrollY + top - 80
    window.scrollTo({ top: Math.max(absoluteTop, 0), behavior: 'smooth' })
  }

  const toggleExperience = (experience: string) => {
    const next = selectedExperience.includes(experience)
      ? selectedExperience.filter((value) => value !== experience)
      : [...selectedExperience, experience]
    updateFilters({ experience: next.length > 0 ? next : undefined, offset: 0 }, { append: false })
    const top = sectionRef.current?.getBoundingClientRect().top ?? 0
    const absoluteTop = window.scrollY + top - 80
    window.scrollTo({ top: Math.max(absoluteTop, 0), behavior: 'smooth' })
  }

  const toggleCategory = (category: JobCategory) => {
    const nextCategory = selectedCategory === category ? null : category
    updateFilters({ category: nextCategory ?? undefined, offset: 0 }, { append: false })
    const top = sectionRef.current?.getBoundingClientRect().top ?? 0
    const absoluteTop = window.scrollY + top - 80
    window.scrollTo({ top: Math.max(absoluteTop, 0), behavior: 'smooth' })
  }

  const toggleRemote = () => {
    const nextRemote = isRemoteOnly ? undefined : true
    updateFilters({ remote: nextRemote, offset: 0 }, { append: false })
    try { localStorage.setItem('jobs:remoteOnly', nextRemote ? '1' : 'any') } catch {}
    const top = sectionRef.current?.getBoundingClientRect().top ?? 0
    const absoluteTop = window.scrollY + top - 80
    window.scrollTo({ top: Math.max(absoluteTop, 0), behavior: 'smooth' })
  }

  const toggleHideVisited = () => {
    setHideVisited((v) => {
      const next = !v
      try { localStorage.setItem('jobs:hideVisited', next ? '1' : '0') } catch {}
      return next
    })
    const top = sectionRef.current?.getBoundingClientRect().top ?? 0
    const absoluteTop = window.scrollY + top - 80
    window.scrollTo({ top: Math.max(absoluteTop, 0), behavior: 'smooth' })
  }

  const clearVisitedHistory = () => {
    try {
      const toRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('visited:')) toRemove.push(key)
      }
      toRemove.forEach((k) => localStorage.removeItem(k))
      setClearedVisited(true)
      setTimeout(() => setClearedVisited(false), 1500)
    } catch {}
  }

  const clearPreferences = () => {
    try {
      localStorage.removeItem('jobs:pageSize')
      localStorage.removeItem('jobs:remoteOnly')
      localStorage.removeItem('jobs:hideVisited')
      setClearedPreferences(true)
      setTimeout(() => setClearedPreferences(false), 1500)
    } catch {}
  }

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.search) count += 1
    if (selectedContracts.length) count += 1
    if (selectedExperience.length) count += 1
    if (selectedCategory) count += 1
    if (!isRemoteOnly) count += 1
    return count
  }, [filters.search, selectedContracts.length, selectedExperience.length, selectedCategory, isRemoteOnly])

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdated) return null
    const diffMs = Date.now() - lastUpdated.getTime()
    const diffMinutes = Math.round(diffMs / 60000)
    if (diffMinutes <= 0) return 'upravo sada'
    if (diffMinutes < 60) return `pre ${diffMinutes} min`
    const diffHours = Math.round(diffMinutes / 60)
    if (diffHours < 24) return `pre ${diffHours} h`
    return lastUpdated.toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' })
  }, [lastUpdated])

  // Show back-to-top button after scroll
  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Keyboard navigation for pagination (Left/Right arrows)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === '/') {
        e.preventDefault()
        searchInputRef.current?.focus()
        return
      }
      if (e.key === 'ArrowRight') {
        if (!loading && currentPage < totalPages) {
          e.preventDefault()
          goToPage(currentPage + 1)
        }
      } else if (e.key === 'ArrowLeft') {
        if (!loading && currentPage > 1) {
          e.preventDefault()
          goToPage(currentPage - 1)
        }
      } else if (e.key === 'Escape') {
        if (showMobileFilters) {
          setShowMobileFilters(false)
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [currentPage, totalPages, loading, goToPage, showMobileFilters])

  // Measure filters content height for smooth expand/collapse on mobile
  useEffect(() => {
    const measure = () => {
      const h = detailsRef.current?.scrollHeight ?? 0
      setDetailsHeight(h)
    }
    // Measure immediately and after layout settles
    measure()
    const t = setTimeout(measure, 50)
    return () => clearTimeout(t)
  }, [showMobileFilters, selectedContracts.length, selectedExperience.length, selectedCategory, isRemoteOnly, loading, facets])

  const handleBackToTop = () => {
    const top = sectionRef.current?.getBoundingClientRect().top ?? 0
    const absoluteTop = window.scrollY + top - 80
    window.scrollTo({ top: Math.max(absoluteTop, 0), behavior: 'smooth' })
  }

  const scrollToSectionTop = () => {
    const top = sectionRef.current?.getBoundingClientRect().top ?? 0
    const absoluteTop = window.scrollY + top - 80
    window.scrollTo({ top: Math.max(absoluteTop, 0), behavior: 'smooth' })
  }

  // ClipboardButton handles copy and announcements internally

  // Reflect filters to URL (page, limit, q, category, contractType[], experience[], remote)
  useEffect(() => {
    const p = new URLSearchParams(params.toString())
    const setSingle = (key: string, value?: string | number | boolean | null) => {
      if (value === undefined || value === null || value === '' || value === 'all') {
        p.delete(key)
        return
      }
      p.set(key, String(value))
    }
    const setMulti = (key: string, values?: string[]) => {
      p.delete(key)
      if (!values || values.length === 0) return
      values.forEach((v) => p.append(key, v))
    }

    const limit = filters.limit ?? 12
    const page = Math.max(1, Math.floor((filters.offset ?? 0) / limit) + 1)
    setSingle('page', page)
    // Keep limit only if not default
    if (limit !== 12) setSingle('limit', limit)
    else p.delete('limit')

    // Prefer q for search
    setSingle('q', (filters.search ?? '').toString().trim() || null)
    setSingle('category', filters.category ?? null)
    setMulti('contractType', (filters.contractType as string[] | undefined))
  setMulti('experience', (filters.experience as string[] | undefined))

  // Remote: default experience is remote-only (even when filters.remote is undefined)
  const remoteOnly = filters.remote !== undefined ? !!filters.remote : true
  setSingle('remote', remoteOnly ? '1' : 'any')
  // UI-only flag in URL for shareability
  setSingle('hideVisited', hideVisited ? '1' : null)

    // We use page, not offset, in URL
    p.delete('offset')

    router.replace(`${pathname}?${p.toString()}`, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.limit, filters.offset, filters.remote, filters.contractType, filters.experience, filters.category, filters.search, pathname, router, hideVisited])

  return (
    <section ref={sectionRef} className="mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm relative">
      {/* Mobile sticky quick filters bar */}
      <div className="md:hidden sticky top-16 z-30 -mx-6 mb-4 border-b border-gray-100 bg-white/90 px-6 py-2 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleHideVisited}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition ${
                hideVisited
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-200 hover:text-emerald-700'
              }`}
              aria-pressed={hideVisited}
              aria-label="Uključi/isključi prikaz posećenih oglasa"
              title="Sakriva samo oglase koji su već posećeni na ovoj stranici. Oznake posećenih traju 7 dana."
            >
              Sakrij posećene
            </button>
            <InfoTooltip
              className="md:hidden"
              label="Šta znači 'Sakrij posećene'"
              title="Objašnjenje opcije 'Sakrij posećene'"
              text="Sakriva samo oglase koje ste već otvorili na ovoj stranici. Oznaka ‘posećeno’ traje 7 dana i može se obrisati kroz ‘Očisti posećene’."
            />
            {hideVisited && hiddenOnPage > 0 && (
              <div className="mt-1 text-xs text-emerald-700">Sakriveno: {hiddenOnPage} posećenih na ovoj stranici</div>
            )}
            <button
              type="button"
              onClick={() => setShowMobileFilters((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-blue-300 hover:text-blue-700"
              aria-expanded={showMobileFilters}
              aria-controls="jobs-filters-detailed"
            >
              <Filter className="h-4 w-4" />
              Filteri
              <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-100 px-1 text-xs font-semibold text-gray-700">
                {activeFilterCount}
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleRemote}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                isRemoteOnly
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:text-blue-700'
              }`}
              aria-pressed={isRemoteOnly}
              aria-label="Uključi/isključi Remote only filter"
            >
              Remote only
            </button>
            <button
              type="button"
              onClick={clearVisitedHistory}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-rose-200 hover:text-rose-700"
              aria-label="Očisti istoriju posećenih oglasa"
              title="Obriši oznake posećenih oglasa"
            >
              Očisti posećene
            </button>
            <button
              type="button"
              onClick={() => resetFilters()}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-rose-200 hover:text-rose-700"
              aria-label="Resetuj sve filtere"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Sveže remote pozicije
            {totalCount > 0 && (
              <span className="ml-2 align-middle rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                Ukupno: {totalCount}
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-600">
            Real-time feed iz agregatora. Prikazujemo{' '}
            <span className="font-semibold text-gray-900" data-testid="jobs-results-count">
              {totalCount}
            </span>{' '}
            rezultata.
          </p>
          {hideVisited && hiddenOnPage > 0 && (
            <div className="mt-1 text-xs text-emerald-700">Sakriveno: {hiddenOnPage} posećenih na ovoj stranici</div>
          )}
          {/* Screen reader live updates for results/page changes */}
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            Strana {currentPage} od {totalPages}. Prikaz {startRecord}-{endRecord} od {totalCount} oglasa.
          </div>
          {hasRealData && lastUpdatedLabel && (
            <div className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5" /> Poslednje osveženo {lastUpdatedLabel}
            </div>
          )}
          {/* SR-only status messages for actions */}
          <div className="sr-only" aria-live="polite">
            {clearedVisited ? 'Oznake posećenih su obrisane.' : ''}
            {clearedPreferences ? 'Preferencije prikaza su resetovane.' : ''}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <ClipboardButton
            value={currentUrl}
            copyText={COPY_LINK_TEXT}
            copiedText={COPY_LINK_COPIED}
            errorText={COPY_LINK_ERROR}
            title={COPY_LINK_TITLE_FILTERS}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-blue-300 hover:text-blue-700"
            showIcon={false}
            announceValue={false}
            renderLabel={(status: ClipboardStatus) => (
              <AnimatePresence mode="wait" initial={false}>
                {status === 'copied' ? (
                  <motion.span
                    key="copied"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.18 }}
                  >
                    Link kopiran
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.18 }}
                  >
                    {COPY_LINK_TEXT}
                  </motion.span>
                )}
              </AnimatePresence>
            )}
          />
          <InfoTooltip
            className="hidden md:inline-block"
            label="Šta radi 'Kopiraj link'"
            title="Objašnjenje opcije 'Kopiraj link'"
            text={COPY_LINK_TOOLTIP_FILTERS}
          />
          {clearedVisited && (
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
              Oznake posećenih su obrisane
            </span>
          )}
          {clearedPreferences && (
            <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700">
              Preferencije su resetovane
            </span>
          )}
          <button
            type="button"
            onClick={() => resetFilters()}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Resetuj filtere
          </button>
          <button
            type="button"
            onClick={() => refreshJobs()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Osveži oglase
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>Privremeni problem sa učitavanjem oglasa. Pokušaćemo ponovo za par sekundi.</p>
        </div>
      )}

      {showFallbackNotice && (
        <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50/60 p-3 text-sm text-indigo-900">
          Još nemamo aktivne oglase iz agregatora, zato prikazujemo kurirani demo set. Novi podaci se učitavaju jednom dnevno.
        </div>
      )}

  <div
        id="jobs-filters-detailed"
        ref={detailsRef}
        className={`mt-6 space-y-4 overflow-hidden transition-[max-height] duration-300 ease-out md:block md:overflow-visible md:transition-none ${showMobileFilters ? 'block' : 'block md:block'}`}
        style={{ maxHeight: showMobileFilters ? detailsHeight : 0 }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
            <Filter className="h-3.5 w-3.5" /> Filteri
          </span>
          {/* Search */}
          <div className="relative w-full sm:w-auto sm:min-w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              inputMode="search"
              placeholder="Pretraga oglasa (naziv, kompanija, tagovi)"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              ref={searchInputRef}
              id="jobs-search-input"
              className="w-full rounded-full border border-gray-200 bg-white pl-9 pr-3 py-1 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              aria-label="Pretraga poslova"
              aria-describedby="jobs-search-help"
            />
            <div id="jobs-search-help" className="sr-only">Savjet: Pritisnite kosu crtu (/) da fokusirate polje za pretragu.</div>
          </div>
          <button
            type="button"
            onClick={toggleRemote}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              isRemoteOnly
                ? 'border-blue-200 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:text-blue-700'
            }`}
            data-testid="jobs-filter-remote"
            aria-pressed={isRemoteOnly}
          >
            Remote only
          </button>
            <button
            type="button"
            onClick={toggleHideVisited}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              hideVisited
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-200 hover:text-emerald-700'
            }`}
            aria-pressed={hideVisited}
              title="Sakriva samo oglase koji su već posećeni na ovoj stranici. Oznake posećenih traju 7 dana."
          >
            Sakrij posećene
          </button>
            <InfoTooltip
              className="ml-1 hidden md:inline-block"
              label="Šta znači 'Sakrij posećene'"
              title="Objašnjenje opcije 'Sakrij posećene'"
              text="Sakriva samo oglase koje ste već otvorili na ovoj stranici. Oznaka ‘posećeno’ traje 7 dana i može se obrisati kroz ‘Očisti posećene’."
            />
          <button
            type="button"
            onClick={clearVisitedHistory}
            className="rounded-full border px-3 py-1 text-xs font-medium text-gray-600 transition border-gray-200 bg-white hover:border-rose-200 hover:text-rose-700"
            aria-label="Očisti istoriju posećenih oglasa"
            title="Obriši oznake posećenih oglasa"
          >
            Očisti posećene
          </button>
            <button
              type="button"
              onClick={clearPreferences}
              className="rounded-full border px-3 py-1 text-xs font-medium text-gray-600 transition border-gray-200 bg-white hover:border-indigo-300 hover:text-indigo-700"
              aria-label="Resetuj sačuvane preferencije prikaza"
              title="Obriši sačuvane preferencije (po stranici, remote only, sakrij posećene)"
            >
              Reset preferenci
            </button>
          <span className="text-[11px] text-gray-500">Aktivno filtera: {activeFilterCount}</span>
          {/* Page size selector */}
          <label className="ml-auto inline-flex items-center gap-2 text-[11px] text-gray-600">
            <span className="sr-only">Rezultata po stranici</span>
            <span className="hidden sm:inline">Po stranici:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const nextLimit = parseInt(e.target.value, 10)
                if (Number.isFinite(nextLimit) && nextLimit > 0) {
                  updateFilters({ limit: nextLimit, offset: 0 }, { append: false })
                  try { localStorage.setItem('jobs:pageSize', String(nextLimit)) } catch {}
                  scrollToSectionTop()
                }
              }}
              className="rounded-full border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              aria-label="Rezultata po stranici"
            >
              {[12, 24, 48].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-2" data-testid="jobs-filter-contract">
          {CONTRACT_OPTIONS.map((option) => {
            const isActive = selectedContracts.includes(option)
            const count = facetCounts.contractType[option] ?? null
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleContract(option)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  isActive
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-200 hover:text-emerald-700'
                }`}
              >
                {CONTRACT_LABELS[option]}
                {count !== null && count !== undefined && (
                  <span className="ml-1 text-[11px] text-emerald-700/80">({count})</span>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-2" data-testid="jobs-filter-seniority">
          {EXPERIENCE_OPTIONS.map(({ value, label }) => {
            const isActive = selectedExperience.includes(value)
            const count = facetCounts.experienceLevel[value] ?? null
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleExperience(value)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  isActive
                    ? 'border-purple-200 bg-purple-50 text-purple-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-purple-200 hover:text-purple-700'
                }`}
              >
                {label}
                {count !== null && count !== undefined && (
                  <span className="ml-1 text-[11px] text-purple-700/80">({count})</span>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-2" data-testid="jobs-filter-category">
          {CATEGORY_OPTIONS.map(({ label, value }) => {
            const isActive = selectedCategory === value
            const count = facetCounts.category[value] ?? null
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleCategory(value)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  isActive
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:text-indigo-700'
                }`}
              >
                {label}
                {count !== null && count !== undefined && (
                  <span className="ml-1 text-[11px] text-indigo-700/80">({count})</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <AnimatePresence initial={false}>
            {filters.search && (
              <motion.button
                type="button"
                onClick={() => updateFilters({ search: undefined, offset: 0 }, { append: false })}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700 hover:border-rose-200 hover:text-rose-700"
                aria-label="Ukloni filter pretrage"
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                Pretraga: “{filters.search}” ✕
              </motion.button>
            )}
            {selectedCategory && (
              <motion.button
                type="button"
                onClick={() => updateFilters({ category: undefined, offset: 0 }, { append: false })}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700 hover:border-rose-200 hover:text-rose-700"
                aria-label="Ukloni kategoriju"
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                Kategorija: {CATEGORY_LABELS[selectedCategory]} ✕
              </motion.button>
            )}
            {selectedContracts.map((ct) => (
              <motion.button
                key={`chip-ct-${ct}`}
                type="button"
                onClick={() => {
                  const next = selectedContracts.filter((v) => v !== ct)
                  updateFilters({ contractType: next.length ? next : undefined, offset: 0 }, { append: false })
                }}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700 hover:border-rose-200 hover:text-rose-700"
                aria-label={`Ukloni tip ugovora ${CONTRACT_LABELS[ct]}`}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                Ugovor: {CONTRACT_LABELS[ct]} ✕
              </motion.button>
            ))}
            {selectedExperience.map((ex) => (
              <motion.button
                key={`chip-ex-${ex}`}
                type="button"
                onClick={() => {
                  const next = selectedExperience.filter((v) => v !== ex)
                  updateFilters({ experience: next.length ? next : undefined, offset: 0 }, { append: false })
                }}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700 hover:border-rose-200 hover:text-rose-700"
                aria-label={`Ukloni nivo iskustva ${ex}`}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                Iskustvo: {EXPERIENCE_OPTIONS.find((o) => o.value === ex)?.label || ex} ✕
              </motion.button>
            ))}
            {hideVisited && (
              <motion.button
                type="button"
                onClick={() => setHideVisited(false)}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700 hover:border-rose-200 hover:text-rose-700"
                aria-label="Prikaži posećene oglase"
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                Sakrij posećene: uključeno ✕
              </motion.button>
            )}
            {!isRemoteOnly && (
              <motion.button
                type="button"
                onClick={() => updateFilters({ remote: true, offset: 0 }, { append: false })}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700 hover:border-rose-200 hover:text-rose-700"
                aria-label="Vrati Remote only"
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                Remote: bilo koji ✕
              </motion.button>
            )}
            <motion.button
              type="button"
              onClick={() => resetFilters()}
              className="ml-1 inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700 hover:border-rose-200 hover:text-rose-700"
              aria-label="Ukloni sve filtere"
              layout
              whileTap={{ scale: 0.97 }}
            >
              Ukloni sve ✕
            </motion.button>
            </AnimatePresence>
          </div>
        )}
      </div>

      {showBackToTop && (
        <button
          type="button"
          onClick={handleBackToTop}
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-4 py-2 text-sm font-medium text-gray-700 shadow-lg backdrop-blur transition hover:border-blue-300 hover:text-blue-700"
          aria-label="Nazad na vrh oglasa"
        >
          <ArrowUp className="h-4 w-4" />
          Na vrh
        </button>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        {showSkeletonOnly
          ? skeletonItems.map((item) => <JobCardSkeleton key={item} />)
          : (
            <>
              {visibleJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
              {loading && visibleJobs.length > 0 &&
                skeletonItems.slice(0, 2).map((item) => <JobCardSkeleton key={`loader-${item}`} />)}
            </>
            )}
      </div>

      {!loading && visibleJobs.length === 0 && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          <p className="mb-3">
            Trenutno nema dostupnih oglasa za izabrane filtere.
            {hideVisited && hiddenOnPage >= 0 && ' Neki oglasi su možda sakriveni jer su već posećeni.'}
          </p>
          {hideVisited && (
            <button
              type="button"
              onClick={() => setHideVisited(false)}
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700"
            >
              Prikaži posećene
            </button>
          )}
        </div>
      )}

      {totalCount > 0 && (
        <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-gray-600">
            Prikaz {startRecord}-{endRecord} od {totalCount} oglasa
          </div>
          <div className="flex items-center gap-2" role="navigation" aria-label="Paginacija">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Prethodna strana ${currentPage > 1 ? `(${currentPage - 1})` : ''}`}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Prethodna
            </button>
            <div className="flex items-center gap-1">
              {paginationItems.map((item, index) => (
                typeof item === 'number' ? (
                  <button
                    key={`page-${item}`}
                    type="button"
                    onClick={() => goToPage(item)}
                    className={`min-w-[32px] rounded-full px-2 py-1 text-xs font-medium transition ${
                      item === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:text-blue-700'
                    }`}
                    aria-current={item === currentPage ? 'page' : undefined}
                    aria-label={`Strana ${item}${item === currentPage ? ' (trenutna)' : ''}`}
                  >
                    {item}
                  </button>
                ) : (
                  <span key={`ellipsis-${index}`} className="px-2 text-xs text-gray-400">…</span>
                )
              ))}
            </div>
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Sledeća strana ${currentPage < totalPages ? `(${currentPage + 1})` : ''}`}
            >
              Sledeća <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
      {/* JSON-LD ItemList for visible jobs on current page */}
      {visibleJobs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              itemListElement: visibleJobs.map((job, idx) => {
                const position = (currentOffset ?? 0) + idx + 1
                const employmentTypeMap: Record<string, string> = {
                  'full-time': 'FULL_TIME',
                  'part-time': 'PART_TIME',
                  contract: 'CONTRACTOR',
                  freelance: 'CONTRACTOR',
                  internship: 'INTERN',
                }
                return {
                  '@type': 'ListItem',
                  position,
                  url: job.url,
                  item: {
                    '@type': 'JobPosting',
                    title: job.title,
                    datePosted: job.postedAt?.toISOString?.() || undefined,
                    employmentType: employmentTypeMap[job.type] || job.type,
                    jobLocationType: job.isRemote ? 'TELECOMMUTE' : undefined,
                    hiringOrganization: job.company ? { '@type': 'Organization', name: job.company } : undefined,
                    description: job.description?.slice(0, 300),
                  },
                }
              }),
            }),
          }}
        />
      )}
    </section>
  )
}
