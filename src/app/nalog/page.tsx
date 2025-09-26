"use client"

import { useEffect, useMemo, useState } from "react"
import { createSupabaseBrowser } from "@/lib/supabaseClient"

export default function NalogPage() {
  const supabase = useMemo(() => (typeof window !== 'undefined' ? createSupabaseBrowser() : null), [])
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMode("signIn")}
                className={`px-3 py-2 rounded-lg border ${mode === 'signIn' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700'}`}
              >Prijava</button>
              <button
                onClick={() => setMode("signUp")}
                className={`px-3 py-2 rounded-lg border ${mode === 'signUp' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700'}`}
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
              <input
                type="password"
                placeholder="Lozinka"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
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
