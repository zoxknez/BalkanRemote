import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Alati za freelance i remote | Remote Balkan',
  description: 'Izabrani alati za Balkan freelancere: fakturisanje, praćenje vremena, dev ops, dizajn i produktivnost.',
};

export default function AlatiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
