<div align="center"># 🚀 Balkan Remote – Career Hub



# 🌍 Balkan Remote[![CI](https://github.com/zoxknez/BalkanRemote/actions/workflows/ci.yml/badge.svg)](https://github.com/zoxknez/BalkanRemote/actions/workflows/ci.yml)



### Kompletna Platforma za Remote Rad sa BalkanaPlatforma za remote rad iz Balkana: poreski vodič, resursi i alati, poslovi, mini forum za pitanja, i prijava/registracija.



[![Live Site](https://img.shields.io/badge/Live-balkan--remote.vercel.app-blue?style=for-the-badge)](https://balkan-remote.vercel.app)Live: https://balkan-remote.vercel.app

[![CI](https://img.shields.io/github/actions/workflow/status/zoxknez/BalkanRemote/ci.yml?style=for-the-badge&label=CI)](https://github.com/zoxknez/BalkanRemote/actions/workflows/ci.yml)

[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)## ✅ Trenutne funkcionalnosti

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)- Početna sa ključnim modulima (Poreski vodič, Saveti, Poslovi)

- Poreski vodič za RSD sa praktičnim presetima (Junior 120k, Medior 250k, Senior 500k)

**Balkan Remote** je moderna web platforma dizajnirana za profesionalce koji žele da rade remote poslove iz **Srbije, Hrvatske, BiH, Crne Gore, Albanije i Severne Makedonije**. - Resursi: bogata kolekcija kvalitetnih linkova (učenje, AI, zajednice, portfolio, freelancing…)

- Alati: filterabilna kolekcija alata + preporuke urednika (dev, remote stack, sigurnost, AI)

Platforma pruža sve što vam treba: **poreski vodič, alate za remote rad, agregator poslova, resurse za učenje, i mini forum za pitanja**.- Pitanja: mini Q&A (Supabase) – prijavljeni korisnici mogu postavljati pitanja

- Nalog: kompletan Auth UX (email/password, potvrda lozinke, indikator jačine, reset lozinke, OAuth Google/GitHub)

[Pogledaj Live Demo](https://balkan-remote.vercel.app) • [Prijavi Problem](https://github.com/zoxknez/BalkanRemote/issues) • [Predloži Feature](https://github.com/zoxknez/BalkanRemote/issues/new)- SEO osnova: sitemap/robots sa automatskim base URL fallback‑om (NEXT_PUBLIC_SITE_URL → VERCEL_URL)

- Merenje: Vercel Analytics + Speed Insights

</div>- Health-check: `/api/health` endpoint koji proverava Supabase dostupnost (za uptime monitoring)

- Oglasi: novi agregator poslova iz eksternih job feed/RSS izvora (dnevni sync, pretraga + filtriranje po tipu ugovora, iskustvu, kategoriji)

---

Napomena: Postoji osnovni kod za job scraping engine, ali je trenutno isključen/by‑design mock i API rute nisu aktivno povezane sa realnim izvorima.

## 📋 Sadržaj

## 🛠 Tech stack

- [✨ Ključne Mogućnosti](#-ključne-mogućnosti)

- [🎯 Moduli Platforme](#-moduli-platforme)- Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS

- [🛠️ Tech Stack](#️-tech-stack)- UI: Radix primitives, Framer Motion, Lucide ikone

- [🚀 Brzo Pokretanje](#-brzo-pokretanje)- Auth + DB: Supabase (Auth + Postgres sa RLS)

- [⚙️ Environment Varijable](#️-environment-varijable)- Hosting: Vercel (Turbopack build; po potrebi klasični build)

- [📦 Deployment](#-deployment)

- [🔐 Autentifikacija](#-autentifikacija)## 📦 Pokretanje lokalno

- [💼 Job Agregator (Oglasi & Firme)](#-job-agregator-oglasi--firme)

- [🧪 Testiranje](#-testiranje)Preduslovi: Node 20+

- [📊 Monitoring & Analytics](#-monitoring--analytics)

- [🤝 Doprinos Projektu](#-doprinos-projektu)1) Instalacija

- [📄 Licenca](#-licenca)```bash

npm install

---```



## ✨ Ključne Mogućnosti2) Okruženje (.env.local)

- Pogledaj `.env.example` i postavi sledeće promenljive:

### 🎨 **Moderni UI/UX**  - `NEXT_PUBLIC_SITE_URL` (opciono lokalno)

- Responsive dizajn za sve uređaje (desktop, tablet, mobilni)  - `NEXT_PUBLIC_SUPABASE_URL` (iz Supabase projekta)

- Framer Motion animacije za fluid korisničko iskustvo  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon/public key iz Supabase)

- Tailwind CSS sa custom temom i dark mode podrškom  - `SCRAPER_SCHEDULE_ENABLED` (opciono; podrazumevano false)

- Pristupačnost (a11y) sa ARIA labelama i keyboard navigacijom

3) Supabase podešavanje (jednokratno)

### 💰 **Poreski Vodič**- U Supabase konzoli (Auth → URL Configuration):

- Interaktivni kalkulator za paušalno i preduzetničko oporezivanje  - Site URL: https://balkan-remote.vercel.app (i/ili http://localhost:3000 za lokalni rad)

- Praktični preseti (Junior 120k, Medior 250k, Senior 500k RSD)  - Redirect URLs: dodaj https://balkan-remote.vercel.app i http://localhost:3000 (po želji i preview wildcard)

- Detaljan prikaz svih obračuna, doprinosa i neto zarade- U Supabase bazi pokreni SQL iz `scripts/supabase-setup.sql` (kreira tabelu `public.questions` i RLS politike).

- Export rezultata i deljenje kalkulacija

4) Dev server

### 💼 **Job Agregator**```bash

- **Oglasi Tab**: RSS feed agregacija sa 20+ izvora (automatski dnevni sync)npm run dev

- **Firme Tab**: Hibridni pregled poslova sa filtriranjem po kategorijama, iskustvu, tipu ugovora# Otvori http://localhost:3000

- Full-text pretraga (FTS) sa weighted ranking i snippet highlight```

- Real-time filtriranje, sortiranje, bookmark funkcionalnost

- Server-side pagination i caching sa ETag podrškom## 🚀 Deploy (Vercel)



### 🛠️ **Alati za Remote Rad**1) Poveži repo i odaberi Next.js preset (Root: ./)

- Kolekcija 50+ kategorisanih alata (Dev, Remote Stack, Security, AI)2) Environment Variables (All Environments ili bar Production/Preview):

- Preporuke urednika za popularne alate   - `NEXT_PUBLIC_SITE_URL` = tvoj domen (npr. https://balkan-remote.vercel.app)

- Filter po kategorijama i pretraga   - `NEXT_PUBLIC_SUPABASE_URL` = https://<tvoj-projekat>.supabase.co

   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Supabase anon key

### 📚 **Resursi**  - (opciono) `NEXT_PUBLIC_SITE_URL` = kanonski URL (ako ne postoji, koristi se `VERCEL_URL`)

- Bogata kolekcija linkova za učenje (YouTube, kursevi, AI, zajednice)3) Build: podrazumevano `next build --turbopack`. Ako zatreba, koristi klasični:

- Portfolio primeri, freelancing platforme   - skripta: `npm run build:classic` (Next klasični builder)

- Saveti za remote rad i career development

4) Speed Insights: paket je već dodat i komponenta uključena u `src/app/layout.tsx`.

### 💬 **Q&A Forum**

- Postavljanje i odgovaranje na pitanja (za registrovane korisnike)### Brzi checklist posle migracije repoa

- Supabase backend sa Row Level Security (RLS)

- Real-time notifikacije za nove odgovore- [ ] Vercel Project → Settings → Git → Connected Git Repository = novi repo

- [ ] Environment Variables postavljene (Production/Preview):

### 🔐 **Kompletan Auth Sistem**  - `NEXT_PUBLIC_SUPABASE_URL`

- Email/Password registracija sa potvrdom  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- OAuth providers (Google, GitHub)  - `SUPABASE_SERVICE_ROLE_KEY`

- Password strength indicator i validacija  - (opciono) `NEXT_PUBLIC_SITE_URL`

- Reset lozinke, email verifikacija- [ ] GitHub Actions Secrets: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

- Protected routes i server-side auth check- [ ] Pokrenuti “Jobs Sync” workflow ručno prvi put (Actions → Jobs Sync → Run)



---## 🔐 OAuth (Supabase)



## 🎯 Moduli PlatformeZa Google i GitHub prijavu:

- U Supabase → Authentication → Providers: uključi Google i/ili GitHub i unesi Client ID/Secret.

| Modul | Opis | Status |- Redirect URL-ovi (Sign in / Callback):

|-------|------|--------|  - Production: `https://<tvoj-domen>/nalog`

| **Početna** | Landing sa pregledom svih modula | ✅ Aktivno |  - Lokalno: `http://localhost:3000/nalog`

| **Poreski Vodič** | Kalkulator poreza sa presetima | ✅ Aktivno |- U Authentication → URL Configuration:

| **Saveti** | Career saveti i best practices | ✅ Aktivno |  - Site URL: `https://<tvoj-domen>` (i/ili `http://localhost:3000` za lokalni rad)

| **Poslovi (Oglasi)** | RSS agregator job oglasa | ✅ Aktivno |- Frontend već ima dugmad i pozive (`supabase.auth.signInWithOAuth`).

| **Poslovi (Firme)** | Hibridni pregled sa tabovima | ✅ Aktivno |

| **Alati** | Alati za remote rad | ✅ Aktivno |## 🔑 Environment promenljive

| **Resursi** | Linkovi za učenje | ✅ Aktivno |

| **Pitanja** | Q&A forum | ✅ Aktivno |- `NEXT_PUBLIC_SITE_URL` – kanonski osnovni URL; ako nije postavljen, koristi se Vercel `VERCEL_URL`

| **Nalog** | Auth i korisnički profil | ✅ Aktivno |- `NEXT_PUBLIC_SUPABASE_URL` – Supabase Project URL

| **API Health** | `/api/health` monitoring | ✅ Aktivno |- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase anon/public key (bezbedno za klijent uz RLS)

- `/api/health` – GET endpoint (bez auth) vraća JSON sa statusom Supabase konekcije (koristi se za monitoring)

---- `SCRAPER_SCHEDULE_ENABLED` – opcioni feature flag (by default false)

- `SUPABASE_SERVICE_ROLE_KEY` – (server only) koristi se u GitHub Action / lokalnoj sync skripti za upsert job oglasa

## 🛠️ Tech Stack

Specifično za agregator oglasa (`Oglasi`):

### **Frontend**- `/api/portal-jobs` – API ruta (Node runtime) koja vraća paginiranu listu + facet counts

- **Framework**: [Next.js 15.5](https://nextjs.org) (App Router, RSC, Server Actions)- `npm run sync:jobs` – pokreće skriptu `scripts/collect-job-feeds.ts` (RSS parsing + upsert)

- **Language**: [TypeScript 5.7](https://www.typescriptlang.org)- GitHub Actions workflow `.github/workflows/job-sync.yml` – zakazani nightly sync (03:00 UTC)

- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com) - GitHub Actions workflow `.github/workflows/job-prune.yml` – mesečno čišćenje starih oglasa (1. u mesecu)

- **UI Library**: [Radix UI](https://www.radix-ui.com) (primitives) - (opciono) `NEXT_PUBLIC_ENABLE_JOB_SCHEMA` = `1` za SSR JSON-LD JobPosting (limitirano na prvih 5)

- **Animation**: [Framer Motion 11](https://www.framer.com/motion) - Manual dry-run: `.github/workflows/job-sync-dry-run.yml` (workflow_dispatch) – koristi `JOB_SYNC_DRY_RUN=1` i NE piše u bazu

- **Icons**: [Lucide React](https://lucide.dev) - (opciono) `NEXT_PUBLIC_ENABLE_FEED_STATS` = `1` javni prikaz health tabele na `/oglasi/stats`

- **State**: React 19 (useState, useEffect, custom hooks) - (opciono) `FEED_STATS_TOKEN` – ako je postavljen, `/api/portal-jobs/stats` zahteva header `Authorization: Bearer <token>` i UI strana prosleđuje token server-side; bez ovoga endpoint je public.

 - `SUPABASE_SERVICE_ROLE_KEY` – neophodan za API/stats stranicu (server-only). Ako nije postavljen, `/oglasi/stats` prikazuje poruku i API vraća grešku.

### **Backend & Database**

- **BaaS**: [Supabase](https://supabase.com) (Auth + Postgres + Row Level Security)### Caching & Ranking (Portal Jobs)

- **API**: Next.js API Routes (Node.js runtime, Edge Functions)

- **ORM**: Supabase Client (REST API)- Conditional GET: `/api/portal-jobs` uključuje `ETag` header. Klijent koji pošalje `If-None-Match` sa istom vrednošću dobija `304 Not Modified` (štedi bandwidth / CPU).

- Cache-Control: `public, s-maxage=60, stale-while-revalidate=120` (Vercel/CDN i SWR strategija). Edge/CDN headeri duplirani (`CDN-Cache-Control`, `Vercel-CDN-Cache-Control`).

### **DevOps & Tooling**- Dodatni dijagnostički headeri:

- **Hosting**: [Vercel](https://vercel.com) (automatic deployments, edge caching)  - `X-Total` – ukupan broj rezultata (pre paginacije)

- **CI/CD**: GitHub Actions (job sync, tests, linting)  - `X-Result-Count` – broj rezultata u ovoj strani

- **Testing**: [Vitest](https://vitest.dev), React Testing Library  - `X-Supabase-Env` – koji Supabase env varovi su prisutni (`pub-url,srv-url,service`)

- **Linting**: ESLint + Prettier  - `X-Cache-Hit: etag` – vraća se samo uz 304

- **Type Checking**: TypeScript strict mode- Full-text search (FTS): aktivira se kada `FTS_RANK=1` u env + korisnik ukuca > 2 karaktera.

- **Monitoring**: Vercel Analytics, Speed Insights, Sentry (optional)  - Weighted vektor (setweight): A=title, B=company+tags, C=category, D=description.

  - Prefix matching: tokeni se konvertuju u `to_tsquery('simple', 'token:* & drugi:*')` – omogućava pronalaženje početaka reči.

### **Build System**  - Rank: `ts_rank_cd` – kombinacija pokrivenosti i pozicije; fallback redosled `posted_at`.

- **Bundler**: Next.js Turbopack (dev), Webpack (production fallback)  - Snippet: `ts_headline` sa `<mark>` wrapper-ima (sanitizovano pre prikaza).

- **CSS**: PostCSS + Tailwind JIT- Fallback (kad FTS isključen ili termini kratki): koristi se `ILIKE` OR (title/company/location/tags).

- **Package Manager**: npm- Sledeća evolucija (ideje): trigram fuzzy fallback, varijabilno ponderisanje preko custom config-a, session-based reordering (klik signali).



---## 📚 Korisne skripte (package.json)



## 🚀 Brzo Pokretanje- `dev` – start dev server (Turbopack)

- `build` – turbopack build

### Preduslovi- `build:classic` – klasični Next build

- `start` – start production server

- **Node.js**: 20.x ili noviji- `test` – vitest

- **npm**: 10.x ili noviji- `lint` – eslint

- **Supabase nalog**: [supabase.com](https://supabase.com)- `find:dupes` – skripta za pronalazak duplikata

- **Git**: za kloniranje repo-a- `sync:jobs` – ručno pokretanje agregacije RSS job oglasa (zahteva `SUPABASE_SERVICE_ROLE_KEY` u env)

- `prune:jobs` – brisanje starih oglasa (default > 60 dana) (`JOB_PRUNE_MAX_AGE_DAYS=45 npm run prune:jobs`)

### 1. Kloniraj Repo  - `FEED_TIMEOUT_MS` – timeout pojedinačnog feed request-a (default 15000ms)

  - `FEED_MAX_RETRIES` – broj retry pokušaja po feedu (default 2)

```bash  - `PORTAL_JOBS_RATE_WINDOW_SEC` / `PORTAL_JOBS_RATE_MAX` – rate limit API /api/portal-jobs (default 60 req / 60s)

git clone https://github.com/zoxknez/BalkanRemote.git  - `NEXT_PUBLIC_ENABLE_JOB_SCHEMA` – uključi SSR JSON-LD JobPosting (SEO eksperimentalno)

cd BalkanRemote  - `JOB_SYNC_DRY_RUN=1` – u sync skripti preskače DB upsert i feed stats updejte (samo prikuplja i loguje)

```  - `NEXT_PUBLIC_ENABLE_FEED_STATS` – prikazuje javnu stats stranicu `/oglasi/stats`

  - `FEED_STATS_TOKEN` – štiti stats API (vidi gore); koristi Bearer auth

### 2. Instaliraj Zavisnosti  - `SUPABASE_SERVICE_ROLE_KEY` – potreban za server-side čitanje `job_feed_stats` (stats API i UI)

  

```bash### Dedupe ratio logging

npm install

```Sync skripta sada loguje dedupe ratio: `ratio = unique/collected` sa 4 decimale (npr. 0.8421). Event polja:

- `job_sync_dry_run_complete`: `{ totalCollected, totalAfterDedupe, ratio, sources }`

### 3. Podesi Environment Varijable- `job_upsert_begin`: `{ count, ratio }`

- `job_sync_complete`: `{ total, ratio, sources }`

Kreiraj `.env.local` fajl u root direktorijumu:

Koristi se za praćenje kvaliteta izvora i procenta duplikata kroz vreme.

```bash

# Site Configuration## 🧭 Roadmap

NEXT_PUBLIC_SITE_URL=http://localhost:3000

- Pitanja: odgovori (answers), kategorije, tagovi, admin moderacija

# Supabase Configuration- Napredne opcije za OAuth (scopes, linkovanje naloga)

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co- Job scraping: cron, deduplikacija, verifikacija izvora i UI povezivanje

NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here- Oglasi: dodatni filteri (remote vs onsite, opseg plate kad postoji), JSON-LD JobPosting schema, brisanje zastarelih oglasa (npr > 60d)

SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here  - (prune skripta dodata – integrisati u mesečni workflow kasnije)

  - (mesečni workflow dodat)

# Optional Features## 🧪 Testovi

SCRAPER_SCHEDULE_ENABLED=false

NEXT_PUBLIC_ENABLE_JOB_SCHEMA=0Pokreni:

NEXT_PUBLIC_ENABLE_FEED_STATS=0

``````bash

npm test

**Napomena**: Pogledaj [Environment Varijable](#️-environment-varijable) sekciju za detaljnije objašnjenje.```



### 4. Podesi Supabase BazuPokriće:

- Kalkulator engine (`calculator-engine.test.ts`)

Pokreni SQL skriptu za kreiranje tabela i RLS politika:- Klasifikatori oglasa (`job-feed-classifiers.test.ts`)

- JSON-LD schema utili (`job-schema.test.ts`)

```bash- API /api/portal-jobs osnovna integracija i rate limit scenario (`src/tests/api/portal-jobs.test.ts`)

# U Supabase SQL Editor (https://app.supabase.com/project/_/sql)

# Kopiraj i pokreni sadržaj iz:### UI komponenta: ClipboardButton

cat scripts/supabase-setup.sql

```Pogledaj `src/components/clipboard-button.tsx` – pristupačno dugme za kopiranje sa fallback‑om i animiranim labelama.



### 5. Pokreni Dev ServerPrimena (osnovno):



```bash```tsx

npm run dev<ClipboardButton value={currentUrl} title="Kopiraj link" />

``````



Aplikacija će biti dostupna na **http://localhost:3000** 🎉Sa animiranom labelom i bez ikone:



---```tsx

<ClipboardButton

## ⚙️ Environment Varijable  value={currentUrl}

  title="Kopiraj link"

### Obavezne Varijable  showIcon={false}

  announceValue={false}

| Varijabla | Opis | Primer |  renderLabel={(status) => (

|-----------|------|--------|    status === 'copied' ? 'Link kopiran' : 'Kopiraj link'

| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |  )}

| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | `eyJhbGciOi...` |/>

| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only) | `eyJhbGciOi...` |```



### Opcionalne VarijableKljučni props:

- `value: string` – tekst za kopiranje (ako je prazan, dugme je disabled)

| Varijabla | Default | Opis |- `copyText`, `copiedText`, `errorText` – tekstovi stanja

|-----------|---------|------|- `title`, `ariaLabel` – pristupačni nazivi (ako `ariaLabel` nije zadat, koristi se `title` pa `copyText`)

| `NEXT_PUBLIC_SITE_URL` | `VERCEL_URL` | Kanonski URL sajta |- `announceValue?: boolean` – da li SR treba da pročita i vrednost (za dugačke URL‑ove postavi na `false`)

| `SCRAPER_SCHEDULE_ENABLED` | `false` | Omogući job scraping (legacy) |- `renderLabel?: (status) => ReactNode` – prilagođena labela (može uz animacije)

| `NEXT_PUBLIC_ENABLE_JOB_SCHEMA` | `0` | JSON-LD JobPosting schema |- `showIcon?: boolean` – prikaži/sakrij ikonu

| `NEXT_PUBLIC_ENABLE_FEED_STATS` | `0` | Javni feed stats na `/oglasi/stats` |

| `FEED_STATS_TOKEN` | - | Bearer token za zaštitu stats API |Napomena: rate limit test koristi in-memory bucket i izvršava 61 uzastopni poziv – ako promeniš `PORTAL_JOBS_RATE_MAX`, ažuriraj i test.

| `FTS_RANK` | `0` | Full-text search ranking |

| `FEED_TIMEOUT_MS` | `15000` | Timeout za feed request (ms) |## 📊 Logging

| `FEED_MAX_RETRIES` | `2` | Max retry za feed |

| `PORTAL_JOBS_RATE_WINDOW_SEC` | `60` | Rate limit window |Podrazumevano "text" format u dev. Za JSON log događaje (bolje za parsiranje u CI) postavi:

| `PORTAL_JOBS_RATE_MAX` | `60` | Max requests u window |

| `JOB_SYNC_DRY_RUN` | `0` | Dry run sync (ne piše u DB) |```bash

| `JOB_PRUNE_MAX_AGE_DAYS` | `60` | Max starost oglasa (dani) |LOG_FORMAT=json npm run sync:jobs

| `LOG_FORMAT` | `text` | Log format (`text` ili `json`) |```



---Event log primer (JSON):

`{"ts":"2025-09-27T03:00:00.000Z","evt":"job_sync_start"}`

## 📦 Deployment

- Dodatni kalkulatori i proširenja poreskog vodiča

### Vercel (Preporučeno)

## 🤝 Contributing

1. **Poveži GitHub Repo**

   - Idi na [vercel.com/new](https://vercel.com/new)Automatsko održavanje zavisnosti: Dependabot (`.github/dependabot.yml`) – weekly za npm i GitHub Actions.

   - Izaberi **BalkanRemote** repo

   - Framework: **Next.js**Predlozi i prijave problema: https://github.com/zoxknez/BalkanRemote/issues

   - Root Directory: `./`

---

2. **Podesi Environment Varijable**

   - Dodaj sve varijable iz `.env.local` u **Vercel Dashboard** → **Settings** → **Environment Variables**Balkan Remote – zajednica i alati za remote rad iz Srbije, Hrvatske, BiH, Crne Gore, Albanije i Severne Makedonije.

   - Odaberi okruženja: **Production**, **Preview**, **Development**

3. **Deploy**
   - Vercel će automatski deployovati svaki push na `main` granu
   - Preview deployments za svaki PR

4. **Custom Domain (opciono)**
   - **Settings** → **Domains** → Dodaj svoj domen
   - Podesi DNS CNAME rekord na Vercel

### GitHub Actions

Automatski workflow-i:

- **CI** (`.github/workflows/ci.yml`): Linting i testovi na svaki push
- **Job Sync** (`.github/workflows/job-sync.yml`): Dnevni sync job oglasa (03:00 UTC)
- **Job Prune** (`.github/workflows/job-prune.yml`): Mesečno čišćenje starih oglasa

**Potrebni GitHub Secrets**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## 🔐 Autentifikacija

### Podešavanje OAuth Providers

#### Google OAuth

1. Idi na [Google Cloud Console](https://console.cloud.google.com)
2. Kreiraj novi projekat ili izaberi postojeći
3. **APIs & Services** → **Credentials** → **Create OAuth 2.0 Client ID**
4. Dodaj **Authorized Redirect URIs**:
   ```
   https://your-project.supabase.co/auth/v1/callback
   http://localhost:54321/auth/v1/callback (lokalno)
   ```
5. Kopiraj **Client ID** i **Client Secret**
6. U Supabase Dashboard → **Authentication** → **Providers** → **Google**:
   - Omogući Google provider
   - Unesi Client ID i Secret

#### GitHub OAuth

1. Idi na [GitHub Developer Settings](https://github.com/settings/developers)
2. **New OAuth App**
3. Podesi:
   - **Homepage URL**: `https://balkan-remote.vercel.app`
   - **Authorization callback URL**: `https://your-project.supabase.co/auth/v1/callback`
4. Kopiraj **Client ID** i generiši **Client Secret**
5. U Supabase Dashboard → **Authentication** → **Providers** → **GitHub**:
   - Omogući GitHub provider
   - Unesi Client ID i Secret

### Supabase Auth Configuration

U **Supabase Dashboard** → **Authentication** → **URL Configuration**:

- **Site URL**: `https://balkan-remote.vercel.app` (production)
- **Redirect URLs**: 
  ```
  https://balkan-remote.vercel.app/nalog
  http://localhost:3000/nalog
  https://*.vercel.app/nalog (preview deployments)
  ```

---

## 💼 Job Agregator (Oglasi & Firme)

### Arhitektura

Platforma ima **dva tab-a za poslove**:

1. **Oglasi Tab** (`/oglasi`)
   - RSS feed agregacija sa 20+ izvora
   - Automatski dnevni sync (GitHub Actions)
   - Full-text pretraga sa weighted ranking
   - Filteri: contract type, experience, category, remote type
   - Server-side pagination (20 poslova po strani)

2. **Firme Tab** (`/firme`)
   - Hibridni pregled (Explore, Saved, Stats, Sources)
   - Kombinuje oglase iz više izvora
   - Bookmark funkcionalnost za prijavljene korisnike
   - Stats dashboard sa vizualizacijama

### Job Sync Workflow

#### Automatski Sync (GitHub Actions)

```yaml
# .github/workflows/job-sync.yml
# Pokreće se svaki dan u 03:00 UTC
```

#### Manuelni Sync (lokalno)

```bash
# Postavi env varijable
export NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Pokreni sync
npm run sync:jobs

# Dry run (ne piše u bazu)
JOB_SYNC_DRY_RUN=1 npm run sync:jobs
```

#### Brisanje Starih Oglasa

```bash
# Briše oglase starije od 60 dana (default)
npm run prune:jobs

# Custom starost (45 dana)
JOB_PRUNE_MAX_AGE_DAYS=45 npm run prune:jobs
```

### Full-Text Search (FTS)

**Omogućavanje FTS**:

```bash
# .env.local ili Vercel Environment Variables
FTS_RANK=1
```

**Kako funkcioniše**:
- Weighted search: **A** (title), **B** (company, tags), **C** (category), **D** (description)
- Prefix matching: `to_tsquery('simple', 'query:*')`
- Ranking: `ts_rank_cd` (coverage + position)
- Snippet highlight: `ts_headline` sa `<mark>` tagovima

### Caching Strategy

- **ETag**: Conditional GET za bandwidth optimizaciju
- **Cache-Control**: `public, s-maxage=60, stale-while-revalidate=120`
- **CDN**: Vercel Edge caching sa custom headers

### Rate Limiting

- **Window**: 60 sekundi
- **Max Requests**: 60
- **Strategy**: Token bucket (in-memory)

---

## 🧪 Testiranje

### Pokretanje Testova

```bash
# Pokreni sve testove
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Suites

| Test Suite | Fajl | Opis |
|------------|------|------|
| **Calculator Engine** | `calculator-engine.test.ts` | Poreski kalkulator logika |
| **Job Feed Classifiers** | `job-feed-classifiers.test.ts` | Klasifikacija job kategorija |
| **JSON-LD Schema** | `job-schema.test.ts` | SEO JobPosting schema |
| **API Portal Jobs** | `portal-jobs.test.ts` | API endpoint i rate limit |

### Continuous Integration

GitHub Actions CI pipeline:

```yaml
# .github/workflows/ci.yml
- Lint (ESLint)
- Type Check (TypeScript)
- Unit Tests (Vitest)
- Build Check (Next.js)
```

---

## 📊 Monitoring & Analytics

### Vercel Analytics

Automatski omogućeno u `src/app/layout.tsx`:

```tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

// ...
<Analytics />
<SpeedInsights />
```

### Health Check Endpoint

```bash
curl https://balkan-remote.vercel.app/api/health

# Response
{
  "status": "ok",
  "supabase": "connected",
  "timestamp": "2025-10-05T12:00:00.000Z"
}
```

### Logging

```bash
# Text format (dev)
npm run sync:jobs

# JSON format (production/CI)
LOG_FORMAT=json npm run sync:jobs
```

**Event Log Example** (JSON):
```json
{
  "ts": "2025-10-05T03:00:00.000Z",
  "evt": "job_sync_start"
}
```

---

## 🤝 Doprinos Projektu

Dobrodošli su svi doprinosi! 🎉

### Kako doprineti?

1. **Fork** repo
2. Kreiraj **feature branch** (`git checkout -b feature/nova-funkcionalnost`)
3. **Commit** izmene (`git commit -m 'feat: dodao novu funkcionalnost'`)
4. **Push** na branch (`git push origin feature/nova-funkcionalnost`)
5. Otvori **Pull Request**

### Coding Standards

- **TypeScript**: Strict mode, type safety
- **ESLint**: Follow existing rules
- **Prettier**: Auto-format on save
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`)

### Prijava Problema

Pronašli bug ili imate ideju za novi feature?

👉 [Otvori Issue](https://github.com/zoxknez/BalkanRemote/issues/new)

---

## 📄 Licenca

Ovaj projekat je licenciran pod **MIT licencom**. Pogledaj [LICENSE](LICENSE) fajl za više detalja.

---

## 🌟 Podrška

Ako vam se sviđa projekat, dajte **⭐ Star** na GitHub-u!

---

<div align="center">

**Napravio** [zoxknez](https://github.com/zoxknez) | **Platforma** za [Remote Rad sa Balkana](https://balkan-remote.vercel.app)

</div>
