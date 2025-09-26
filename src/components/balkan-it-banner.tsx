'use client';

import type { ReactNode } from 'react';

interface BannerItem {
  icon: ReactNode;
  title: string;
  description: string;
}

interface BalkanItBannerProps {
  title: string;
  subtitle: string;
  items?: BannerItem[];
  className?: string;
}

const defaultItems: BannerItem[] = [
  { icon: '🏗️', title: 'Lokalne firme', description: 'Domaće IT kompanije iz Srbije, Hrvatske, BiH i regiona' },
  { icon: '🌍', title: 'Global Remote', description: 'Međunarodne kompanije otvorene za remote timove iz Balkana' },
  { icon: '🚀', title: 'Startup scena', description: 'Inovativni startup-i i scaleup timovi' },
  { icon: '💼', title: 'Outsourcing', description: 'Agencije i partneri koji grade proizvode za klijente širom sveta' },
];

export function BalkanItBanner({ title, subtitle, items = defaultItems, className }: BalkanItBannerProps) {
  const containerClass = [
    'bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 text-white',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClass}>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-blue-100 mb-6 max-w-3xl mx-auto">{subtitle}</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.title} className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="font-semibold">{item.title}</div>
              <div className="text-sm text-blue-100">{item.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
