import OglasiContent from './OglasiContent'
import { fetchPortalJobs } from '@/lib/job-portal-repository'
import { buildStructuredJobPostings } from '@/lib/job-schema'
// Auth removed temporarily (public access) – keep component import commented for quick restore
// import { RequireAuth } from '@/components/require-auth'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Agregirani IT oglasi (Remote / EU zona) | Remote Balkan',
  description: 'Pregled najnovijih agregiranih remote IT oglasa (EU vremenska zona) sa više izvora. Filtriraj po tipu, iskustvu, kategoriji i sačuvaj oglase koje želiš da ispratiš.',
  alternates: {
    canonical: '/oglasi'
  },
  openGraph: {
    title: 'Remote Balkan – Agregirani IT oglasi',
    description: 'Jedinstveno mesto za filtriranje i praćenje najnovijih remote IT poslova za Balkan & EU vreme.',
    url: '/oglasi',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agregirani IT oglasi | Remote Balkan',
    description: 'Najnoviji remote IT oglasi sa više izvora – filtriraj i sačuvaj.'
  }
}

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
      {await JobSchemaSSR()}
    </>
  )
}
