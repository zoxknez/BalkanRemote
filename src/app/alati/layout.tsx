import type { Metadata } from 'next';
import React from 'react';
import { buildOgImageUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Alati za freelance i remote | Balkan Remote',
  description: 'Izabrani alati za Balkan freelancere: fakturisanje, praćenje vremena, dev ops, dizajn i produktivnost.',
  openGraph: {
    title: 'Alati za freelance i remote | Balkan Remote',
    description: 'Top alati za freelancere i remote rad sa Balkana.',
    url: '/alati',
    images: [{ url: buildOgImageUrl('Alati za remote rad', 'Top alati i preporuke'), width: 1200, height: 630 }],
  },
};

export default function AlatiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
