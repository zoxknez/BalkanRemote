import { Suspense } from 'react'
import type { Metadata } from 'next'

import TaxGuideContent from './TaxGuideContent'

export const metadata: Metadata = {
  title: 'Balkan remote tax guide | Remote Balkan',
  description:
    'Compare flat tax, actual income and company structures across Serbia, Croatia, Bosnia and Herzegovina and Montenegro. Interactive calculators and official resources.',
  alternates: {
    canonical: '/tax-guide',
  },
  openGraph: {
    title: 'Balkan remote tax guide | Remote Balkan',
    description:
      'Remote Balkan tax guide with calculators, pros/cons and official links for freelancers and founders across the region.',
    url: 'https://remotebalkan.com/tax-guide',
  },
}

export default function TaxGuidePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <TaxGuideContent />
    </Suspense>
  )
}
