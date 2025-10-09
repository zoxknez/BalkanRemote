import BookmarkedContent from './BookmarkedContent'
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Sačuvani OnSite | Balkan Remote',
  description: 'Tvoja privatna lista sačuvanih onsite i hibridnih pozicija iz lokalnih firmi. Sve kategorije poslova.',
  alternates: { canonical: '/firme/bookmarks' },
  robots: { index: false, follow: true },
  openGraph: {
  title: 'Sačuvani OnSite | Balkan Remote',
  description: 'Brz pristup onsite i hibridnim pozicijama koje si sačuvao za kasnije.',
    url: '/firme/bookmarks'
  }
}

export default async function BookmarkedJobsPage() {
  return <BookmarkedContent />
}

