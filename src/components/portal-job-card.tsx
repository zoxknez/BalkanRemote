'use client'

import { motion } from 'framer-motion'
import { Briefcase, Calendar, MapPin, Globe2, ExternalLink, Building2, Tag } from 'lucide-react'
import { PortalJobRecord } from '@/types/jobs'
import { cn, formatDate, formatSalary } from '@/lib/utils'

interface PortalJobCardProps {
  job: PortalJobRecord
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

export function PortalJobCard({ job }: PortalJobCardProps) {
  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all',
        job.featured && 'ring-2 ring-blue-500/20 border-blue-200'
      )}
    >
      {job.featured && (
        <div className="absolute -top-px -left-px bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1 text-xs font-medium text-white rounded-tr-xl rounded-bl-xl">⭐ Izdvojeno</div>
      )}
      <div className="flex flex-col gap-3">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-base group-hover:text-blue-700 transition-colors line-clamp-2">{job.title}</h3>
            <p className="text-sm text-gray-600 flex items-center gap-1"><Building2 className="w-4 h-4" /> {job.company}</p>
          </div>
          <time className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(job.posted_at)}</time>
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

        {job.description && (
          <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
            {job.description.replace(/\s+/g,' ').trim()}
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
          <div className="text-sm font-semibold text-green-600">
            {formatSalary(job.salary_min ?? undefined, job.salary_max ?? undefined, job.currency ?? undefined)}
          </div>
          <a href={job.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
            Otvori <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </footer>
      </div>
    </motion.article>
  )
}
