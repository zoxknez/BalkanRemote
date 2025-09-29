"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  Home,
  Building2,
  BookOpen,
  Wrench,
  Zap,
  FileText,
  Briefcase,
  Heart,
  MessageCircle,
  UserPlus,
  Newspaper,
  Bookmark,
} from "lucide-react";

type NavItem = {
  name: string;
  short?: string; // kraći label za uže širine (opciono)
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  match?: string;
};

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navigation: NavItem[] = [
    { name: "Početna", short: "Početna", href: "/", icon: Home },
    { name: "Saveti", href: "/saveti", icon: Zap },
    { name: "Poslovi", href: "/poslovi", icon: Briefcase },
    { name: "Oglasi", href: "/oglasi", icon: Newspaper },
    { name: "Sačuvano", short: "Sačuvano", href: "/oglasi/bookmarks", icon: Bookmark },
    { name: "Poreski vodič", short: "Poreski", href: "/poreski-vodic", icon: FileText },
    { name: "Kompanije", href: "/kompanije", icon: Building2 },
    { name: "Resursi", href: "/resursi", icon: BookOpen },
    { name: "Alati", href: "/alati", icon: Wrench },
    { name: "Pitanja", href: "/pitanja", icon: MessageCircle },
    { name: "Registracija", short: "Registruj se", href: "/nalog?view=register", match: "/nalog", icon: UserPlus },
  ];

  // --- centriranje: izmeri širinu leve/desne zone i izjednači ih ---
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [sidePx, setSidePx] = useState(0);

  const updateSides = () => {
    const l = leftRef.current?.offsetWidth ?? 0;
    const r = rightRef.current?.offsetWidth ?? 0;
    setSidePx(Math.max(l, r));
  };

  // koristimo layout effect da prvi render ne "trepne" pogrešno
  useLayoutEffect(() => {
    updateSides();
  // ...existing code...
  }, []);

  useEffect(() => {
    updateSides();
    const onResize = () => updateSides();

    // reaktivno na promene sadržaja (CTA/tekst/logo)
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(updateSides);
      if (leftRef.current) ro.observe(leftRef.current);
      if (rightRef.current) ro.observe(rightRef.current);
    }

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
    };
  // ...existing code...
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-[60] bg-blue-600 text-white px-3 py-2 rounded"
      >
        Preskoči na sadržaj
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* FLEX: [left nav right] - simetrično centrirano */}
  <div className="items-center min-h-[4rem] py-2 md:flex md:gap-0 md:justify-between">
          // ...existing code...
          {/* LEVO (logo) */}
          <div ref={leftRef} className="hidden md:flex items-center flex-none">
            <Link href="/" className="flex items-center gap-3 group">
              <span className="relative inline-flex">
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 via-blue-600 to-purple-600 opacity-75 blur-sm transition duration-300 group-hover:opacity-95"
                />
                <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 text-white text-lg font-semibold tracking-tight shadow-lg shadow-blue-500/30 ring-1 ring-white/40">
                  RB
                </span>
              </span>
              <span className="flex items-baseline gap-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-700">
                <span>Remote</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                  Balkan
                </span>
              </span>
            </Link>
          </div>

          {/* NAV (centar) */}
          <nav
            className="hidden md:flex items-center justify-center gap-1.5 xl:gap-2 flex-wrap xl:flex-nowrap mx-auto"
            role="navigation"
            aria-label="Glavna navigacija"
          >
            {navigation.map((item) => {
              const Icon = item.icon;
              const matchPath = item.match ?? item.href;
              const active = pathname === matchPath || pathname.startsWith(`${matchPath}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative inline-flex items-center gap-1 rounded-full border px-2 py-1
                              text-[11px] md:text-xs font-semibold transition-all duration-200
                              shrink min-w-[6.5rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
                                active
                                  ? "text-blue-700 border-blue-100"
                                  : "text-gray-700 border-transparent hover:border-blue-100 hover:text-blue-600"
                              }`}
                  title={item.name}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 via-blue-600/10 to-purple-500/10 ring-1 ring-blue-500/15"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                    />
                  )}
                  <Icon
                    className="w-4 h-4 shrink-0 relative z-10 transition-transform duration-200 group-hover:-translate-y-0.5"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <span className="relative z-10 truncate max-w-[8.5rem] sm:max-w-[10rem] xl:max-w-none">
                    <span className="hidden xl:inline">{item.name}</span>
                    <span className="xl:hidden">{item.short ?? item.name}</span>
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* DESNO (CTA) */}
          <div ref={rightRef} className="hidden md:flex items-center gap-3 flex-none">
          // ...existing code...
            <Link
              href="/poslovi"
              className="inline-flex items-center justify-center h-10 px-5 whitespace-nowrap bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-full font-medium hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
            >
              Traži poslove
            </Link>
            <a
              href="https://paypal.me/o0o0o0o0o0o0o"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Doniraj autoru preko PayPal"
              className="inline-flex items-center justify-center h-10 px-5 whitespace-nowrap gap-2 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 text-white text-sm font-medium hover:shadow-lg hover:scale-[1.02] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40"
            >
              <Heart className="w-4 h-4" aria-hidden />
              <span>Doniraj</span>
            </a>
          </div>

          {/* MOBILE: logo + burger (ispod md se slažu normalno) */}
          <div className="md:hidden flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <span className="relative inline-flex">
                <span aria-hidden className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 via-blue-600 to-purple-600 opacity-75 blur-sm" />
                <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 text-white text-base font-semibold tracking-tight shadow-lg shadow-blue-500/30 ring-1 ring-white/40">
                  RB
                </span>
              </span>
              <span className="text-base font-bold text-gray-900">
                Remote <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Balkan</span>
              </span>
            </Link>

            <div className="ml-auto">
              <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white/95 px-3 py-1.5 text-gray-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                aria-label={isOpen ? "Zatvori meni" : "Otvori meni"}
                aria-expanded={isOpen}
                aria-controls="mobile-nav"
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative flex h-9 w-9 items-center justify-center">
                  {!isOpen && <span className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" aria-hidden />}
                  <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/40">
                    {isOpen ? <X className="w-5 h-5" aria-hidden /> : <Menu className="w-5 h-5" aria-hidden />}
                  </span>
                </span>
                <span className={`text-xs font-semibold uppercase tracking-wide ${isOpen ? "text-blue-600" : "text-gray-700"}`}>
                  Meni
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE NAV */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-white border-b border-gray-200"
          id="mobile-nav"
          role="navigation"
          aria-label="Mobilna navigacija"
        >
          <div className="px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const matchPath = item.match ?? item.href;
              const active = pathname === matchPath || pathname.startsWith(`${matchPath}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex items-center gap-3 py-2 px-3 rounded-xl border font-medium transition-all duration-200 ${
                    active
                      ? "text-blue-700 border-blue-100 bg-blue-50"
                      : "text-gray-700 border-transparent hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50/40"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/15 via-blue-600/10 to-purple-500/15"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                    />
                  )}
                  <Icon
                    className="w-5 h-5 shrink-0 relative z-10 transition-transform duration-200 group-hover:-translate-y-0.5"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              );
            })}
            <div className="pt-4 mt-2 border-t border-gray-200">
              <Link
                href="/poslovi"
                className="block text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium"
                onClick={() => setIsOpen(false)}
              >
                Traži poslove
              </Link>
            </div>
            <div className="pt-3">
              <a
                href="https://paypal.me/o0o0o0o0o0o0o"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-gradient-to-r from-amber-500 to-rose-600 text-white px-6 py-3 rounded-lg font-medium"
              >
                <span className="inline-flex items-center gap-2 justify-center">
                  <Heart className="w-4 h-4" aria-hidden /> Doniraj
                </span>
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}
