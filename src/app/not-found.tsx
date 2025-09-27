import Link from 'next/link'
export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Stranica nije pronađena</h1>
  <p className="text-gray-600 mb-6">Možda je premeštena ili privremeno nije dostupna.</p>
      <div className="flex items-center justify-center gap-3">
        <Link href="/" className="inline-flex items-center justify-center h-10 px-5 rounded-full bg-gray-900 text-white">Početna</Link>
        <Link href="/pitanja" className="inline-flex items-center justify-center h-10 px-5 rounded-full border">Pitanja</Link>
      </div>
    </div>
  )
}
