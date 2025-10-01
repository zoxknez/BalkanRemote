import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { buildOgImageUrl } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const publicBaseUrl = process.env.NEXT_PUBLIC_SITE_URL
  || (typeof process !== 'undefined' && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://www.balkan-remote.com');

export const metadata: Metadata = {
  metadataBase: new URL(publicBaseUrl),
  title: {
    default: 'Remote Balkan – Career Hub',
    template: '%s | Remote Balkan',
  },
  description:
    'Sve za remote rad iz Balkana: kalkulatori plata i poreza, vodiči za poreze i banke, IT kompanije, resursi i alati.',
  applicationName: 'Remote Balkan',
  generator: 'Next.js',
  authors: [{ name: 'Remote Balkan' }],
  creator: 'Remote Balkan',
  publisher: 'Remote Balkan',
  keywords: [
    'remote rad', 'Balkan', 'Srbija', 'Hrvatska', 'BiH', 'Crna Gora', 'Albanija', 'Severna Makedonija',
    'IT kompanije', 'porezi', 'banke', 'resursi', 'alati', 'poslovi'
  ],
  formatDetection: { telephone: false, date: true, email: false, address: false },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Remote Balkan – Career Hub',
    description:
      'Kalkulatori, vodiči, kompanije i alati za remote rad iz Srbije, Hrvatske, BiH, Crne Gore, Albanije i Severne Makedonije.',
    url: '/',
    siteName: 'Remote Balkan',
    locale: 'sr_RS',
    type: 'website',
    images: [
      {
        url: buildOgImageUrl('Remote Balkan – Career Hub', 'Sve za remote rad iz Balkana'),
        width: 1200,
        height: 630,
        alt: 'Remote Balkan – Career Hub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remote Balkan – Career Hub',
    description:
      'Praktični alati i vodiči za remote rad iz Balkana: porezi, banke, kompanije i resursi.',
    images: [buildOgImageUrl('Remote Balkan – Career Hub')]
  },
};

// Move themeColor to viewport per Next.js 15 requirement
export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1220' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const analyticsEnabled = process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS === 'true'
  const speedInsightsEnabled = process.env.NEXT_PUBLIC_ENABLE_VERCEL_SPEED_INSIGHTS === 'true'
  return (
    <html lang="sr">
      <body className={`${inter.variable} font-sans antialiased`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:top-3 focus:left-3 focus:rounded-md focus:bg-black focus:text-white focus:px-3 focus:py-2">
          Preskoči na sadržaj
        </a>
        <Script id="ld-org" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Remote Balkan',
            url: publicBaseUrl,
            logo: '/favicon.svg'
          })}
        </Script>
        <Header />
        <main className="min-h-screen" id="main-content">
          {children}
        </main>
        {analyticsEnabled && <Analytics />}
        {speedInsightsEnabled && <SpeedInsights />}
        <Footer />
      </body>
    </html>
  );
}
