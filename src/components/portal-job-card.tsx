'use client'

import { motion } from 'framer-motion'
import { Briefcase, Calendar, MapPin, Globe2, ExternalLink, Building2, Tag, Star, LogIn } from 'lucide-react'
import { PortalJobRecord } from '@/types/jobs'
import { cn, formatDate, formatSalary } from '@/lib/utils'
import { sanitizeHtml } from '@/lib/sanitizeHtml'
import { useEffect, useState } from 'react'
import { getSupabaseClientBrowser } from '@/lib/job-bookmarks'

interface PortalJobCardProps {
  job: PortalJobRecord & { __score?: number }
  searchTerm?: string
}

const experienceLabels: Record<string, string> = {
  entry: 'Početni',
  mid: 'Srednji',
  senior: 'Senior',
  lead: 'Lead',
  executive: 'Executive'
}

const typeLabels: Record<string, string> = {
  'full-time': 'Puno radno vreme',
  'part-time': 'Skraćeno',
  'contract': 'Ugovor',
  'freelance': 'Freelance',
  'internship': 'Praksa'
}

export function PortalJobCard({ job, searchTerm }: PortalJobCardProps) {
  const supabase = getSupabaseClientBrowser()
  const [bookmarked, setBookmarked] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!supabase) return
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return
      const { data, error } = await supabase
        .schema('public')
        .from('job_portal_bookmarks')
        .select('listing_id')
        .eq('listing_id', job.id)
        .eq('user_id', session.session.user.id)
        .maybeSingle()
      if (!mounted) return
      if (!error && data) setBookmarked(true)
    }
    load().catch(()=>{})
    return () => { mounted = false }
  }, [job.id, supabase])

  const toggle = async () => {
    if (!supabase || loading) return
    const { data: session } = await supabase.auth.getSession()
    if (!session.session) {
      // Blagi vizuelni feedback (shake + flash) kada korisnik nije prijavljen
      try {
        const el = document.getElementById(`job-${job.id}-bookmark`)
        if (el) {
          el.classList.remove('animate-[bookmark-warn_600ms_ease]')
          // force reflow
          void el.offsetWidth
          el.classList.add('animate-[bookmark-warn_600ms_ease]')
        }
      } catch {/* ignore */}
      return
    }
    setLoading(true)
    const target = !bookmarked
    setBookmarked(target)
    try {
      if (target) {
        const { error } = await supabase
          .schema('public')
          .from('job_portal_bookmarks')
          .insert({ user_id: session.session.user.id, listing_id: job.id })
        if (error) throw error
        try { window.dispatchEvent(new CustomEvent('job-bookmark-changed', { detail: { id: job.id, added: true } })) } catch {/* ignore */}
      } else {
        const { error } = await supabase
          .schema('public')
          .from('job_portal_bookmarks')
          .delete()
          .eq('user_id', session.session.user.id)
          .eq('listing_id', job.id)
        if (error) throw error
        try { window.dispatchEvent(new CustomEvent('job-bookmark-changed', { detail: { id: job.id, added: false } })) } catch {/* ignore */}
      }
    } catch {
      // revert on error
      setBookmarked(!target)
    } finally {
      setLoading(false)
    }
  }
  const highlight = (text: string | null | undefined) => {
    if (!text) return null
    if (!searchTerm || searchTerm.trim().length < 3) return <>{text}</>
    const safe = searchTerm.trim().replace(/[-/\\^$*+?.()|[\]{}]/g, '')
    if (!safe) return <>{text}</>
    const rx = new RegExp(safe, 'gi')
    const parts = text.split(rx)
    const matches = text.match(rx) || []
    const nodes: React.ReactNode[] = []
    parts.forEach((part, i) => {
      nodes.push(part)
      if (i < matches.length) {
        nodes.push(<mark key={i} className="bg-yellow-200/70 text-gray-900 rounded px-0.5">{matches[i]}</mark>)
      }
    })
    return <>{nodes}</>
  }

  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all',
        job.featured && 'ring-2 ring-blue-500/20 border-blue-200',
        bookmarked && 'border-yellow-400/70'
      )}
      data-job-id={job.id}
    >
      {job.featured && (
        <div className="absolute -top-px -left-px bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1 text-xs font-medium text-white rounded-tr-xl rounded-bl-xl">⭐ Izdvojeno</div>
      )}
      <div className="flex flex-col gap-3">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1 min-w-[60%]">
            <h3 className="font-semibold text-gray-900 text-base group-hover:text-blue-700 transition-colors line-clamp-2">{highlight(job.title)}</h3>
            <p className="text-sm text-gray-600 flex items-center gap-1"><Building2 className="w-4 h-4" /> {highlight(job.company)}</p>
          </div>
          <div className="flex items-start gap-3">
            <time className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(job.posted_at)}</time>
            <div className="relative">
              <button
                id={`job-${job.id}-bookmark`}
                onClick={toggle}
                disabled={loading || !supabase}
                aria-label={bookmarked ? 'Ukloni iz sačuvanih' : 'Sačuvaj oglas'}
                className={cn(
                  'p-1.5 rounded-md border transition text-xs flex items-center justify-center h-8 w-8 outline-none',
                  bookmarked ? 'bg-yellow-400 border-yellow-500 text-white shadow-inner' : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700',
                  loading && 'opacity-60 cursor-wait'
                )}
              >
                <Star className={cn('w-4 h-4', bookmarked ? 'fill-white' : 'fill-none')} />
              </button>
              {/* Tooltip / prompt for not-logged-in case */}
              <AuthlessHint jobId={job.id} />
            </div>
          </div>
        </header>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600">
          {job.location && (
            <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
          )}
          {job.is_remote && (
            <span className="inline-flex items-center gap-1"><Globe2 className="w-3.5 h-3.5" /> Remote</span>
          )}
          {job.type && (
            <span className="inline-flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {typeLabels[job.type] || job.type}</span>
          )}
          {job.experience_level && (
            <span className="inline-flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> {experienceLabels[job.experience_level] || job.experience_level}</span>
          )}
        </div>

        {searchTerm && (job as any).headline ? (
          <p
            className="text-sm text-gray-700 line-clamp-3 leading-relaxed [&_mark]:bg-yellow-200/70 [&_mark]:rounded [&_mark]:px-0.5"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: sanitizeHtml((job as any).headline as string) }}
          />
        ) : job.description && (
          <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
            {highlight(job.description.replace(/\s+/g,' ').trim())}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {job.tags?.slice(0,4).map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-medium tracking-wide">{tag}</span>
          ))}
          {job.tags && job.tags.length > 4 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-[10px]">+{job.tags.length - 4}</span>
          )}
        </div>

        <footer className="flex items-center justify-between pt-1">
          <div className="text-sm font-semibold text-green-600 flex items-center gap-2">
            {formatSalary(job.salary_min ?? undefined, job.salary_max ?? undefined, job.currency ?? undefined)}
            {searchTerm && (job as any).rank !== undefined && (
              <span className="text-[10px] font-normal text-gray-400">rank {(job as any).rank.toFixed(3)}</span>
            )}
          </div>
          <a href={job.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
            Otvori <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </footer>
      </div>
    </motion.article>
  )
}

function AuthlessHint({ jobId }: { jobId: string }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const el = document.getElementById(`job-${jobId}-bookmark`)
    if (!el) return
    const handler = () => {
      // Ako nema supabase clienta ili nema sesije – pokazati hint kratko
      // (provjera izvedena indirektno kroz data attr koje toggle dodaje animacijom)
      // Ovde pojednostavljeno: ako je dugme disabled → verovatno nema supabase env.
      if (el.getAttribute('disabled') !== null) return
      // Detektuj custom anim klasu koju dodajemo kad nema sesije
      if (el.classList.contains('animate-[bookmark-warn_600ms_ease]')) {
        setShow(true)
        setTimeout(() => setShow(false), 2400)
      }
    }
    el.addEventListener('animationstart', handler)
    return () => { el.removeEventListener('animationstart', handler) }
  }, [jobId])
  if (!show) return null
  return (
    <div className="absolute -right-1 top-9 z-30 w-48 rounded-md border border-amber-300 bg-white p-2 shadow-md animate-fade-in text-[11px] leading-snug text-amber-800">
      <div className="flex items-start gap-1">
        <LogIn className="w-3.5 h-3.5 mt-0.5" />
        <span><strong>Prijava potrebna</strong><br />Sačuvaj oglase klikom na zvezdicu nakon prijave.</span>
      </div>
    </div>
  )
}

