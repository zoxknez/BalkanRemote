import React, { Suspense } from 'react'
import { AlertCircle, CheckCircle2, RefreshCcw } from 'lucide-react'

async function fetchStats() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/portal-jobs/stats`, { next: { revalidate: 60 } })
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
    metadata?: any
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
            <th className="px-4 py-3 text-left">Message</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const hasRecentError = !!r.last_error_at && (!r.last_success_at || new Date(r.last_error_at) > new Date(r.last_success_at))
            return (
              <tr key={r.source_id} className="border-t last:border-b hover:bg-gray-50/60">
                <td className="px-4 py-2 font-mono text-xs">{r.source_id}</td>
                <td className="px-4 py-2">{formatTs(r.last_success_at)}</td>
                <td className="px-4 py-2 text-red-600">{formatTs(r.last_error_at)}</td>
                <td className="px-4 py-2 text-right text-emerald-600 font-medium">{r.success_count}</td>
                <td className="px-4 py-2 text-right text-red-600 font-medium">{r.failure_count}</td>
                <td className="px-4 py-2">
                  {hasRecentError ? (
                    <span className="inline-flex items-center gap-1 text-red-600 text-xs font-semibold"><AlertCircle className="w-3 h-3"/> ERR</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold"><CheckCircle2 className="w-3 h-3"/> OK</span>
                  )}
                </td>
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
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <RefreshCcw className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold tracking-tight">Oglasi – Feed Health</h1>
      </div>
      <p className="text-sm text-gray-600 mb-6">Pregled uspeha i grešaka pri dnevnoj agregaciji. Podaci se keširaju 60s.</p>
      <Suspense fallback={<div className="text-sm text-gray-500">Učitavanje...</div>}>
        <StatsTable />
      </Suspense>
    </div>
  )
}