import { Suspense } from 'react'
import type { Metadata } from 'next'

import KompanijeContent from '@/app/kompanije/KompanijeContent'
import { buildOgImageUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'IT kompanije koje zapošljavaju remote | Balkan Remote',
  description:
    'Filtriraj i istraži IT kompanije sa Balkana i globalne timove koji zapošljavaju remote talente iz regiona.',
  alternates: {
    canonical: '/kompanije',
  },
  openGraph: {
    title: 'IT kompanije koje zapošljavaju remote | Balkan Remote',
    description: 'Istraži timove koji rade remote i zapošljavaju na Balkanu.',
    url: '/kompanije',
    images: [
      { url: buildOgImageUrl('IT kompanije', 'Remote-friendly timovi sa Balkana'), width: 1200, height: 630, alt: 'IT kompanije' },
    ],
  },
}

export default function KompanijePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}> 
      <KompanijeContent />
    </Suspense>
  )
}
