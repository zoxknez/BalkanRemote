import OglasiContent from './OglasiContent'
import { fetchPortalJobs } from '@/lib/job-portal-repository'
import { buildStructuredJobPostings } from '@/lib/job-schema'

export const dynamic = 'force-dynamic'

async function JobSchemaSSR() {
  if (!process.env.NEXT_PUBLIC_ENABLE_JOB_SCHEMA) return null
  try {
    const { rows } = await fetchPortalJobs({ limit: 5, offset: 0, withGlobalFacets: false })
    if (!rows.length) return null
    const payload = buildStructuredJobPostings(rows)
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }} />
  } catch {
    return null
  }
}

export default async function OglasiPage() {
  return (
    <>
      <OglasiContent />
      {/* SEO: SSR JSON-LD (limit 5) */}
      {await JobSchemaSSR()}
    </>
  )
}
