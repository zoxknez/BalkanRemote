import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Kompanije koje rade remote sa Balkana | Balkan Remote',
  description: 'Lista proverenih kompanija i timova koji zapošljavaju remote stručnjake sa Balkana. Transparentni uslovi i iskustva.',
};

export default function KompanijeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
