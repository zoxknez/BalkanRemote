'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Globe2, Zap } from 'lucide-react';

import { stats, heroHighlights } from './constants';

function HomeInner() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#123a85] text-slate-100">
      {/* Animated background */}
      <div className="fixed inset-0 -z-20">
        <div className="absolute inset-0 bg-[#123a85]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent opacity-60" />
        <div className="absolute left-1/4 top-0 h-96 w-96 animate-pulse rounded-full bg-[#1d5cc2]/25 blur-3xl" />
        <div className="absolute right-1/5 top-1/3 h-80 w-80 animate-pulse rounded-full bg-[#1d5cc2]/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 animate-pulse rounded-full bg-[#0f2f6d]/30 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(18,58,133,0.35),transparent_65%)]" />
      </div>

      {/* Neural network overlay */}
      <div className="fixed inset-0 -z-10">
        <svg className="h-full w-full opacity-30" viewBox="0 0 1000 1000" fill="none">
          <defs>
            <linearGradient id="neural" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <g stroke="url(#neural)" strokeWidth="1" fill="none">
            <circle cx="100" cy="150" r="3" />
            <circle cx="300" cy="100" r="2" />
            <circle cx="500" cy="200" r="4" />
            <circle cx="700" cy="120" r="2" />
            <circle cx="900" cy="180" r="3" />
            <line x1="100" y1="150" x2="300" y2="100" opacity="0.5" />
            <line x1="300" y1="100" x2="500" y2="200" opacity="0.4" />
            <line x1="500" y1="200" x2="700" y2="120" opacity="0.6" />
            <line x1="700" y1="120" x2="900" y2="180" opacity="0.3" />
            <circle cx="150" cy="400" r="2" />
            <circle cx="350" cy="450" r="3" />
            <circle cx="550" cy="380" r="2" />
            <circle cx="750" cy="420" r="4" />
            <line x1="150" y1="400" x2="350" y2="450" opacity="0.4" />
            <line x1="350" y1="450" x2="550" y2="380" opacity="0.5" />
            <line x1="550" y1="380" x2="750" y2="420" opacity="0.3" />
          </g>
        </svg>
      </div>

      <section className="relative pt-16 pb-24 sm:pt-20 sm:pb-32">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-5xl text-center"
          >
            {/* Status indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mx-auto mb-8 flex w-fit items-center gap-3 rounded-full border border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10 px-6 py-3 backdrop-blur-xl"
            >
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-75" />
                <div className="relative h-3 w-3 rounded-full bg-green-400" />
              </div>
              <span className="text-sm font-medium text-green-100">🇷🇸🇭🇷🇧🇦🇲🇪🇦🇱🇲🇰 REMOTE WORK HUB ZA BALKAN</span>
            </motion.div>

            <h1 className="bg-gradient-to-r from-white via-green-200 to-blue-300 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-7xl">
              REMOTE BALKAN
              <br />
              <span className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                CAREER HUB
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
              Kompletan vodič za remote rad iz Srbije, Hrvatske, BiH, Crne Gore, Albanije i Severne Makedonije.
              <span className="text-green-400"> Praktični saveti</span>,<span className="text-blue-400"> poreske optimizacije</span> i
              <span className="text-purple-400"> balkanske IT kompanije</span>.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
              <Link href="/saveti">
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: '0 25px 50px -12px rgba(34, 197, 94, 0.5)' }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-75 blur-xl" />
                  <div className="relative rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-4">
                    <div className="flex items-center gap-3 text-lg font-semibold text-white">
                      <Zap className="h-5 w-5" />
                      POČNI SA REMOTE RADOM
                    </div>
                  </div>
                </motion.div>
              </Link>

              <Link href="/poreski-vodic">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="group rounded-2xl border border-slate-600/50 bg-slate-900/50 px-8 py-4 backdrop-blur-xl transition-all hover:border-blue-500/50 hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-3 text-lg font-semibold text-slate-200 group-hover:text-blue-300">
                    <Globe2 className="h-5 w-5" />
                    IZRAČUNAJ ZARADU
                  </div>
                </motion.div>
              </Link>
            </div>

            {/* Tech highlights */}
            <div className="mt-14">
              <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {heroHighlights.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.08] p-6 backdrop-blur-xl shadow-[0_20px_45px_-25px_rgba(15,23,42,0.8)]"
                    >
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      <div className="relative flex items-center gap-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg ${
                            item.pulse ? 'ring-4 ring-cyan-400/40 ring-offset-2 ring-offset-[#123a85]' : ''
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-base font-semibold text-white">{item.label}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-16">
              <div className="mx-auto grid max-w-5xl grid-cols-2 gap-5 md:grid-cols-4">
                {stats.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.07] p-6 text-center backdrop-blur-xl shadow-[0_20px_45px_-25px_rgba(15,23,42,0.9)]"
                  >
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/15 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="relative">
                      <div className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                        {item.value}
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-100">{item.label}</p>
                      <p className="text-xs text-slate-200/70">{item.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default function HomeView() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-400">Učitavanje…</div>}>
      <HomeInner />
    </Suspense>
  );
}
