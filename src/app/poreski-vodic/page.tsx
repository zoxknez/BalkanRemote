import { Suspense } from 'react';
import type { Metadata } from 'next';

import TaxGuideClient from './Client';
import { buildOgImageUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Poreski vodič za remote rad na Balkanu | Remote Balkan',
  description:
    'Uporedi paušal, stvarni prihod i DOO modele za Srbiju, Hrvatsku, BiH i Crnu Goru. Kalkulatori, linkovi i najvažniji koraci za freelance i remote rad.',
  alternates: {
    canonical: '/poreski-vodic',
  },
  openGraph: {
    title: 'Poreski vodič za remote rad na Balkanu | Remote Balkan',
    description:
      'Detaljan poreski vodič: modeli oporezivanja, kalkulatori i zvanični linkovi za freelancere i kompanije iz regiona.',
    url: '/poreski-vodic',
    images: [
      {
        url: buildOgImageUrl('Poreski vodič za remote rad', 'Modeli oporezivanja i kalkulatori'),
        width: 1200,
        height: 630,
        alt: 'Poreski vodič za remote rad na Balkanu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Poreski vodič za remote rad na Balkanu | Remote Balkan',
    description: 'Modeli oporezivanja, kalkulatori i zvanični linkovi.',
    images: [buildOgImageUrl('Poreski vodič za remote rad')],
  },
};

export default function PoreskiVodicPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <TaxGuideClient />
    </Suspense>
  );
}