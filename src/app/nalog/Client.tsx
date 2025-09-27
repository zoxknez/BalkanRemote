'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Eye, EyeOff, Github, Lock, Mail } from 'lucide-react'

import { createSupabaseBrowser } from '@/lib/supabaseClient'

const EMAIL_REGEX = /.+@.+\..+/

type AuthMode = 'signIn' | 'signUp' | 'reset'

const MODE_LABELS: Record<AuthMode, string> = {
  signIn: 'Prijava',
  signUp: 'Registracija',
  reset: 'Reset lozinke',
}

export function NalogClient() {
  const supabase = useMemo(() => (typeof window !== 'undefined' ? createSupabaseBrowser() : null), [])
  const siteUrl = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.location.origin
    }
    return process.env.NEXT_PUBLIC_SITE_URL ?? ''
  }, [])
  const [mode, setMode] = useState<AuthMode>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)

  const supabaseAvailable = Boolean(supabase)

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data }) => {
      setSessionEmail(data.session?.user?.email ?? null)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user?.email ?? null)
    })

    return () => {
      subscription.subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const url = new URL(window.location.href)
    const view = url.searchParams.get('view') ?? url.searchParams.get('mode')

    if (view === 'register' || view === 'signup') {
      setMode('signUp')
    } else if (view === 'reset') {
      setMode('reset')
    }

    if (window.location.hash.includes('type=recovery')) {
      setMode('reset')
    }
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!supabase) return

    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (!EMAIL_REGEX.test(email)) {
        throw new Error('Unesite ispravan email')
      }

      if (password.length < 6) {
        throw new Error('Lozinka mora imati bar 6 karaktera')
      }

      if (mode === 'signUp' && password !== confirm) {
        throw new Error('Lozinke se ne poklapaju')
      }

      if (mode === 'reset') {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
        setMessage('Lozinka je promenjena. Sada se možete prijaviti.')
        setMode('signIn')
        setPassword('')
        setConfirm('')
        return
      }

      if (mode === 'signIn') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setMessage('Uspešno prijavljeni.')
        return
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: siteUrl ? `${siteUrl}/nalog` : undefined,
        },
      })
      if (error) throw error
      setMessage('Registracija uspešna. Proverite email za potvrdu (ako je potrebno).')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg || 'Došlo je do greške')
    } finally {
      setLoading(false)
    }
  }, [confirm, email, mode, password, siteUrl, supabase])

  const handleSignOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }, [supabase])

  const sendResetEmail = useCallback(async () => {
    if (!supabase) return

    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (!EMAIL_REGEX.test(email)) {
        throw new Error('Unesite ispravan email')
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: siteUrl ? `${siteUrl}/nalog` : undefined,
      })
      if (error) throw error
      setMessage('Ako nalog postoji, poslat je email za promenu lozinke.')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg || 'Došlo je do greške')
    } finally {
      setLoading(false)
    }
  }, [email, siteUrl, supabase])

  const signInWithProvider = useCallback(
    async (provider: 'github' | 'google') => {
      if (!supabase) return
      setLoading(true)
      setError(null)

      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: siteUrl ? `${siteUrl}/nalog` : undefined,
          },
        })
        if (error) throw error
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        setError(msg || 'Greška pri OAuth prijavi')
      } finally {
        setLoading(false)
      }
    },
    [siteUrl, supabase],
  )

  return (
    <div className="space-y-6">
      {!supabaseAvailable && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">Supabase konfiguracija nije pronađena.</p>
          <p className="mt-1">
            Dodajte promenljive <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> i{' '}
            <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> u <code className="font-mono">.env.local</code> kako bi registracija i prijava radile.
          </p>
          <p className="mt-2">Trenutno je forma onemogućena.</p>
        </div>
      )}
      {sessionEmail ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-700">
            Prijavljeni kao: <span className="font-medium">{sessionEmail}</span>
          </p>
          <button
            onClick={handleSignOut}
            className="mt-3 inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800"
          >
            Odjava
          </button>
        </div>
      ) : (
        <>
          {supabaseAvailable ? null : (
            <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
              Registracija nije moguća dok se ne podese Supabase kredencijali.
            </div>
          )}
          <div className="flex w-full flex-wrap items-center gap-1 rounded-lg bg-gray-100 p-1" role="tablist" aria-label="Auth modes">
            {(['signIn', 'signUp', 'reset'] satisfies AuthMode[]).map((authMode) => (
              <button
                key={authMode}
                type="button"
                onClick={() => setMode(authMode)}
                role="tab"
                aria-selected={mode === authMode}
                className={`flex-1 min-w-[120px] rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${mode === authMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                disabled={!supabaseAvailable}
              >
                <span className="flex items-center justify-center gap-2">
                  {MODE_LABELS[authMode]}
                  {authMode === 'signUp' && (
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
                      Novo
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>

          {mode !== 'signUp' && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
              <span className="font-medium">Nemate nalog?</span>
              <button
                type="button"
                onClick={() => setMode('signUp')}
                className="inline-flex items-center gap-1 rounded-md border border-indigo-200 px-3 py-1 font-semibold text-indigo-700 transition hover:border-indigo-300 hover:text-indigo-800"
              >
                Pređite na registraciju →
              </button>
            </div>
          )}

          <div className="mt-4 space-y-4" aria-disabled={!supabaseAvailable}>
            <label className="block text-sm font-medium text-gray-700" htmlFor="auth-email">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                id="auth-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                className="w-full rounded-lg border border-gray-300 p-3 pl-9 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                disabled={!supabaseAvailable}
              />
            </div>
            {email && !EMAIL_REGEX.test(email) && <p className="text-xs text-red-600">Unesite ispravan email.</p>}

            <label className="block text-sm font-medium text-gray-700" htmlFor="auth-password">
              {mode === 'reset' ? 'Nova lozinka' : 'Lozinka'}
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Unesite lozinku"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                className="w-full rounded-lg border border-gray-300 p-3 pl-9 pr-12 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                disabled={!supabaseAvailable}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute inset-y-0 right-3 my-auto inline-flex h-8 items-center justify-center rounded-md px-2 text-sm text-gray-600 hover:text-gray-900"
                aria-label={showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'}
                disabled={!supabaseAvailable}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password && password.length < 6 && <p className="text-xs text-amber-600">Lozinka treba da ima bar 6 karaktera.</p>}

            {mode === 'signUp' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700" htmlFor="auth-confirm">
                  Potvrdite lozinku
                </label>
                <input
                  id="auth-confirm"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ponovite lozinku"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  disabled={!supabaseAvailable}
                />
                {confirm && confirm !== password && <p className="text-xs text-red-600">Lozinke se ne poklapaju.</p>}
              </div>
            )}

            <div className="h-2 overflow-hidden rounded-full bg-gray-100" aria-hidden>
              <div
                className={`${password.length >= 10 ? 'bg-green-500' : password.length >= 6 ? 'bg-amber-500' : 'bg-gray-300'} h-full transition-all`}
                style={{ width: `${Math.min(100, password.length * 10)}%` }}
              />
            </div>

            {mode !== 'reset' && (
              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={sendResetEmail} className="text-indigo-600 hover:text-indigo-700 disabled:text-gray-400" disabled={!supabaseAvailable}>
                  Zaboravljena lozinka?
                </button>
                <span className="text-gray-500">{mode === 'signUp' ? 'Bar 6 karaktera' : '\u00A0'}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || (mode !== 'reset' && !email) || !password || !supabaseAvailable}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Obrada…' : mode === 'signIn' ? 'Prijava' : mode === 'reset' ? 'Postavi novu lozinku' : 'Registracija'}
            </button>

            <div aria-live="polite" className="min-h-5 text-sm">
              {error && <div className="text-red-600">{error}</div>}
              {message && <div className="text-green-700">{message}</div>}
            </div>

            <div className="pt-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => signInWithProvider('google')}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!supabaseAvailable}
                >
                  <span className="text-[#EA4335]">G</span>
                  <span>Nastavi sa Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => signInWithProvider('github')}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!supabaseAvailable}
                >
                  <Github className="h-4 w-4" />
                  <span>Nastavi sa GitHub</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
