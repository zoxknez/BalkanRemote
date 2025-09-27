"use client";

export default function PosloviContent() {
  // Minimalna verzija stranice "Poslovi" na zahtev: uklonjen hero, JobsFeed,
  // brze prečice, filteri i sve sekcije/opisi.
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
          Poslovi
        </h1>
        <p className="mt-4 text-gray-600">
          Stranica je privremeno pojednostavljena. U toku je ažuriranje sadržaja.
        </p>
      </div>
    </div>
  );
}
