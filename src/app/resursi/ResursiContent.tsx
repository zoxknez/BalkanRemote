'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCurrentUrl } from '@/hooks/useCurrentUrl';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, ArrowUp, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { ResourceCard } from '@/components/resource-card';
import { ClipboardButton } from '@/components/clipboard-button';
import { InfoTooltip } from '@/components/info-tooltip';
import { mockResources } from '@/data/mock-data';
import { COPY_LINK_TEXT, COPY_LINK_COPIED, COPY_LINK_ERROR, COPY_LINK_TITLE_FILTERS, COPY_LINK_TOOLTIP_FILTERS } from '@/data/ui-copy';
import type { Resource } from '@/types';

const RESOURCES_PER_PAGE = 8; // 2x4 grid

type CategoryOpt = {
  value: string;
  label: string;
  icon: string; // emoji
  count: number;
};

type TypeOpt = {
  value: 'all' | 'besplatno' | 'placeno' | 'freemium';
  label: string;
  icon: string;
  badge?: 'FREE' | 'PAID' | 'FREEMIUM';
};

type LanguageOpt = {
  value: 'all' | 'sr' | 'en' | 'mix';
  label: string;
  flag: string;
};

function ResursiContent() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const currentUrl = useCurrentUrl();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedLength, setSelectedLength] = useState<'all' | 'short' | 'medium' | 'long'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'rating' | 'title'>('rating');
  const [isLoading, setIsLoading] = useState(false);
  // ClipboardButton provides its own feedback; no separate copied state here
  const firstLoadRef = useRef(true);
  const [showTop, setShowTop] = useState(false);

  // Initialize from URL once
  useEffect(() => {
    if (!firstLoadRef.current) return;
    firstLoadRef.current = false;
    const q = params?.get('q') || '';
    const cat = params?.get('category') || 'all';
    const typ = params?.get('type') || 'all';
    const lang = params?.get('lang') || 'all';
    const lvl = params?.get('level');
    const s = params?.get('sort') as 'rating' | 'title' | null;
    const length = params?.get('length') as 'short' | 'medium' | 'long' | null;
    const page = parseInt(params?.get('page') || '1', 10);
    if (q) setSearchTerm(q);
    if (cat) setSelectedCategory(cat);
    if (typ) setSelectedType(typ);
    if (lang) setSelectedLanguage(lang);
    if (length === 'short' || length === 'medium' || length === 'long') setSelectedLength(length);
    if (lvl === 'beginner' || lvl === 'advanced') {
      // leave as hint only; category remains as set
    }
    if (s && ['rating', 'title'].includes(s)) setSortBy(s);
    if (Number.isFinite(page) && page > 0) setCurrentPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Kategorije – koristi ispravne emodžije i nazive
  const categories: CategoryOpt[] = [
    { value: 'all', label: 'Sve kategorije', icon: '🎯', count: mockResources.length },
    { value: 'sajt', label: 'Job Board-i', icon: '🌐', count: mockResources.filter((r: Resource) => r.category === 'sajt').length },
    { value: 'alat', label: 'Dev Alati & Produktivnost', icon: '🛠️', count: mockResources.filter((r: Resource) => r.category === 'alat').length },
    { value: 'kurs', label: 'Online Kursevi & Bootcamp', icon: '📚', count: mockResources.filter((r: Resource) => r.category === 'kurs').length },
    { value: 'blog', label: 'Tech Blogovi & News', icon: '✍️', count: mockResources.filter((r: Resource) => r.category === 'blog').length },
    { value: 'podcast', label: 'Dev Podkasti', icon: '🎧', count: mockResources.filter((r: Resource) => r.category === 'podcast').length },
    { value: 'knjiga', label: 'Skill Books & Ebooks', icon: '📖', count: mockResources.filter((r: Resource) => r.category === 'knjiga').length },
    { value: 'newsletter', label: 'Tech Newsletter-i', icon: '📰', count: mockResources.filter((r: Resource) => r.category === 'newsletter').length },
  ];

  const types: TypeOpt[] = [
    { value: 'all', label: 'Sve cene', icon: '💳' },
    { value: 'besplatno', label: 'Potpuno Besplatno', icon: '💚', badge: 'FREE' },
    { value: 'placeno', label: 'Premium Plaćeno', icon: '💰', badge: 'PAID' },
    { value: 'freemium', label: 'Freemium Model', icon: '🔀', badge: 'FREEMIUM' },
  ];

  const languages: LanguageOpt[] = [
    { value: 'all', label: 'Svi jezici', flag: '🌍' },
    { value: 'sr', label: 'Srpski sadržaj', flag: '🇷🇸' },
    { value: 'en', label: 'Engleski sadržaj', flag: '🇬🇧' },
    { value: 'mix', label: 'Višejezički', flag: '🌐' },
  ];

  const filteredResources: Resource[] = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();

    let resources = (mockResources as Resource[]).filter((resource) => {
      const title = (resource.title ?? '').toString().toLowerCase();
      const desc = (resource.description ?? '').toString().toLowerCase();
      const tagsArr: string[] = Array.isArray(resource.tags) ? resource.tags : [];

      const matchesSearch =
        s.length === 0 ||
        title.includes(s) ||
        desc.includes(s) ||
        tagsArr.some((tag) => (tag ?? '').toString().toLowerCase().includes(s));

      const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
      const matchesType = selectedType === 'all' || resource.type === selectedType;
      const matchesLanguage = selectedLanguage === 'all' || resource.language === selectedLanguage;

      const matchesLevel = params?.get('level')
        ? (params?.get('level') === 'beginner' ? resource.difficulty === 'beginner' : resource.difficulty === 'advanced')
        : true;

      const matchesLength = (() => {
        if (selectedLength === 'all') return true;
        const t = (resource.timeToComplete || '').toLowerCase();
        // derive minutes with simple heuristics
        const mins = /min/.test(t)
          ? parseInt(t, 10) || (t.includes('10') ? 10 : t.includes('20') ? 20 : t.includes('30') ? 30 : 30)
          : /hour|sat/.test(t)
          ? t.includes('5') || t.includes('6')
            ? 300
            : 120
          : /week|nedelj/.test(t)
          ? 7 * 60 * 4
          : undefined;
        if (!mins) return true;
        if (selectedLength === 'short') return mins <= 45;
        if (selectedLength === 'medium') return mins > 45 && mins <= 240;
        if (selectedLength === 'long') return mins > 240;
        return true;
      })();

      return matchesSearch && matchesCategory && matchesType && matchesLanguage && matchesLevel && matchesLength;
    });

    resources = resources.sort((a, b) => (sortBy === 'rating' ? (b.rating || 0) - (a.rating || 0) : a.title.localeCompare(b.title)));

    return resources;
  }, [searchTerm, selectedCategory, selectedType, selectedLanguage, selectedLength, sortBy, params]);

  // Reflect filters + pagination in URL
  useEffect(() => {
    const p = new URLSearchParams(params?.toString() ?? '');
    const setOrDelete = (key: string, value: string | number) => {
      const v = String(value).trim();
      if (v && v !== 'all' && v !== '1') p.set(key, v);
      else p.delete(key);
    };
    setOrDelete('q', searchTerm);
    setOrDelete('category', selectedCategory);
    setOrDelete('type', selectedType);
    setOrDelete('lang', selectedLanguage);
    setOrDelete('sort', sortBy);
    setOrDelete('length', selectedLength);
    setOrDelete('page', currentPage);
    const effectivePath = pathname || '/resursi';
    router.replace(`${effectivePath}?${p.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory, selectedType, selectedLanguage, selectedLength, sortBy, currentPage, pathname, router]);

  // Lightweight loading shimmer
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 180);
    setIsLoading(true);
    return () => clearTimeout(t);
  }, [searchTerm, selectedCategory, selectedType, selectedLanguage, selectedLength, sortBy, currentPage]);

  // Back to top visibility
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 320);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Pagination
  const totalPages = Math.ceil(filteredResources.length / RESOURCES_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * RESOURCES_PER_PAGE;
  const endIndex = startIndex + RESOURCES_PER_PAGE;
  const currentResources = filteredResources.slice(startIndex, endIndex);

  // Reset na stranu 1 kad se promene filteri ili pretraga
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedType, selectedLanguage, selectedLength]);

  // Osiguraj da currentPage nikad ne pređe totalPages (npr. kad su rezultati manji)
  useEffect(() => {
    setCurrentPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const featuredResources = filteredResources.filter((resource: Resource) => resource.featured);

  // Metrics for quick summary
  const totalResources = filteredResources.length;
  const totalCategories = categories.length - 1; // exclude 'all'
  const estMinutes = Math.max(Math.round(totalResources * 0.7), 8);
  const langSet = new Set(filteredResources.map(r => r.language));
  const totalLangs = langSet.size;

  return (
    <div className="min-h-screen bg-white">
      {/* Unified Gradient Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
                <span className="text-3xl">📚</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-3">Resursi za remote rad</h1>
            <p className="text-center text-blue-100 text-lg max-w-3xl mx-auto">
              Najbolji sajtovi, alati, kursevi i saveti za uspešnu remote karijeru
            </p>

            {/* Metrics summary */}
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white/20 px-4 py-3 shadow-sm">
                <span className="text-2xl">📚</span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-100">Resursa</p>
                  <p className="text-lg font-semibold text-white">{totalResources}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white/20 px-4 py-3 shadow-sm">
                <span className="text-2xl">🗂️</span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-100">Kategorija</p>
                  <p className="text-lg font-semibold text-white">{totalCategories}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white/20 px-4 py-3 shadow-sm">
                <span className="text-2xl">⏱️</span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-100">Minuta čitanja</p>
                  <p className="text-lg font-semibold text-white">{estMinutes}+</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white/20 px-4 py-3 shadow-sm">
                <span className="text-2xl">🌍</span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-100">Jezika</p>
                  <p className="text-lg font-semibold text-white">{totalLangs}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-6 text-sm">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                <span>⭐</span>
                <span>Preporučeno</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                <span>💚</span>
                <span>Besplatno</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                <span>🌐</span>
                <span>Job board-i</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Featured Resources Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">⭐ Preporučeni resursi od Balkan Remote tima</h2>
            <p className="text-purple-100 mb-6">Ovi resursi su lično testirani i preporučeni od strane našeg tima</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl mb-2">🌟</div>
                <div className="font-semibold">LinkedIn Remote Jobs</div>
                <div className="text-sm text-purple-100">480+ pozicija za Srbiju</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-semibold">Clutch Lista</div>
                <div className="text-sm text-purple-100">IT kompanije u Srbiji</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl mb-2">📖</div>
                <div className="font-semibold">SkillCrush Guide</div>
                <div className="text-sm text-purple-100">Remote work vodič</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[240px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Pretražite resurse po nazivu ili opisu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 w-full">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-auto whitespace-nowrap"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label} ({category.count})
                  </option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-auto whitespace-nowrap"
              >
                {types.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-auto whitespace-nowrap"
              >
                {languages.map((language) => (
                  <option key={language.value} value={language.value}>
                    {language.flag} {language.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedLength}
                onChange={(e) => setSelectedLength(e.target.value as typeof selectedLength)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-auto whitespace-nowrap"
              >
                <option value="all">Trajanje: Sva</option>
                <option value="short">Kratko (≤ 45 min)</option>
                <option value="medium">Srednje (≤ 4h)</option>
                <option value="long">Dugo (≥ 4h)</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'rating' | 'title')}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-auto whitespace-nowrap"
              >
                <option value="rating">Sortiraj: Najbolje ocenjeni</option>
                <option value="title">Sortiraj: A–Z</option>
              </select>

              <div className="flex items-center gap-2 w-full sm:w-auto">
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

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{filteredResources.length}</div>
            <div className="text-sm text-gray-600">Ukupno resursa</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {filteredResources.filter((r: Resource) => r.type === 'besplatno').length}
            </div>
            <div className="text-sm text-gray-600">Besplatni</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">{featuredResources.length}</div>
            <div className="text-sm text-gray-600">Preporučeni</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {filteredResources.filter((r: Resource) => r.language === 'sr').length}
            </div>
            <div className="text-sm text-gray-600">Na srpskom</div>
          </div>
        </div>

        {/* Resources Grid */}
        {filteredResources.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            >
              <AnimatePresence mode="popLayout">
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="h-44 rounded-xl border border-gray-200 bg-gray-100 animate-pulse" />
                    ))
                  : currentResources.map((resource: Resource, index: number) => (
                      <motion.div
                        key={resource.id ?? `${resource.title}-${index}`}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <ResourceCard resource={resource} />
                      </motion.div>
                    ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8 mb-8">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Prethodna
                </button>

                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => {
                    const pageNum = i + 1;
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isActive ? 'bg-purple-600 text-white' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
              Prikazano {filteredResources.length === 0 ? 0 : startIndex + 1}-
              {Math.min(endIndex, filteredResources.length)} od {filteredResources.length} resursa
              {currentPage > 1 && ` (strana ${currentPage} od ${totalPages})`}
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nema resursa za vašu pretragu</h3>
            <p className="text-gray-600 mb-6">Pokušajte sa drugačijim kriterijumima ili predložite nam novi resurs</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedType('all');
                setSelectedLanguage('all');
                setSortBy('rating');
                setCurrentPage(1);
                router.replace(pathname || '/resursi', { scroll: false });
              }}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Obriši filtere
            </button>
          </motion.div>
        )}

        {/* Curated Collections */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">🎯 Odabrane kolekcije resursa</h2>
          <p className="text-gray-600 mb-6">Brzi izbor najkorisnijih resursa po scenarijima: traženje posla, produktivnost i učenje.</p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="font-semibold text-gray-900 mb-2">Toolkit za traženje posla</div>
              <div className="text-sm text-gray-600 mb-4">LinkedIn pretrage, globalni board‑ovi i portfolio alati.</div>
              <div className="flex flex-wrap gap-2">
                <a href="https://www.linkedin.com/jobs/search/?keywords=remote&f_WT=2" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-gray-700 hover:bg-gray-50">
                  LinkedIn Remote <ArrowUpRight className="w-4 h-4" />
                </a>
                <a href="https://euremotejobs.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-gray-700 hover:bg-gray-50">
                  EU Remote Jobs <ArrowUpRight className="w-4 h-4" />
                </a>
                <a href="https://remoteok.com/remote-dev-jobs" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-gray-700 hover:bg-gray-50">
                  RemoteOK Dev <ArrowUpRight className="w-4 h-4" />
                </a>
                <a href="https://weworkremotely.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-gray-700 hover:bg-gray-50">
                  WWR <ArrowUpRight className="w-4 h-4" />
                </a>
                <a href="https://wellfound.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-gray-700 hover:bg-gray-50">
                  Wellfound <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="font-semibold text-gray-900 mb-2">Produktivnost i fokus</div>
              <div className="text-sm text-gray-600 mb-4">Time‑blocking, task management i deep work alati.</div>
              <div className="flex flex-wrap gap-2">
                <a href="https://todoist.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-gray-700 hover:bg-gray-50">Todoist <ArrowUpRight className="w-4 h-4" /></a>
                <a href="https://notion.so/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-gray-700 hover:bg-gray-50">Notion <ArrowUpRight className="w-4 h-4" /></a>
                <a href="https://clockify.me/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-gray-700 hover:bg-gray-50">Clockify <ArrowUpRight className="w-4 h-4" /></a>
                <a href="https://cal.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-gray-700 hover:bg-gray-50">Cal.com <ArrowUpRight className="w-4 h-4" /></a>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="font-semibold text-gray-900 mb-2">Učenje i certifikacije</div>
              <div className="text-sm text-gray-600 mb-4">Praktični kursevi i dokumentacija visokog kvaliteta.</div>
              <div className="flex flex-wrap gap-2">
                <a href="https://developer.mozilla.org/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-gray-700 hover:bg-gray-50">MDN Web Docs <ArrowUpRight className="w-4 h-4" /></a>
                <a href="https://react.dev/learn" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-gray-700 hover:bg-gray-50">React Docs <ArrowUpRight className="w-4 h-4" /></a>
                <a href="https://www.coursera.org/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-gray-700 hover:bg-gray-50">Coursera <ArrowUpRight className="w-4 h-4" /></a>
                <a href="https://www.udemy.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-gray-700 hover:bg-gray-50">Udemy <ArrowUpRight className="w-4 h-4" /></a>
              </div>
            </div>
          </div>
        </div>

        {/* Freelance & Vetted Platforms */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">💼 Freelance & vetted platforme</h3>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex flex-wrap gap-2">
              {[
                ['Upwork','https://www.upwork.com/'],
                ['Fiverr','https://www.fiverr.com/'],
                ['Toptal','https://www.toptal.com/'],
                ['Braintrust','https://www.usebraintrust.com/'],
                ['Contra','https://contra.com/'],
                ['Malt','https://www.malt.com/'],
                ['Lemon.io','https://lemon.io/'],
              ].map(([label, href]) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-gray-700 hover:bg-gray-50">
                  {label} <ArrowUpRight className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Portfolio, CV i LinkedIn */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">🧰 Portfolija, CV i LinkedIn</h3>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex flex-wrap gap-2">
              {[
                ['Reactive Resume','https://rxresu.me/'],
                ['Canva CV','https://www.canva.com/resumes/templates/'],
                ['Novorésumé','https://novoresume.com/'],
                ['Standard Resume','https://standardresume.co/'],
                ['GitHub Pages Portfolio','https://pages.github.com/'],
                ['Behance Portfolio','https://www.behance.net/'],
                ['LinkedIn Learning','https://www.linkedin.com/learning/'],
              ].map(([label, href]) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-gray-700 hover:bg-gray-50">
                  {label} <ArrowUpRight className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Interview prep */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">🧪 Priprema za intervju</h3>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex flex-wrap gap-2">
              {[
                ['LeetCode','https://leetcode.com/'],
                ['HackerRank','https://www.hackerrank.com/'],
                ['Pramp','https://www.pramp.com/'],
                ['Interviewing.io','https://interviewing.io/'],
                ['System Design Primer','https://github.com/donnemartin/system-design-primer'],
                ['Grokking System Design','https://www.designgurus.io/course/grokking-the-system-design-interview'],
              ].map(([label, href]) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-gray-700 hover:bg-gray-50">
                  {label} <ArrowUpRight className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* AI Productivity */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">🤖 AI za produktivnost</h3>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex flex-wrap gap-2">
              {[
                ['Perplexity','https://www.perplexity.ai/'],
                ['ChatGPT','https://chat.openai.com/'],
                ['Claude','https://claude.ai/'],
                ['GitHub Copilot','https://github.com/features/copilot'],
                ['Cursor IDE','https://www.cursor.com/'],
                ['Phind','https://www.phind.com/'],
              ].map(([label, href]) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-gray-700 hover:bg-gray-50">
                  {label} <ArrowUpRight className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Balkan Communities */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">🌍 Balkan zajednice i događaji</h3>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex flex-wrap gap-2">
              {[
                ['Startit','https://startit.rs/'],
                ['HelloWorld.rs forum','https://www.helloworld.rs/forum/'],
                ['ITkonekt','https://it-konekt.com/'],
                ['JS Belgrade','https://www.meetup.com/js-belgrade/'],
                ['PHP Serbia','https://www.phpserbia.org/'],
                ['Laravel Srbija','https://www.facebook.com/groups/laravelsrbija/'],
                ['DevOps Serbia','https://devopsserbia.org/'],
              ].map(([label, href]) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-gray-700 hover:bg-gray-50">
                  {label} <ArrowUpRight className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Design & UX */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">🎨 Design & UX inspiracija</h3>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex flex-wrap gap-2">
              {[
                ['Figma Community','https://www.figma.com/community'],
                ['Refactoring UI','https://refactoringui.com/'],
                ['Mobbin','https://mobbin.com/'],
                ['UI Patterns','https://ui-patterns.com/'],
                ['LottieFiles','https://lottiefiles.com/'],
              ].map(([label, href]) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-gray-700 hover:bg-gray-50">
                  {label} <ArrowUpRight className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Roadmaps & Learning */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">🗺️ Roadmap i učenje</h3>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex flex-wrap gap-2">
              {[
                ['roadmap.sh','https://roadmap.sh/'],
                ['TeachYourselfCS','https://teachyourselfcs.com/'],
                ['OSSU CS','https://github.com/ossu/computer-science'],
                ['Frontend Mentor','https://www.frontendmentor.io/'],
                ['Exercism','https://exercism.org/'],
              ].map(([label, href]) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-gray-700 hover:bg-gray-50">
                  {label} <ArrowUpRight className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Categories Overview */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Kategorije resursa</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories
              .filter((c) => c.value !== 'all')
              .map((category) => {
                const count = mockResources.filter((r: Resource) => r.category === category.value).length;
                return (
                  <div
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-3">{category.icon}</div>
                      <div className="font-semibold text-gray-900 group-hover:text-purple-600">{category.label}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {count} {count === 1 ? 'resurs' : 'resursa'}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Editorial: Plan učenja */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Kadenca</h3>
            <p className="text-sm text-gray-600">5× nedeljno po 45–60 min. Svake nedelje jedna tema i mini projekat.</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Preporuke</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
              <li>Frontend: MDN + React docs</li>
              <li>Design: Figma tut + Design Systems</li>
              <li>PM: Atlassian Agile + Linear guide</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Objavljivanje</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
              <li>Changelog dnevnik (Notion)</li>
              <li>Demo na GitHub Pages/Vercel</li>
              <li>Kratak post na LinkedIn-u</li>
            </ul>
          </div>
        </div>

        {/* Submit Resource CTA */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">💡 Imate korisni resurs?</h2>
            <p className="text-gray-600 mb-6">Podelite ga sa zajednicom i pomozite drugima da napreduju u remote karijeri</p>
            <Link
              href="/predlozi-resurs"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all inline-flex"
            >
              Predloži resurs
            </Link>
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
  );
}

export default ResursiContent;
