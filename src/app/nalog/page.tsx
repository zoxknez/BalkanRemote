"use client"

import { useEffect, useMemo, useState } from "react"
import { createSupabaseBrowser } from "@/lib/supabaseClient"
import { Mail, Lock, Eye, EyeOff, Github } from "lucide-react"

export default function NalogPage() {
  const supabase = useMemo(() => (typeof window !== 'undefined' ? createSupabaseBrowser() : null), [])
  const [mode, setMode] = useState<"signIn" | "signUp" | "reset">("signIn")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSessionEmail(data.session?.user?.email ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSessionEmail(s?.user?.email ?? null))
    return () => sub.subscription.unsubscribe()
  }, [supabase])

  // Detect Supabase recovery link and show reset password UI
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.location.hash.includes('type=recovery')) {
      setMode('reset')
    }
  }, [])

  const submit = async () => {
  if (!supabase) return
  setLoading(true)
    setError(null)
    setMessage(null)
    try {
      // basic validation
      const emailOk = /.+@.+\..+/.test(email)
      if (!emailOk) throw new Error('Unesite ispravan email')
  if (password.length < 6) throw new Error('Lozinka mora imati bar 6 karaktera')
  if (mode === 'signUp' && password !== confirm) throw new Error('Lozinke se ne poklapaju')
      if (mode === 'reset') {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
        setMessage('Lozinka je promenjena. Sada se možete prijaviti.')
        setMode('signIn')
        setPassword("")
        setConfirm("")
      } else if (mode === "signIn") {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setMessage("Uspešno prijavljeni.")
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined }
        })
        if (error) throw error
        setMessage("Registracija uspešna. Proverite email za potvrdu (ako je potrebno).")
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg || "Došlo je do greške")
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
  if (!supabase) return
  await supabase.auth.signOut()
  }

  const resetPassword = async () => {
    if (!supabase) return
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const emailOk = /.+@.+\..+/.test(email)
      if (!emailOk) throw new Error('Unesite ispravan email')
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/nalog` : undefined,
      })
      if (error) throw error
      setMessage('Ako nalog postoji, poslat je email za promenu lozinke.')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg || 'Došlo je do greške')
    } finally {
      setLoading(false)
    }
  }

  const signInWithProvider = async (provider: 'github' | 'google') => {
    if (!supabase) return
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin + '/nalog' : undefined,
        },
      })
      if (error) throw error
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg || 'Greška pri OAuth prijavi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Nalog</h1>
        <p className="text-gray-600 mb-6">Registracija i prijava</p>

        {sessionEmail ? (
          <div className="mb-6 rounded-lg border p-4 bg-gray-50">
            <p className="text-sm text-gray-700">Prijavljeni kao: <span className="font-medium">{sessionEmail}</span></p>
            <button onClick={signOut} className="mt-3 inline-flex items-center px-4 py-2 rounded-lg bg-gray-800 text-white">
              Odjava
            </button>
          </div>
        ) : (
          <>
            <div className="inline-flex items-center gap-1 mb-5 rounded-lg p-1 bg-gray-100">
              <button
                onClick={() => setMode("signIn")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'signIn' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                aria-pressed={mode === 'signIn'}
              >Prijava</button>
              <button
                onClick={() => setMode("signUp")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'signUp' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                aria-pressed={mode === 'signUp'}
              >Registracija</button>
              <button
                onClick={() => setMode("reset")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'reset' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                aria-pressed={mode === 'reset'}
              >Reset lozinke</button>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="relative transition-shadow">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full border rounded-lg pl-9 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {email && !/.+@.+\..+/.test(email) && (
                <p className="text-xs text-red-600">Unesite ispravan email.</p>
              )}
              <label className="block text-sm font-medium text-gray-700">{mode === 'reset' ? 'Nova lozinka' : 'Lozinka'}</label>
              <div className="relative transition-shadow">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Unesite lozinku"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                  className="w-full border rounded-lg pl-9 p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-3 my-auto h-8 px-2 text-sm text-gray-600 hover:text-gray-900"
                  aria-label={showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'}
                >{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
              {password && password.length < 6 && (
                <p className="text-xs text-amber-600">Lozinka treba da ima bar 6 karaktera.</p>
              )}
              {mode === 'signUp' && (
                <>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Potvrdite lozinku"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {confirm && confirm !== password && (
                    <p className="text-xs text-red-600">Lozinke se ne poklapaju.</p>
                  )}
                </>
              )}
              <div className="h-2 rounded bg-gray-100 overflow-hidden" aria-hidden>
                <div
                  className={`${
                    password.length >= 10 ? 'bg-green-500' : password.length >= 6 ? 'bg-amber-500' : 'bg-gray-300'
                  } h-full transition-all`}
                  style={{ width: `${Math.min(100, password.length * 10)}%` }}
                />
              </div>
              {mode !== 'reset' && (
                <div className="flex items-center justify-between text-sm">
                  <button type="button" onClick={resetPassword} className="text-indigo-600 hover:text-indigo-700">
                    Zaboravljena lozinka?
                  </button>
                  <span className="text-gray-500">{mode === 'signUp' ? 'Bar 6 karaktera' : ' '} </span>
                </div>
              )}
              <button
                onClick={submit}
                disabled={loading || (!email && mode !== 'reset') || !password}
                className="w-full px-4 py-2 rounded-lg bg-indigo-600 disabled:opacity-50 text-white"
              >{loading ? 'Obrada…' : (mode === 'signIn' ? 'Prijava' : mode === 'reset' ? 'Postavi novu lozinku' : 'Registracija')}</button>
              <div aria-live="polite" className="min-h-5">
                {error && <div className="text-sm text-red-600">{error}</div>}
                {message && <div className="text-sm text-green-700">{message}</div>}
              </div>

              {/* OAuth providers */}
              <div className="pt-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => signInWithProvider('google')}
                    className="flex-1 inline-flex items-center justify-center gap-2 border rounded-lg py-2 text-sm hover:bg-gray-50"
                  >
                    <span className="text-[#EA4335]">G</span>
                    <span>Nastavi sa Google</span>
                  </button>
                  <button
                    onClick={() => signInWithProvider('github')}
                    className="flex-1 inline-flex items-center justify-center gap-2 border rounded-lg py-2 text-sm hover:bg-gray-50"
                  >
                    <Github className="w-4 h-4" />
                    <span>Nastavi sa GitHub</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
