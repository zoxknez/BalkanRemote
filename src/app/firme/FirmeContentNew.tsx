"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useHybridJobs } from '@/hooks/useHybridJobs'
import { HybridJobCard } from '@/components/hybrid-job-card'
import { JobCardSkeletonGrid } from '@/components/job-card-skeleton'
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
  Sparkles,
  Bookmark,
  BarChart3,
  Link as LinkIcon,
  ExternalLink,
  TrendingUp,
  Flame,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HybridJob } from '@/hooks/useHybridJobs'

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

type TabType = 'explore' | 'saved' | 'stats' | 'sources'

export default function FirmeContentSimplified() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [searchInput, setSearchInput] = useState(searchParams?.get('search') || '')
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('explore')
  const [savedJobs, setSavedJobs] = useState<HybridJob[]>([])
  const [savedLoading, setSavedLoading] = useState(false)
  const [bookmarkCount, setBookmarkCount] = useState<number | null>(null)
  
  // Autocomplete functionality
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  
  // Debug mode
  const [debugMode, setDebugMode] = useState(false)

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

  // Debug mode detection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    setDebugMode(urlParams.get('debug') === '1')
  }, [])

  // Autocomplete suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setSuggestionsLoading(true)

    try {
      const response = await fetch(`/api/hybrid-jobs/suggest?q=${encodeURIComponent(query)}`, {
        signal: abortControllerRef.current.signal
      })
      
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
        setShowSuggestions(true)
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Suggestions fetch error:', error)
      }
    } finally {
      setSuggestionsLoading(false)
    }
  }, [])

  // Debounced search suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(searchInput)
    }, 350)

    return () => clearTimeout(timeoutId)
  }, [searchInput, fetchSuggestions])

  // Analytics tracking
  const trackEvent = useCallback(async (event: string, data: Record<string, unknown> = {}) => {
    try {
      await fetch('/api/hybrid-jobs/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, data })
      })
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  }, [])

  const handleSearch = useCallback(() => {
    updateFilters({ search: searchInput.trim() || null, offset: 0 })
    trackEvent('search_performed', { query: searchInput.trim() })
  }, [searchInput, updateFilters, trackEvent])

  // Keyboard navigation for suggestions
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
          const selectedSuggestion = suggestions[selectedSuggestionIndex]
          setSearchInput(selectedSuggestion)
          setShowSuggestions(false)
          updateFilters({ search: selectedSuggestion, offset: 0 })
          trackEvent('search_performed', { query: selectedSuggestion })
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
    }
  }, [showSuggestions, suggestions, selectedSuggestionIndex, handleSearch, updateFilters, trackEvent])

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleWorkType = useCallback((type: string) => {
    const current = filters.workType || []
    const exists = current.includes(type)
    const next = exists 
      ? current.filter(t => t !== type)
      : [...current, type]
    updateFilters({ workType: next.length > 0 ? next : undefined, offset: 0 })
    trackEvent('filter_used', { filter: 'workType', value: type, action: exists ? 'remove' : 'add' })
  }, [filters.workType, updateFilters, trackEvent])

  const setCountry = useCallback((country: string | null) => {
    updateFilters({ country, offset: 0 })
    trackEvent('filter_used', { filter: 'country', value: country, action: country ? 'add' : 'remove' })
  }, [updateFilters, trackEvent])

  const toggleExperience = useCallback((exp: string) => {
    const current = filters.experience || []
    const exists = current.includes(exp)
    const next = exists
      ? current.filter(e => e !== exp)
      : [...current, exp]
    updateFilters({ experience: next.length > 0 ? next : undefined, offset: 0 })
    trackEvent('filter_used', { filter: 'experience', value: exp, action: exists ? 'remove' : 'add' })
  }, [filters.experience, updateFilters, trackEvent])

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
    trackEvent('page_navigation', { page, totalPages })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [totalPages, limit, updateFilters, trackEvent])

  // Fetch saved jobs
  const fetchSavedJobs = useCallback(async () => {
    setSavedLoading(true)
    try {
      const res = await fetch('/api/hybrid-jobs/bookmarks')
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      setSavedJobs(json?.data || [])
      setBookmarkCount(json?.data?.length ?? 0)
    } catch (err) {
      console.error('Failed to fetch saved jobs:', err)
      setSavedJobs([])
      setBookmarkCount(0)
    } finally {
      setSavedLoading(false)
    }
  }, [])

  // Initial bookmark count
  useEffect(() => {
    // TODO: Create /api/hybrid-jobs/bookmarks endpoint when bookmarking feature is added
    setBookmarkCount(0)
  }, [])

  // Load saved jobs when tab changes
  useEffect(() => {
    if (activeTab === 'saved') {
      fetchSavedJobs()
    }
  }, [activeTab, fetchSavedJobs])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.3),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 py-14 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
                <Building2 className="w-12 h-12" />
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 mb-3">
              <h1 className="text-4xl md:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-indigo-100 drop-shadow">
                OnSite & Hibridni Poslovi
              </h1>
              <span className="hidden md:inline-flex text-sm font-medium px-3 py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white items-center gap-2">
                🌍 Balkan
              </span>
            </div>
            <p className="text-center text-blue-50/90 text-lg max-w-3xl mx-auto mb-8">
              Kurirani agregator OnSite i hibridnih pozicija sa vodećih balkanskih platformi. Ažuriranje svakog dana.
            </p>

          {/* Tab Navigation */}
          <div className="mt-10 flex flex-wrap justify-center gap-3 text-xs" role="tablist" aria-label="Firme sekcije">
            {(['explore', 'saved', 'stats', 'sources'] as const).map(t => {
              const label = t === 'explore' ? 'Pretraga' : (t === 'saved' ? 'Sačuvano' : (t === 'stats' ? 'Statistika' : 'Izvori'))
              const selected = activeTab === t
              return (
                <button
                  key={t}
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`panel-${t}`}
                  id={`tab-${t}`}
                  onClick={() => {
                    setActiveTab(t)
                    trackEvent('tab_switched', { tab: t })
                    if (t === 'saved') {
                      fetchSavedJobs()
                    }
                  }}
                  className={cn(
                    'px-5 py-2 rounded-full border backdrop-blur-sm transition font-medium flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50',
                    selected ? 'bg-white text-blue-700 border-white shadow' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                  )}
                >
                  {t === 'explore' && <Sparkles className="w-4 h-4" />}
                  {t === 'saved' && <Bookmark className="w-4 h-4" />}
                  {t === 'stats' && <BarChart3 className="w-4 h-4" />}
                  {t === 'sources' && <LinkIcon className="w-4 h-4" />}
                  {label}
                  {t === 'explore' && activeFilterCount > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center text-[10px] bg-blue-600 text-white rounded-full h-5 px-2">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto" aria-live="polite">
            <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 flex flex-col">
              <span className="text-[11px] uppercase tracking-wide text-blue-100/80">Ukupno</span>
              <span className="text-2xl font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5" /> {total}
              </span>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 flex flex-col">
              <span className="text-[11px] uppercase tracking-wide text-blue-100/80">Novo 24h</span>
              <span className="text-2xl font-semibold flex items-center gap-2">
                <Flame className="w-5 h-5" /> {summary?.newToday ?? 0}
              </span>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 flex flex-col">
              <span className="text-[11px] uppercase tracking-wide text-blue-100/80">Sačuvano</span>
              <span className="text-2xl font-semibold flex items-center gap-2">
                <Bookmark className="w-5 h-5" /> {bookmarkCount ?? 0}
              </span>
            </div>
          </div>
          </motion.div>
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

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* EXPLORE TAB - Jobs Grid */}
        {activeTab === 'explore' && (
          <>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row gap-3 md:items-center p-3 md:p-4 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur shadow-sm">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true)
                    }}
                    placeholder="Pretraži po poziciji, kompaniji..."
                    className="w-full h-11 md:h-12 rounded-xl border border-gray-300 bg-white pl-12 pr-4 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400"
                  />
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && (suggestions.length > 0 || suggestionsLoading) && (
                    <div
                      ref={suggestionsRef}
                      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto"
                    >
                      {suggestionsLoading ? (
                        <div className="p-3 text-center text-gray-500">
                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                          <span className="text-sm">Učitavam predloge...</span>
                        </div>
                      ) : (
                        suggestions.map((suggestion, index) => (
                          <button
                            key={suggestion}
                            onClick={() => {
                              setSearchInput(suggestion)
                              setShowSuggestions(false)
                              updateFilters({ search: suggestion, offset: 0 })
                              trackEvent('search_performed', { query: suggestion })
                            }}
                            className={cn(
                              "w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors",
                              index === selectedSuggestionIndex && "bg-blue-50 text-blue-700"
                            )}
                          >
                            {suggestion}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Search className="w-4 h-4" />
                  Traži
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 whitespace-nowrap relative"
                >
                  <Filter className="w-4 h-4" />
                  Filteri
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {loading && (
              <div>
                <div className="flex items-center justify-center py-8 mb-6">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Učitavanje poslova...</span>
                </div>
                <JobCardSkeletonGrid count={6} />
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
          </>
        )}

        {/* SAVED TAB */}
        {activeTab === 'saved' && (
          <div>
            {savedLoading && (
              <div>
                <div className="flex items-center justify-center py-8 mb-6">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Učitavanje sačuvanih...</span>
                </div>
                <JobCardSkeletonGrid count={4} />
              </div>
            )}

            {!savedLoading && savedJobs.length === 0 && (
              <div className="bg-gray-50 rounded-xl p-12 text-center">
                <Bookmark className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nema sačuvanih poslova
                </h3>
                <p className="text-gray-600 mb-6">
                  Klikni na ⭐ na kartici posla da sačuvaš za kasnije
                </p>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Pregledaj poslove
                </button>
              </div>
            )}

            {!savedLoading && savedJobs.length > 0 && (
              <>
                <div className="mb-6 text-sm text-gray-600">
                  <strong className="text-gray-900">{savedJobs.length}</strong> sačuvanih poslova
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedJobs.map((job) => (
                    <HybridJobCard key={job.id} job={job} searchTerm="" />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* STATS TAB */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Statistika tržišta
              </h2>

              {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                    <div className="text-sm text-blue-600 font-medium mb-2">Ukupno aktivnih pozicija</div>
                    <div className="text-4xl font-bold text-blue-700">{summary.totalHybrid}</div>
                    <div className="text-xs text-blue-600 mt-2">OnSite i hibridni poslovi</div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
                    <div className="text-sm text-orange-600 font-medium mb-2 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Novo danas
                    </div>
                    <div className="text-4xl font-bold text-orange-700">{summary.newToday}</div>
                    <div className="text-xs text-orange-600 mt-2">Sveži oglasi</div>
                  </div>
                </div>
              )}

              {summary?.sources && summary.sources.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Po izvorima</h3>
                  <div className="space-y-2">
                    {summary.sources.map((source) => (
                      <div key={source.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">{source.name}</span>
                        <span className="text-lg font-bold text-blue-600">{source.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Pratite tržište
              </h3>
              <p className="text-blue-100 mb-4">
                Baza se ažurira dnevno sa najnovijim oglasima iz vodećih platformi na Balkanu.
              </p>
              <div className="flex gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Automatsko ažuriranje</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Validacija podataka</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SOURCES TAB */}
        {activeTab === 'sources' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <LinkIcon className="w-6 h-6 text-blue-600" />
                Izvori podataka
              </h2>
              <p className="text-gray-600 mb-6">
                Prikupljamo oglase sa najpoznatijih platformi za poslove na Balkanu
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'HelloWorld.rs', url: 'https://www.helloworld.rs/oglasi-za-posao', country: '🇷🇸', desc: 'Vodeća IT platforma u Srbiji', jobs: 300 },
                  { name: 'Poslovi.infostud.com', url: 'https://poslovi.infostud.com', country: '🇷🇸', desc: 'Infostud oglasnik', jobs: 30 },
                  { name: 'Posao.hr', url: 'https://www.posao.hr', country: '🇭🇷', desc: 'Hrvatski oglasnik poslova', jobs: 25 },
                  { name: 'MojPosao.net', url: 'https://mojposao.net', country: '��', desc: 'Najveći portal u Hrvatskoj', jobs: 0, disabled: true },
                  { name: 'Posao.ba', url: 'https://posao.ba', country: '��', desc: 'Vodeći portal u BiH', jobs: 0, disabled: true },
                  { name: 'Kariera.mk', url: 'https://kariera.mk', country: '🇲🇰', desc: 'Makedonska platforma', jobs: 0, disabled: true },
                ].map((source) => (
                <a
                  key={source.name}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (source.disabled) {
                      e.preventDefault();
                    } else {
                      trackEvent('source_click', { source: source.name, url: source.url });
                    }
                  }}
                  className={cn(
                    "flex items-center justify-between p-4 border-2 rounded-lg transition-all group",
                    source.disabled
                      ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                      : "border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                  )}
                >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{source.country}</span>
                      <div>
                        <div className={cn(
                          "font-semibold",
                          source.disabled 
                            ? "text-gray-500" 
                            : "text-gray-900 group-hover:text-blue-600"
                        )}>
                          {source.name}
                          {source.disabled && <span className="ml-2 text-xs text-gray-400">(uskoro)</span>}
                        </div>
                        <div className="text-sm text-gray-500">{source.desc}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {source.jobs > 0 && (
                        <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                          {source.jobs}
                        </div>
                      )}
                      <ExternalLink className={cn(
                        "w-5 h-5",
                        source.disabled
                          ? "text-gray-300"
                          : "text-gray-400 group-hover:text-blue-600"
                      )} />
                    </div>
                  </a>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <strong>Napomena:</strong> Podaci se ažuriraju automatski. Neki izvori mogu imati odloženo ažuriranje.
                    Uvek proverite originalni oglas za najnovije informacije.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Debug Mode Panel */}
        {debugMode && (
          <div className="mt-8 p-4 bg-gray-100 rounded-xl border border-gray-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Debug Mode
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Current State:</h4>
                <pre className="bg-white p-3 rounded border text-xs overflow-auto">
                {JSON.stringify({
                  activeTab,
                  searchInput,
                  filters,
                  suggestions: suggestions.slice(0, 3),
                  showSuggestions,
                  selectedSuggestionIndex,
                  total,
                  loading,
                  error: error || null
                }, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Summary:</h4>
                <pre className="bg-white p-3 rounded border text-xs overflow-auto">
                  {JSON.stringify(summary, null, 2)}
                </pre>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setDebugMode(false)}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
              >
                Hide Debug
              </button>
              <button
                onClick={() => {
                  console.log('Firme Debug State:', {
                    activeTab,
                    searchInput,
                    filters,
                    suggestions,
                    summary,
                    jobs: jobs.slice(0, 3)
                  })
                }}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Log to Console
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
