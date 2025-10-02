import { Suspense } from 'react'
import type { Metadata } from 'next'
import { buildOgImageUrl } from '@/lib/site'

import TaxGuideContent from './TaxGuideContent'

export const metadata: Metadata = {
  title: 'Balkan remote tax guide | Balkan Remote',
  description:
    'Compare flat tax, actual income and company structures across Serbia, Croatia, Bosnia and Herzegovina and Montenegro. Interactive calculators and official resources.',
  alternates: {
    canonical: '/tax-guide',
  },
  openGraph: {
    title: 'Balkan remote tax guide | Balkan Remote',
    description:
      'Balkan Remote tax guide with calculators, pros/cons and official links for freelancers and founders across the region.',
    url: '/tax-guide',
    images: [
      {
        url: buildOgImageUrl('Balkan remote tax guide', 'Comparisons, calculators and official links') + '&theme=guide',
        width: 1200,
        height: 630,
        alt: 'Balkan remote tax guide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Balkan remote tax guide | Balkan Remote',
    description: 'Calculators, comparisons and official links across the region.',
    images: [buildOgImageUrl('Balkan remote tax guide') + '&theme=guide'],
  },
}

export default function TaxGuidePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <TaxGuideContent />
    </Suspense>
  )
}
