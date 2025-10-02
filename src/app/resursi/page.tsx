import { Suspense } from 'react';
import type { Metadata } from 'next';

import ResursiContent from './ResursiContent';
import { buildOgImageUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Resursi za remote karijeru | Balkan Remote',
  description:
    'Kurirani resursi za remote rad: job board-ovi, alati, kursevi, produktivnost i zajednice na jednom mestu.',
  alternates: {
    canonical: '/resursi',
  },
  openGraph: {
    title: 'Resursi za remote karijeru | Balkan Remote',
    description:
      'Istraži najbolje sajtove, alate i sadržaje koji pomažu profesionalcima sa Balkana da uspešno rade remote.',
    url: '/resursi',
    images: [
      {
        url: buildOgImageUrl('Resursi za remote karijeru', 'Kurirani linkovi, alati i zajednice'),
        width: 1200,
        height: 630,
        alt: 'Resursi za remote karijeru',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resursi za remote karijeru | Balkan Remote',
    description: 'Istraži najbolje sajtove, alate i sadržaje koji pomažu profesionalcima sa Balkana da uspešno rade remote.',
    images: [buildOgImageUrl('Resursi za remote karijeru')],
  },
};

export default function ResursiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <ResursiContent />
    </Suspense>
  );
}
