import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Resursi za remote karijeru | Balkan Remote',
  description: 'Kolekcija vodiča, predloga i primera iz prakse za razvoj remote karijere na Balkanu.',
};

export default function ResursiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
