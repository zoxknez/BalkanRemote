import type { Metadata } from 'next'

import { NalogClient } from './Client'

const faqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'QAPage',
  name: 'Remote Balkan nalozi',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Da li je registracija besplatna?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Da, kreiranje naloga je potpuno besplatno. Planovi za napredne alatke biće najavljeni unapred.',
      },
    },
    {
      '@type': 'Question',
      name: 'Kako resetujem lozinku?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Kliknite na "Zaboravljena lozinka?" na prijavi i pratite uputstva u email poruci koja stiže.',
      },
    },
    {
      '@type': 'Question',
      name: 'Koje provajdere za prijavu podržavate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Trenutno podržavamo prijavu putem email-a, GitHub-a i Google naloga.',
      },
    },
  ],
}

export const metadata: Metadata = {
  title: 'Nalog | Remote Balkan',
  description:
    'Registrujte se ili se prijavite na Remote Balkan da biste pratili napredne alate, personalizovane kalkulatore i poseban sadržaj zajednice.',
  alternates: {
    canonical: '/nalog',
  },
  openGraph: {
    title: 'Remote Balkan nalog',
    description: 'Jedinstveno mesto za vaše kalkulatore, alate i resurse iz Remote Balkan zajednice.',
    url: 'https://remotebalkan.com/nalog',
    siteName: 'Remote Balkan',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nalog | Remote Balkan',
    description: 'Prijava i registracija za ekskluzivne Remote Balkan alatke i sadržaj.',
  },
}

const highlights = [
  {
    title: 'Rani pristup alatima',
    description: 'Prijavljeni korisnici prvi testiraju nove kalkulatore, scrape izvore i marketplace opcije.',
  },
  {
    title: 'Personalizovani podsetnici',
    description: 'Sačuvajte oglase, generišite prilagođene upozorenja i pratite izmene legislacije po državama.',
  },
  {
    title: 'Community benefiti',
    description: 'Pridružite se privatnim diskusijama, delite predloge i glasajte za sledeće funkcionalnosti.',
  },
]

const helpSteps = [
  {
    title: '1. Kreirajte nalog',
    description: 'Popunite email i lozinku ili nastavite preko Google/GitHub naloga.',
  },
  {
    title: '2. Potvrdite email',
    description: 'Ukoliko je potrebno, aktivacioni link stiže u roku od nekoliko minuta.',
  },
  {
    title: '3. Istražite alatke',
    description: 'Otključajte kalkulatore, scraping pipeline i personalizovane preglede poslova.',
  },
]

export default function NalogPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />

      <div className="text-center">
        <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600">
          Remote Balkan nalog
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Pristupite svojim alatima i zajednici
        </h1>
        <p className="mt-4 text-base text-gray-600 sm:text-lg">
          Sve što vam treba za praćenje remote poslova, poreza i regionalnih benefita na jednom mestu.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,_3fr)_minmax(0,_2fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <NalogClient />
          <p className="mt-6 text-xs text-gray-500">
            Prijavom prihvatate osnovne{' '}
            <a href="/pitanja" className="underline transition hover:text-indigo-600">
              uslove korišćenja i pravila ponašanja zajednice
            </a>
            .
          </p>
        </div>

        <aside className="space-y-6 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/80 p-6 text-left">
          <div>
            <h2 className="text-lg font-semibold text-indigo-900">Zašto kreirati nalog?</h2>
            <ul className="mt-3 space-y-3 text-sm text-indigo-900/80">
              {highlights.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-indigo-600">
                    •
                  </span>
                  <div>
                    <p className="font-medium text-indigo-900">{item.title}</p>
                    <p>{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-indigo-200 pt-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Kako funkcioniše</h3>
            <ol className="mt-3 space-y-2 text-sm text-indigo-900/80">
              {helpSteps.map((step) => (
                <li key={step.title} className="flex gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                    {step.title.split('.')[0]}
                  </span>
                  <div>
                    <p className="font-medium text-indigo-900">{step.title}</p>
                    <p>{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl border border-indigo-200 bg-white/70 p-4 text-sm text-indigo-900">
            <h3 className="font-semibold text-indigo-900">Podrška</h3>
            <p className="mt-2">
              Treba vam pomoć oko naloga? Pišite na{' '}
              <a href="mailto:zoxknez@hotmail.com" className="font-medium text-indigo-700 underline">
                zoxknez@hotmail.com
              </a>{' '}
              ili otvorite{' '}
              <a
                href="https://github.com/zoxknez/BalkanRemote/issues/new"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-700 underline"
              >
                GitHub issue
              </a>
              .
            </p>
            <p className="mt-2">
              Za hitne probleme najbrži kanal je{' '}
              <a
                href="https://x.com/KoronVirus"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-700 underline"
              >
                X DM
              </a>
              .
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
