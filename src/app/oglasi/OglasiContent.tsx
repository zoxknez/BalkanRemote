"use client"

import { useMemo, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { usePortalJobs } from '@/hooks/usePortalJobs'
import { PortalJobContractType } from '@/types/jobs'
import { PortalJobCard } from '@/components/portal-job-card'
import { RefreshCcw, Filter, Search, Layers, Briefcase, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const CONTRACT_ORDER: PortalJobContractType[] = ['full-time','part-time','contract','freelance','internship']
const CONTRACT_SET = new Set(CONTRACT_ORDER)

export default function OglasiContent() {
  const {
    jobs,
    loading,
    error,
    total,
    facets,
    filters,
    updateFilters,
    resetFilters,
    hasMore
  } = usePortalJobs({ limit: 20, remote: true })

  const contractFacets = useMemo(() => facets?.contractType || {}, [facets])
  const experienceFacets = useMemo(() => facets?.experienceLevel || {}, [facets])
  const categoryFacets = useMemo(() => facets?.category || {}, [facets])

  const orderedContractKeys: PortalJobContractType[] = useMemo(() => {
    const allKeys = Object.keys(contractFacets) as PortalJobContractType[]
    const primary = CONTRACT_ORDER.filter(k => contractFacets[k])
    const rest = allKeys.filter(k => !CONTRACT_SET.has(k))
    return [...primary, ...rest]
  }, [contractFacets])

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Infinite scroll uz IntersectionObserver (prefetch sledeće strane).
  useEffect(() => {
    if (!sentinelRef.current) return
    const node = sentinelRef.current
    const observer = new IntersectionObserver(entries => {
      const entry = entries[0]
      if (entry.isIntersecting && hasMore && !loading) {
        updateFilters({ offset: (filters.offset || 0) + (filters.limit || 20) })
      }
    }, { rootMargin: '400px 0px 0px 0px' })
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, loading, filters.offset, filters.limit, updateFilters])
  const activeFilterCount = (() => {
    let c = 0
    if (filters.search) c++
    if (filters.contractType && filters.contractType.length) c++
    if (filters.experience && filters.experience.length) c++
    if (filters.category) c++
    // remote je default true – brojimo samo kad je isključeno (tj. filter promenjen)
    if (filters.remote === undefined) c++
    return c
  })()

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
                <Briefcase className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-3">Agregirani oglasi (testni tab)</h1>
            <p className="text-center text-blue-100 text-lg max-w-3xl mx-auto">Eksperimentalni prikaz najnovijih remote / EU‑timezone poslova iz više izvora. Podaci se osvežavaju jednom dnevno.</p>
            <p className="text-center text-blue-100 text-xs max-w-2xl mx-auto mt-2 opacity-90">Napomena: u lokalnom okruženju bez Supabase varijabli prikazaće se prazna lista radi razvoja UI-a. Na produkciji će prikazivati sveže oglase iz baze.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20"><Layers className="w-4 h-4" /> {total} oglasa</div>
              {jobs.length>0 && activeFilterCount>0 && (
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                  <Filter className="w-4 h-4" />
                  <span>Filteri: {activeFilterCount}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="main-content">
        {/* Search & controls */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              defaultValue={filters.search ?? ''}
              placeholder="Pretraga po nazivu ili kompaniji..."
              onChange={(e) => {
                const value = e.target.value.trim()
                if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
                searchDebounceRef.current = setTimeout(() => {
                  updateFilters({ search: value || null, offset: 0 })
                }, 400)
              }}
              className="w-full rounded-full border border-gray-300 bg-white pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400"
            />
          </div>
          <div className="flex gap-2">
            <select
              aria-label="Sortiraj"
              value={filters.order || 'posted'}
              onChange={(e) => updateFilters({ order: e.target.value as 'posted' | 'created', offset: 0 })}
              className="rounded-full border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:border-blue-300"
            >
              <option value="posted">Najnovije objave</option>
              <option value="created">Najskorije dodato</option>
            </select>
            <button
              onClick={() => resetFilters()}
              className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700"
            >
              Reset
            </button>
            <button
              onClick={() => updateFilters({ offset: 0 })}
              className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700"
            >
              <RefreshCcw className="w-4 h-4" /> Osveži
            </button>
          </div>
        </div>

        {/* Facet chips */}
        {facets && (
          <div className="space-y-4 mb-8">
            <div className="flex flex-wrap gap-2 items-center">
              {orderedContractKeys.map(key => (
                <button
                  key={key}
                  onClick={() => {
                    const current = (filters.contractType || []) as PortalJobContractType[]
                    const exists = current.includes(key)
                    const next = exists ? current.filter(c => c!== key) : [...current, key]
                    updateFilters({ contractType: next.length? next: undefined, offset:0 })
                  }}
                  className={cn('inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition',
                    ((filters.contractType||[]) as PortalJobContractType[]).includes(key) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:text-blue-700'
                  )}
                >
                  {key} <span className="text-[10px] opacity-70">{contractFacets[key]}</span>
                </button>
              ))}
            </div>
            {/* Experience */}
            <div className="flex flex-wrap gap-2 items-center">
              {Object.entries(experienceFacets).map(([lvl,count]) => (
                <button
                  key={lvl}
                  onClick={() => {
                    const current = filters.experience || []
                    const exists = current.includes(lvl)
                    const next = exists ? current.filter(c => c!== lvl) : [...current, lvl]
                    updateFilters({ experience: next.length? next: undefined, offset:0 })
                  }}
                  className={cn('inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition',
                    (filters.experience||[]).includes(lvl) ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300 hover:text-purple-700'
                  )}
                >
                  {lvl} <span className="text-[10px] opacity-70">{count}</span>
                </button>
              ))}
            </div>
            {/* Category */}
            <div className="flex flex-wrap gap-2 items-center">
              {Object.entries(categoryFacets).map(([cat,count]) => (
                <button
                  key={cat}
                  onClick={() => updateFilters({ category: filters.category === cat ? null : cat, offset:0 })}
                  className={cn('inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition',
                    filters.category === cat ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-300 hover:text-emerald-700'
                  )}
                >
                  {cat} <span className="text-[10px] opacity-70">{count}</span>
                </button>
              ))}
              <button
                onClick={() => updateFilters({ remote: filters.remote ? undefined : true, offset:0 })}
                className={cn('inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition',
                  filters.remote ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-gray-700 border-gray-300 hover:border-amber-300 hover:text-amber-700'
                )}
              >
                remote
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Greška pri učitavanju oglasa: {error}
            <div className="mt-3">
              <button
                onClick={() => updateFilters({ offset: 0 })}
                className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-white px-4 py-2 text-xs font-medium text-red-700 hover:border-red-400"
              >Pokušaj ponovo</button>
            </div>
          </div>
        )}

        {/* Jobs grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => (
            <PortalJobCard key={job.id} job={job} />
          ))}
          {loading && jobs.length === 0 && Array.from({ length: 6 }).map((_,i) => (
            <div key={i} className="animate-pulse h-60 rounded-xl border border-gray-200 bg-gray-50">
              <div className="h-8 bg-gray-200/60 rounded-t-xl" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-5/6" />
                <div className="h-3 bg-gray-200 rounded w-3/5" />
              </div>
            </div>
          ))}
        </div>

        {!loading && jobs.length === 0 && !error && (
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

        {/* Load more */}
        <div className="flex justify-center mt-10">
          {hasMore && (
            <div className="flex flex-col items-center gap-3">
              <button
                disabled={loading}
                onClick={() => updateFilters({ offset: (filters.offset||0) + (filters.limit||20) })}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 text-sm font-medium shadow hover:shadow-md transition disabled:opacity-60"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Učitaj još
              </button>
              <div ref={sentinelRef} aria-hidden className="h-1 w-full" />
              <p className="text-[11px] text-gray-400">Automatsko učitavanje pri skrolu…</p>
            </div>
          )}
          {!hasMore && !loading && jobs.length>0 && (
            <div className="text-sm text-gray-500">Nema više rezultata.</div>
          )}
        </div>
      </main>
    </div>
  )
}
