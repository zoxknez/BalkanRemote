import { Suspense } from 'react';
import type { Metadata } from 'next';

import ResursiContent from './ResursiContent';

export const metadata: Metadata = {
  title: 'Resursi za remote karijeru | Remote Balkan',
  description:
    'Kurirani resursi za remote rad: job board-ovi, alati, kursevi, produktivnost i zajednice na jednom mestu.',
  alternates: {
    canonical: '/resursi',
  },
  openGraph: {
    title: 'Resursi za remote karijeru | Remote Balkan',
    description:
      'Istraži najbolje sajtove, alate i sadržaje koji pomažu profesionalcima sa Balkana da uspešno rade remote.',
    url: 'https://remotebalkan.com/resursi',
  },
};

export default function ResursiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <ResursiContent />
    </Suspense>
  );
}
