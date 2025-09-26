 'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Building2, Users, TrendingUp, Star, Link as LinkIcon, Check, ArrowUp, CheckCircle } from 'lucide-react'
import { CompanyCard } from '@/components/company-card'
import { mockCompanies } from '@/data/mock-data'

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
  const [copied, setCopied] = useState(false)
  const [showTop, setShowTop] = useState(false)
  const firstLoadRef = useRef(true)

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

  const industries = [
    { value: 'all', label: 'Sve industrije', count: mockCompanies.length },
    { value: 'Technology', label: 'Tehnologija & Software', count: mockCompanies.filter(c => c.industry === 'Technology').length },
    { value: 'Technology/Marketing', label: 'Tech Marketing', count: mockCompanies.filter(c => c.industry === 'Technology/Marketing').length },
    { value: 'Finance', label: 'Fintech & Banking', count: mockCompanies.filter(c => c.industry === 'Finance').length },
    { value: 'Healthcare', label: 'HealthTech', count: mockCompanies.filter(c => c.industry === 'Healthcare').length },
    { value: 'Education', label: 'EdTech & Online Learning', count: mockCompanies.filter(c => c.industry === 'Education').length },
    { value: 'Gaming', label: 'Gaming & Entertainment', count: mockCompanies.filter(c => c.industry === 'Gaming').length },
    { value: 'Outsourcing', label: 'Development Outsourcing', count: mockCompanies.filter(c => c.industry === 'Outsourcing').length }
  ]

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
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 text-white mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              🇷🇸🇭🇷🇧🇦🇲🇪 Balkanska IT scena u ekspanziji
            </h2>
            <p className="text-blue-100 mb-6">
              Naš region je novi hub za remote rad - evo ko sve zapošljava ovde
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl mb-2">🏗️</div>
                <div className="font-semibold">Lokalne Firme</div>
                <div className="text-sm text-blue-100">Domaće IT kompanije</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl mb-2">🌍</div>
                <div className="font-semibold">Global Remote</div>
                <div className="text-sm text-blue-100">Svetski giganti</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl mb-2">🚀</div>
                <div className="font-semibold">Startup Scene</div>
                <div className="text-sm text-blue-100">Inovativni startup-i</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl mb-2">💼</div>
                <div className="font-semibold">Outsourcing</div>
                <div className="text-sm text-blue-100">Development partneri</div>
              </div>
            </div>
          </div>
        </div>

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
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {industries.map((industry) => (
                  <option key={industry.value} value={industry.value}>
                    {industry.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {companySizes.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>

              <label className="flex items-center space-x-2 px-4 py-3 bg-gray-50 rounded-lg">
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
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="rating">Sortiraj: Najbolje ocenjene</option>
                <option value="openPositions">Sortiraj: Najviše pozicija</option>
                <option value="founded">Sortiraj: Najnovije (osnivanje)</option>
                <option value="name">Sortiraj: A–Z</option>
              </select>

              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedIndustry('all')
                  setSelectedSize('all')
                  setHiringOnly(false)
                  setSortBy('rating')
                  router.replace(pathname, { scroll: false })
                }}
                className="px-4 py-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Obriši filtere
              </button>

              <button
                onClick={async () => {
                  try {
                    const url = window.location.href
                    await navigator.clipboard.writeText(url)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1500)
                  } catch {}
                }}
                className="px-4 py-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 inline-flex items-center gap-2"
                title="Kopiraj link sa filterima"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <LinkIcon className="w-4 h-4 text-gray-600" />}
                {copied ? 'Kopirano' : 'Kopiraj link'}
              </button>
            </div>
          </div>

          {/* Quick chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { label: 'Hiring sada', action: () => setHiringOnly(true) },
              { label: 'Top ocenjene', action: () => setSortBy('rating') },
              { label: 'Fintech', action: () => setSelectedIndustry('Finance') },
              { label: 'Outsourcing', action: () => setSelectedIndustry('Outsourcing') },
              { label: 'HealthTech', action: () => setSelectedIndustry('Healthcare') },
              { label: 'Startup (<100)', action: () => setSelectedSize('startup') },
              { label: 'SMB (100–999)', action: () => setSelectedSize('medium') },
              { label: 'Enterprise (1000+)', action: () => setSelectedSize('large') },
            ].map((chip) => (
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
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Insajti iz vaše pretrage</h3>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🌟 Izdvojene kompanije
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['NCR Voyix', 'Clutch', 'Microsoft'].map((name) => (
              <div key={name} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{name}</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Zapošljava
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Balkan IT Market Insights */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            📊 Balkanska IT scena - ključne informacije
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
              <div className="text-3xl mb-3">🇷🇸</div>
              <h3 className="font-semibold text-gray-900 mb-2">Srbija</h3>
              <p className="text-sm text-gray-600 mb-3">Tech hub Balkana</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• 100+ IT kompanija</li>
                <li>• Paušalno oporezivanje</li>
                <li>• Engleski mandatory</li>
                <li>• €25-75k prosek</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
              <div className="text-3xl mb-3">🇭🇷</div>
              <h3 className="font-semibold text-gray-900 mb-2">Hrvatska</h3>
              <p className="text-sm text-gray-600 mb-3">EU prednosti</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• EU članstvo</li>
                <li>• SEPA plaćanja</li>
                <li>• Turizam + Tech</li>
                <li>• €20-60k prosek</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
              <div className="text-3xl mb-3">🇧🇦</div>
              <h3 className="font-semibold text-gray-900 mb-2">BiH</h3>
              <p className="text-sm text-gray-600 mb-3">Najjeftiniji talenti</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Niži troškovi</li>
                <li>• Kvalitetan kadar</li>
                <li>• Outsourcing hub</li>
                <li>• €15-45k prosek</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
              <div className="text-3xl mb-3">🇲🇪</div>
              <h3 className="font-semibold text-gray-900 mb-2">Crna Gora</h3>
              <p className="text-sm text-gray-600 mb-3">9% poreza</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Najniži porez</li>
                <li>• Digital nomads</li>
                <li>• Startup incentive</li>
                <li>• €20-50k prosek</li>
              </ul>
            </div>
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
                <li>Vega IT (Novi Sad)</li>
                <li>Nordeus (Belgrade)</li>
                <li>Eipix Entertainment</li>
                <li>Seven Bridges Genomics</li>
              </ul>
            </div>
            
            <div className="bg-white/10 rounded-lg p-6 text-center">
              <div className="text-2xl mb-3">🏢</div>
              <h4 className="font-semibold mb-2">Established</h4>
              <ul className="text-sm text-indigo-100 space-y-1">
                <li>Asseco SEE</li>
                <li>RT-RK (Novi Sad)</li>
                <li>Levi9 Technology</li>
                <li>Execom Technologies</li>
              </ul>
            </div>
            
            <div className="bg-white/10 rounded-lg p-6 text-center">
              <div className="text-2xl mb-3">🌍</div>
              <h4 className="font-semibold mb-4">Global with Balkan offices</h4>
              <ul className="text-sm text-indigo-100 space-y-1">
                <li>Microsoft (Belgrade)</li>
                <li>NCR Voyix</li>
                <li>Endava</li>
                <li>EPAM Systems</li>
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
          <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Predloži kompaniju
          </button>
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
