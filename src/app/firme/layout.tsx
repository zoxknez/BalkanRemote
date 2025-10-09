import type { Metadata } from 'next'
import { buildOgImageUrl } from '@/lib/site'
import React from 'react'

export const metadata: Metadata = {
  title: 'OnSite - Svi poslovi | Balkan Remote',
  description: 'Agregator najnovijih onsite i hibridnih poslova iz lokalnih firmi na Balkanu. Sve kategorije - IT, marketing, finansije, HR, zdravstvo i više.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'OnSite - Svi poslovi | Balkan Remote',
    description: 'Poslednji onsite i hibridni poslovi iz lokalnih firmi na Balkanu. Sve kategorije dostupne.',
    url: '/firme',
    images: [{ url: buildOgImageUrl('OnSite - Svi poslovi', 'Balkan Remote'), width: 1200, height: 630 }],
  },
}

export default function FirmeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}