import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Remote Balkan – Karijera na daljinu sa Balkana',
  description:
    'Praktični vodiči, kompanije i alati za uspešnu remote karijeru sa Balkana. Bez suvišne priče, samo konkretno.',
};

export default function HomeGroupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
