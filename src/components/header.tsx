"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Menu, X, Home, Building2, BookOpen, Wrench, Zap, FileText, Briefcase, Heart, MessageCircle, UserPlus, Newspaper } from 'lucide-react'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: 'Početna', href: '/', icon: Home },
    { name: 'Saveti', href: '/saveti', icon: Zap },
    { name: 'Poslovi', href: '/poslovi', icon: Briefcase },
    { name: 'Oglasi', href: '/oglasi', icon: Newspaper },
    { name: 'Poreski vodič', href: '/poreski-vodic', icon: FileText },
    { name: 'Kompanije', href: '/kompanije', icon: Building2 },
    { name: 'Resursi', href: '/resursi', icon: BookOpen },
    { name: 'Alati', href: '/alati', icon: Wrench },
    { name: 'Pitanja', href: '/pitanja', icon: MessageCircle },
    { name: 'Registracija', href: '/nalog?view=register', match: '/nalog', icon: UserPlus },
  ] as const

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      {/* Skip to content */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-[60] bg-blue-600 text-white px-3 py-2 rounded">Preskoči na sadržaj</a>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-4 md:gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Balkan</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-1 items-center justify-center gap-2" role="navigation" aria-label="Glavna navigacija">
            {navigation.map((item) => {
              const Icon = item.icon
              const matchPath = 'match' in item && item.match ? item.match : item.href
              const active = pathname === matchPath || pathname.startsWith(`${matchPath}/`)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
                    active
                      ? 'text-blue-700 border-blue-100'
                      : 'text-gray-600 border-transparent hover:border-blue-100 hover:text-blue-600'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/15 via-blue-600/10 to-purple-500/15 ring-1 ring-blue-500/20"
                      transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10 transition-transform duration-200 group-hover:-translate-y-0.5" />
                  <span className="relative z-10 flex items-center gap-1">
                    {item.name}
                    {item.href === '/oglasi' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/90 text-white font-bold tracking-wide shadow-sm">TEST</span>
                    )}
                  </span>
                </Link>
              )
            })}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0 ml-auto pl-4">
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
              <Heart className="w-4 h-4" />
              <span>Doniraj</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden ml-auto">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors"
              aria-label={isOpen ? 'Zatvori meni' : 'Otvori meni'}
              aria-expanded={isOpen}
              aria-controls="mobile-nav"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
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
              const Icon = item.icon
              const matchPath = 'match' in item && item.match ? item.match : item.href
              const active = pathname === matchPath || pathname.startsWith(`${matchPath}/`)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative flex items-center gap-3 py-2 px-3 rounded-xl border font-medium transition-all duration-200 ${
                    active
                      ? 'text-blue-700 border-blue-100 bg-blue-50'
                      : 'text-gray-700 border-transparent hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50/40'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/15 via-blue-600/10 to-purple-500/15"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10 transition-transform duration-200 group-hover:-translate-y-0.5" />
                  <span className="relative z-10 flex items-center gap-1">
                    {item.name}
                    {item.href === '/oglasi' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/90 text-white font-bold tracking-wide shadow-sm">TEST</span>
                    )}
                  </span>
                </Link>
              )
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
                <span className="inline-flex items-center gap-2 justify-center"><Heart className="w-4 h-4" /> Doniraj</span>
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  )
}
