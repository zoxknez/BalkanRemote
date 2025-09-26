import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Poslovi za remote rad | Remote Balkan',
  description:
    'Kurirani linkovi i resursi za pronalazak remote poslova iz Balkana: LinkedIn pretrage, liste kompanija, članci i vodiči.',
};

export default function PosloviLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
