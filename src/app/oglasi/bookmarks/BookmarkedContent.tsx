"use client"
import { usePortalJobs } from '@/hooks/usePortalJobs'
import { PortalJobCard } from '@/components/portal-job-card'
import { Loader2, Bookmark } from 'lucide-react'
import { useEffect } from 'react'

export default function BookmarkedContent() {
  const { jobs, loading, error, updateFilters, filters } = usePortalJobs({ mode: 'bookmarks', limit: 200 })
  useEffect(() => {
    // ensure mode stays bookmarks if parent hot-reloads
    if (filters.mode !== 'bookmarks') updateFilters({ mode: 'bookmarks' })
  }, [filters.mode, updateFilters])
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-xl bg-yellow-100 text-yellow-700"><Bookmark className="w-6 h-6" /></div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Sačuvani oglasi</h1>
          <p className="text-sm text-gray-600">Privatna kolekcija poslova koje želiš da pratiš (zahteva prijavu).</p>
        </div>
      </div>
      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">Greška: {error}</div>
      )}
      {loading && jobs.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600"><Loader2 className="w-4 h-4 animate-spin" /> Učitavanje…</div>
      )}
      {!loading && jobs.length === 0 && !error && (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-600">Nema sačuvanih oglasa. Klikni zvezdicu na listi oglasa da dodaš.</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map(j => <PortalJobCard key={j.id} job={j} />)}
      </div>
    </div>
  )
}
