"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Menu, X, Home, Building2, BookOpen, Wrench, Zap, FileText, Briefcase, Heart, MessageCircle } from 'lucide-react'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: 'Početna', href: '/', icon: Home },
    { name: 'Saveti', href: '/saveti', icon: Zap },
    { name: 'Poslovi', href: '/poslovi', icon: Briefcase },
  { name: 'Poreski vodič', href: '/poreski-vodic', icon: FileText },
    { name: 'Kompanije', href: '/kompanije', icon: Building2 },
    { name: 'Resursi', href: '/resursi', icon: BookOpen },
    { name: 'Alati', href: '/alati', icon: Wrench },
    { name: 'Pitanja', href: '/pitanja', icon: MessageCircle }
  ]

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      {/* Skip to content */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-[60] bg-blue-600 text-white px-3 py-2 rounded">Preskoči na sadržaj</a>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">RB</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Remote Balkan</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2" role="navigation" aria-label="Glavna navigacija">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative inline-flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
                    active ? 'text-gray-900' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-md bg-white"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
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
          <div className="md:hidden">
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
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex items-center gap-2 py-2 px-3 rounded-md font-medium transition hover:scale-[1.01] ${
                    active ? 'text-gray-900' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-md bg-white"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{item.name}</span>
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
