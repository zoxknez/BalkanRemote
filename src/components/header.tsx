'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Menu, X, Home, Building2, BookOpen, Wrench, Zap, FileText, Briefcase, Heart } from 'lucide-react'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  const navigation = [
    { name: 'Početna', href: '/', icon: Home },
    { name: 'Saveti', href: '/saveti', icon: Zap },
    { name: 'Poslovi', href: '/poslovi', icon: Briefcase },
  { name: 'Poreski vodič', href: '/poreski-vodic', icon: FileText },
    { name: 'Kompanije', href: '/kompanije', icon: Building2 },
    { name: 'Resursi', href: '/resursi', icon: BookOpen },
    { name: 'Alati', href: '/alati', icon: Wrench }
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
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
          <nav className="hidden md:flex items-center space-x-6" role="navigation" aria-label="Glavna navigacija">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors font-medium whitespace-nowrap"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/poslovi"
              className="inline-flex items-center justify-center h-9 px-4 whitespace-nowrap bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg font-medium hover:shadow-lg transition-all duration-200"
            >
              Traži poslove
            </Link>
            <a
              href="https://paypal.me/o0o0o0o0o0o0o"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Doniraj autoru preko PayPal"
              className="inline-flex items-center justify-center h-9 px-4 whitespace-nowrap gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-rose-600 text-white text-sm font-medium hover:shadow-lg hover:scale-[1.02] transition-all"
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
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
            <div className="pt-4">
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
