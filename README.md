# 🚀 Remote Balkan - Comprehensive Remote Work Platform

**Napredna platforma za remote poslove na Balkanu sa AI-powered tools i multifunkcionalnim kalkulator sistemom.**

## ⚠️ Važno za AI Asistente
**НИКАД НЕ БРИСАТИ ПОСТОЈЕЋЕ ФАЈЛОВЕ** - увек питај пре већих измена и користи мале, тачне edit-ове.

## 🎯 Features

### 🔥 **MVP Moduli (Implementirani)**

#### 🎯 **Smart Match System**
- AI algoritam za personalizovane job preporuke
- TF-IDF skills matching sa scoring sistemom  
- Seniority, salary i location compatibility
- Detaljno objašnjenje zašto je posao idealan

#### 🧮 **Multifunkcionalni Kalkulator (40+ kalkulatora)**
- **Plata/Porezi**: RS Net↔Gross (Paušal/Preduzetnik/DOO), HR/BG/RO/MK varijante
- **Freelance**: Efektivna satnica, break-even rates, invoice builder
- **COL & Budžet**: Cost-of-living normalizer, remote office costs
- **Vreme**: Timezone overlap, PTO tracking, meeting costs
- **Procene**: Remote readiness score, burnout risk, productivity metrics

#### � **Poreski Vodič za Srbiju**  
- Kompletno poređenje: Paušal vs Preduzetnik vs DOO
- Interaktivni kalkulatori sa 2024 stopama
- FAQ sistema za remote radnike
- Oficijalni linkovi (APR, Poreska uprava, eFaktura)

#### 🧰 **Remote Balkan Toolbox**
- **140+ curated linkova** kategorisano u 27 grupa
- Job boards, EOR servisi, Payment solutions, Security tools
- Local badge sistem za Balkan-specific servise
- Advanced search, filtering i rating sistem

### 🤖 **Job Scraper Engine (In Development)**
- 40+ job board konfiguracija (HelloWorld, Poslovi.hr, RemoteOK...)
- Smart duplicate detection sa content fingerprinting
- Automatic daily scraping sa scheduling
- Rate limiting i anti-bot protection

## 🛠 **Tech Stack**

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **UI**: Framer Motion, Lucide Icons, Headless UI
- **State Management**: React hooks, SWR za data fetching  
- **Database**: PostgreSQL (Prisma ORM), Redis za caching
- **Scraping**: Puppeteer/Playwright, Proxy rotation
- **Deployment**: Vercel (frontend), Railway (backend)

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI primitives
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Build Tool:** Turbopack

## 📦 Instaliranje

```bash
# Instaliraj dependencies
npm install

# Pokreni development server
npm run dev

# Otvori http://localhost:3000
```

### 🔧 Konfiguracija okruženja

- `SCRAPER_SCHEDULE_ENABLED` – podrazumevano `false` u lokalnom okruženju. Postavi na `true` samo ako želiš da se job scraper automatski pokreće na intervalu. Manualno pokretanje је i dalje dostupno preko `POST /api/scraper/stats` čak и када je scheduler isključen.

## 🚀 Build i Deploy

```bash
# Production build
npm run build

# Start production server
npm start
```

---

Balkan remote zajednica
