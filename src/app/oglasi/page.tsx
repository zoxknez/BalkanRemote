import OglasiContent from './OglasiContent'
import { fetchPortalJobs } from '@/lib/job-portal-repository'
import { buildStructuredJobPostings } from '@/lib/job-schema'
// Auth removed temporarily (public access) – keep component import commented for quick restore
// import { RequireAuth } from '@/components/require-auth'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Remote & Hybrid IT Poslovi - 900+ Oglasa | Balkan Remote',
  description: 'Najbolji remote i hibridni IT poslovi iz 43+ izvora ažurno svaki dan. JavaScript, Python, React, Node.js i više. Filtriraj po iskustvu, kompaniji, plati. EU vremenska zona.',
  keywords: [
    'remote IT poslovi', 'remote developer jobs', 'JavaScript poslovi', 'Python remote',
    'React developer', 'Node.js remote', 'remote programer', 'IT oglasi',
    'remote work Balkan', 'EU timezone jobs', 'senior developer remote',
    'junior developer jobs', 'fullstack remote', 'backend developer',
    'frontend developer', 'DevOps remote', 'remote Srbija', 'remote Hrvatska'
  ],
  alternates: {
    canonical: '/oglasi'
  },
  openGraph: {
    title: 'Remote & Hybrid IT Poslovi - 900+ Aktuelnih Oglasa',
    description: 'Kuriran izbor najboljih remote i hibridnih IT pozicija za EU vremensku zonu. Ažuriranje svaki dan iz 43+ izvora.',
    url: '/oglasi',
    type: 'website',
    images: [
      {
        url: '/og-jobs.png',
        width: 1200,
        height: 630,
        alt: 'Balkan Remote IT Poslovi'
      }
    ],
    siteName: 'Balkan Remote'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remote & Hybrid IT Poslovi - 900+ Oglasa',
    description: 'Najnoviji remote i hibridni IT oglasi za EU vremensku zonu. Filtriraj po tehnologiji, iskustvu, plati.',
    images: ['/og-jobs.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
