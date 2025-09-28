import { Suspense } from 'react';
import Script from 'next/script';
import type { Metadata } from 'next';

import PosloviContent from './PosloviContent';
import { buildOgImageUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Remote poslovi i prečice | Remote Balkan',
  description:
    'Kurirana lista remote poslova, freelance platformi i direktorijuma kompanija prilagođena talentima sa Balkana.',
  alternates: {
    canonical: '/poslovi',
  },
  openGraph: {
    title: 'Remote poslovi i prečice | Remote Balkan',
    description: 'Aktuelni remote oglasi i platforme za talente sa Balkana.',
    url: '/poslovi',
    images: [
      {
        url: buildOgImageUrl('Remote poslovi i prečice', 'Agregirani oglasi i platforme'),
        width: 1200,
        height: 630,
        alt: 'Remote poslovi i prečice',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remote poslovi i prečice | Remote Balkan',
    description: 'Aktuelni remote oglasi i platforme za talente sa Balkana.',
    images: [buildOgImageUrl('Remote poslovi i prečice')],
  },
};

export default function PosloviPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <Script id="ld-job-aggregate" type="application/ld+json" strategy="beforeInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Remote poslovi | Remote Balkan',
          description: 'Agregirani remote oglasi prilagođeni regionu Balkana',
          url: '/poslovi',
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: [],
          },
        })}
      </Script>
      <PosloviContent />
    </Suspense>
  );
}
