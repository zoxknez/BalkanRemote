export default function KontaktPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 text-white text-2xl mb-3">✉️</div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Kontakt</h1>
          <p className="text-gray-600 mt-2">Bez email adresa – javite se preko sledećih kanala</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="https://x.com/KoronVirus"
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition"
          >
            <div className="text-2xl">𝕏</div>
            <div className="mt-2 font-semibold text-gray-900 group-hover:text-indigo-700">X (Twitter)</div>
            <div className="text-sm text-gray-600">Pošaljite DM ili mention</div>
          </a>

          <a
            href="https://www.linkedin.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition"
          >
            <div className="text-2xl">in</div>
            <div className="mt-2 font-semibold text-gray-900 group-hover:text-indigo-700">LinkedIn</div>
            <div className="text-sm text-gray-600">Povežite se i pošaljite poruku</div>
          </a>

          <a
            href="https://github.com/zoxknez/BalkanRemote/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition"
          >
            <div className="text-2xl">💬</div>
            <div className="mt-2 font-semibold text-gray-900 group-hover:text-indigo-700">GitHub Issues</div>
            <div className="text-sm text-gray-600">Otvorite issue za predlog ili prijavu problema</div>
          </a>

          <a
            href="https://github.com/zoxknez/BalkanRemote"
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition"
          >
            <div className="text-2xl">⭐</div>
            <div className="mt-2 font-semibold text-gray-900 group-hover:text-indigo-700">Repo & Diskusija</div>
            <div className="text-sm text-gray-600">Zvezdica i diskusija dobrodošli</div>
          </a>
        </div>

        <div className="mt-8 text-sm text-gray-500 text-center">
          Preferiramo javne kanale kako bismo znanje i rešenja deliili sa zajednicom.
        </div>
      </div>
    </div>
  )
}
