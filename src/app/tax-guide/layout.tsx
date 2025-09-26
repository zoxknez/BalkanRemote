import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Poreski vodič za remote rad | Remote Balkan',
  description:
    'Pregled poreza i doprinosa za remote i freelance rad u Srbiji, Hrvatskoj, BiH i CG. Režimi oporezivanja i obaveze.',
};

export default function TaxGuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
