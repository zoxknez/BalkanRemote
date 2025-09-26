# 🚀 Remote Balkan – Career Hub

Platforma za remote rad iz Balkana: poreski vodič, resursi i alati, poslovi, mini forum za pitanja, i prijava/registracija.

Live: https://balkan-remote.vercel.app

## ✅ Trenutne funkcionalnosti

- Početna sa ključnim modulima (Poreski vodič, Saveti, Poslovi)
- Poreski vodič za RSD sa praktičnim presetima (Junior 120k, Medior 250k, Senior 500k)
- Resursi: bogata kolekcija kvalitetnih linkova (učenje, AI, zajednice, portfolio, freelancing…)
- Alati: filterabilna kolekcija alata + preporuke urednika (dev, remote stack, sigurnost, AI)
- Pitanja: mini Q&A (Supabase) – prijavljeni korisnici mogu postavljati pitanja
- Nalog: registracija/prijava preko Supabase Auth (email/password, spremno za OAuth)
- SEO osnova: sitemap/robots sa automatskim base URL fallback‑om (NEXT_PUBLIC_SITE_URL → VERCEL_URL)
- Web Analytics: Vercel Analytics uključen

Napomena: Postoji osnovni kod za job scraping engine, ali je trenutno isključen/by‑design mock i API rute nisu aktivno povezane sa realnim izvorima.

## 🛠 Tech stack

- Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- UI: Radix primitives, Framer Motion, Lucide ikone
- Auth + DB: Supabase (Auth + Postgres sa RLS)
- Hosting: Vercel (Turbopack build; po potrebi klasični build)

## 📦 Pokretanje lokalno

Preduslovi: Node 20+

1) Instalacija
```bash
npm install
```

2) Okruženje (.env.local)
- Pogledaj `.env.example` i postavi sledeće promenljive:
  - `NEXT_PUBLIC_SITE_URL` (opciono lokalno)
  - `NEXT_PUBLIC_SUPABASE_URL` (iz Supabase projekta)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon/public key iz Supabase)
  - `SCRAPER_SCHEDULE_ENABLED` (opciono; podrazumevano false)

3) Supabase podešavanje (jednokratno)
- U Supabase konzoli (Auth → URL Configuration):
  - Site URL: https://balkan-remote.vercel.app (i/ili http://localhost:3000 za lokalni rad)
  - Redirect URLs: dodaj https://balkan-remote.vercel.app i http://localhost:3000 (po želji i preview wildcard)
- U Supabase bazi pokreni SQL iz `scripts/supabase-setup.sql` (kreira tabelu `public.questions` i RLS politike).

4) Dev server
```bash
npm run dev
# Otvori http://localhost:3000
```

## 🚀 Deploy (Vercel)

1) Poveži repo i odaberi Next.js preset (Root: ./)
2) Environment Variables (All Environments ili bar Production/Preview):
   - `NEXT_PUBLIC_SITE_URL` = tvoj domen (npr. https://balkan-remote.vercel.app)
   - `NEXT_PUBLIC_SUPABASE_URL` = https://<tvoj-projekat>.supabase.co
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Supabase anon key
3) Build: podrazumevano `next build --turbopack`. Ako zatreba, koristi klasični:
   - skripta: `npm run build:classic` (Next klasični builder)

## 🔑 Environment promenljive

- `NEXT_PUBLIC_SITE_URL` – kanonski osnovni URL; ako nije postavljen, koristi se Vercel `VERCEL_URL`
- `NEXT_PUBLIC_SUPABASE_URL` – Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase anon/public key (bezbedno za klijent uz RLS)
- `SCRAPER_SCHEDULE_ENABLED` – opcioni feature flag (by default false)

## 📚 Korisne skripte (package.json)

- `dev` – start dev server (Turbopack)
- `build` – turbopack build
- `build:classic` – klasični Next build
- `start` – start production server
- `test` – vitest
- `lint` – eslint
- `find:dupes` – skripta za pronalazak duplikata

## 🧭 Roadmap

- Pitanja: odgovori (answers), kategorije, tagovi, admin moderacija
- OAuth (Google/GitHub) kroz Supabase
- Job scraping: cron, deduplikacija, verifikacija izvora i UI povezivanje
- Dodatni kalkulatori i proširenja poreskog vodiča

## 🤝 Contributing

Predlozi i prijave problema: https://github.com/zoxknez/BalkanRemote/issues

---

Remote Balkan – zajednica i alati za remote rad iz Srbije, Hrvatske, BiH, Crne Gore, Albanije i Severne Makedonije.
