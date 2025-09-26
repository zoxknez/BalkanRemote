"use client"

import { useEffect, useMemo, useState } from "react"
import { createSupabaseBrowser } from "@/lib/supabaseClient"

export default function NalogPage() {
  const supabase = useMemo(() => (typeof window !== 'undefined' ? createSupabaseBrowser() : null), [])
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
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
      if (mode === "signIn") {
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
            </div>

            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Lozinka"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-3 my-auto h-8 px-2 text-sm text-gray-600 hover:text-gray-900"
                  aria-label={showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'}
                >{showPassword ? 'Sakrij' : 'Prikaži'}</button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={resetPassword} className="text-indigo-600 hover:text-indigo-700">
                  Zaboravljena lozinka?
                </button>
                <span className="text-gray-500">{mode === 'signUp' ? 'Bar 6 karaktera' : ' '} </span>
              </div>
              <button
                onClick={submit}
                disabled={loading || !email || !password}
                className="w-full px-4 py-2 rounded-lg bg-indigo-600 disabled:opacity-50 text-white"
              >{loading ? 'Obrada…' : (mode === 'signIn' ? 'Prijava' : 'Registracija')}</button>
              {error && <div className="text-sm text-red-600">{error}</div>}
              {message && <div className="text-sm text-green-700">{message}</div>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
