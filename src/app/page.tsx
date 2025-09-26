'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Globe2, Zap, Cpu, Network, Orbit } from 'lucide-react';

import { stats, valueProps, heroHighlights, balkanHighlights } from './(home)/constants';

function HomeInner() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Animated background */}
      <div className="fixed inset-0 -z-20">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/50 to-purple-950/30" />
        <div className="absolute left-1/4 top-0 h-96 w-96 animate-pulse rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-80 w-80 animate-pulse rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 animate-pulse rounded-full bg-pink-500/20 blur-3xl" />
        {/* Ako nemaš plugin za bg-grid-white, možeš ostaviti ovu liniju ili ukloniti bez greške */}
        <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]" />
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

      <section className="relative py-24 sm:py-32">
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
              <span className="text-sm font-medium text-green-100">🇷🇸🇭🇷🇧🇦🇲🇪 REMOTE WORK HUB ZA BALKAN</span>
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
            <div className="mt-16 flex flex-wrap items-center justify-center gap-4">
              {heroHighlights.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="group relative"
                  >
                    <div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-xl ${
                        item.pulse ? 'animate-pulse' : ''
                      }`}
                    />
                    <div className="relative rounded-2xl border border-slate-700/50 bg-slate-900/50 px-6 py-3 backdrop-blur-xl">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 p-2">
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-slate-200">{item.label}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-2 gap-6 md:grid-cols-4">
              {stats.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative overflow-hidden rounded-3xl border border-slate-800/50 bg-slate-900/30 p-6 backdrop-blur-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative text-center">
                    <div className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                      {item.value}
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-300">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Vrednosti / kartice --- */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-300 backdrop-blur-xl">
              <Network className="h-4 w-4" />
              PRAKTIČNI VODIČI I ALATI
            </div>
            <h2 className="mt-6 bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              Platforma za remote rad iz Balkana
            </h2>
            <p className="mt-3 text-slate-400">
              Sve na jednom mestu: porezi i banke, kalkulatori, kompanije i saveti za uspešan remote rad iz regiona.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {valueProps.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative overflow-hidden rounded-3xl border border-slate-800/50 bg-slate-900/20 p-8 backdrop-blur-xl transition-all hover:-translate-y-2"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.glow} opacity-0 transition-opacity duration-500 group-hover:opacity-10`} />
                  <div className={`absolute -right-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br ${item.glow} opacity-20 blur-3xl transition-all duration-500 group-hover:opacity-40`} />

                  <div className="relative mb-6">
                    <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.glow} shadow-2xl`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.glow} opacity-50 blur-xl`} />
                  </div>

                  <h3 className="mb-4 text-xl font-bold text-white">{item.title}</h3>
                  <p className="mb-6 text-sm leading-relaxed text-slate-400">{item.description}</p>

                  <div className="space-y-3">
                    {item.points.map((point, pointIndex) => (
                      <motion.div
                        key={point}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + pointIndex * 0.05 + 0.3 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-3 text-xs text-slate-300"
                      >
                        <div className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${item.glow}`} />
                        <span>{point}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="absolute inset-0 rounded-3xl border border-transparent bg-gradient-to-r from-transparent via-slate-700/50 to-transparent p-px opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="h-full w-full rounded-3xl bg-slate-900/50" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- Istaknuti moduli --- */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(56,189,248,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.15),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 px-4 py-2 text-sm font-semibold text-cyan-300 backdrop-blur-xl">
              <Cpu className="h-4 w-4" />
              KLJUČNI MODULI
            </div>
            <h2 className="mt-6 bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              Najtraženiji alati i kalkulatori
            </h2>
            <p className="mt-3 text-slate-400">
              Brzi pristup salary/tax kalkulatoru i vodičima relevantnim za Srbiju, Hrvatsku, BiH, Crnu Goru, Albaniju i Severnu Makedoniju.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {balkanHighlights.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link href={card.href} className="group block h-full">
                    <div className="relative h-full overflow-hidden rounded-3xl border border-slate-800/50 bg-slate-900/20 p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-slate-700/50">
                      <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-20`} />
                      <div className={`absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br ${card.gradient} opacity-20 blur-3xl transition-all duration-500 group-hover:opacity-40`} />

                      <div className="relative flex items-start justify-between">
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-800/50 px-3 py-1 text-xs font-bold text-slate-300 backdrop-blur">
                          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                          {card.badge}
                        </div>
                        <div className={`relative rounded-2xl bg-gradient-to-br ${card.gradient} p-3 shadow-2xl`}>
                          <Icon className="h-6 w-6 text-white" />
                          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.gradient} opacity-50 blur-xl`} />
                        </div>
                      </div>

                      <div className="relative mt-8">
                        <h3 className="mb-4 text-2xl font-bold text-white">{card.title}</h3>
                        <p className="mb-8 text-sm leading-relaxed text-slate-400">{card.description}</p>

                        <div className="flex items-center gap-2 text-sm font-semibold text-white transition-colors group-hover:text-cyan-300">
                          <span>Otvori</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>

                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- Završni CTA blok --- */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent" />
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[40px] border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/60 p-12 backdrop-blur-xl"
          >
            {/* Holographic effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10" />
            <div className="absolute -left-32 top-0 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
            <div className="absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

            {/* Scan lines */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(6,182,212,0.03)_50%,transparent_100%)] bg-[length:60px_100%] animate-pulse" />

            <div className="relative text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-300 backdrop-blur"
              >
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                Spremno za upotrebu
              </motion.div>

              <h2 className="mt-6 bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                Kreni sa svojom remote karijerom
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-base text-slate-400 sm:text-lg">
                Otvori kalkulatore, pogledaj resurse i kompanije koje zapošljavaju iz regiona.
                Sve što trebaš za sledeći korak na jednom mestu.
              </p>

              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href="/resursi">
                  <motion.div
                    whileHover={{ scale: 1.05, boxShadow: '0 25px 50px -12px rgba(6, 182, 212, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 p-1"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-75 blur-xl" />
                    <div className="relative rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4">
                      <div className="flex items-center gap-3 text-lg font-semibold text-white">
                        <Orbit className="h-5 w-5" />
                        OTKRIJ RESURSE
                      </div>
                    </div>
                  </motion.div>
                </Link>

                <Link href="/kompanije">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="group rounded-2xl border border-slate-700/50 bg-slate-800/30 px-8 py-4 backdrop-blur-xl transition-all hover:border-purple-500/50 hover:bg-purple-500/10"
                  >
                    <div className="flex items-center gap-3 text-lg font-semibold text-slate-300 group-hover:text-purple-300">
                      <Network className="h-5 w-5" />
                      POGLEDAJ KOMPANIJE
                    </div>
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-400">Učitavanje…</div>}>
      <HomeInner />
    </Suspense>
  );
}

