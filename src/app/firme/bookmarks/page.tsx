import BookmarkedContent from './BookmarkedContent'
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Sačuvane firme/hybrid | Balkan Remote',
  description: 'Tvoja privatna lista sačuvanih onsite i hybrid pozicija iz lokalnih firmi. Sve kategorije poslova.',
  alternates: { canonical: '/firme/bookmarks' },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Sačuvane firme/hybrid | Balkan Remote',
    description: 'Brz pristup onsite i hybrid pozicijama koje si sačuvao za kasnije.',
    url: '/firme/bookmarks'
  }
}

export default async function BookmarkedJobsPage() {
  return <BookmarkedContent />
}

