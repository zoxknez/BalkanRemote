import React, { Suspense } from 'react'
import type { Metadata } from 'next'
import { AlertCircle, CheckCircle2, RefreshCcw, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Oglasi – status izvora',
  description: 'Status kolekcije izvora za agregirane oglase',
  robots: { index: false, follow: false },
}

// Admin page should be dynamic to avoid build-time prerender hitting internal APIs
export const dynamic = 'force-dynamic'

async function fetchStats() {
  // Relative fetch radi u server komponenti i koristi internu Next fetch logiku + revalidate.
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('Feed stats disabled: SUPABASE_SERVICE_ROLE_KEY not set. Returning empty dataset.')
    return [] as Array<{
      source_id: string
      last_success_at: string | null
      last_error_at: string | null
      success_count: number
      failure_count: number
      updated_at: string
      metadata?: { lastErrorMessage?: string }
    }>
  }
  const headers: Record<string,string> = {}
  if (process.env.FEED_STATS_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.FEED_STATS_TOKEN}`
  }
  const res = await fetch('/api/portal-jobs/stats', { next: { revalidate: 60 }, headers })
  if (!res.ok) {
    throw new Error('Failed to load stats')
  }
  const json = await res.json()
  return json.data as Array<{
    source_id: string
    last_success_at: string | null
    last_error_at: string | null
    success_count: number
    failure_count: number
    updated_at: string
    metadata?: { lastErrorMessage?: string }
  }>
}

function formatTs(ts: string | null) {
  if (!ts) return '—'
  const d = new Date(ts)
  return d.toLocaleString('sr-RS', { hour12: false })
}

async function StatsTable() {
  const rows = await fetchStats()
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
          <tr>
            <th className="px-4 py-3 text-left">Source</th>
            <th className="px-4 py-3 text-left">Last success</th>
            <th className="px-4 py-3 text-left">Last error</th>
            <th className="px-4 py-3 text-right">Success</th>
            <th className="px-4 py-3 text-right">Fail</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-right">Rate</th>
            <th className="px-4 py-3 text-left">Message</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const hasRecentError = !!r.last_error_at && (!r.last_success_at || new Date(r.last_error_at) > new Date(r.last_success_at))
            const lastSuccessAgeMs = r.last_success_at ? Date.now() - new Date(r.last_success_at).getTime() : Infinity
            const isStale = !hasRecentError && lastSuccessAgeMs > 1000 * 60 * 60 * 48 // > 48h
            const totalRuns = r.success_count + r.failure_count
            const successRate = totalRuns === 0 ? 0 : (r.success_count / totalRuns)
            return (
              <tr key={r.source_id} className="border-t last:border-b hover:bg-gray-50/60">
                <td className="px-4 py-2 font-mono text-xs">{r.source_id}</td>
                <td className="px-4 py-2">{formatTs(r.last_success_at)}</td>
                <td className="px-4 py-2 text-red-600">{formatTs(r.last_error_at)}</td>
                <td className="px-4 py-2 text-right text-emerald-600 font-medium">{r.success_count}</td>
                <td className="px-4 py-2 text-right text-red-600 font-medium">{r.failure_count}</td>
                <td className="px-4 py-2">
                  {hasRecentError ? (
                    <span className="inline-flex items-center gap-1 text-red-600 text-xs font-semibold" title={r.metadata?.lastErrorMessage || 'Error'}><AlertCircle className="w-3 h-3"/> ERR</span>
                  ) : isStale ? (
                    <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-semibold" title="No recent successful run in >48h"><Clock className="w-3 h-3"/> STALE</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold" title="Healthy"><CheckCircle2 className="w-3 h-3"/> OK</span>
                  )}
                </td>
                <td className="px-4 py-2 text-right text-xs tabular-nums" title={`${(successRate * 100).toFixed(2)}%`}>{(successRate * 100).toFixed(1)}%</td>
                <td className="px-4 py-2 text-xs text-gray-600 max-w-[240px] truncate" title={r.metadata?.lastErrorMessage || ''}> {r.metadata?.lastErrorMessage || ''}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function OglasiStatsPage() {
  if (!process.env.NEXT_PUBLIC_ENABLE_FEED_STATS) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center text-sm text-gray-500">
        Statistika feedova je isključena. (Feature flag: NEXT_PUBLIC_ENABLE_FEED_STATS)
      </div>
    )
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center text-sm text-gray-500">
        Feed statistika je privremeno nedostupna jer nije definisan server-side ključ.<br />
        Postavi <code>SUPABASE_SERVICE_ROLE_KEY</code> u Vercel okruženju da bi ova stranica radila.
      </div>
    )
  }
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <RefreshCcw className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold tracking-tight">Oglasi – Feed Health</h1>
      </div>
      <p className="text-sm text-gray-600 mb-6">Pregled uspeha i grešaka pri dnevnoj agregaciji. Podaci se keširaju 60s. (Feature flag: NEXT_PUBLIC_ENABLE_FEED_STATS)</p>
      <Suspense fallback={<div className="text-sm text-gray-500">Učitavanje...</div>}>
        <StatsTable />
      </Suspense>
    </div>
  )
}