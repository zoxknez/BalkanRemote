'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { MapPin, Briefcase, Building2, Users, ExternalLink, Calendar } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Job } from '@/types'
import { formatDate, formatSalary } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface JobCardProps {
  job: Job
  className?: string
}

export function JobCard({ job, className }: JobCardProps) {
  const experienceLevels = {
    entry: 'Početni',
    mid: 'Srednji',
    senior: 'Senior', 
    lead: 'Lead'
  }

  const jobTypes = {
    'full-time': 'Puno radno vreme',
    'part-time': 'Skraćeno radno vreme',
    'contract': 'Ugovor',
    'freelance': 'Freelance',
    'internship': 'Praksa'
  }

  const titleId = `job-title-${job.id}`
  const sourceHost = useMemo(() => {
    try {
      const host = new URL(job.url).host
      return host.replace(/^www\./, '')
    } catch {
      return null
    }
  }, [job.url])

  const brandMap: Record<string, string> = {
    'poslovi.infostud.com': 'Infostud',
    'helloworld.rs': 'HelloWorld',
    'startit.rs': 'Startit',
  }
  const sourceLabel = sourceHost ? (brandMap[sourceHost] ?? sourceHost) : null

  const [visited, setVisited] = useState(false)
  useEffect(() => {
    try {
      const key = `visited:${job.id}`
      // Check existing state
      if (localStorage.getItem(key) === '1') setVisited(true)

      // Intercept link click to mark visited
      // We'll rely on onClick handler on the link below.

    } catch {
      // ignore storage issues
    }
  }, [job.id])

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden focus-within:outline focus-within:outline-2 focus-within:outline-blue-500/40",
        job.featured && "ring-2 ring-blue-500/20 border-blue-200",
        className
      )}
      role="article"
      aria-labelledby={titleId}
    >
      {job.featured && (
        <div className="absolute top-0 left-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 text-xs font-medium" aria-label="Izdvojeni oglas">
          ⭐ Izdvojeno
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {job.companyLogo && (
              <Image
                src={job.companyLogo}
                alt={job.company}
                width={48}
                height={48}
                className="w-12 h-12 rounded-lg object-cover"
                unoptimized
              />
            )}
            <div>
              <h3 id={titleId} className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                {job.title}
              </h3>
              <p className="text-gray-600 flex items-center">
                <Building2 className="w-4 h-4 mr-1" />
                {job.company}
              </p>
            </div>
          </div>
          <div className="text-right">
            <time dateTime={job.postedAt.toISOString()} className="text-sm text-gray-500 flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(job.postedAt)}
            </time>
            {sourceLabel && (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-700 hover:text-blue-700 hover:border-blue-300"
                aria-label={`Otvori izvor: ${sourceLabel}`}
                title={`Otvori izvor: ${sourceLabel}`}
              >
                {sourceLabel}
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {job.location}
          </div>
          <div className="flex items-center">
            <Briefcase className="w-4 h-4 mr-1" />
            {jobTypes[job.type]}
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {experienceLevels[job.experienceLevel]}
          </div>
        </div>

        <p className="text-gray-700 mb-4 line-clamp-3">
          {job.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {job.tags.slice(0, 4).map((tag) => (
            <span 
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
            >
              {tag}
            </span>
          ))}
          {job.tags.length > 4 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-xs">
              +{job.tags.length - 4} više
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-green-600">
            {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
          </div>
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center px-4 py-2 rounded-lg transition-colors text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
              visited ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-blue-600 text-white hover:bg-blue-700"
            )}
            aria-label={`Otvori oglas: ${job.title} — ${job.company}`}
            title={`Otvori izvor: ${(() => { try { return new URL(job.url).host } catch { return job.url } })()}`}
            onClick={() => {
              try {
                localStorage.setItem(`visited:${job.id}`, '1')
                setVisited(true)
              } catch {}
            }}
          >
            Prijavi se
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>
    </motion.div>
  )
}
