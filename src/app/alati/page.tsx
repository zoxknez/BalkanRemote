"use client"

import { useState, useMemo, useEffect, Suspense, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCurrentUrl } from '@/hooks/useCurrentUrl'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronLeft, ChevronRight, ArrowUp, ArrowUpRight } from 'lucide-react'
import { ToolCard } from '@/components/tool-card'
import { mockTools } from '@/data/mock-data'
import { ClipboardButton } from '@/components/clipboard-button'
import { InfoTooltip } from '@/components/info-tooltip'
import { COPY_LINK_TEXT, COPY_LINK_COPIED, COPY_LINK_ERROR, COPY_LINK_TITLE_FILTERS, COPY_LINK_TOOLTIP_FILTERS } from '@/data/ui-copy'

const TOOLS_PER_PAGE = 9 // Optimalno za 3x3 grid

function AlatiContent() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPricing, setSelectedPricing] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'rating' | 'name'>('rating')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  // ClipboardButton handles copied state internally
  const [showTop, setShowTop] = useState(false)
  const firstLoadRef = useRef(true)
  const currentUrl = useCurrentUrl()

  const categories = [
    { value: 'all', label: 'Sve kategorije', icon: '🎯', count: mockTools.length },
    { value: 'komunikacija', label: 'Team Komunikacija', icon: '💬', count: mockTools.filter(t => t.category === 'komunikacija').length },
    { value: 'produktivnost', label: 'Produktivnost', icon: '⚡', count: mockTools.filter(t => t.category === 'produktivnost').length },
    { value: 'design', label: 'Kreativni Dizajn', icon: '🎨', count: mockTools.filter(t => t.category === 'design').length },
    { value: 'development', label: 'Code & Development', icon: '⚙️', count: mockTools.filter(t => t.category === 'development').length },
    { value: 'project-management', label: 'Project Management', icon: '📊', count: mockTools.filter(t => t.category === 'project-management').length },
    { value: 'time-tracking', label: 'Time & Analytics', icon: '⏰', count: mockTools.filter(t => t.category === 'time-tracking').length },
    { value: 'finance', label: 'Finance & Billing', icon: '💰', count: mockTools.filter(t => t.category === 'finance').length },
    { value: 'marketing', label: 'Marketing & CRM', icon: '📈', count: mockTools.filter(t => t.category === 'marketing').length },
    { value: 'security', label: 'Security & Privacy', icon: '🛡️', count: mockTools.filter(t => t.category === 'security').length },
    { value: 'analytics', label: 'Data & Analytics', icon: '📊', count: mockTools.filter(t => t.category === 'analytics').length },
    { value: 'ai-tools', label: 'AI & Automation', icon: '🤖', count: mockTools.filter(t => t.category === 'ai-tools').length },
    { value: 'storage', label: 'Cloud & Storage', icon: '☁️', count: mockTools.filter(t => t.category === 'storage').length },
    { value: 'automation', label: 'Workflow Automation', icon: '🔄', count: mockTools.filter(t => t.category === 'automation').length }
  ]

  const pricingOptions = [
    { value: 'all', label: 'Sve cene', icon: '💳' },
    { value: 'besplatno', label: 'Potpuno Besplatno', icon: '💚', badge: 'FREE' },
    { value: 'placeno', label: 'Premium Plaćeno', icon: '💎', badge: 'PREMIUM' },
    { value: 'freemium', label: 'Freemium Model', icon: '🔀', badge: 'FREEMIUM' }
  ]

  const filteredTools = useMemo(() => {
    const categoryQuery = params.get('cat') || params.get('category')
    const categoriesFilter = categoryQuery ? categoryQuery.split(',') : undefined
    const tools = mockTools.filter((tool) => {
      const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tool.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesCategory = categoriesFilter
        ? categoriesFilter.includes(tool.category)
        : (selectedCategory === 'all' || tool.category === selectedCategory)
      const matchesPricing = selectedPricing === 'all' || tool.pricing === selectedPricing
      
      return matchesSearch && matchesCategory && matchesPricing
    })

    tools.sort((a, b) => (sortBy === 'rating' ? (b.rating || 0) - (a.rating || 0) : a.name.localeCompare(b.name)))

    return tools
  }, [searchTerm, selectedCategory, selectedPricing, sortBy, params])

  // Pagination logic
  const totalPages = Math.ceil(filteredTools.length / TOOLS_PER_PAGE)
  const startIndex = (currentPage - 1) * TOOLS_PER_PAGE
  const endIndex = startIndex + TOOLS_PER_PAGE
  const currentTools = filteredTools.slice(startIndex, endIndex)

  // Init from URL
  useEffect(() => {
    if (!firstLoadRef.current) return
    firstLoadRef.current = false
    const q = params.get('q') || ''
    const cat = params.get('cat') || 'all'
    const pricing = params.get('pricing') || 'all'
    const s = params.get('sort') as 'rating' | 'name' | null
    const page = parseInt(params.get('page') || '1', 10)
    if (q) setSearchTerm(q)
    if (cat) setSelectedCategory(cat)
    if (pricing) setSelectedPricing(pricing)
    if (s && ['rating', 'name'].includes(s)) setSortBy(s)
    if (Number.isFinite(page) && page > 0) setCurrentPage(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reflect filters in URL
  useEffect(() => {
    const p = new URLSearchParams(params.toString())
    const setOrDelete = (key: string, value: string | number) => {
      const v = String(value).trim()
      if (v && v !== 'all' && v !== '1') p.set(key, v)
      else p.delete(key)
    }
    setOrDelete('q', searchTerm)
  setOrDelete('cat', selectedCategory)
    setOrDelete('pricing', selectedPricing)
    setOrDelete('sort', sortBy)
    setOrDelete('page', currentPage)
    router.replace(`${pathname}?${p.toString()}`, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory, selectedPricing, sortBy, currentPage, pathname, router])

  // Reset to page 1 when main filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory, selectedPricing])

  // Lightweight shimmer
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 180)
    setIsLoading(true)
    return () => clearTimeout(t)
  }, [searchTerm, selectedCategory, selectedPricing, sortBy, currentPage])

  // Back to top visibility
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 320)
    window.addEventListener('scroll', onScroll)
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toolCategories = [
    {
      name: 'Komunikacija',
      icon: '💬',
      tools: ['Slack', 'Microsoft Teams', 'Discord', 'Zoom'],
      description: 'Alati za komunikaciju sa timom'
    },
    {
      name: 'Produktivnost',
      icon: '⚡',
      tools: ['Notion', 'Trello', 'Asana', 'Todoist'],
      description: 'Organizacija posla i povećanje produktivnosti'
    },
    {
      name: 'Design',
      icon: '🎨',
      tools: ['Figma', 'Canva', 'Adobe Creative Cloud', 'Sketch'],
      description: 'Kreiranje vizuelnog sadržaja i UI/UX dizajn'
    },
    {
      name: 'Development',
      icon: '⚙️',
      tools: ['VS Code', 'GitHub', 'GitLab', 'Docker'],
      description: 'Alati za programiranje i development'
    },
    {
      name: 'Project Management',
      icon: '📊',
      tools: ['Jira', 'Monday.com', 'ClickUp', 'Linear'],
      description: 'Upravljanje projektima i timovima'
    },
    {
      name: 'Time Tracking',
      icon: '⏰',
      tools: ['Toggl', 'RescueTime', 'Clockify', 'Time Doctor'],
      description: 'Praćenje radnog vremena'
    }
  ]

  // currentUrl handled by useCurrentUrl

  return (
  <div className="min-h-screen bg-white">
      {/* Unified Gradient Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
                <span className="text-3xl">🛠️</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-3">Alati za remote rad</h1>
            <p className="text-center text-blue-100 text-lg max-w-3xl mx-auto">
              Najbolji alati koji će vam olakšati remote rad i povećati produktivnost
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6 text-sm">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                <span>⚡</span>
                <span>Produktivnost</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                <span>💬</span>
                <span>Komunikacija</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                <span>🤖</span>
                <span>AI & automatizacija</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Essential Tools Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              🚀 Must-have alati za remote rad iz Balkana
            </h2>
            <p className="text-indigo-100 mb-6">
              Alati koji rade odlično u našem regionu i sa našim budžetima
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl mb-2">💳</div>
                <div className="font-semibold">Payoneer/Wise</div>
                <div className="text-sm text-indigo-100">Primanje plate iz inostranstva</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl mb-2">📱</div>
                <div className="font-semibold">Viber/WhatsApp</div>
                <div className="text-sm text-indigo-100">Komunikacija sa lokalnim timom</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl mb-2">⚡</div>
                <div className="font-semibold">UPS + Backup net</div>
                <div className="text-sm text-indigo-100">Kontinuiran rad bez prekida</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl mb-2">🌍</div>
                <div className="font-semibold">VPN + Grammarly</div>
                <div className="text-sm text-indigo-100">Pristup i komunikacija</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Pretražite alate po nazivu ili funkcionalnosti..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full min-w-[240px] pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent whitespace-nowrap"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedPricing}
                onChange={(e) => setSelectedPricing(e.target.value)}
                className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent whitespace-nowrap"
              >
                {pricingOptions.map((pricing) => (
                  <option key={pricing.value} value={pricing.value}>
                    {pricing.label}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'rating' | 'name')}
                className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent whitespace-nowrap"
              >
                <option value="rating">Sortiraj: Najbolje ocenjeni</option>
                <option value="name">Sortiraj: A–Z</option>
              </select>

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

        {/* Tool Categories Overview */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📋 Kategorije alata
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => setSelectedCategory(category.name.toLowerCase().replace(' ', '-'))}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {category.description}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {category.tools.slice(0, 2).map((tool) => (
                      <span key={tool} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {tool}
                      </span>
                    ))}
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                      +{category.tools.length - 2} više
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Editor's Picks & Quick Stacks */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">⭐ Preporuke urednika</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Dev essentials</h3>
              <p className="text-sm text-gray-600 mb-4">Core alatke za svakodnevni development</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'VS Code', href: 'https://code.visualstudio.com/' },
                  { name: 'GitHub', href: 'https://github.com/' },
                  { name: 'GitHub Desktop', href: 'https://desktop.github.com/' },
                  { name: 'Docker Desktop', href: 'https://www.docker.com/products/docker-desktop/' },
                  { name: 'Postman', href: 'https://www.postman.com/' },
                  { name: 'Insomnia', href: 'https://insomnia.rest/' },
                  { name: 'DBeaver', href: 'https://dbeaver.io/' },
                ].map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Remote stack</h3>
              <p className="text-sm text-gray-600 mb-4">Stabilan setup za timski rad na daljinu</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Slack', href: 'https://slack.com/' },
                  { name: 'Zoom', href: 'https://zoom.us/' },
                  { name: 'Google Meet', href: 'https://meet.google.com/' },
                  { name: 'Notion', href: 'https://www.notion.so/' },
                  { name: 'ClickUp', href: 'https://clickup.com/' },
                  { name: 'Linear', href: 'https://linear.app/' },
                  { name: 'Clockify', href: 'https://clockify.me/' },
                  { name: 'Cal.com', href: 'https://cal.com/' },
                ].map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Security & privacy</h3>
              <p className="text-sm text-gray-600 mb-4">Bezbedan rad i privatnost</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: '1Password', href: 'https://1password.com/' },
                  { name: 'Bitwarden', href: 'https://bitwarden.com/' },
                  { name: 'Proton Mail', href: 'https://proton.me/mail' },
                  { name: 'Proton VPN', href: 'https://protonvpn.com/' },
                  { name: 'Cloudflare WARP', href: 'https://one.one.one.one/' },
                  { name: 'Mullvad VPN', href: 'https://mullvad.net/' },
                  { name: 'uBlock Origin', href: 'https://ublockorigin.com/' },
                ].map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI & Automation + Finance */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">AI i automatizacija</h3>
            <p className="text-sm text-gray-600 mb-4">Ubrzajte rad pametnim alatima</p>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'GitHub Copilot', href: 'https://github.com/features/copilot' },
                { name: 'ChatGPT', href: 'https://chat.openai.com/' },
                { name: 'Claude', href: 'https://claude.ai/' },
                { name: 'Perplexity', href: 'https://www.perplexity.ai/' },
                { name: 'Zapier', href: 'https://zapier.com/' },
                { name: 'Make', href: 'https://www.make.com/' },
                { name: 'Cursor', href: 'https://www.cursor.com/' },
                { name: 'Phind', href: 'https://www.phind.com/' },
              ].map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                >
                  <span>{link.name}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Fakturisanje i finansije (Balkan)</h3>
            <p className="text-sm text-gray-600 mb-4">Prijem uplata, fakture i troškovi</p>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Payoneer', href: 'https://www.payoneer.com/' },
                { name: 'Wise', href: 'https://wise.com/' },
                { name: 'Revolut', href: 'https://www.revolut.com/' },
                { name: 'Clockify', href: 'https://clockify.me/' },
                { name: 'Wave (US/CA)', href: 'https://www.waveapps.com/' },
                { name: 'Zoho Invoice', href: 'https://www.zoho.com/invoice/' },
              ].map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                >
                  <span>{link.name}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        {filteredTools.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            >
              <AnimatePresence mode="popLayout">
                {isLoading
                  ? Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="h-48 rounded-xl border border-gray-200 bg-gray-100 animate-pulse" />
                    ))
                  : currentTools.map((tool, index) => (
                      <motion.div
                        key={tool.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <ToolCard tool={tool} />
                      </motion.div>
                    ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8 mb-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Prethodna
                </button>

                <div className="flex space-x-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1
                    const isActive = pageNum === currentPage
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sledeća
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}

            {/* Results info */}
            <div className="text-center text-sm text-gray-600 mb-8">
              Prikazano {startIndex + 1}-{Math.min(endIndex, filteredTools.length)} od {filteredTools.length} alata
              {currentPage > 1 && ` (strana ${currentPage} od ${totalPages})`}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🛠️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nema alata za vašu pretragu
            </h3>
            <p className="text-gray-600 mb-6">
              Pokušajte sa drugačijim kriterijumima ili nam predložite novi alat
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
                setSelectedPricing('all')
                setSortBy('rating')
                setCurrentPage(1)
                router.replace(pathname, { scroll: false })
              }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Obriši filtere
            </button>
          </motion.div>
        )}

        {/* Remote Work Setup Guide */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🏠 Setup za remote rad
            </h2>
            <p className="text-gray-600">
              Minimalni setup alata za produktivan remote rad
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">💻</div>
              <h4 className="font-semibold text-gray-900 mb-2">Hardware</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Laptop/Desktop</li>
                <li>Webcam</li>
                <li>Mikrofon/Slušalice</li>
                <li>Drugi monitor</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">💬</div>
              <h4 className="font-semibold text-gray-900 mb-2">Komunikacija</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Slack / Teams</li>
                <li>Zoom / Google Meet</li>
                <li>Email client</li>
                <li>WhatsApp / Telegram</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">📝</div>
              <h4 className="font-semibold text-gray-900 mb-2">Produktivnost</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Notion / Obsidian</li>
                <li>Google Workspace</li>
                <li>Task manager</li>
                <li>Time tracker</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🔧</div>
              <h4 className="font-semibold text-gray-900 mb-2">Development</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Code editor</li>
                <li>Git client</li>
                <li>Terminal</li>
                <li>VPN klijent</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Editorial: Praktični setup saveti */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Minimalni stack</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
              <li>Slack/Teams + Zoom/Meet</li>
              <li>Notion/Google Workspace</li>
              <li>Time tracking + invoicing</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Konvencije u timu</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
              <li>Jedan source of truth (wiki)</li>
              <li>Šabloni za PR/issue/meeting</li>
              <li>Dogovor o radnim satima</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Automatizacije</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
              <li>Zapier/Make za rutine</li>
              <li>CI za testove i verifikacije</li>
              <li>Slack bot za podsjetnike</li>
            </ul>
          </div>
        </div>

        {/* Balkan Specific Tips */}
        <div className="mt-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-4">🇷🇸 Saveti za Balkan region</h2>
            <p className="text-green-100">Specifični saveti za remote rad iz Srbije, Hrvatske, BiH, Crne Gore, Albanije i Severne Makedonije</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-2xl mb-3">💳</div>
              <h4 className="font-semibold mb-3">Plaćanje & Banking</h4>
              <ul className="text-sm text-green-100 space-y-2">
                <li>• Payoneer za USA klijente</li>
                <li>• Wise za EU SEPA transfere</li>
                <li>• Revolut kao backup opcija</li>
                <li>• Lokalne banke za devizne račune</li>
              </ul>
            </div>
            
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-2xl mb-3">🌐</div>
              <h4 className="font-semibold mb-3">Internet & Pristup</h4>
              <ul className="text-sm text-green-100 space-y-2">
                <li>• Fiber optika 100+ Mbps</li>
                <li>• VPN za geo-restricted sadržaj</li>
                <li>• Mobile hotspot kao backup</li>
                <li>• UPS za stabilnu struju</li>
              </ul>
            </div>
            
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-2xl mb-3">📱</div>
              <h4 className="font-semibold mb-3">Komunikacija</h4>
              <ul className="text-sm text-green-100 space-y-2">
                <li>• Grammarly za engleski</li>
                <li>• Viber/WhatsApp za lokal tim</li>
                <li>• Google Translate kao pomoć</li>
                <li>• Calendly za scheduling</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
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


export default function AlatiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}> 
      <AlatiContent />
    </Suspense>
  )
}
