import type { Metadata } from 'next'
import { buildOgImageUrl } from '@/lib/site'
import React from 'react'

export const metadata: Metadata = {
  title: 'Pitanja i sugestije | Balkan Remote',
  description: 'Postavite pitanja timu i zajednici; čitajte iskustva drugih i delite predloge.',
  alternates: { canonical: '/pitanja' },
  openGraph: {
    title: 'Pitanja i sugestije | Balkan Remote',
    description: 'Diskusije, pitanja i predlozi iz zajednice.',
    url: '/pitanja',
    images: [{ url: buildOgImageUrl('Pitanja i sugestije', 'Diskusije i predlozi zajednice'), width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pitanja i sugestije | Balkan Remote',
    description: 'Postavite pitanje ili predlog; pročitajte odgovore zajednice.',
    images: [buildOgImageUrl('Pitanja i sugestije')],
  },
}

export default function PitanjaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
