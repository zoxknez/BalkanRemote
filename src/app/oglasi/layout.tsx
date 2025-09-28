import type { Metadata } from 'next'
import { buildOgImageUrl } from '@/lib/site'
import React from 'react'

export const metadata: Metadata = {
  title: 'Agregirani oglasi – testni tab | Remote Balkan',
  description: 'Eksperimentalni agregator (test) – najnoviji remote / EU-timezone poslovi iz više izvora sa filtriranjem po tipu ugovora, iskustvu i kategoriji.',
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Agregirani oglasi – testni tab | Remote Balkan',
    description: 'Eksperimentalni agregator (test) – poslednji remote poslovi iz više izvora.',
    url: '/oglasi',
    images: [{ url: buildOgImageUrl('Agregirani oglasi (test)', 'Eksperimentalni prikaz'), width: 1200, height: 630 }],
  },
}

export default function OglasiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
