import FirmeContent from './FirmeContentNew'
// import { fetchPortalJobs } from '@/lib/job-portal-repository'
// import { buildStructuredJobPostings } from '@/lib/job-schema'
// Auth removed temporarily (public access) – keep component import commented for quick restore
// import { RequireAuth } from '@/components/require-auth'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'OnSite Poslovi - Balkan | Balkan Remote',
  description: 'Najbolji onsite i hibridni poslovi iz lokalnih firmi na Balkanu i regionu. Sve kategorije - od IT, finansija, marketinga do zdravstva i edukacije.',
  keywords: [
    'onsite poslovi', 'hybrid poslovi', 'IT poslovi Beograd', 'poslovi Zagreb', 'developer jobs Sarajevo',
    'marketing poslovi Srbija', 'finansije Hrvatska', 'HR poslovi', 'adminsitracija poslovi',
    'zdravstvo poslovi', 'edukacija poslovi', 'pravni poslovi', 'prodaja poslovi',
    'firme Balkan', 'lokalne firme', 'hibridni rad', 'flexible rad', 'onsite rad',
    'poslovi Novi Sad', 'poslovi Split', 'poslovi Ljubljana', 'poslovi Skopje', 'poslovi Podgorica'
  ],
  alternates: {
    canonical: '/firme'
  },
  openGraph: {
    title: 'OnSite Poslovi - Sve Kategorije na Balkanu',
    description: 'Kuriran izbor najboljih onsite i hibridnih pozicija iz lokalnih firmi. Sve kategorije poslova, ne samo IT.',
    url: '/firme',
    type: 'website',
    images: [
      {
        url: '/og-jobs.png',
        width: 1200,
        height: 630,
        alt: 'Balkan OnSite i Hibridni Poslovi'
      }
    ],
    siteName: 'Balkan Remote'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OnSite Poslovi - Sve Kategorije',
  description: 'Najnoviji onsite i hibridni oglasi iz lokalnih firmi. Sve kategorije - IT, marketing, finansije, HR i više.',
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

// Structured data schema for hybrid/onsite jobs - to be implemented
// async function JobSchemaSSR() {
//   if (!process.env.NEXT_PUBLIC_ENABLE_JOB_SCHEMA) return null
//   try {
//     // Fetch hybrid jobs for schema
//     return null
//   } catch {
//     return null
//   }
// }

export default function FirmePage() {
  return <FirmeContent />
}