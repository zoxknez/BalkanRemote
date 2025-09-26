import { Suspense } from 'react';
import type { Metadata } from 'next';

import PosloviContent from './PosloviContent';

export const metadata: Metadata = {
  title: 'Remote poslovi i prečice | Remote Balkan',
  description:
    'Kurirana lista remote poslova, freelance platformi i direktorijuma kompanija prilagođena talentima sa Balkana.',
  alternates: {
    canonical: '/poslovi',
  },
};

export default function PosloviPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <PosloviContent />
    </Suspense>
  );
}
