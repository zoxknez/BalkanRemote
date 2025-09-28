"use client"

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    // Optional: hook in real logger here
    console.error(error)
  }, [error])

  return (
    <html>
      <body className="min-h-screen grid place-items-center bg-white p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900">Nešto je pošlo naopako</h1>
          <p className="mt-2 text-gray-600">Ako se greška ponavlja, javite nam. Pokušaćemo da osvežimo stranicu.</p>
          {error?.digest && (
            <p className="mt-2 text-xs text-gray-400">Kod greške: {error.digest}</p>
          )}
          <div className="mt-4 flex items-center justify-center gap-3">
            <button onClick={() => reset()} className="rounded-md bg-indigo-600 px-4 py-2 text-white">Pokušaj ponovo</button>
            <Link href="/" className="rounded-md border px-4 py-2 text-gray-700">Početna</Link>
          </div>
        </div>
      </body>
    </html>
  )
}
