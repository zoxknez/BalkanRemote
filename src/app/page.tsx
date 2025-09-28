import type { Metadata } from 'next';
import HomeView from './(home)/HomeView';
import { buildOgImageUrl, getPublicBaseUrl } from '@/lib/site';

const siteUrl = getPublicBaseUrl();
const ogImage = buildOgImageUrl('Remote Balkan', 'Career hub za remote profesionalce sa Balkana');

export const metadata: Metadata = {
  title: 'Remote Balkan | Career hub za remote profesionalce sa Balkana',
  description:
    'Kompletan vodič za remote rad iz Srbije, Hrvatske, BiH, Crne Gore, Albanije i Severne Makedonije – saveti, poreske optimizacije i IT kompanije.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Remote Balkan | Career hub za remote profesionalce sa Balkana',
    description:
      'Remote Balkan donosi praktične savete, poreske optimizacije i resurse za remote rad na Balkanu.',
    url: siteUrl,
    siteName: 'Remote Balkan',
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: 'Remote Balkan – Career Hub',
      },
    ],
    locale: 'sr_RS',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remote Balkan | Career hub za remote profesionalce sa Balkana',
    description:
      'Pronađi remote poslove, poreske vodiče i praktične resurse prilagođene Balkanu.',
    images: [ogImage],
  },
};

export default function Page() {
  return <HomeView />;
}

