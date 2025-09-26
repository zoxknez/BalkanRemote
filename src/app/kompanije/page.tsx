import { Suspense } from 'react'
import type { Metadata } from 'next'

import KompanijeContent from '@/app/kompanije/KompanijeContent'

export const metadata: Metadata = {
  title: 'IT kompanije koje zapošljavaju remote | Remote Balkan',
  description:
    'Filtriraj i istraži IT kompanije sa Balkana i globalne timove koji zapošljavaju remote talente iz regiona.',
  alternates: {
    canonical: '/kompanije',
  },
}

export default function KompanijePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}> 
      <KompanijeContent />
    </Suspense>
  )
}
