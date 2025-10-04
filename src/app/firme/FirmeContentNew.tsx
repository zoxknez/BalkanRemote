"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useHybridJobs } from '@/hooks/useHybridJobs'
import { HybridJobCard } from '@/components/hybrid-job-card'
import {
  Search,
  Filter,
  MapPin,
  Briefcase,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Building2,
  Globe,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

const WORK_TYPES = [
  { value: 'hybrid', label: 'Hibridno', icon: '🏢', desc: 'Kombinacija remote i kancelarija' },
  { value: 'onsite', label: 'U kancelariji', icon: '🏛️', desc: 'Rad iz kancelarije' },
  { value: 'flexible', label: 'Fleksibilno', icon: '✨', desc: 'Fleksibilan način rada' },
] as const

const BALKAN_COUNTRIES = [
  { code: 'RS', label: 'Srbija', flag: '🇷🇸' },
  { code: 'HR', label: 'Hrvatska', flag: '🇭🇷' },
  { code: 'BA', label: 'BiH', flag: '🇧🇦' },
  { code: 'SI', label: 'Slovenija', flag: '🇸🇮' },
  { code: 'MK', label: 'Makedonija', flag: '🇲🇰' },
  { code: 'ME', label: 'Crna Gora', flag: '🇲🇪' },
] as const

const EXPERIENCE_LEVELS = [
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
] as const

export default function FirmeContentSimplified() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [searchInput, setSearchInput] = useState(searchParams?.get('search') || '')
  const [showFilters, setShowFilters] = useState(false)

  const {
    jobs,
    loading,
    error,
    total,
    filters,
    updateFilters,
    resetFilters,
    summary,
  } = useHybridJobs({
    limit: 12,
    offset: (() => {
      const page = parseInt(searchParams?.get('page') || '1', 10)
      return page > 1 ? (page - 1) * 12 : 0
    })(),
    search: searchParams?.get('search') || undefined,
    workType: (() => {
      const types = searchParams?.getAll('workType') || []
      return types.length ? types : ['hybrid', 'onsite']
    })(),
    country: searchParams?.get('country') || undefined,
    experience: searchParams?.getAll('experience') || undefined,
    order: 'posted_date',
  })

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.workType?.length) filters.workType.forEach(t => params.append('workType', t))
    if (filters.country) params.set('country', filters.country)
    if (filters.experience?.length) filters.experience.forEach(e => params.append('experience', e))
    if (filters.offset && filters.offset > 0) {
      const page = Math.floor(filters.offset / (filters.limit || 12)) + 1
      params.set('page', String(page))
    }
    
    const qs = params.toString()
    const newUrl = qs ? `/firme?${qs}` : '/firme'
    if (window.location.pathname + window.location.search !== newUrl) {
      router.replace(newUrl, { scroll: false })
    }
  }, [filters, router])

  const handleSearch = useCallback(() => {
    updateFilters({ search: searchInput.trim() || null, offset: 0 })
  }, [searchInput, updateFilters])

  const toggleWorkType = useCallback((type: string) => {
    const current = filters.workType || []
    const exists = current.includes(type)
    const next = exists 
      ? current.filter(t => t !== type)
      : [...current, type]
    updateFilters({ workType: next.length > 0 ? next : undefined, offset: 0 })
  }, [filters.workType, updateFilters])

  const setCountry = useCallback((country: string | null) => {
    updateFilters({ country, offset: 0 })
  }, [updateFilters])

  const toggleExperience = useCallback((exp: string) => {
    const current = filters.experience || []
    const exists = current.includes(exp)
    const next = exists
      ? current.filter(e => e !== exp)
      : [...current, exp]
    updateFilters({ experience: next.length > 0 ? next : undefined, offset: 0 })
  }, [filters.experience, updateFilters])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.country) count++
    if (filters.experience?.length) count++
    const defaultWorkTypes = ['hybrid', 'onsite']
    const hasCustomWorkType = filters.workType && 
      (filters.workType.length !== defaultWorkTypes.length || 
       !filters.workType.every(t => defaultWorkTypes.includes(t)))
    if (hasCustomWorkType) count++
    return count
  }, [filters])

  const handleClearFilters = useCallback(() => {
    resetFilters()
    setSearchInput('')
    setShowFilters(false)
  }, [resetFilters])

  // Pagination
  const limit = filters.limit || 12
  const currentPage = Math.floor((filters.offset || 0) / limit) + 1
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const goToPage = useCallback((page: number) => {
    if (page < 1 || page > totalPages) return
    updateFilters({ offset: (page - 1) * limit })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [totalPages, limit, updateFilters])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Building2 className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">
              Hibridni & Lokalni Poslovi
            </h1>
          </div>
          <p className="text-blue-100 text-lg mb-6">
            Pronađi poslove na Balkanu sa radom iz kancelarije ili hibridnim modelom
          </p>

          {/* Search Bar */}
          <div className="flex gap-2 max-w-3xl">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Pretraži po poziciji, kompaniji..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border-0 text-gray-900 text-lg shadow-lg focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
            >
              Traži
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-4 bg-blue-500/20 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-blue-500/30 transition-colors relative"
            >
              <Filter className="w-5 h-5" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 text-blue-900 text-xs font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Stats */}
          {summary && (
            <div className="mt-6 flex gap-4 text-sm">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Sparkles className="w-4 h-4 inline mr-2" />
                <strong>{summary.totalHybrid}</strong> aktivnih pozicija
              </div>
              {summary.newToday > 0 && (
                <div className="bg-yellow-400/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  🔥 <strong>{summary.newToday}</strong> novih danas
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b border-gray-200 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Work Type */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Tip rada
                  </label>
                  <div className="flex flex-col gap-2">
                    {WORK_TYPES.map(({ value, label, icon, desc }) => {
                      const isActive = filters.workType?.includes(value)
                      return (
                        <button
                          key={value}
                          onClick={() => toggleWorkType(value)}
                          className={cn(
                            "px-4 py-3 rounded-lg border-2 text-left transition-all",
                            isActive
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{icon}</span>
                            <div className="flex-1">
                              <div className="font-medium">{label}</div>
                              <div className="text-xs text-gray-500">{desc}</div>
                            </div>
                            {isActive && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Država
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setCountry(null)}
                      className={cn(
                        "px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                        !filters.country
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300 bg-white text-gray-600"
                      )}
                    >
                      <Globe className="w-4 h-4 inline mr-1" />
                      Sve
                    </button>
                    {BALKAN_COUNTRIES.map(({ code, label, flag }) => {
                      const isActive = filters.country === code
                      return (
                        <button
                          key={code}
                          onClick={() => setCountry(isActive ? null : code)}
                          className={cn(
                            "px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                            isActive
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:border-gray-300 bg-white text-gray-600"
                          )}
                        >
                          <span className="mr-1">{flag}</span>
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">
                    Nivo iskustva
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EXPERIENCE_LEVELS.map(({ value, label }) => {
                      const isActive = filters.experience?.includes(value)
                      return (
                        <button
                          key={value}
                          onClick={() => toggleExperience(value)}
                          className={cn(
                            "px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                            isActive
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:border-gray-300 bg-white text-gray-600"
                          )}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {activeFilterCount} aktivnih filtera
                  </span>
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Obriši sve filtere
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Jobs Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Učitavanje poslova...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Greška pri učitavanju</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="bg-gray-50 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nema rezultata
            </h3>
            <p className="text-gray-600 mb-6">
              Pokušaj da promeniš filtere ili pretragu
            </p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Obriši filtere
            </button>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <>
            <div className="mb-6 text-sm text-gray-600">
              Pronađeno <strong className="text-gray-900">{total}</strong> poslova
              {filters.search && ` za "${filters.search}"`}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {jobs.map((job) => (
                <HybridJobCard key={job.id} job={job} searchTerm={filters.search || ''} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 7) {
                    pageNum = i + 1
                  } else if (currentPage <= 4) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i
                  } else {
                    pageNum = currentPage - 3 + i
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => goToPage(pageNum)}
                      className={cn(
                        "w-10 h-10 rounded-lg font-medium transition-colors",
                        pageNum === currentPage
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      {pageNum}
                    </button>
                  )
                })}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
