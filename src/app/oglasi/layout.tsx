import type { Metadata } from 'next'
import { buildOgImageUrl } from '@/lib/site'
import React from 'react'

export const metadata: Metadata = {
  title: 'Agregirani oglasi | Remote Balkan',
  description: 'Agregator najnovijih remote / EU-timezone poslova iz više izvora sa filtriranjem po tipu ugovora, iskustvu i kategoriji.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Agregirani oglasi | Remote Balkan',
    description: 'Poslednji remote i EU-timezone poslovi iz više izvora.',
    url: '/oglasi',
    images: [{ url: buildOgImageUrl('Agregirani oglasi', 'Remote Balkan'), width: 1200, height: 630 }],
  },
}

export default function OglasiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
