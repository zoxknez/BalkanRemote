"use client"

import { useMemo } from "react"
import { createSupabaseBrowser } from "@/lib/supabaseClient"
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"

export default function NalogPage() {
  const supabase = useMemo(() => createSupabaseBrowser(), [])

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Nalog</h1>
        <p className="text-gray-600 mb-6">Registracija i prijava</p>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          redirectTo={typeof window !== 'undefined' ? window.location.origin : undefined}
        />
      </div>
    </div>
  )
}
