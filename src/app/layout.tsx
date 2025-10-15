import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ErrorBoundary } from "@/components/error-boundary";
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
    default: 'Balkan Remote – Career Hub',
    template: '%s | Balkan Remote',
  },
  description:
    'Sve za remote rad iz Balkana: kalkulatori plata i poreza, vodiči za poreze i banke, IT kompanije, resursi i alati.',
  applicationName: 'Balkan Remote',
  generator: 'Next.js',
  authors: [{ name: 'Balkan Remote' }],
  creator: 'Balkan Remote',
  publisher: 'Balkan Remote',
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
    title: 'Balkan Remote – Career Hub',
    description:
      'Kalkulatori, vodiči, kompanije i alati za remote rad iz Srbije, Hrvatske, BiH, Crne Gore, Albanije i Severne Makedonije.',
    url: '/',
    siteName: 'Balkan Remote',
    locale: 'sr_RS',
    type: 'website',
    images: [
      {
        url: buildOgImageUrl('Balkan Remote – Career Hub', 'Sve za remote rad iz Balkana'),
        width: 1200,
        height: 630,
        alt: 'Balkan Remote – Career Hub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Balkan Remote – Career Hub',
    description:
      'Praktični alati i vodiči za remote rad iz Balkana: porezi, banke, kompanije i resursi.',
    images: [buildOgImageUrl('Balkan Remote – Career Hub')]
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
        
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_title: document.title,
                  page_location: window.location.href,
                  anonymize_ip: true,
                });
              `}
            </Script>
          </>
        )}
        
        <Script id="ld-org" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Balkan Remote',
            url: publicBaseUrl,
            logo: '/favicon.svg'
          })}
        </Script>
        <Header />
        <ErrorBoundary>
          <main className="min-h-screen" id="main-content">
            {children}
          </main>
        </ErrorBoundary>
        {analyticsEnabled && <Analytics />}
        {speedInsightsEnabled && <SpeedInsights />}
        <Footer />
      </body>
    </html>
  );
}
