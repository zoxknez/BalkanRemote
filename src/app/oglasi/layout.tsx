import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Agregirani oglasi – testni tab | Remote Balkan',
  description: 'Eksperimentalni agregator (test) – najnoviji remote / EU-timezone poslovi iz više izvora sa filtriranjem po tipu ugovora, iskustvu i kategoriji.'
}

export default function OglasiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
