'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabaseClient'

type Props = {
  children: React.ReactNode
  title?: string
  description?: string
  redirectTo?: string
}

export function RequireAuth({ children, title = 'Prijava potrebna', description = 'Molimo prijavite se da biste videli ovu stranicu.', redirectTo = '/nalog?view=signIn&returnTo=' }: Props) {
  const searchParams = useSearchParams()
  const debugAuth = searchParams?.get('debugAuth') === '1'
  const devAutoAuth = process.env.NEXT_PUBLIC_DEV_AUTO_AUTH === '1'
  const supabase = useMemo(() => (typeof window !== 'undefined' ? createSupabaseBrowser() : null), [])
  const [loading, setLoading] = useState(true)
  const [grace, setGrace] = useState(true)
  const [isAuthed, setIsAuthed] = useState(false)
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)
  const [reason, setReason] = useState<string>('init')

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!supabase) {
        setLoading(false)
        setIsAuthed(false)
        return
      }
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      const authed = Boolean(data.session)
      setIsAuthed(authed)
      setSessionEmail(data.session?.user?.email ?? null)
      if (!authed) setReason('no-session')
      setLoading(false)
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return
        const sAuthed = Boolean(session)
        setIsAuthed(sAuthed)
        setSessionEmail(session?.user?.email ?? null)
        if (!sAuthed) setReason('no-session')
      })
      return () => {
        sub.subscription.unsubscribe()
      }
    }
    const cleanup = load()
    return () => { mounted = false; void cleanup }
  }, [supabase])

  // Grace delay (sprečava flicker ekrana za brze sesije)
  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setGrace(false), 350)
      return () => clearTimeout(t)
    }
  }, [loading])

  // Bypass auth completely with ?debugAuth=1 so da možemo da vidimo sadržaj kad login zeza.
  const isDev = process.env.NODE_ENV !== 'production'

  if (debugAuth && !isAuthed && !loading && isDev) {
    return (
      <div className="relative">
        <div className="fixed bottom-4 right-4 z-50 w-[380px] max-h-[60vh] overflow-auto rounded-lg border border-amber-300 bg-white p-4 text-[11px] font-mono shadow-lg">
          <strong>AUTH DEBUG MODE (bypass)</strong>
          <pre className="mt-2 whitespace-pre-wrap leading-snug">{JSON.stringify({
            supabaseClient: Boolean(supabase),
            isAuthed,
            sessionEmail,
            reason,
            env: {
              hasAnon: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
              hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
            },
          }, null, 2)}</pre>
          <p className="mt-2 text-[10px] text-amber-600">U produkciji ukloni ?debugAuth=1.</p>
        </div>
        {children}
      </div>
    )
  }

  if (loading || grace) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
        Provera sesije…
      </div>
    )
  }

  if (!isAuthed) {
    // Dev auto auth (environment controlled) – omogućava prikaz stranice bez realne sesije.
    if (devAutoAuth) {
      return (
        <div className="relative">
          <div className="fixed bottom-4 left-4 z-40 rounded-md bg-amber-600/90 text-white px-3 py-2 text-xs shadow">
            DEV AUTO AUTH aktivan (NEXT_PUBLIC_DEV_AUTO_AUTH=1) – nema prave sesije.
          </div>
          {children}
        </div>
      )
    }
    const href = typeof window !== 'undefined' ? `${redirectTo}${encodeURIComponent(window.location.pathname)}` : '/nalog?view=signIn'
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
        {debugAuth && (
          <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-[11px] font-mono text-amber-800">
            <p className="font-semibold mb-1">Debug info:</p>
            <pre className="whitespace-pre-wrap leading-snug">{JSON.stringify({
              supabaseClient: Boolean(supabase),
              isAuthed,
              sessionEmail,
              reason,
            }, null, 2)}</pre>
          </div>
        )}
        {supabase ? (
          <Link href={href} className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Idi na prijavu
          </Link>
        ) : (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Nalog nije konfigurisan (nedostaju NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).
          </div>
        )}
      </div>
    )
  }

  return <>{children}</>
}
