'use client'

import { motion } from 'framer-motion'
import { Briefcase, Calendar, MapPin, Globe2, ExternalLink, Building2, Tag, Star, LogIn } from 'lucide-react'
import { HybridJob } from '@/hooks/useHybridJobs'
import { cn, formatDate, formatSalary } from '@/lib/utils'
import { sanitizeHtml } from '@/lib/sanitizeHtml'
import { useEffect, useState } from 'react'
import { getSupabaseClientBrowser } from '@/lib/job-bookmarks'

interface HybridJobCardProps {
  job: HybridJob
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

const workTypeLabels: Record<string, string> = {
  'hybrid': 'Hibridno',
  'onsite': 'U kancelariji',
  'flexible': 'Fleksibilno',
  'remote-optional': 'Remote opciono'
}

export function HybridJobCard({ job, searchTerm }: HybridJobCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)

  useEffect(() => {
    const checkBookmark = async () => {
      try {
        const supabase = getSupabaseClientBrowser()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('job_bookmarks')
          .select('id')
          .eq('user_id', user.id)
          .eq('job_id', job.id)
          .single()

        setIsBookmarked(!!data)
      } catch {
        // Ignore errors
      }
    }
    checkBookmark()
  }, [job.id])

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setBookmarkLoading(true)
    try {
      const supabase = getSupabaseClientBrowser()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Show login prompt or redirect
        return
      }

      if (isBookmarked) {
        await supabase
          .from('job_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('job_id', job.id)
      } else {
        await supabase
          .from('job_bookmarks')
          .insert({
            user_id: user.id,
            job_id: job.id,
            job_title: job.title,
            company_name: job.company_name,
            created_at: new Date().toISOString()
          })
      }

      setIsBookmarked(!isBookmarked)
    } catch (error) {
      console.error('Bookmark error:', error)
    } finally {
      setBookmarkLoading(false)
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="space-y-4">
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {searchTerm ? (
                <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(job.title) }} />
              ) : (
                job.title
              )}
            </h3>
            {job.company_name && (
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                <Building2 className="w-4 h-4" />
                <span className="font-medium">{job.company_name}</span>
                {job.company_website && (
                  <a 
                    href={job.company_website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>
          <button
            onClick={handleBookmark}
            disabled={bookmarkLoading}
            className={cn(
              "rounded-full p-2 transition-colors",
              isBookmarked 
                ? "bg-amber-50 text-amber-600 hover:bg-amber-100" 
                : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-amber-600"
            )}
            title={isBookmarked ? "Ukloni iz sačuvanih" : "Sačuvaj oglas"}
          >
            <Star className={cn("w-4 h-4", isBookmarked && "fill-current")} />
          </button>
        </header>

        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
          {job.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {job.location}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Globe2 className="w-3.5 h-3.5" /> {workTypeLabels[job.work_type] || job.work_type}
          </span>
          {job.employment_type && (
            <span className="inline-flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" /> {typeLabels[job.employment_type] || job.employment_type}
            </span>
          )}
          {job.experience_level && (
            <span className="inline-flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> {experienceLabels[job.experience_level] || job.experience_level}
            </span>
          )}
        </div>

        {searchTerm && (job as any).headline ? (
          <p
            className="text-sm text-gray-700 line-clamp-3 leading-relaxed [&_mark]:bg-yellow-200/70 [&_mark]:rounded [&_mark]:px-0.5"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml((job as any).headline || '') }}
          />
        ) : job.description && (
          <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
            {job.description}
          </p>
        )}

        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, 6).map(skill => (
              <span key={skill} className="inline-block rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                {skill}
              </span>
            ))}
            {job.skills.length > 6 && (
              <span className="inline-block rounded-full bg-gray-50 px-2 py-1 text-xs text-gray-500">
                +{job.skills.length - 6} više
              </span>
            )}
          </div>
        )}

        <footer className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {job.posted_date && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(job.posted_date)}
              </span>
            )}
            {job.source_name && (
              <span className="inline-flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                {job.source_name}
              </span>
            )}
            {(job.salary_min || job.salary_max) && (
              <span className="font-medium text-green-600">
                {formatSalary(job.salary_min ?? undefined, job.salary_max ?? undefined, job.salary_currency ?? undefined)}
              </span>
            )}
          </div>
          {job.application_url && (
            <a 
              href={job.application_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Otvori <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </footer>
      </div>
    </motion.article>
  )
}

function AuthlessHint({ jobId }: { jobId: string }) {
  return (
    <div className="mt-2 rounded-md bg-blue-50 p-3 text-center">
      <div className="flex items-center justify-center gap-2 text-sm text-blue-700">
        <LogIn className="w-4 h-4" />
        <span>
          <a href="/nalog" className="font-medium underline hover:no-underline">
            Uloguj se
          </a>{' '}
          da sačuvaš oglas
        </span>
      </div>
    </div>
  )
}