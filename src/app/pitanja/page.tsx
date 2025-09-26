"use client"

import { useEffect, useRef } from "react"

/**
 * Pitanja/Sugestije – mini forum
 *
 * Ovo embed-uje Utterances (https://utteranc.es), GitHub-powered komentare.
 * Posetilac mora imati GitHub nalog da bi postovao – što nam rešava registraciju, auth i moderaciju.
 *
 * Napomena:
 *  - Potrebno je da instaliraš Utterances aplikaciju na repo
 *    https://github.com/apps/utterances
 *  - U widget konfiguraciji ispod zameni repo sa "zoxknez/BalkanRemote" (već postavljeno)
 *  - Issue mapping: "pathname" – pravi thread po stranici /pitanja
 */
export default function PitanjaPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Remove existing widget if re-mounted
    containerRef.current.querySelector("iframe")?.remove()
    containerRef.current.querySelector("script[data-utterances]")?.remove()

    const script = document.createElement("script")
    script.src = "https://utteranc.es/client.js"
    script.async = true
    script.crossOrigin = "anonymous"
    script.setAttribute("data-utterances", "")
  script.setAttribute("repo", "zoxknez/BalkanRemote")
  script.setAttribute("issue-term", "pathname")
  // No label needed; avoids requiring a pre-created label in the repo
  script.setAttribute("theme", "preferred-color-scheme")

    containerRef.current.appendChild(script)
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Pitanja i sugestije</h1>
        <p className="text-gray-600 mb-6">
          Ostavite pitanje ili predlog. Prijava preko GitHub naloga – nema zasebne registracije.
        </p>
        <div ref={containerRef} />
      </div>
    </div>
  )
}
