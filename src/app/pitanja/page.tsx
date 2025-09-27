"use client"

import { useEffect, useMemo, useState } from "react"
import { Users, MessageCircle, Clock, Sparkles } from "lucide-react"
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

  const stats = useMemo(() => {
    const total = questions.length
    const unique = new Set(questions.map((q) => q.user_email ?? 'anon')).size
    const latestDate = total ? new Date(questions[0].created_at) : null
    const latestLabel = latestDate
      ? latestDate.toLocaleDateString('sr-RS', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—'

    return {
      total,
      unique,
      latestLabel,
    }
  }, [questions])

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
              <MessageCircle className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-3">Pitanja i sugestije</h1>
          <p className="text-center text-blue-100 text-lg max-w-2xl mx-auto">
            Postavite pitanje timu Remote Balkan zajednice ili pročitajte iskustva drugih.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3">
              <Sparkles className="h-5 w-5 text-amber-200" />
              <div>
                <p className="text-xs uppercase tracking-wide text-blue-100">Ukupno pitanja</p>
                <p className="text-lg font-semibold text-white">{stats.total}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3">
              <Users className="h-5 w-5 text-green-200" />
              <div>
                <p className="text-xs uppercase tracking-wide text-blue-100">Aktivnih članova</p>
                <p className="text-lg font-semibold text-white">{stats.unique}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3">
              <Clock className="h-5 w-5 text-indigo-200" />
              <div>
                <p className="text-xs uppercase tracking-wide text-blue-100">Poslednje pitanje</p>
                <p className="text-lg font-semibold text-white">{stats.latestLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

  <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 md:mt-14 pb-16 relative z-10">
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
    </div>
  )
}
