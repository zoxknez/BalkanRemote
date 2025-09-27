# 🚀 Remote Balkan – Career Hub

Platforma za remote rad iz Balkana: poreski vodič, resursi i alati, poslovi, mini forum za pitanja, i prijava/registracija.

Live: https://balkan-remote.vercel.app

## ✅ Trenutne funkcionalnosti

- Početna sa ključnim modulima (Poreski vodič, Saveti, Poslovi)
- Poreski vodič za RSD sa praktičnim presetima (Junior 120k, Medior 250k, Senior 500k)
- Resursi: bogata kolekcija kvalitetnih linkova (učenje, AI, zajednice, portfolio, freelancing…)
- Alati: filterabilna kolekcija alata + preporuke urednika (dev, remote stack, sigurnost, AI)
- Pitanja: mini Q&A (Supabase) – prijavljeni korisnici mogu postavljati pitanja
- Nalog: kompletan Auth UX (email/password, potvrda lozinke, indikator jačine, reset lozinke, OAuth Google/GitHub)
- SEO osnova: sitemap/robots sa automatskim base URL fallback‑om (NEXT_PUBLIC_SITE_URL → VERCEL_URL)
- Merenje: Vercel Analytics + Speed Insights
- Health-check: `/api/health` endpoint koji proverava Supabase dostupnost (za uptime monitoring)
- Oglasi: novi agregator poslova iz eksternih job feed/RSS izvora (dnevni sync, pretraga + filtriranje po tipu ugovora, iskustvu, kategoriji)

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
  - (opciono) `NEXT_PUBLIC_SITE_URL` = kanonski URL (ako ne postoji, koristi se `VERCEL_URL`)
3) Build: podrazumevano `next build --turbopack`. Ako zatreba, koristi klasični:
   - skripta: `npm run build:classic` (Next klasični builder)

4) Speed Insights: paket je već dodat i komponenta uključena u `src/app/layout.tsx`.

## 🔐 OAuth (Supabase)

Za Google i GitHub prijavu:
- U Supabase → Authentication → Providers: uključi Google i/ili GitHub i unesi Client ID/Secret.
- Redirect URL-ovi (Sign in / Callback):
  - Production: `https://<tvoj-domen>/nalog`
  - Lokalno: `http://localhost:3000/nalog`
- U Authentication → URL Configuration:
  - Site URL: `https://<tvoj-domen>` (i/ili `http://localhost:3000` za lokalni rad)
- Frontend već ima dugmad i pozive (`supabase.auth.signInWithOAuth`).

## 🔑 Environment promenljive

- `NEXT_PUBLIC_SITE_URL` – kanonski osnovni URL; ako nije postavljen, koristi se Vercel `VERCEL_URL`
- `NEXT_PUBLIC_SUPABASE_URL` – Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase anon/public key (bezbedno za klijent uz RLS)
- `/api/health` – GET endpoint (bez auth) vraća JSON sa statusom Supabase konekcije (koristi se za monitoring)
- `SCRAPER_SCHEDULE_ENABLED` – opcioni feature flag (by default false)
- `SUPABASE_SERVICE_ROLE_KEY` – (server only) koristi se u GitHub Action / lokalnoj sync skripti za upsert job oglasa

Specifično za agregator oglasa (`Oglasi`):
- `/api/portal-jobs` – API ruta (Node runtime) koja vraća paginiranu listu + facet counts
- `npm run sync:jobs` – pokreće skriptu `scripts/collect-job-feeds.ts` (RSS parsing + upsert)
- GitHub Actions workflow `.github/workflows/job-sync.yml` – zakazani nightly sync (03:00 UTC)

## 📚 Korisne skripte (package.json)

- `dev` – start dev server (Turbopack)
- `build` – turbopack build
- `build:classic` – klasični Next build
- `start` – start production server
- `test` – vitest
- `lint` – eslint
- `find:dupes` – skripta za pronalazak duplikata
- `sync:jobs` – ručno pokretanje agregacije RSS job oglasa (zahteva `SUPABASE_SERVICE_ROLE_KEY` u env)
- `prune:jobs` – brisanje starih oglasa (default > 60 dana) (`JOB_PRUNE_MAX_AGE_DAYS=45 npm run prune:jobs`)

## 🧭 Roadmap

- Pitanja: odgovori (answers), kategorije, tagovi, admin moderacija
- Napredne opcije za OAuth (scopes, linkovanje naloga)
- Job scraping: cron, deduplikacija, verifikacija izvora i UI povezivanje
- Oglasi: dodatni filteri (remote vs onsite, opseg plate kad postoji), JSON-LD JobPosting schema, brisanje zastarelih oglasa (npr > 60d)
  - (prune skripta dodata – integrisati u mesečni workflow kasnije)
## 🧪 Testovi

Pokreni:

```bash
npm test
```

Dodati testovi za klasifikatore oglasa (`src/lib/__tests__/job-feed-classifiers.test.ts`).

## 📊 Logging

Podrazumevano "text" format u dev. Za JSON log događaje (bolje za parsiranje u CI) postavi:

```bash
LOG_FORMAT=json npm run sync:jobs
```

Event log primer (JSON):
`{"ts":"2025-09-27T03:00:00.000Z","evt":"job_sync_start"}`

- Dodatni kalkulatori i proširenja poreskog vodiča

## 🤝 Contributing

Predlozi i prijave problema: https://github.com/zoxknez/BalkanRemote/issues

---

Remote Balkan – zajednica i alati za remote rad iz Srbije, Hrvatske, BiH, Crne Gore, Albanije i Severne Makedonije.
