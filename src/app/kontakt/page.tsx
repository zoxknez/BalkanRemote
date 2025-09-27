import type { Metadata } from 'next'

import { ClipboardButton } from '@/components/clipboard-button'
import { sanitizeHtml } from '@/lib/sanitizeHtml'

const CONTACT_EMAIL = 'zoxknez@hotmail.com'

const contactMethods = [
  {
    title: 'X (Twitter)',
    description: 'Pošaljite DM ili mention',
    href: 'https://x.com/KoronVirus',
    icon: '𝕏',
    external: true,
  },
  {
    title: 'GitHub profil',
    description: 'Novi GitHub nalog autora',
    href: 'https://github.com/o0o0o0o0o0o0o0o0o0o0o0o0o0o0o0o',
    icon: '🐙',
    external: true,
  },
  {
    title: 'Email',
    description: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    icon: '📧',
    external: false,
    action: 'copy-email' as const,
  },
  {
    title: 'GitHub Issues',
    description: 'Otvorite issue za predlog ili prijavu problema',
    href: 'https://github.com/o0o0o0o0o0o0o0o0o0o0o0o0o0o0o0o/balkan_remote/issues/new',
    icon: '💬',
    external: true,
  },
  {
    title: 'Repo & Diskusija',
    description: 'Zvezdica i diskusija dobrodošli',
    href: 'https://github.com/o0o0o0o0o0o0o0o0o0o0o0o0o0o0o0o/balkan_remote',
    icon: '⭐',
    external: true,
  },
]

const contactJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Remote Balkan',
  url: 'https://remotebalkan.com',
  email: `mailto:${CONTACT_EMAIL}`,
  sameAs: ['https://x.com/KoronVirus', 'https://github.com/o0o0o0o0o0o0o0o0o0o0o0o0o0o0o0o'],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'Community Support',
      email: CONTACT_EMAIL,
      url: 'https://remotebalkan.com/kontakt',
    },
  ],
}

export const metadata: Metadata = {
  title: 'Kontakt | Remote Balkan',
  description: 'Javite se preko X (Twitter), emaila ili GitHub issue-a i uključite se u Remote Balkan zajednicu.',
  alternates: {
    canonical: '/kontakt',
  },
  openGraph: {
    title: 'Kontakt | Remote Balkan',
    description: 'Najbrže do Remote Balkan tima preko javnih kanala, emaila ili GitHub diskusija.',
    url: 'https://remotebalkan.com/kontakt',
    siteName: 'Remote Balkan',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kontakt | Remote Balkan',
    description: 'Najbrži načini da se javite Remote Balkan zajednici.',
  },
}

export default function KontaktPage() {
  const contactJsonLdString = sanitizeHtml(JSON.stringify(contactJsonLd))

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {contactJsonLdString && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: contactJsonLdString }} />
      )}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 text-white text-2xl mb-3" aria-hidden="true">
            ✉️
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Kontakt</h1>
          <p className="text-gray-600 mt-2">Najbrži načini da se javite ili predložite poboljšanje</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {contactMethods.map((method) => {
            const externalProps = method.external
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {}

            return (
              <a
                key={method.title}
                href={method.href}
                {...externalProps}
                className="group flex h-full flex-col justify-between rounded-xl border border-gray-200 p-5 transition hover:border-indigo-300 hover:shadow-sm"
              >
                <div>
                  <div className="text-2xl" aria-hidden="true">
                    {method.icon}
                  </div>
                  <div className="mt-2 font-semibold text-gray-900 group-hover:text-indigo-700">{method.title}</div>
                  <div className="text-sm text-gray-600">{method.description}</div>
                </div>

                {method.action === 'copy-email' && (
                  <div className="mt-4">
                    <ClipboardButton
                      value={CONTACT_EMAIL}
                      copyText="Kopiraj email"
                      copiedText="Email je kopiran!"
                      className="border-indigo-200 text-indigo-700"
                    />
                  </div>
                )}
              </a>
            )
          })}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          Preferiramo javne kanale kako bismo znanje i rešenja delili sa zajednicom.
        </div>
      </div>
    </div>
  )
}
