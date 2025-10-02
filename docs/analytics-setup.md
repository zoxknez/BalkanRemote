# Environment Variables Setup - Analytics & Monitoring

Da bi sve analytics i monitoring funkcionalnosti radile, potrebno je dodati sledeće environment varijable:

## Vercel Environment Variables

Idi u Vercel Dashboard → Settings → Environment Variables i dodaj:

### Google Analytics (✅ CONFIGURED)
```bash
NEXT_PUBLIC_GA_ID=G-S5QX97NHY7
```
### Sentry Error Monitoring
```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@xxxxxxx.ingest.sentry.io/xxxxxxx
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

### JSON-LD Structured Data
```bash
NEXT_PUBLIC_ENABLE_JOB_SCHEMA=true
```

## Kako da sada ove keys:

### 1. Google Analytics
1. Idi na https://analytics.google.com/
2. Kreiraj novi property za www.balkan-remote.com
3. Uzmi GA4 Measurement ID (G-XXXXXXXXXX)

### 2. Sentry
1. Idi na https://sentry.io/
2. Kreiraj novi projekat
3. Uzmi DSN iz Project Settings → Client Keys (DSN)
4. Uzmi Organization Slug iz Organization Settings
5. Uzmi Project Slug iz Project Settings

**Već je konfigurisan:** Sentry wizard je automatski napravio konfiguraciju!

### 3. FINAL Vercel Environment Variables (READY!)
**Copy-paste ove exact vrednosti u Vercel:**

```bash
NEXT_PUBLIC_GA_ID=G-S5QX97NHY7
NEXT_PUBLIC_ENABLE_JOB_SCHEMA=true
```

**Sentry environment varijable NISU potrebne jer je DSN hardkovan u config fajlovima!**

**Kada dodaš Google Analytics ID:**
```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 4. Local Development (.env.local)
```bash
NEXT_PUBLIC_GA_ID=G-S5QX97NHY7
NEXT_PUBLIC_SENTRY_DSN=https://080348f0cac706fd2a00cf8a6c9a5dbd@o4510118899482624.ingest.de.sentry.io/4510118900990032
SENTRY_ORG=o0o0o0o
SENTRY_PROJECT=javascript-nextjs
NEXT_PUBLIC_ENABLE_JOB_SCHEMA=true
```

## Implementirane Analytics Features

✅ **Google Analytics GA4** - KOMPLETNO IMPLEMENTIRANO! (G-S5QX97NHY7)
  - Page view tracking automatski
  - Custom event tracking za job aplikacije
  - Search tracking i source click tracking
  - Optimizovano za performance i privacy
✅ **Sentry Error Monitoring** - kompletna konfiguracija sa wizardom
  - Client, server i edge runtime monitoring
  - Session replay za debugging  
  - Router transition tracking
  - Global error handler
  - Request error capturing
✅ **Job Click Tracking** - praćenje primena za poslove
✅ **Search Tracking** - praćenje pretrage po filterima  
✅ **Source Click Tracking** - praćenje klikova na job board-ove
✅ **JSON-LD Structured Data** - SEO optimizacija za job postings
✅ **Enhanced SEO Metadata** - poboljšani meta tagovi za oglasi stranicu

## Kako testirati:

1. Dodaj environment varijable
2. Redeploy na Vercel
3. Otvori Developer Tools → Network tab
4. Koristi sajt i vidi da li se šalju GA events i Sentry telemetrija

## Performance Impact:

- Google Analytics: ~3KB gzipped
- Sentry: ~125KB (vidi output: First Load JS povećan sa 102kB na 228kB)
- Total overhead: ~128KB
- **Opravdano:** Za production aplikaciju je kritično imati error monitoring

## Konfiguracija Status:

🟢 **Sentry** - POTPUNO KONFIGURISANO! 
  - Wizard kreirao sve potrebne fajlove
  - DSN hardkodovan u config fajlove  
  - Session Replay, Tracing, Logs enabled
  - Test page: `/sentry-example-page`
� **Google Analytics** - KOMPLETNO KONFIGURISANO! (G-S5QX97NHY7)
🟢 **JSON-LD Schema** - Radi (potrebno samo NEXT_PUBLIC_ENABLE_JOB_SCHEMA=true)

## Environment Variables za Vercel:

**MINIMALNO potrebno (Sentry već ima hardkovan DSN):**
```bash
NEXT_PUBLIC_ENABLE_JOB_SCHEMA=true
```

**Sa Google Analytics (FINAL):**
```bash
NEXT_PUBLIC_GA_ID=G-S5QX97NHY7
NEXT_PUBLIC_ENABLE_JOB_SCHEMA=true
```
