import BookmarkedContent from './BookmarkedContent'
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Sačuvani IT oglasi | Remote Balkan',
  description: 'Tvoja privatna lista sačuvanih IT oglasa. Vraćaj se brzo na interesantne pozicije i prati nove objave.',
  alternates: { canonical: '/oglasi/bookmarks' },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Sačuvani IT oglasi | Remote Balkan',
    description: 'Brz pristup oglasima koje si sačuvao za kasnije.',
    url: '/oglasi/bookmarks'
  }
}

export default async function BookmarkedJobsPage() {
  return <BookmarkedContent />
}

