"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RefreshCw, AlertCircle, Filter, RotateCcw, Clock, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react'

import { usePortalJobs } from '@/hooks/usePortalJobs'
import { JobCard } from '@/components/job-card'
import { mockJobs } from '@/data/mock-data-new'
import type { Job } from '@/types'
import type { PortalJobRecord, PortalJobContractType, JobCategory } from '@/types/jobs'

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
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const [showBackToTop, setShowBackToTop] = useState(false)

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
  } = usePortalJobs({ limit: 12, offset: 0, remote: true })

  const normalizedJobs = useMemo(() => portalJobs.map(mapPortalJob), [portalJobs])
  const hasRealData = normalizedJobs.length > 0

  const fallbackJobs = useMemo(() => {
    if (hasRealData || loading) {
      return [] as Job[]
    }
    return mockJobs.slice(0, 6)
  }, [hasRealData, loading])

  const visibleJobs = hasRealData ? normalizedJobs : fallbackJobs
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
    updateFilters({ remote: isRemoteOnly ? undefined : true, offset: 0 }, { append: false })
    const top = sectionRef.current?.getBoundingClientRect().top ?? 0
    const absoluteTop = window.scrollY + top - 80
    window.scrollTo({ top: Math.max(absoluteTop, 0), behavior: 'smooth' })
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

  const handleBackToTop = () => {
    const top = sectionRef.current?.getBoundingClientRect().top ?? 0
    const absoluteTop = window.scrollY + top - 80
    window.scrollTo({ top: Math.max(absoluteTop, 0), behavior: 'smooth' })
  }

  return (
    <section ref={sectionRef} className="mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm relative">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Sveže remote pozicije</h2>
          <p className="text-sm text-gray-600">
            Real-time feed iz agregatora. Prikazujemo{' '}
            <span className="font-semibold text-gray-900" data-testid="jobs-results-count">
              {totalCount}
            </span>{' '}
            rezultata.
          </p>
          {hasRealData && lastUpdatedLabel && (
            <div className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5" /> Poslednje osveženo {lastUpdatedLabel}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
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

  <div className="mt-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
            <Filter className="h-3.5 w-3.5" /> Filteri
          </span>
          <button
            type="button"
            onClick={toggleRemote}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              isRemoteOnly
                ? 'border-blue-200 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:text-blue-700'
            }`}
            data-testid="jobs-filter-remote"
          >
            Remote only
          </button>
          <span className="text-[11px] text-gray-500">Aktivno filtera: {activeFilterCount}</span>
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
        <p className="mt-6 text-sm text-gray-500">Trenutno nema dostupnih oglasa. Pokušajte da osvežite ili promenite filtere.</p>
      )}

      {totalCount > 0 && (
        <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-gray-600">
            Prikaz {startRecord}-{endRecord} od {totalCount} oglasa
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
            >
              Sledeća <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
