"use client"

import {
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
  type ButtonHTMLAttributes,
} from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useHybridJobs } from '@/hooks/useHybridJobs'
import { PortalJobContractType, type PortalJobRecord, type ScraperSource } from '@/types/jobs'
import { HybridJobCard } from '@/components/hybrid-job-card'
import {
  RefreshCcw,
  Filter,
  Search,
  Layers,
  Briefcase,
  Flame,
  Globe2,
  Star,
  Sparkles,
  BarChart2,
  Tag as TagIcon,
  X,
  RotateCcw,
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ExternalLink,
  Link as LinkIcon,
} from 'lucide-react'
import { getSupabaseClientBrowser } from '@/lib/job-bookmarks'
import { cn } from '@/lib/utils'
import { trackSourceClick } from '@/lib/telemetry/analytics'

type TimeoutHandle = ReturnType<typeof setTimeout>

const CONTRACT_ORDER: PortalJobContractType[] = ['full-time', 'part-time', 'contract', 'freelance', 'internship']
const CONTRACT_SET = new Set(CONTRACT_ORDER)

export default function FirmeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const debug = process.env.NODE_ENV !== 'production' && (searchParams?.get('debug') === '1')

  const {
    jobs,
    loading,
    error,
    total,
    facets,
    filters,
    updateFilters,
    resetFilters,
    hasMore,
    summary,
  } = useHybridJobs({
    limit: 6,
    // Inicijalni offset prema ?page i ?limit
    offset: (() => {
      const p = parseInt(searchParams?.get('page') || '1', 10)
      const l = parseInt(searchParams?.get('limit') || '6', 10)
      return p > 1 ? (p - 1) * l : 0
    })(),
    search: searchParams?.get('search') || undefined,
    category: searchParams?.get('category') || undefined,
    contractType: (() => {
      const values = searchParams?.getAll('contractType') || []
      const filtered = values.filter((v): v is PortalJobContractType => (CONTRACT_SET as Set<string>).has(v))
      return filtered.length ? filtered : undefined
    })(),
    experience: (() => {
      const values = searchParams?.getAll('experience') || []
      return values.length ? values : undefined
    })(),
    // FIRME/HYBRID: Prikaz samo hybrid/onsite pozicija (ne remote)
    workType: ['hybrid', 'onsite', 'flexible'],
    order: (searchParams?.get('order') === 'created_at' ? 'created_at' : 'posted_date'),
  })

  // Sačuvani (bookmarked) poslovi – učitavaju se kada je tab "saved"
  const [savedJobs, setSavedJobs] = useState<PortalJobRecord[]>([])
  const [savedLoading, setSavedLoading] = useState(false)

  // Izvori (sources) – učitavaju se kada je tab "sources"
  const [sources, setSources] = useState<ScraperSource[]>([])
  const [sourcesLoading, setSourcesLoading] = useState(false)

  const fetchSavedJobs = useCallback(async () => {
    setSavedLoading(true)
    try {
      const res = await fetch('/api/portal-jobs/bookmarks')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setSavedJobs(json?.data?.jobs ?? [])
      if (typeof json?.data?.total === 'number') setBookmarkCount(Math.max(0, json.data.total))
    } catch {
      setSavedJobs([])
    } finally {
      setSavedLoading(false)
    }
  }, [])

  const fetchSources = useCallback(async () => {
    setSourcesLoading(true)
    try {
      const res = await fetch('/api/scraper/sources')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setSources(Array.isArray(json?.data) ? json.data : [])
    } catch {
      setSources([])
    } finally {
      setSourcesLoading(false)
    }
  }, [])

  // Facets memoi
  const contractFacets = useMemo(() => facets?.contractType || {}, [facets])
  const experienceFacets = useMemo(() => facets?.experienceLevel || {}, [facets])
  const categoryFacets = useMemo(() => facets?.category || {}, [facets])
  const orderedContractKeys: PortalJobContractType[] = useMemo(() => {
    const allKeys = Object.keys(contractFacets) as PortalJobContractType[]
    const primary = CONTRACT_ORDER.filter((k) => Number((contractFacets as Record<string, number>)[k] || 0) > 0)
    const rest = allKeys.filter(k => !CONTRACT_SET.has(k))
    return [...primary, ...rest]
  }, [contractFacets])

  // Pretraga i sugestije
  const searchDebounceRef = useRef<TimeoutHandle | null>(null)
  const suggestDebounceRef = useRef<TimeoutHandle | null>(null)
  const activeFetchRef = useRef<AbortController | null>(null)

  const [searchInput, setSearchInput] = useState(filters.search || '')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)

  // Sync eksternih izmena filtera -> input (npr. reset)
  useEffect(() => {
    setSearchInput(filters.search || '')
  }, [filters.search])

  const fetchSuggestions = useCallback((term: string) => {
    // Abort prethodni upit
    activeFetchRef.current?.abort()

    const clean = term.trim()
    if (clean.length < 2) {
      setSuggestions([])
      setHighlightedIndex(-1)
      return
    }

    const ctrl = new AbortController()
    activeFetchRef.current = ctrl
    fetch(`/api/portal-jobs/suggest?q=${encodeURIComponent(clean)}`, { signal: ctrl.signal })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('bad response'))))
      .then(json => {
        if (!ctrl.signal.aborted) {
          setSuggestions(Array.isArray(json?.suggestions) ? json.suggestions : [])
          setShowSuggestions(true)
          setHighlightedIndex(-1)
        }
      })
      .catch(() => { /* ignore */ })
  }, [])

  const applySuggestion = useCallback((value: string) => {
    setSearchInput(value)
    setShowSuggestions(false)
    setSuggestions([])
    updateFilters({ search: value || null, offset: 0 })
  }, [updateFilters])

  // Paginacija (bez infinite scroll)
  const limit = filters.limit || 6
  const currentPage = Math.floor((filters.offset || 0) / limit) + 1
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const paginationPages = useMemo(() => {
    const pages: (number | '…')[] = []
    if (totalPages <= 9) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }
    pages.push(1)
    const windowStart = Math.max(2, currentPage - 1)
    const windowEnd = Math.min(totalPages - 1, currentPage + 1)
    if (windowStart > 2) pages.push('…')
    for (let p = windowStart; p <= windowEnd; p++) pages.push(p)
    if (windowEnd < totalPages - 1) pages.push('…')
    pages.push(totalPages)
    return pages
  }, [currentPage, totalPages])

  const activeFilterCount = useMemo(() => {
    let c = 0
    if (filters.search) c++
    if (filters.contractType && filters.contractType.length) c++
    if (filters.experience && filters.experience.length) c++
    if (filters.category) c++
    if (filters.workType && filters.workType.length) c++
    return c
  }, [filters])

  // Sync filters -> URL (debounced), bez internih polja
  const urlSyncRef = useRef<TimeoutHandle | null>(null)
  useEffect(() => {
    if (urlSyncRef.current) clearTimeout(urlSyncRef.current)
    urlSyncRef.current = setTimeout(() => {
      const params = new URLSearchParams()
      if (filters.search) params.set('search', filters.search)
      if (filters.category) params.set('category', filters.category)
      if (filters.contractType && filters.contractType.length) (filters.contractType as string[]).forEach(ct => params.append('contractType', ct))
      if (filters.experience && filters.experience.length) (filters.experience as string[]).forEach(exp => params.append('experience', exp))
      if (filters.order && filters.order !== 'posted_date') params.set('order', filters.order)
      if ((filters.offset || 0) > 0) params.set('page', String(currentPage))
      if (limit !== 6) params.set('limit', String(limit))
      const qs = params.toString()
      const target = qs ? `/firme?${qs}` : '/firme'
      if (typeof window !== 'undefined' && window.location.pathname === '/firme' && window.location.search !== (qs ? `?${qs}` : '')) {
        router.replace(target, { scroll: false })
      }
    }, 350)
    return () => { if (urlSyncRef.current) clearTimeout(urlSyncRef.current) }
  }, [filters.search, filters.category, filters.contractType, filters.experience, filters.workType, filters.order, filters.offset, router, currentPage, limit])

  // Tabovi
  const [tab, setTab] = useState<'explore' | 'saved' | 'stats' | 'sources'>('explore')
  const [bookmarkCount, setBookmarkCount] = useState<number | null>(null)
  const supabase = getSupabaseClientBrowser()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Učitaj session jednom
  useEffect(() => {
    let mounted = true
    async function loadSession() {
      if (!supabase) return
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setIsLoggedIn(!!data?.session)
    }
    loadSession().catch(() => {})
    return () => { mounted = false }
  }, [supabase])

  const fetchBookmarkCount = useCallback(async () => {
    try {
      const res = await fetch('/api/portal-jobs/bookmarks')
      if (!res.ok) return
      const json = await res.json()
      if (typeof json?.data?.total === 'number') setBookmarkCount(Math.max(0, json.data.total))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { fetchBookmarkCount().catch(() => {}) }, [fetchBookmarkCount])

  // Event: sinhronizuj KPI i saved listu
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ id?: string; added?: boolean }>).detail
      setBookmarkCount(prev => {
        if (prev == null) return prev
        const added = !!detail?.added
        const next = prev + (added ? 1 : -1)
        return next < 0 ? 0 : next
      })
      if (tab === 'saved') {
        fetchSavedJobs().catch(() => {})
      }
    }
    window.addEventListener('job-bookmark-changed', handler as EventListener)
    return () => window.removeEventListener('job-bookmark-changed', handler as EventListener)
  }, [tab, fetchSavedJobs])

  // Učitaj saved listu pri ulasku u tab
  useEffect(() => {
    if (tab === 'saved') {
      fetchSavedJobs().catch(() => {})
    } else if (tab === 'sources' && sources.length === 0) {
      fetchSources().catch(() => {})
    }
  }, [tab, fetchSavedJobs, fetchSources, sources.length])

  // Globalni cleanup: timere + abort kontroler + zatvaranje sugestija
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
      if (suggestDebounceRef.current) clearTimeout(suggestDebounceRef.current)
      if (urlSyncRef.current) clearTimeout(urlSyncRef.current)
      activeFetchRef.current?.abort()
      setShowSuggestions(false)
    }
  }, [])

  // Memo: maksimum za top kategorije (za progress bar)
  const topCategoryMax = useMemo(() => {
    const values = Object.values(categoryFacets) as number[]
    return values.length ? Math.max(1, ...values) : 1
  }, [categoryFacets])

  const hybridPctRounded = summary?.totalHybrid != null ? Math.round((summary.totalHybrid / total) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {debug && (
        <div className="fixed z-50 bottom-4 right-4 w-[420px] max-h-[60vh] overflow-auto rounded-xl border border-gray-300 bg-white shadow-xl text-[11px] font-mono p-3 space-y-2">
          <div className="flex items-center justify-between">
            <strong>DEBUG portal-jobs</strong>
            <span className="text-gray-500">jobs:{jobs.length} / total:{total} loading:{String(loading)}</span>
          </div>
          <pre className="whitespace-pre-wrap leading-snug">{JSON.stringify({
            filters,
            hasMore,
            error,
            firstIds: jobs.slice(0, 5).map(j => j.id)
          }, null, 2)}</pre>
          <p className="text-[10px] text-gray-400">Ukloni ?debug=1 iz URL-a da sakriješ panel.</p>
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.3),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
                <Briefcase className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-purple-100 drop-shadow">
              Poslovi & Remote Oglasi
            </h1>
            <p className="text-center text-blue-50/90 text-lg max-w-3xl mx-auto">
              Kurirani agregator EU timezone / remote friendly pozicija. Ažuriranje svakog jutra.
            </p>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto" aria-live="polite">
              <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 flex flex-col">
                <span className="text-[11px] uppercase tracking-wide text-blue-100/80">Ukupno</span>
                <span className="text-2xl font-semibold flex items-center gap-2"><Layers className="w-5 h-5" /> {total}</span>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 flex flex-col">
                <span className="text-[11px] uppercase tracking-wide text-blue-100/80">Novo 24h</span>
                <span className="text-2xl font-semibold flex items-center gap-2"><Flame className="w-5 h-5" /> {summary?.newToday ?? 0}</span>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 flex flex-col">
                <span className="text-[11px] uppercase tracking-wide text-blue-100/80">Remote %</span>
                <span className="text-2xl font-semibold flex items-center gap-2"><Globe2 className="w-5 h-5" /> {hybridPctRounded}%</span>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 flex flex-col">
                <span className="text-[11px] uppercase tracking-wide text-blue-100/80">Sačuvano</span>
                <span className="text-2xl font-semibold flex items-center gap-2"><Star className="w-5 h-5" /> {bookmarkCount != null ? bookmarkCount : '—'}</span>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-3 text-xs" role="tablist" aria-label="Oglasi sekcije">
              {(['explore', 'saved', 'stats', 'sources'] as const).map(t => {
                const label = t === 'explore' ? 'Pretraga' : (t === 'saved' ? 'Sačuvano' : (t === 'stats' ? 'Statistika' : 'Izvori'))
                const selected = tab === t
                return (
                  <button
                    key={t}
                    role="tab"
                    aria-selected={selected}
                    aria-controls={`panel-${t}`}
                    id={`tab-${t}`}
                    onClick={() => setTab(t)}
                    className={cn(
                      'px-5 py-2 rounded-full border backdrop-blur-sm transition font-medium flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50',
                      selected ? 'bg-white text-blue-700 border-white shadow' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                    )}
                  >
                    {t === 'explore' && <Search className="w-4 h-4" />}
                    {t === 'saved' && <Star className="w-4 h-4" />}
                    {t === 'stats' && <BarChart2 className="w-4 h-4" />}
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
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="main-content">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-9">
            {/* Search & controls */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row gap-3 md:items-center p-3 md:p-4 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur shadow-sm">
                {/* Search */}
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="jobs-search"
                      name="jobs-search"
                      type="text"
                      value={searchInput}
                      placeholder="Pretraga po nazivu ili kompaniji..."
                      onChange={(e) => {
                        const raw = e.target.value
                        setSearchInput(raw)
                        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
                        searchDebounceRef.current = setTimeout(() => {
                          updateFilters({ search: raw.trim() || null, offset: 0 })
                        }, 400)
                        if (suggestDebounceRef.current) clearTimeout(suggestDebounceRef.current)
                        suggestDebounceRef.current = setTimeout(() => {
                          fetchSuggestions(raw)
                        }, 250)
                      }}
                      onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
                      onKeyDown={(e) => {
                        if (!showSuggestions) return
                        if (e.key === 'ArrowDown') {
                          e.preventDefault()
                          setHighlightedIndex(i => (i + 1 >= suggestions.length ? 0 : i + 1))
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault()
                          setHighlightedIndex(i => (i - 1 < 0 ? suggestions.length - 1 : i - 1))
                        } else if (e.key === 'Enter') {
                          if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
                            e.preventDefault()
                            applySuggestion(suggestions[highlightedIndex])
                          }
                        } else if (e.key === 'Escape') {
                          setShowSuggestions(false)
                        }
                      }}
                      onBlur={() => { setTimeout(() => setShowSuggestions(false), 120) }}
                      className="w-full h-11 md:h-12 rounded-xl border border-gray-300 bg-white pl-12 pr-4 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400"
                      aria-autocomplete="list"
                      aria-controls={showSuggestions ? 'search-suggest-list' : undefined}
                      aria-activedescendant={highlightedIndex >= 0 ? `suggest-${highlightedIndex}` : undefined}
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <ul
                        role="listbox"
                        id="search-suggest-list"
                        className="absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg text-sm"
                      >
                        {suggestions.map((s, i) => {
                          const term = searchInput.trim().toLowerCase()
                          const idx = term ? s.toLowerCase().indexOf(term) : -1
                          let content: ReactNode = s
                          if (idx >= 0 && term.length > 0) {
                            const before = s.slice(0, idx)
                            const match = s.slice(idx, idx + term.length)
                            const after = s.slice(idx + term.length)
                            content = <>{before}<mark className="bg-yellow-200 rounded px-0.5">{match}</mark>{after}</>
                          }
                          return (
                            <li
                              id={`suggest-${i}`}
                              key={s + i}
                              role="option"
                              aria-selected={highlightedIndex === i}
                              onMouseDown={(e) => { e.preventDefault(); applySuggestion(s) }}
                              onMouseEnter={() => setHighlightedIndex(i)}
                              className={cn('cursor-pointer px-3 py-2 flex items-center gap-2', highlightedIndex === i ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50')}
                            >
                              <Search className="w-3 h-3 text-gray-400" />
                              <span className="truncate" title={s}>{content}</span>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                </div>
              </div>
              
              {/* Important Notice Box */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 md:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <Info className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-amber-900 mb-2">Važno obaveštenje o linkovima oglasa</h3>
                    <div className="text-amber-800 space-y-2">
                      <p>Zbog tehničkih ograničenja job board sajtova, linkovi vode na glavne stranice umesto direktno na oglase.</p>
                      <div className="bg-white/60 rounded-lg p-3 border border-amber-200">
                        <p className="font-medium text-amber-900 mb-1">💡 Kako da pronađeš oglas:</p>
                        <p>Kopiraj <strong>naziv pozicije + kompaniju</strong> i pretraži na Google-u ili job board sajtu</p>
                        <div className="mt-2 font-mono text-sm bg-amber-100 px-2 py-1 rounded text-amber-800">
                          Primer: &quot;React Developer Microsoft&quot;
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3 md:items-center p-3 md:p-4 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur shadow-sm">
                {/* Controls */}
                <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
                  <SelectWrapper label="Broj" name="jobs-page-size" value={String(limit)} onChange={(v) => updateFilters({ limit: parseInt(v, 10) || 6, offset: 0 })}>
                    {[6, 12, 24, 36].map(n => <option key={n} value={n}>{n}/str</option>)}
                  </SelectWrapper>
                  <SelectWrapper label="Sort" name="jobs-sort" value={filters.order || 'posted_date'} onChange={(v) => updateFilters({ order: (v as 'posted_date' | 'created_at'), offset: 0 })}>
                    <option value="posted_date">Najnovije</option>
                    <option value="created_at">Dodato</option>
                  </SelectWrapper>
                  <ToolbarButton onClick={() => updateFilters({ offset: 0 })} icon={<RefreshCcw className="w-4 h-4" />}>Osveži</ToolbarButton>
                  <ToolbarButton onClick={() => resetFilters()} variant="ghost" icon={<RotateCcw className="w-4 h-4" />}>Reset</ToolbarButton>
                </div>
              </div>
            </div>

            {facets && tab === 'explore' && (
              <div className="space-y-6 mb-10">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <Filter className="w-4 h-4" /> Filteri
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => resetFilters()}
                    className="text-gray-500 hover:text-blue-600 transition underline decoration-dotted"
                  >Poništi sve</button>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  {/* Tip ugovora */}
                  <div>
                    <h4 className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2"><Briefcase className="w-3.5 h-3.5" /> Ugovor</h4>
                    <div className="flex flex-wrap gap-2">
                      {orderedContractKeys.map(key => {
                        const active = ((filters.contractType || []) as PortalJobContractType[]).includes(key)
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              const current = (filters.contractType || []) as PortalJobContractType[]
                              const exists = current.includes(key)
                              const next = exists ? current.filter(c => c !== key) : [...current, key]
                              updateFilters({ contractType: next.length ? next : undefined, offset: 0 })
                            }}
                            className={filterPillClass('contract', active)}
                          >
                            <span className="md:text-[12px]">{key}</span>
                            <span className="ml-1 text-[9px] md:text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-black/10 text-current">{(contractFacets as Record<string, number>)[key]}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Iskustvo */}
                  <div>
                    <h4 className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2"><Layers className="w-3.5 h-3.5" /> Iskustvo</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(experienceFacets).map(([lvl, count]) => {
                        const active = (filters.experience || []).includes(lvl)
                        return (
                          <button
                            key={lvl}
                            onClick={() => {
                              const current = filters.experience || []
                              const exists = current.includes(lvl)
                              const next = exists ? current.filter(c => c !== lvl) : [...current, lvl]
                              updateFilters({ experience: next.length ? next : undefined, offset: 0 })
                            }}
                            className={filterPillClass('experience', active)}
                          >
                            <span className="md:text-[12px]">{lvl}</span>
                            <span className="ml-1 text-[9px] md:text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-black/10 text-current">{count as number}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Kategorija */}
                  <div>
                    <h4 className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2"><TagIcon className="w-3.5 h-3.5" /> Kategorija</h4>
                    <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto pr-1 custom-scrollbar pe-1">
                      {Object.entries(categoryFacets).map(([cat, count]) => {
                        const active = filters.category === cat
                        return (
                          <button
                            key={cat}
                            onClick={() => updateFilters({ category: active ? null : cat, offset: 0 })}
                            className={filterPillClass('category', active)}
                          >
                            <span className="truncate max-w-[120px] md:max-w-[140px] md:text-[12px]" title={cat}>{cat}</span>
                            <span className="ml-1 text-[9px] md:text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-black/10 text-current">{count as number}</span>
                          </button>
                        )
                      })}
                    </div>
                    <div className="mt-3">
                      <div className="text-xs font-medium text-gray-700 mb-2">Tip rada:</div>
                      <div className="flex flex-wrap gap-2">
                        {['hybrid', 'onsite', 'flexible'].map(type => (
                          <button
                            key={type}
                            onClick={() => {
                              const current = filters.workType || []
                              const exists = current.includes(type)
                              const next = exists ? current.filter(t => t !== type) : [...current, type]
                              updateFilters({ workType: next.length > 0 ? next : undefined, offset: 0 })
                            }}
                            className={filterPillClass('workType', filters.workType?.includes(type))}
                          >
                            {type === 'hybrid' ? 'Hibridno' : type === 'onsite' ? 'U kancelariji' : 'Fleksibilno'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Aktivni filteri (chips) */}
                <ActiveFilterChips
                  filters={filters}
                  onRemove={(type, value) => {
                    if (type === 'contractType') {
                      const curr = (filters.contractType || []) as PortalJobContractType[]
                      const next = curr.filter(c => c !== (value as PortalJobContractType))
                      updateFilters({ contractType: next.length ? next : undefined, offset: 0 })
                    } else if (type === 'experience') {
                      const curr = (filters.experience || [])
                      const next = curr.filter((c: string) => c !== value)
                      updateFilters({ experience: next.length ? next : undefined, offset: 0 })
                    } else if (type === 'category') {
                      updateFilters({ category: null, offset: 0 })
                    } else if (type === 'remote') {
                      updateFilters({ remote: undefined, offset: 0 })
                    } else if (type === 'search') {
                      updateFilters({ search: null, offset: 0 })
                      setSearchInput('')
                    }
                  }}
                />
              </div>
            )}

            {error && (
              <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert" aria-live="assertive">
                Greška pri učitavanju oglasa: {error}
                <div className="mt-3">
                  <button
                    onClick={() => updateFilters({ offset: 0 })}
                    className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-white px-4 py-2 text-xs font-medium text-red-700 hover:border-red-400"
                  >Pokušaj ponovo</button>
                </div>
              </div>
            )}

            {tab === 'explore' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-live="polite">
                {jobs.map(job => (
                  <HybridJobCard key={job.id} job={job} searchTerm={filters.search || undefined} />
                ))}
                {loading && jobs.length === 0 && Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="animate-pulse h-64 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="h-9 bg-gray-200/60 rounded-t-xl" />
                    <div className="p-5 space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-5/6" />
                      <div className="h-3 bg-gray-200 rounded w-2/5" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'saved' && (
              <div id="panel-saved" role="tabpanel" aria-labelledby="tab-saved" className="min-h-[200px]">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2 text-lg"><Star className="w-5 h-5 text-yellow-500" /> Sačuvani oglasi</h2>
                  <div className="text-xs text-gray-500">{bookmarkCount != null ? `${bookmarkCount} ukupno` : '—'}</div>
                </div>
                {!isLoggedIn && (
                  <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                    Prijavi se da bi sačuvao oglase. Klik na zvezdicu (★) pored oglasa nakon prijave.
                  </div>
                )}
                {savedLoading && savedJobs.length === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="animate-pulse h-56 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100" />
                    ))}
                  </div>
                )}
                {!savedLoading && savedJobs.length === 0 && isLoggedIn && (
                  <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-600">
                    Još nema sačuvanih oglasa.
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedJobs.map(job => (
                    <HybridJobCard key={job.id} job={job} searchTerm={undefined} />
                  ))}
                </div>
              </div>
            )}

            {tab === 'stats' && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-blue-600" /> Statistika (osnovna)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Ukupno poslova</p>
                    <p className="text-2xl font-semibold mt-1">{total}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Novi u 24h</p>
                    <p className="text-2xl font-semibold mt-1">{summary?.newToday ?? 0}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Remote (%)</p>
                    <p className="text-2xl font-semibold mt-1">{hybridPctRounded}%</p>
                  </div>
                </div>
                {Array.isArray((summary as {sources?: unknown[]})?.sources) && (summary as {sources: unknown[]}).sources.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-semibold mb-3">Top izvori</h3>
                    <div className="overflow-hidden rounded-xl border border-gray-200">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 text-gray-600">
                          <tr>
                            <th className="text-left font-medium px-3 py-2">Izvor</th>
                            <th className="text-right font-medium px-3 py-2">Broj</th>
                            <th className="text-right font-medium px-3 py-2">Udeo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {((summary as { sources?: { id: string; name: string; count: number; pct: number }[] }).sources || []).map((s) => (
                            <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-gray-800">{s.name}</td>
                              <td className="px-3 py-2 text-right text-gray-600">{s.count}</td>
                              <td className="px-3 py-2 text-right text-gray-600">{s.pct}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                <p className="text-[11px] text-gray-500 mt-4">Plan sledeće: CTR po izvoru, vreme do prvog klika, distribucija po iskustvu.</p>
              </div>
            )}

            {tab === 'sources' && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-blue-600" /> 
                  Job board izvori ({sources.length})
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Oglasi se automatski prikupljaju sa sledećih job board sajtova svake noći. Klikni na bilo koji sajt da ga otvoriš u novom tabu.
                </p>
                
                {sourcesLoading && (
                  <div className="text-center py-8" aria-live="polite">
                    <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-600 mt-2">Učitavam izvore...</p>
                  </div>
                )}

                {!sourcesLoading && sources.length === 0 && (
                  <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-600">
                    Nema dostupnih izvora.
                  </div>
                )}

                {!sourcesLoading && sources.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sources.map((source) => (
                      <div key={source.id} className="rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all group">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{source.name}</h3>
                            <p className="text-xs text-gray-500 mt-1">{source.website}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {source.isActive ? (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                Aktivan
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                Neaktivan
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                          <span>Prioritet: {source.priority}/10</span>
                          <span>Uspešnost: {typeof source.successRate === 'number' ? source.successRate.toFixed(1) : 0}%</span>
                        </div>

                        {Array.isArray(source.tags) && source.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {source.tags.slice(0, 3).map((tag: string) => (
                              <span key={tag} className="inline-flex items-center px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <a
                          href={source.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                          onClick={() => { trackSourceClick(source.name, source.website) }}
                        >
                          Otvori sajt
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Kako funkcioniše?</h3>
                  <p className="text-xs text-blue-800">
                    Naš scraper automatski posećuje ove sajtove svake noći i prikuplja najnovije remote IT oglase. 
                    Oglasi se filtriraju, standardizuju i dodaju u našu bazu ako nisu duplikati.
                  </p>
                </div>
              </div>
            )}

            {!loading && jobs.length === 0 && !error && tab === 'explore' && (
              <div className="mt-10 text-center text-sm text-gray-600 border border-dashed border-gray-300 rounded-xl p-10">
                <p className="font-medium mb-2">Nema pronađenih oglasa za zadate filtere.</p>
                <button
                  onClick={() => resetFilters()}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-5 py-2 text-xs font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700"
                >
                  Resetuj filtere
                </button>
              </div>
            )}

            {tab === 'explore' && totalPages > 1 && (
              <nav className="mt-12 flex items-center justify-center gap-3 flex-wrap text-sm" aria-label="Stranice">
                <button
                  disabled={currentPage === 1 || loading}
                  onClick={() => updateFilters({ offset: 0 })}
                  className={cn('h-9 px-3 rounded-full border text-xs font-medium transition flex items-center gap-1', currentPage === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 bg-white/90 backdrop-blur hover:border-blue-400 hover:text-blue-700 shadow-sm')}
                >⏮ Prva</button>
                <button
                  disabled={currentPage === 1 || loading}
                  onClick={() => updateFilters({ offset: (currentPage - 2) * limit })}
                  className={cn('h-9 px-3 rounded-full border text-xs font-medium transition flex items-center', currentPage === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 bg-white/90 backdrop-blur hover:border-blue-400 hover:text-blue-700 shadow-sm')}
                ><ChevronLeft className="w-4 h-4" /></button>
                <div className="flex items-center gap-1">
                  {paginationPages.map((p, i) => p === '…' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-gray-400 select-none">…</span>
                  ) : (
                    <button
                      key={`page-${p}`}
                      onClick={() => updateFilters({ offset: (p - 1) * limit })}
                      aria-current={p === currentPage ? 'page' : undefined}
                      className={cn('min-w-[42px] h-9 px-3 rounded-full border text-xs font-medium transition', p === currentPage ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-600 shadow' : 'border-gray-300 bg-white/90 backdrop-blur hover:border-blue-400 hover:text-blue-700 shadow-sm')}
                    >{p}</button>
                  ))}
                </div>
                <button
                  disabled={currentPage === totalPages || loading}
                  onClick={() => updateFilters({ offset: currentPage * limit })}
                  className={cn('h-9 px-3 rounded-full border text-xs font-medium transition flex items-center', currentPage === totalPages ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 bg-white/90 backdrop-blur hover:border-blue-400 hover:text-blue-700 shadow-sm')}
                ><ChevronRight className="w-4 h-4" /></button>
                <button
                  disabled={currentPage === totalPages || loading}
                  onClick={() => updateFilters({ offset: (totalPages - 1) * limit })}
                  className={cn('h-9 px-3 rounded-full border text-xs font-medium transition flex items-center gap-1', currentPage === totalPages ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 bg-white/90 backdrop-blur hover:border-blue-400 hover:text-blue-700 shadow-sm')}
                >Poslednja ⏭</button>
              </nav>
            )}
          </div>

          <aside className="lg:col-span-3 space-y-6">
            {/* Brzi saveti */}
            <div className="relative overflow-hidden rounded-2xl border border-purple-200/70 bg-gradient-to-br from-white via-purple-50 to-blue-50 p-5 shadow-sm">
              <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 bg-purple-300/20 rounded-full blur-3xl" />
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-purple-700"><Sparkles className="w-4 h-4" /> Brzi saveti</h3>
              <ul className="space-y-3">
                {[
                  { icon: <Search className='w-3.5 h-3.5 text-blue-600' />, text: 'Probaj pretragu sa 2+ pojma (npr. “react senior”).' },
                  { icon: <Layers className='w-3.5 h-3.5 text-purple-600' />, text: 'Koristi filter iskustva da suziš gomilu junior oglasa.' },
                  { icon: <Star className='w-3.5 h-3.5 text-yellow-500' />, text: 'Bookmark (★) zahteva prijavu – čuva listu za kasnije.' },
                  { icon: <Globe2 className='w-3.5 h-3.5 text-emerald-600' />, text: 'Remote % meri odnos svih remote oglasa.' }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-gray-700 leading-relaxed">
                    <span className="mt-0.5 shrink-0 inline-flex items-center justify-center rounded-md bg-white/70 backdrop-blur px-2 py-1 border border-gray-200 shadow-inner">{item.icon}</span>
                    <span className="flex-1">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Top kategorije sa progres barovima */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><TagIcon className="w-4 h-4 text-blue-600" /> Top kategorije</h3>
              <div className="space-y-2">
                {Object.entries(categoryFacets)
                  .sort((a, b) => (b[1] as number) - (a[1] as number))
                  .slice(0, 8)
                  .map(([c, count]) => {
                    const pct = Math.round(((count as number) / topCategoryMax) * 100)
                    const active = filters.category === c
                    return (
                      <button
                        key={c}
                        onClick={() => updateFilters({ category: active ? null : c, offset: 0 })}
                        className={cn('group w-full text-left rounded-lg border px-3 py-2 transition relative overflow-hidden', active ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/40')}
                      >
                        <span className="flex items-center justify-between text-[11px] font-medium mb-1">
                          <span className={cn('truncate max-w-[140px]', active ? 'text-blue-700' : 'text-gray-700')} title={c}>{c}</span>
                          <span className={cn('tabular-nums', active ? 'text-blue-700' : 'text-gray-500')}>{count as number}</span>
                        </span>
                        <span className="block h-1.5 rounded bg-gray-100">
                          <span style={{ width: pct + '%' }} className={cn('h-full block rounded', active ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gradient-to-r from-blue-300 to-purple-300 group-hover:from-blue-400 group-hover:to-purple-400')} />
                        </span>
                      </button>
                    )
                  })}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

type ChipFilters = {
  search?: string | null
  contractType?: PortalJobContractType[]
  experience?: string[]
  category?: string | null
  remote?: boolean
}
function ActiveFilterChips({ filters, onRemove }: { filters: ChipFilters; onRemove: (type: string, value?: string) => void }) {
  const chips: { key: string; label: string; type: string; value?: string }[] = []
  if (filters.search) chips.push({ key: 'search', label: `Pretraga: ${filters.search}`, type: 'search' })
  if (filters.contractType) (filters.contractType as string[]).forEach(ct => chips.push({ key: `ct-${ct}`, label: ct, type: 'contractType', value: ct }))
  if (filters.experience) (filters.experience as string[]).forEach(ex => chips.push({ key: `ex-${ex}`, label: ex, type: 'experience', value: ex }))
  if (filters.category) chips.push({ key: 'cat', label: filters.category, type: 'category' })
  if (filters.remote) chips.push({ key: 'remote', label: 'Remote', type: 'remote' })
  if (!chips.length) return null
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map(c => {
        const color = c.type === 'contractType' ? 'blue' : c.type === 'experience' ? 'purple' : c.type === 'category' ? 'emerald' : c.type === 'remote' ? 'amber' : 'gray'
        const base = `inline-flex items-center gap-1 rounded-full pl-3 pr-2 py-1 text-[11px] font-medium border shadow-sm`
        const style = {
          blue: 'bg-blue-50 text-blue-700 border-blue-200',
          purple: 'bg-purple-50 text-purple-700 border-purple-200',
          emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          amber: 'bg-amber-50 text-amber-700 border-amber-200',
          gray: 'bg-gray-100 text-gray-700 border-gray-200'
        }[color]
        return (
          <span key={c.key} className={cn(base, style)}>
            {c.label}
            <button
              onClick={() => onRemove(c.type, c.value)}
              className="p-0.5 rounded-full hover:bg-white/40 transition text-gray-600"
              aria-label={`Ukloni filter ${c.label}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        )
      })}
    </div>
  )
}

// Utility za stilizaciju filter pill dugmadi
function filterPillClass(kind: 'contract' | 'experience' | 'category' | 'remote', active: boolean) {
  const base = 'group inline-flex items-center rounded-full px-3 py-1.5 md:px-3.5 md:py-2 text-[11px] md:text-[12px] font-medium border transition shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1'
  const palette: Record<string, { on: string; off: string }> = {
    contract: {
      on: 'bg-blue-600 text-white border-blue-600 focus:ring-blue-500/40',
      off: 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:text-blue-700 focus:ring-blue-500/30'
    },
    experience: {
      on: 'bg-purple-600 text-white border-purple-600 focus:ring-purple-500/40',
      off: 'bg-white text-gray-700 border-gray-300 hover:border-purple-300 hover:text-purple-700 focus:ring-purple-500/30'
    },
    category: {
      on: 'bg-emerald-600 text-white border-emerald-600 focus:ring-emerald-500/40',
      off: 'bg-white text-gray-700 border-gray-300 hover:border-emerald-300 hover:text-emerald-700 focus:ring-emerald-500/30'
    },
    remote: {
      on: 'bg-amber-600 text-white border-amber-600 focus:ring-amber-500/40',
      off: 'bg-white text-gray-700 border-gray-300 hover:border-amber-300 hover:text-amber-700 focus:ring-amber-500/30'
    }
  }
  const set = palette[kind]
  return cn(base, active ? set.on : set.off)
}

type SelectWrapperProps = {
  label: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
  name?: string
  id?: string
}

function SelectWrapper({ label, value, onChange, children, name, id }: SelectWrapperProps) {
  return (
    <label className="relative inline-flex items-center text-[10px] font-semibold uppercase tracking-wide text-gray-500">
      <span className="sr-only">{label}</span>
      <select
        id={id || name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-xl border border-gray-300 bg-white/80 backdrop-blur px-3 pr-7 py-2 text-xs md:text-sm md:py-2.5 font-medium text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-sm"
      >
        {children}
      </select>
      <ChevronsUpDown className="pointer-events-none w-3.5 h-3.5 absolute right-2 text-gray-400" />
    </label>
  )
}

interface ToolbarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode
  variant?: 'solid' | 'ghost'
}

function ToolbarButton({ icon, children, variant = 'solid', className, ...rest }: ToolbarButtonProps) {
  const styles = variant === 'solid'
    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent hover:from-blue-500 hover:to-purple-500 focus:ring-blue-500/40'
    : 'bg-white/60 text-gray-600 border-gray-300 hover:text-blue-700 hover:border-blue-400 focus:ring-blue-500/30'
  return (
    <button
      className={cn('inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 md:px-5 md:py-2.5 text-xs md:text-sm font-semibold transition shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1', styles, className)}
      {...rest}
    >
      {icon}{children}
    </button>
  )
}
