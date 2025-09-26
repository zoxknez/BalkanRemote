import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Saveti za remote rad | Remote Balkan',
  description: 'Praktični saveti za remote rad iz Srbije, Hrvatske, BiH i Crne Gore: pravni status, banke, alati, CV i nalaženje klijenata.',
};

export default function SavetiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
