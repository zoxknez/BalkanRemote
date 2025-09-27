'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCurrentUrl } from '@/hooks/useCurrentUrl'
import { motion } from 'framer-motion'
import { Search, Building2, Users, TrendingUp, Star, ArrowUp, CheckCircle } from 'lucide-react'
import { CompanyCard } from '@/components/company-card'
import { BalkanItBanner } from '@/components/balkan-it-banner'
import { mockCompanies } from '@/data/mock-data'
import type { Company } from '@/types'
import { ClipboardButton } from '@/components/clipboard-button'
import { InfoTooltip } from '@/components/info-tooltip'
import { COPY_LINK_TEXT, COPY_LINK_COPIED, COPY_LINK_ERROR, COPY_LINK_TITLE_FILTERS, COPY_LINK_TOOLTIP_FILTERS } from '@/data/ui-copy'

const INDUSTRY_LABELS: Record<string, string> = {
  Technology: 'Tehnologija & Software',
  'Technology/Marketing': 'Tech Marketing',
  Finance: 'Fintech & Banking',
  Healthcare: 'HealthTech',
  Education: 'EdTech & Online Learning',
  Gaming: 'Gaming & Entertainment',
  Outsourcing: 'Development Outsourcing',
  'Automation & Integration': 'Automation & Integration',
  'DevOps Platform': 'DevOps & Platform Engineering',
  'Design & Collaboration Tools': 'Design & Collaboration',
  'Freelance Marketplace': 'Freelance Platforms',
  'Social Media Management': 'Marketing SaaS',
  'Artificial Intelligence': 'AI & Machine Learning',
  Cybersecurity: 'Cybersecurity & Trust'
}

const REGION_KEYWORDS = [
  { key: 'serbia', label: 'Srbija', flag: '🇷🇸', keywords: ['serbia', 'serbian', 'belgrade', 'beograd', 'novi sad', 'nis'] },
  { key: 'croatia', label: 'Hrvatska', flag: '🇭🇷', keywords: ['croatia', 'croatian', 'zagreb', 'split', 'rijeka', 'vodnjan'] },
  { key: 'bosnia', label: 'Bosna i Hercegovina', flag: '🇧🇦', keywords: ['bosnia', 'bosnia and herzegovina', 'sarajevo', 'banja luka', 'bih'] },
  { key: 'montenegro', label: 'Crna Gora', flag: '🇲🇪', keywords: ['montenegro', 'podgorica'] },
  { key: 'north-macedonia', label: 'Severna Makedonija', flag: '🇲🇰', keywords: ['north macedonia', 'skopje'] },
  { key: 'slovenia', label: 'Slovenija', flag: '🇸🇮', keywords: ['slovenia', 'ljubljana'] },
  { key: 'remote', label: 'Remote-first', flag: '🌍', keywords: ['remote', 'distributed', 'global'] }
] as const

type RegionSummary = {
  key: string
  label: string
  flag: string
  count: number
  hiring: number
  topIndustries: string[]
  averageRating: number | null
}

function buildRegionInsights(companies: Company[]): RegionSummary[] {
  return REGION_KEYWORDS.map((region) => {
    const matched = companies.filter((company) => {
      const location = (company.location || '').toLowerCase()
      return region.keywords.some((keyword) => location.includes(keyword))
    })

    if (!matched.length) return null

    const hiring = matched.filter((company) => company.isHiring).length
    const industryCounts = new Map<string, number>()
    let ratingSum = 0
    let ratingCount = 0

    matched.forEach((company) => {
      industryCounts.set(company.industry, (industryCounts.get(company.industry) || 0) + 1)
      if (company.rating) {
        ratingSum += company.rating
        ratingCount += 1
      }
    })

    const topIndustries = Array.from(industryCounts.entries())
      .sort((a, b) => {
        if (b[1] === a[1]) return a[0].localeCompare(b[0])
        return b[1] - a[1]
      })
      .slice(0, 2)
      .map(([value]) => INDUSTRY_LABELS[value] ?? value)

    return {
      key: region.key,
      label: region.label,
      flag: region.flag,
      count: matched.length,
      hiring,
      topIndustries,
      averageRating: ratingCount ? ratingSum / ratingCount : null
    }
  }).filter(Boolean) as RegionSummary[]
}

// ... later inside the default export/component scope (file uses 'use client', so hooks are fine)

export default function KompanijeContent() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all')
  const [selectedSize, setSelectedSize] = useState<string>('all')
  const [hiringOnly, setHiringOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'rating' | 'openPositions' | 'founded' | 'name'>('rating')
  const [isLoading, setIsLoading] = useState(false)
  // ClipboardButton handles copy feedback internally
  const [showTop, setShowTop] = useState(false)
  const firstLoadRef = useRef(true)
  const currentUrl = useCurrentUrl()

  // Initialize state from URL on first mount
  useEffect(() => {
    if (!firstLoadRef.current) return
    firstLoadRef.current = false
    const q = params.get('q') || ''
    const industry = params.get('industry') || 'all'
    let size = params.get('size') || 'all'
    // Accept aliases from Home tab (smb -> small, enterprise -> large)
    if (size === 'smb') size = 'small'
    if (size === 'enterprise') size = 'large'
    const hiring = params.get('hiring')
    const sort = params.get('sort') as 'rating' | 'openPositions' | 'founded' | 'name' | null
    if (q) setSearchTerm(q)
    if (industry) setSelectedIndustry(industry)
    if (size) setSelectedSize(size)
    if (hiring === 'true') setHiringOnly(true)
    if (sort && ['rating', 'openPositions', 'founded', 'name'].includes(sort)) setSortBy(sort)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // currentUrl is derived via useCurrentUrl

  // Reflect filters in URL; avoid loops by not depending on params
  useEffect(() => {
    const p = new URLSearchParams(params.toString())
    const setOrDelete = (key: string, value: string | boolean) => {
      const v = typeof value === 'boolean' ? (value ? 'true' : '') : value
      if (v && v !== 'all' && v !== 'false') p.set(key, v)
      else p.delete(key)
    }
    setOrDelete('q', searchTerm.trim())
    setOrDelete('industry', selectedIndustry)
    setOrDelete('size', selectedSize)
    setOrDelete('hiring', hiringOnly)
    setOrDelete('sort', sortBy)
    router.replace(`${pathname}?${p.toString()}`, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedIndustry, selectedSize, hiringOnly, sortBy, pathname, router])

  // Lightweight loading state on filter changes (UX)
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 180)
    setIsLoading(true)
    return () => clearTimeout(t)
  }, [searchTerm, selectedIndustry, selectedSize, hiringOnly, sortBy])

  // Back to top visibility
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 320)
    window.addEventListener('scroll', onScroll)
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const industries = useMemo(() => {
    const counts = new Map<string, number>()

    mockCompanies.forEach((company) => {
      counts.set(company.industry, (counts.get(company.industry) || 0) + 1)
    })

    const entries = Array.from(counts.entries())
      .sort((a, b) => {
        if (b[1] === a[1]) return a[0].localeCompare(b[0])
        return b[1] - a[1]
      })
      .map(([value, count]) => ({
        value,
        label: INDUSTRY_LABELS[value] ?? value,
        count
      }))

    return [
      { value: 'all', label: 'Sve industrije', count: mockCompanies.length },
      ...entries
    ]
  }, [])

  const companySizes = [
    { value: 'all', label: 'Sve veličine' },
    { value: 'startup', label: 'Startup (1-50)', icon: '🚀' },
    { value: 'small', label: 'Mala (51-200)', icon: '🏢' },
    { value: 'medium', label: 'Srednja (201-1000)', icon: '🏭' },
    { value: 'large', label: 'Velika (1000+)', icon: '🌆' }
  ]

  const filteredCompanies = useMemo(() => {
    const base = mockCompanies.filter((company) => {
      const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          company.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          company.industry.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesIndustry = selectedIndustry === 'all' || company.industry === selectedIndustry
      
      let matchesSize = true
      if (selectedSize !== 'all') {
        const raw = (company.size || '').toString().toLowerCase()
        // Parse numbers like "500-1000 employees", "30000+ employees" or single number
        const range = raw.match(/(\d{1,6})\s*[-–]\s*(\d{1,6})/)
        const plus = raw.match(/(\d{1,6})\s*\+/)
        const single = raw.match(/(\d{1,6})/)
        let upper: number | undefined
        if (range) upper = parseInt(range[2], 10)
        else if (plus) upper = parseInt(plus[1], 10)
        else if (single) upper = parseInt(single[1], 10)

        if (upper == null || Number.isNaN(upper)) {
          // Fallback heuristics: assume SMB
          upper = 300
        }

        switch (selectedSize) {
          case 'startup':
            matchesSize = upper < 100
            break
          case 'small':
            matchesSize = upper >= 100 && upper < 200
            break
          case 'medium':
            matchesSize = upper >= 200 && upper < 1000
            break
          case 'large':
            matchesSize = upper >= 1000
            break
        }
      }
      
      const matchesHiring = !hiringOnly || company.isHiring
      
      return matchesSearch && matchesIndustry && matchesSize && matchesHiring
    })

    const sorted = [...base]
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'openPositions':
          return (b.openPositions || 0) - (a.openPositions || 0)
        case 'founded':
          return (b.foundedYear || 0) - (a.foundedYear || 0)
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })
    return sorted
  }, [searchTerm, selectedIndustry, selectedSize, hiringOnly, sortBy])

  const statsSource = filteredCompanies.length > 0 ? filteredCompanies : mockCompanies
  const quickIndustryTargets = industries.filter((industry) => industry.value !== 'all').slice(0, 3)

  const quickFilterChips = [
    { label: 'Hiring sada', action: () => setHiringOnly(true) },
    { label: 'Top ocenjene', action: () => setSortBy('rating') },
    ...quickIndustryTargets.map((industry) => ({
      label: industry.label,
      action: () => setSelectedIndustry(industry.value)
    })),
    { label: 'Startup (<100)', action: () => setSelectedSize('startup') },
    { label: 'SMB (100–999)', action: () => setSelectedSize('medium') },
    { label: 'Enterprise (1000+)', action: () => setSelectedSize('large') }
  ]

  const topHiringCompanies = useMemo(() => {
    const source = filteredCompanies.length > 0 ? filteredCompanies : mockCompanies
    return source
      .filter((company) => company.isHiring)
      .slice()
      .sort((a, b) => (b.openPositions || 0) - (a.openPositions || 0))
      .slice(0, 2)
  }, [filteredCompanies])

  const topTechStacks = useMemo(() => {
    const source = filteredCompanies.length > 0 ? filteredCompanies : mockCompanies
    const frequency = new Map<string, number>()

    source.forEach((company) => {
      company.techStack?.forEach((tech) => {
        frequency.set(tech, (frequency.get(tech) || 0) + 1)
      })
    })

    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
  }, [filteredCompanies])

  const topBenefits = useMemo(() => {
    const source = filteredCompanies.length > 0 ? filteredCompanies : mockCompanies
    const frequency = new Map<string, number>()

    source.forEach((company) => {
      company.benefits?.forEach((benefit) => {
        frequency.set(benefit, (frequency.get(benefit) || 0) + 1)
      })
    })

    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
  }, [filteredCompanies])

  const regionHighlights = useMemo(() => buildRegionInsights(filteredCompanies.length > 0 ? filteredCompanies : mockCompanies), [filteredCompanies])
  const topRegionHighlights = regionHighlights.slice(0, 3)
  const globalRegionHighlights = useMemo(() => buildRegionInsights(mockCompanies), [])

  const topRatedCompanies = useMemo(() => {
    const source = filteredCompanies.length > 0 ? filteredCompanies : mockCompanies
    return source
      .filter((company) => typeof company.rating === 'number')
      .slice()
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 6)
  }, [filteredCompanies])

  const totalHiringCompanies = statsSource.filter((company) => company.isHiring).length
  const totalOpenPositions = statsSource.reduce((sum, company) => sum + (company.openPositions || 0), 0)
  const insightContextLabel = filteredCompanies.length > 0 ? 'iz vaše pretrage' : 'iz cele baze'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Unified Gradient Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
                <Building2 className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-3">IT Kompanije na Balkanu</h1>
            <p className="text-center text-blue-100 text-lg max-w-3xl mx-auto">
              Balkanske IT kompanije i međunarodne koje zapošljavaju remote talente iz regiona
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6 text-sm">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                <CheckCircle className="w-4 h-4" />
                <span>Aktuelno zapošljavanje</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                <Users className="w-4 h-4" />
                <span>Različite veličine timova</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                <TrendingUp className="w-4 h-4" />
                <span>Sortiranje i filtri</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Balkan IT Scene Banner */}
        <BalkanItBanner
          className="mb-8"
          title="🇷🇸🇭🇷🇧🇦🇲🇪 Balkanska IT scena u ekspanziji"
          subtitle="Naš region je novi hub za remote rad - evo ko sve zapošljava ovde"
        />

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Pretražite po nazivu kompanije ili industriji..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full sm:w-auto sm:min-w-[200px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {industries.map((industry) => (
                  <option key={industry.value} value={industry.value}>
                    {industry.label}
                    {industry.value !== 'all' ? ` (${industry.count})` : ''}
                  </option>
                ))}
              </select>

              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full sm:w-auto sm:min-w-[180px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {companySizes.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>

              <label className="flex items-center justify-between sm:justify-start space-x-2 px-4 py-3 bg-gray-50 rounded-lg w-full sm:w-auto">
                <input
                  type="checkbox"
                  checked={hiringOnly}
                  onChange={(e) => setHiringOnly(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Samo aktivno zapošljavaju</span>
              </label>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'rating' | 'openPositions' | 'founded' | 'name')}
                className="w-full sm:w-auto sm:min-w-[210px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="rating">Sortiraj: Najbolje ocenjene</option>
                <option value="openPositions">Sortiraj: Najviše pozicija</option>
                <option value="founded">Sortiraj: Najnovije (osnivanje)</option>
                <option value="name">Sortiraj: A–Z</option>
              </select>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:basis-full justify-center sm:justify-start">
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedIndustry('all')
                    setSelectedSize('all')
                    setHiringOnly(false)
                    setSortBy('rating')
                    router.replace(pathname, { scroll: false })
                  }}
                  className="w-full sm:w-auto px-4 py-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
                >
                  Obriši filtere
                </button>

                <div className="w-full sm:w-auto inline-flex items-center gap-2">
                  <ClipboardButton
                    value={currentUrl}
                    copyText={COPY_LINK_TEXT}
                    copiedText={COPY_LINK_COPIED}
                    errorText={COPY_LINK_ERROR}
                    title={COPY_LINK_TITLE_FILTERS}
                    className="w-full sm:w-auto"
                    announceValue={false}
                    disabled={!currentUrl}
                  />
                  <InfoTooltip
                    text={COPY_LINK_TOOLTIP_FILTERS}
                    label="Šta radi 'Kopiraj link'"
                    title="Objašnjenje opcije 'Kopiraj link'"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {quickFilterChips.map((chip) => (
              <button
                key={chip.label}
                onClick={chip.action}
                className="px-3 py-1.5 text-xs rounded-full border border-gray-300 hover:bg-gray-50"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{filteredCompanies.length}</div>
                <div className="text-sm text-gray-600">Kompanija</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {filteredCompanies.filter(c => c.isHiring).length}
                </div>
                <div className="text-sm text-gray-600">Zapošljava</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {filteredCompanies.reduce((total, company) => total + company.openPositions, 0)}
                </div>
                <div className="text-sm text-gray-600">Otvorenih pozicija</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {(() => {
                    const rated = filteredCompanies.filter(c => c.rating)
                    if (!rated.length) return '0.0'
                    const avg = filteredCompanies.reduce((sum, c) => sum + (c.rating || 0), 0) / rated.length
                    return avg.toFixed(1)
                  })()}
                </div>
                <div className="text-sm text-gray-600">Prosečna ocena</div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights from current search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Insajti {insightContextLabel}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-lg bg-gray-50 border">
              <div className="text-gray-600">Top industrije</div>
              <div className="mt-1 font-medium text-gray-900">
                {(() => {
                  const count = new Map<string, number>()
                  filteredCompanies.forEach(c => count.set(c.industry, (count.get(c.industry) || 0) + 1))
                  const top = Array.from(count.entries()).sort((a,b)=>b[1]-a[1]).slice(0,3)
                  return top.length ? top.map(([name, n]) => `${name} (${n})`).join(', ') : '—'
                })()}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border">
              <div className="text-gray-600">Zapošljavaju</div>
              <div className="mt-1 font-medium text-gray-900">
                {filteredCompanies.filter(c => c.isHiring).length} kompanija
              </div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border">
              <div className="text-gray-600">Prosečna ocena</div>
              <div className="mt-1 font-medium text-gray-900">
                {(() => {
                  const rated = filteredCompanies.filter(c => c.rating)
                  if (!rated.length) return '—'
                  const avg = rated.reduce((s,c)=> s + (c.rating||0), 0) / rated.length
                  return avg.toFixed(1)
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Snapshot: Hiring & Trends */}
        <div className="grid gap-5 lg:grid-cols-3 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Ko zapošljava sada</h3>
                <p className="text-[11px] text-gray-500">Pregled {insightContextLabel}</p>
              </div>
              <span className="text-xs font-medium bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                {totalHiringCompanies} hiring
              </span>
            </div>
            <div className="space-y-3">
              {topHiringCompanies.length ? (
                topHiringCompanies.map((company, index) => (
                  <div key={company.id} className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 leading-tight">
                        {index + 1}. {company.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {INDUSTRY_LABELS[company.industry] ?? company.industry}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-purple-600">
                        {company.openPositions} pozicija
                      </div>
                      <div className="text-[11px] text-gray-500 max-w-[130px] leading-tight">
                        {company.location}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  Trenutno nema aktivnih oglašenih pozicija za odabrane filtere.
                </p>
              )}
            </div>
            <div className="mt-4 text-[11px] text-gray-500">
              Ukupno {totalOpenPositions} otvorenih pozicija {insightContextLabel}.
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900">Šta se najviše traži</h3>
            <p className="text-[11px] text-gray-500">Stack i benefiti {insightContextLabel}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {topTechStacks.length ? (
                topTechStacks.map(([tech, count]) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full"
                  >
                    {tech}
                    <span className="text-[11px] text-blue-500">×{count}</span>
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">Nema stack podataka za trenutne filtere.</span>
              )}
            </div>
            <h4 className="mt-5 text-xs font-semibold text-gray-900 uppercase tracking-wide">Top benefiti</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {topBenefits.length ? (
                topBenefits.map(([benefit, count]) => (
                  <span
                    key={benefit}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-green-50 text-green-700 rounded-full"
                  >
                    {benefit}
                    <span className="text-[11px] text-green-500">×{count}</span>
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">Nema podataka o benefitima za ove filtere.</span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900">Regionalni fokus</h3>
            <p className="text-[11px] text-gray-500">Gde su timovi {insightContextLabel}</p>
            <div className="mt-3 space-y-3">
              {topRegionHighlights.length ? (
                topRegionHighlights.map((region) => (
                  <div
                    key={region.key}
                    className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 last:border-b-0 last:pb-0"
                  >
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {region.flag} {region.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {region.topIndustries.length ? region.topIndustries.join(', ') : 'Različite industrije'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{region.count}</div>
                      <div className="text-[11px] text-gray-500">{region.hiring} hiring</div>
                      {region.averageRating ? (
                        <div className="text-[11px] text-yellow-600 mt-1">
                          ★ {region.averageRating.toFixed(1)}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  Vaši filteri ne poklapaju nijedan regionalni centar – probajte šire kriterijume.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Companies Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 rounded-xl border border-gray-200 bg-gray-100 animate-pulse" />
              ))
            : filteredCompanies.map((company, index) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <CompanyCard company={company} />
                </motion.div>
              ))}
        </motion.div>

        {/* Editorial: Kako da apliciraš */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">CV i portfolio</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
              <li>Precizan summary sa stackom i rezultatima</li>
              <li>3–5 relevantnih projekata sa linkovima</li>
              <li>Kratāk “role | scope | impact” format</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Interview priprema</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
              <li>STAR metod za odgovore</li>
              <li>Demo repo ili live sandbox</li>
              <li>Pitanja o remote procesima</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Ponuda i pregovori</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
              <li>Range u bruto/neto i benefiti</li>
              <li>Remote allowance i oprema</li>
              <li>Probni period i ciljevi</li>
            </ul>
          </div>
        </div>

        {/* No Results */}
        {filteredCompanies.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nema kompanija za vašu pretragu
            </h3>
            <p className="text-gray-600 mb-6">
              Pokušajte sa drugačijim kriterijumima pretrage ili filtrima
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedIndustry('all')
                setSelectedSize('all')
                setHiringOnly(false)
                setSortBy('rating')
                router.replace(`${pathname}`, { scroll: false })
              }}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Obriši filtere
            </button>
          </motion.div>
        )}

        {/* Popular Companies Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🌟 Izdvojene kompanije
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Najbolje ocenjeni timovi {insightContextLabel} sa provjerenim remote procesima i aktivnim hiring signalima.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topRatedCompanies.length ? (
              topRatedCompanies.map((company) => (
                <div
                  key={company.id}
                  className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm sm:text-base">
                        {company.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {INDUSTRY_LABELS[company.industry] ?? company.industry}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-yellow-600">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{company.rating?.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span className="truncate max-w-[60%]">{company.location}</span>
                    <span className={company.isHiring ? 'text-green-600 font-medium' : 'text-gray-400'}>
                      {company.isHiring ? `🟢 ${company.openPositions} pozicija` : '⭕ Pauza'}
                    </span>
                  </div>
                  {company.techStack?.length ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {company.techStack.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 text-[11px] bg-blue-50 text-blue-700 rounded-md"
                        >
                          {tech}
                        </span>
                      ))}
                      {company.techStack.length > 4 && (
                        <span className="px-2 py-0.5 text-[11px] bg-gray-100 text-gray-500 rounded-md">
                          +{company.techStack.length - 4}
                        </span>
                      )}
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 col-span-full text-center text-sm text-gray-500">
                Nema dovoljno ocenjenih kompanija u izboru – uklonite neke filtere da vidite preporuke.
              </div>
            )}
          </div>
        </div>

        {/* Balkan IT Market Insights */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            📊 Balkanska IT scena - ključne informacije
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {globalRegionHighlights.length ? (
              globalRegionHighlights.map((region) => (
                <div key={region.key} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
                  <div className="text-3xl mb-3">{region.flag}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{region.label}</h3>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• {region.count} kompanija u bazi</li>
                    <li>• {region.hiring} trenutno hiring</li>
                    <li>• Najtraženije: {region.topIndustries[0] ?? 'Raznolike industrije'}</li>
                    <li>• Prosečna ocena: {region.averageRating ? `${region.averageRating.toFixed(1)}★` : 'n/a'}</li>
                  </ul>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center col-span-full">
                <p className="text-sm text-gray-600">
                  Još uvek prikupljamo podatke o regionalnim hubovima. Predložite kompaniju i pomozite nam da upotpunimo mapu.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Top Balkan Companies */}
        <div className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-4">🏆 Top Balkanske IT kompanije</h2>
            <p className="text-indigo-100">Najuspešnije domaće kompanije koje zapošljavaju remote</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-lg p-6 text-center">
              <div className="text-2xl mb-3">🚀</div>
              <h4 className="font-semibold mb-2">Startup Scene</h4>
              <ul className="text-sm text-indigo-100 space-y-1">
                <li>Tenderly (Belgrade)</li>
                <li>Seven Bridges Genomics</li>
                <li>Symphony.is</li>
                <li>Quantox Technology</li>
              </ul>
            </div>
            
            <div className="bg-white/10 rounded-lg p-6 text-center">
              <div className="text-2xl mb-3">🏢</div>
              <h4 className="font-semibold mb-2">Established</h4>
              <ul className="text-sm text-indigo-100 space-y-1">
                <li>HTEC Group</li>
                <li>Vega IT</li>
                <li>Infobip</li>
                <li>Endava</li>
              </ul>
            </div>
            
            <div className="bg-white/10 rounded-lg p-6 text-center">
              <div className="text-2xl mb-3">🌍</div>
              <h4 className="font-semibold mb-4">Global with Balkan offices</h4>
              <ul className="text-sm text-indigo-100 space-y-1">
                <li>LinkedIn</li>
                <li>NCR Voyix</li>
                <li>GitLab</li>
                <li>Zapier</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ne vidite svoju omiljenu kompaniju?
          </h2>
          <p className="text-purple-100 mb-6">
            Predložite je nama i dodaćemo je u bazu podataka
          </p>
          <a
            href="mailto:info@remotebalkan.com?subject=Predlog%20kompanije%20za%20Remote%20Balkan"
            className="inline-flex items-center justify-center bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Predloži kompaniju
          </a>
        </div>
      </div>

      {/* Back to top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700 transition-colors"
          aria-label="Na vrh"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
