"use client"

import { useEffect, useMemo, useState } from "react"
import { createSupabaseBrowser } from "@/lib/supabaseClient"

type Question = {
  id: string
  content: string
  created_at: string
  user_email: string | null
}

export default function PitanjaPage() {
  const supabase = useMemo(() => (typeof window !== 'undefined' ? createSupabaseBrowser() : null), [])
  const [questions, setQuestions] = useState<Question[]>([])
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<{ user?: { email?: string | null } } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: authSub } = supabase.auth.onAuthStateChange((_evt, s) => setSession(s))
    return () => authSub.subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    (async () => {
      if (!supabase) return
      setLoading(true)
      const { data } = await supabase
        .from("questions")
        .select("id, content, created_at, user_email")
        .order("created_at", { ascending: false })
        .limit(50)
      setQuestions(data || [])
      setLoading(false)
    })()
  }, [supabase])

  const submit = async () => {
  if (!session || !supabase) return
    if (!content.trim()) return
    setSubmitting(true)
    const { error, data } = await supabase
      .from("questions")
      .insert({ content: content.trim(), user_email: session.user?.email || null })
      .select()
      .single()
    if (!error && data) {
      setQuestions((prev) => [data as Question, ...prev])
      setContent("")
    }
    setSubmitting(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Pitanja i sugestije</h1>
        <p className="text-gray-600 mb-6">Postavite pitanje ili predlog. Potrebna je registracija/prijava.</p>

        {!session ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-gray-600">
            <p className="mb-4">Za postavljanje pitanja, prijavite se.</p>
            <a href="/nalog" className="inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white">Prijava / Registracija</a>
          </div>
        ) : (
          <div className="mb-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Vaše pitanje ili sugestija..."
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={4}
            />
            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={submit}
                disabled={submitting || !content.trim()}
                className="px-4 py-2 rounded-lg bg-indigo-600 disabled:opacity-50 text-white"
              >
                {submitting ? 'Slanje...' : 'Pošalji pitanje'}
              </button>
              <span className="text-sm text-gray-500">Prijavljeni kao: {session.user?.email}</span>
            </div>
          </div>
        )}

        <h2 className="text-lg font-semibold text-gray-900 mb-3">Najnovija pitanja</h2>
        {loading ? (
          <div className="text-gray-500">Učitavanje...</div>
        ) : questions.length === 0 ? (
          <div className="text-gray-500">Još uvek nema pitanja.</div>
        ) : (
          <ul className="space-y-3">
            {questions.map((q) => (
              <li key={q.id} className="border rounded-lg p-3">
                <div className="text-gray-900 whitespace-pre-wrap">{q.content}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {q.user_email || 'anon'} • {new Date(q.created_at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
