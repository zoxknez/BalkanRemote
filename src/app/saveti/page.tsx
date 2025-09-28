import { Suspense } from 'react'
import type { Metadata } from 'next'

import SavetiContent from './SavetiContent'
import { buildOgImageUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Remote work saveti za Balkan | Remote Balkan',
  description:
    'Kompletan vodič za remote rad na Balkanu: pravni koraci, banke, alati, klijenti i balans za Srbiju, Hrvatsku, BiH i region.',
  alternates: {
    canonical: '/saveti',
  },
  openGraph: {
    title: 'Remote work saveti za Balkan | Remote Balkan',
    description:
      'Praktični saveti, checkliste i resursi za freelancere i remote profesionalce iz Srbije, Hrvatske, BiH, CG i regiona.',
    url: '/saveti',
    images: [
      {
        url: buildOgImageUrl('Remote work saveti za Balkan', 'Checkliste, alati i pravni koraci'),
        width: 1200,
        height: 630,
        alt: 'Remote work saveti za Balkan',
      },
    ],
  },
}

export default function SavetiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <SavetiContent />
    </Suspense>
  )
}
