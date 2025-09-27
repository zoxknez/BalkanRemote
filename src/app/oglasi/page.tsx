'use client'
import OglasiContent from './OglasiContent'
import { useEffect, useState } from 'react'

interface JobLite {
  id: string
  title: string
  company: string
  url: string
  posted_at: string
  type: string | null
  location: string | null
  salary_min: number | null
  salary_max: number | null
  currency: string | null
}

function JobSchemaInjector() {
  const [jobs, setJobs] = useState<JobLite[]>([])
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_ENABLE_JOB_SCHEMA) return
    // Fetch first 5 jobs (no filters) for structured data
    const controller = new AbortController()
    fetch('/api/portal-jobs?limit=5', { signal: controller.signal })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data?.jobs) return
        const mapped: JobLite[] = json.data.jobs.map((j: any) => ({
          id: j.id,
            title: j.title,
            company: j.company,
            url: j.url,
            posted_at: j.posted_at,
            type: j.type,
            location: j.location,
            salary_min: j.salary_min,
            salary_max: j.salary_max,
            currency: j.currency,
        }))
        setJobs(mapped)
      }).catch(() => {})
    return () => controller.abort()
  }, [])

  if (!process.env.NEXT_PUBLIC_ENABLE_JOB_SCHEMA || jobs.length === 0) return null

  const items = jobs.map(j => {
    const base: Record<string, any> = {
      '@context': 'https://schema.org/',
      '@type': 'JobPosting',
      title: j.title,
      datePosted: j.posted_at,
      hiringOrganization: { '@type': 'Organization', name: j.company },
      employmentType: j.type || 'FULL_TIME',
      applicantLocationRequirements: { '@type': 'Country', name: 'Remote' },
      jobLocationType: 'TELECOMMUTE',
      directApply: true,
      url: j.url,
    }
    if (j.salary_min && j.currency) {
      base.baseSalary = {
        '@type': 'MonetaryAmount',
        currency: j.currency,
        value: {
          '@type': 'QuantitativeValue',
          minValue: j.salary_min,
          maxValue: j.salary_max || undefined,
          unitText: 'YEAR'
        }
      }
    }
    return base
  })

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(items) }} />
  )
}

export default function OglasiPage() {
  return <>
    <OglasiContent />
    <JobSchemaInjector />
  </>
}
