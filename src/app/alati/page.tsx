"use client";

import { useState, useMemo, useEffect, Suspense, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCurrentUrl } from "@/hooks/useCurrentUrl";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, ArrowUp } from "lucide-react";
import { ToolCard } from "@/components/tool-card";
import { mockTools } from "@/data/mock-data";
import { ClipboardButton } from "@/components/clipboard-button";
import { InfoTooltip } from "@/components/info-tooltip";
import {
  COPY_LINK_TEXT,
  COPY_LINK_COPIED,
  COPY_LINK_ERROR,
  COPY_LINK_TITLE_FILTERS,
  COPY_LINK_TOOLTIP_FILTERS,
} from "@/data/ui-copy";

const TOOLS_PER_PAGE = 9;

// canonical vrednosti koje očekujemo u tool.category
const CATEGORY_VALUES = [
  "",
  "komunikacija",
  "produktivnost",
  "design",
  "development",
  "project-management",
  "time-tracking",
  "finance",
  "marketing",
  "security",
  "analytics",
  "ai-tools",
  "storage",
  "automation",
] as const;

type CategoryValue = (typeof CATEGORY_VALUES)[number];

const PRICING_VALUES = ["all", "besplatno", "placeno", "freemium"] as const;
type PricingValue = (typeof PRICING_VALUES)[number];

function toKebab(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, "-");
}

function AlatiContent() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryValue>(""); // "" = sve
  const [selectedPricing, setSelectedPricing] = useState<PricingValue>("all");
  const [sortBy, setSortBy] = useState<"rating" | "name">("rating");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const firstLoadRef = useRef(true);
  const currentUrl = useCurrentUrl();

  // memo brojača po kategorijama (O(N) umesto O(N*K) po renderu)
  const countsByCategory = useMemo(() => {
    const m = new Map<string, number>();
    for (const v of CATEGORY_VALUES) m.set(v, 0);
    for (const t of mockTools) {
      const key = (t.category || "").toLowerCase();
      m.set(key, (m.get(key) || 0) + 1);
    }
    return m;
  }, []);

  const categories = useMemo(
    () => [
      { value: "" as CategoryValue, label: "Sve kategorije", icon: "🎯", count: mockTools.length },
      ...CATEGORY_VALUES.filter((v) => v !== "").map((v) => ({
        value: v as CategoryValue,
        label:
          v === "project-management"
            ? "Project Management"
            : v === "time-tracking"
            ? "Time & Analytics"
            : v === "ai-tools"
            ? "AI & Automation"
            : v === "storage"
            ? "Cloud & Storage"
            : v === "development"
            ? "Code & Development"
            : v === "design"
            ? "Kreativni Dizajn"
            : v === "komunikacija"
            ? "Team Komunikacija"
            : v === "produktivnost"
            ? "Produktivnost"
            : v.charAt(0).toUpperCase() + v.slice(1),
        icon:
          v === "komunikacija"
            ? "💬"
            : v === "produktivnost"
            ? "⚡"
            : v === "design"
            ? "🎨"
            : v === "development"
            ? "⚙️"
            : v === "project-management"
            ? "📊"
            : v === "time-tracking"
            ? "⏰"
            : v === "finance"
            ? "💰"
            : v === "marketing"
            ? "📈"
            : v === "security"
            ? "🛡️"
            : v === "analytics"
            ? "📊"
            : v === "ai-tools"
            ? "🤖"
            : v === "storage"
            ? "☁️"
            : "🔄",
        count: countsByCategory.get(v) || 0,
      })),
    ],
    [countsByCategory]
  );

  const pricingOptions = useMemo(
    () => [
      { value: "all" as PricingValue, label: "Sve cene", icon: "💳" },
      { value: "besplatno" as PricingValue, label: "Potpuno Besplatno", icon: "💚", badge: "FREE" },
      { value: "placeno" as PricingValue, label: "Premium Plaćeno", icon: "💎", badge: "PREMIUM" },
      { value: "freemium" as PricingValue, label: "Freemium Model", icon: "🔀", badge: "FREEMIUM" },
    ],
    []
  );

  // filtriranje + sortiranje
  const filteredTools = useMemo(() => {
    // dopusti ?cat=a,b,c (trim + lower)
    const categoryQuery = (params?.get("cat") || params?.get("category")) ?? undefined;
    const categoriesFilter = categoryQuery
      ? categoryQuery
          .split(",")
          .map((x) => x.trim().toLowerCase())
          .filter(Boolean)
      : undefined;

    const q = searchTerm.trim().toLowerCase();

    const tools = mockTools.filter((tool) => {
      const name = tool.name.toLowerCase();
      const desc = tool.description.toLowerCase();
      const feats = (tool.features || []).map((f: string) => f.toLowerCase());

      const matchesSearch = !q || name.includes(q) || desc.includes(q) || feats.some((f: string) => f.includes(q));
      const cat = (tool.category || "").toLowerCase();

      const matchesCategory = categoriesFilter
        ? categoriesFilter.includes(cat)
        : selectedCategory === "" || cat === selectedCategory;

      const matchesPricing = selectedPricing === "all" || tool.pricing === selectedPricing;

      return matchesSearch && matchesCategory && matchesPricing;
    });

    tools.sort((a, b) =>
      sortBy === "rating"
        ? (b.rating || 0) - (a.rating || 0) || a.name.localeCompare(b.name) // tie-breaker
        : a.name.localeCompare(b.name)
    );

    return tools;
  }, [params, searchTerm, selectedCategory, selectedPricing, sortBy]);

  // paginacija
  const totalPages = Math.max(1, Math.ceil(filteredTools.length / TOOLS_PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * TOOLS_PER_PAGE;
  const endIndex = startIndex + TOOLS_PER_PAGE;
  const currentTools = filteredTools.slice(startIndex, endIndex);

  // init iz URL-a (samo jednom)
  useEffect(() => {
    if (!firstLoadRef.current) return;
    firstLoadRef.current = false;

  const q = params?.get("q") || "";
  const cat = (params?.get("cat") || params?.get("category") || "") as CategoryValue;
  const pricing = (params?.get("pricing") || "all") as PricingValue;
  const s = (params?.get("sort") as "rating" | "name" | null) ?? null;
  const page = parseInt(params?.get("page") || "1", 10);

    if (q) setSearchTerm(q);
    if (CATEGORY_VALUES.includes(cat)) setSelectedCategory(cat);
    if (PRICING_VALUES.includes(pricing)) setSelectedPricing(pricing);
    if (s && (s === "rating" || s === "name")) setSortBy(s);
    if (Number.isFinite(page) && page > 0) setCurrentPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Upis filtera u URL (bez suvišnih replace poziva i bez '?' kad nema ničega)
  useEffect(() => {
    const p = new URLSearchParams();
    const setIf = (k: string, v: string | number | boolean) => {
      const s = String(v).trim();
      if (s && s !== "all" && !(k === "page" && s === "1")) p.set(k, s);
    };

    setIf("q", searchTerm);
    setIf("cat", selectedCategory); // "" znači sve → ne pišemo
    setIf("pricing", selectedPricing);
    setIf("sort", sortBy);
    setIf("page", safePage);

  const qs = p.toString();
  const effectivePath = pathname || '/alati';
  const nextUrl = qs ? `${effectivePath}?${qs}` : effectivePath;
  const currUrl = `${effectivePath}${window.location.search}`;

    if (nextUrl !== currUrl) router.replace(nextUrl, { scroll: false });
  }, [searchTerm, selectedCategory, selectedPricing, sortBy, safePage, pathname, router]);

  // reset strane kada glavni filteri promene rezultat
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedPricing]);

  // lagani shimmer
  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 180);
    return () => clearTimeout(t);
  }, [searchTerm, selectedCategory, selectedPricing, sortBy, safePage]);

  // back-to-top
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 320);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toolCategories = [
    { name: "Komunikacija", icon: "💬", tools: ["Slack", "Microsoft Teams", "Discord", "Zoom"], description: "Alati za komunikaciju sa timom" },
    { name: "Produktivnost", icon: "⚡", tools: ["Notion", "Trello", "Asana", "Todoist"], description: "Organizacija posla i povećanje produktivnosti" },
    { name: "Design", icon: "🎨", tools: ["Figma", "Canva", "Adobe Creative Cloud", "Sketch"], description: "Kreiranje vizuelnog sadržaja i UI/UX dizajn" },
    { name: "Development", icon: "⚙️", tools: ["VS Code", "GitHub", "GitLab", "Docker"], description: "Alati za programiranje i development" },
    { name: "Project Management", icon: "📊", tools: ["Jira", "Monday.com", "ClickUp", "Linear"], description: "Upravljanje projektima i timovima" },
    { name: "Time Tracking", icon: "⏰", tools: ["Toggl", "RescueTime", "Clockify", "Time Doctor"], description: "Praćenje radnog vremena" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
                <span className="text-3xl">🛠️</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-3">Alati za remote rad</h1>
            <p className="text-center text-blue-100 text-lg max-w-3xl mx-auto">Najbolji alati koji će vam olakšati remote rad i povećati produktivnost</p>
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
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">🚀 Must-have alati za remote rad iz Balkana</h2>
            <p className="text-indigo-100 mb-6">Alati koji rade odlično u našem regionu i sa našim budžetima</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { icon: "💳", title: "Payoneer/Wise", text: "Primanje plate iz inostranstva" },
                { icon: "📱", title: "Viber/WhatsApp", text: "Komunikacija sa lokalnim timom" },
                { icon: "⚡", title: "UPS + Backup net", text: "Kontinuiran rad bez prekida" },
                { icon: "🌍", title: "VPN + Grammarly", text: "Pristup i komunikacija" },
              ].map((x) => (
                <div key={x.title} className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl mb-2">{x.icon}</div>
                  <div className="font-semibold">{x.title}</div>
                  <div className="text-sm text-indigo-100">{x.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pretraga i filteri */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="tools-search"
                  aria-label="Pretražite alate"
                  type="text"
                  placeholder="Pretražite alate po nazivu ili funkcionalnosti..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full min-w-[240px] pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
              <select
                id="tools-category"
                aria-label="Kategorija"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as CategoryValue)}
                className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent whitespace-nowrap"
              >
                {categories.map((c) => (
                  <option key={c.value || "all"} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>

              <select
                id="tools-pricing"
                aria-label="Cena"
                value={selectedPricing}
                onChange={(e) => setSelectedPricing(e.target.value as PricingValue)}
                className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent whitespace-nowrap"
              >
                {pricingOptions.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>

              <select
                id="tools-sort"
                aria-label="Sortiranje"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "rating" | "name")}
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
                <InfoTooltip text={COPY_LINK_TOOLTIP_FILTERS} label="Šta radi 'Kopiraj link'" title="Objašnjenje opcije 'Kopiraj link'" />
              </div>
            </div>
          </div>
        </div>

        {/* Kategorije (pregled) */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Kategorije alata</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => setSelectedCategory(toKebab(category.name) as CategoryValue)}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {category.tools.slice(0, 2).map((tool) => (
                      <span key={tool} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {tool}
                      </span>
                    ))}
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">+{category.tools.length - 2} više</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Editor's picks / stackovi */}
        {/* ... (tvoj postojeći sadržaj ispod ostaje isti — skraćeno zbog mesta) ... */}

        {/* GRID alata */}
        {filteredTools.length > 0 ? (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <AnimatePresence mode="popLayout">
                {isLoading
                  ? Array.from({ length: TOOLS_PER_PAGE }).map((_, i) => <div key={i} className="h-48 rounded-xl border border-gray-200 bg-gray-100 animate-pulse" />)
                  : currentTools.map((tool, index) => (
                      <motion.div key={tool.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                        <ToolCard tool={tool} />
                      </motion.div>
                    ))}
              </AnimatePresence>
            </motion.div>

            {/* paginacija */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8 mb-8">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={safePage === 1}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Prethodna
                </button>

                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const isActive = pageNum === safePage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isActive ? "bg-blue-600 text-white" : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={safePage === totalPages}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sledeća
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}

            <div className="text-center text-sm text-gray-600 mb-8">
              Prikazano {startIndex + 1}-{Math.min(endIndex, filteredTools.length)} od {filteredTools.length} alata
              {safePage > 1 && ` (strana ${safePage} od ${totalPages})`}
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
            <div className="text-6xl mb-4">🛠️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nema alata za vašu pretragu</h3>
            <p className="text-gray-600 mb-6">Pokušajte sa drugačijim kriterijumima ili nam predložite novi alat</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
                setSelectedPricing("all");
                setSortBy("rating");
                setCurrentPage(1);
                router.replace(pathname || '/alati', { scroll: false });
              }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Obriši filtere
            </button>
          </motion.div>
        )}
      </div>

      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700 transition-colors"
          aria-label="Na vrh"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export default function AlatiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AlatiContent />
    </Suspense>
  );
}
