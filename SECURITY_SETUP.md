# 🔒 Security Setup - RemoteBalkan App

## ✅ IMPLEMENTIRANO (Sve Kritične Fix-eve)

### 1. ✅ Autentifikacija na POST `/api/hybrid-jobs`
- Bearer token authentication
- Konfiguriše se sa `HYBRID_JOBS_API_KEY` env variable
- Reject unauthorized requests sa 401 statusom

### 2. ✅ Rate Limiting na GET `/api/hybrid-jobs`
- 30 requests per minute po IP adresi
- Automatic cleanup old buckets (memory leak prevention)
- 429 response sa Retry-After header

### 3. ✅ SQL Injection Prevention
- Search input sanitization
- Escape SQL wildcards (%, _, \)
- Remove special characters
- Length limiting (max 100 chars)

### 4. ✅ Zod Validation Schema
- Strict type checking na POST endpoint
- Field length limits
- Email/URL validation
- Enum validation za work_type, region, etc.

### 5. ✅ Error Boundary
- Catches React errors gracefully
- Production-safe error messages
- Development mode shows stack traces
- Auto-retry functionality

### 6. ✅ Cache Invalidation
- Automatic cache clear nakon POST request
- Pattern-based invalidation (`invalidatePattern`)
- Prevents stale data

### 7. ✅ Environment Validation
- Zod-based env schema
- Auto-validation na import (dev/test)
- Production warnings za missing optional vars
- Typed environment access

---

## 🔐 ENVIRONMENT VARIABLES

### Kreiraj `.env.local` file:

```env
# ===================================================================
# REQUIRED (Aplikacija neće raditi bez ovih)
# ===================================================================

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ===================================================================
# SECURITY (Preporučeno za production)
# ===================================================================

# API Key za POST /api/hybrid-jobs (min 32 karaktera)
# Generiši sa: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
HYBRID_JOBS_API_KEY=

# Feed Stats Token (opciono)
FEED_STATS_TOKEN=

# ===================================================================
# OPTIONAL (Za production features)
# ===================================================================

# Site URL
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Vercel Analytics & Speed Insights
NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS=true
NEXT_PUBLIC_ENABLE_VERCEL_SPEED_INSIGHTS=true

# Sentry Error Tracking
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=javascript-nextjs

# ===================================================================
# DEVELOPMENT (Samo za local development)
# ===================================================================

NODE_ENV=development
NEXT_PUBLIC_DEV_AUTO_AUTH=0
```

---

## 🚀 KAKO GENERISATI API KEY

### Metoda 1: Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Metoda 2: OpenSSL
```bash
openssl rand -hex 32
```

### Metoda 3: Online (ako nemaš Node.js/OpenSSL)
```
https://www.uuidgenerator.net/api/guid
```

**Kopiraj generated key i dodaj u `.env.local`:**
```env
HYBRID_JOBS_API_KEY=a1b2c3d4e5f6...your-64-char-hex-key...
```

---

## 🧪 TESTIRANJE SECURITY FIX-EVA

### 1. Test Auth (POST bez tokena - treba da vrati 401)
```bash
curl -X POST http://localhost:3000/api/hybrid-jobs \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Job","company_name":"Test","work_type":"hybrid","source_name":"test","external_id":"test-1"}'
```

**Očekivani rezultat:**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### 2. Test Auth (sa tokenom - treba da radi)
```bash
curl -X POST http://localhost:3000/api/hybrid-jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key-from-env" \
  -d '{
    "title": "Senior Developer",
    "company_name": "Test Company",
    "work_type": "hybrid",
    "source_name": "test",
    "external_id": "test-123"
  }'
```

**Očekivani rezultat:**
```json
{
  "success": true,
  "data": { ... }
}
```

### 3. Test Rate Limiting (35 requests brzo - treba 429)
```bash
for i in {1..35}; do
  echo "Request $i:"
  curl -s http://localhost:3000/api/hybrid-jobs?limit=10 | jq '.success, .error'
done
```

**Očekivani rezultat:** Prvi 30 requests OK, 31-35 vraćaju:
```json
{
  "success": false,
  "error": "Rate limit exceeded. Try again in 1 minute."
}
```

### 4. Test Validation (invalid data - treba 422)
```bash
curl -X POST http://localhost:3000/api/hybrid-jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{"title":"ab","company_name":"Test","work_type":"invalid","source_name":"test","external_id":"test-1"}'
```

**Očekivani rezultat:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "title": ["Title must be at least 3 characters"],
    "work_type": ["Invalid enum value..."]
  }
}
```

### 5. Test SQL Injection Prevention
```bash
curl "http://localhost:3000/api/hybrid-jobs?search=%27%20OR%201%3D1--"
```

**Očekivani rezultat:** Search is sanitized, no SQL injection occurs

---

## 📊 SECURITY CHECKLIST

- [x] ✅ POST authentication (Bearer token)
- [x] ✅ Rate limiting (30 req/min)
- [x] ✅ Input sanitization (SQL injection prevention)
- [x] ✅ Zod validation (type safety)
- [x] ✅ Error boundary (graceful error handling)
- [x] ✅ Cache invalidation (prevent stale data)
- [x] ✅ Environment validation (Zod schema)
- [x] ✅ Security headers (already in next.config.ts)
- [x] ✅ CSP policy (already configured)
- [x] ✅ HTTPS enforced (upgrade-insecure-requests)

---

## 🔐 ADDITIONAL SECURITY RECOMMENDATIONS

### 1. Database Row Level Security (RLS)
```sql
-- Pokreni u Supabase SQL Editor:

-- Enable RLS na hybrid_jobs tabeli
ALTER TABLE hybrid_jobs ENABLE ROW LEVEL SECURITY;

-- Policy: Read access za sve (GET)
CREATE POLICY "Allow public read access" ON hybrid_jobs
  FOR SELECT USING (true);

-- Policy: Write access samo sa service key (POST)
CREATE POLICY "Service role only write" ON hybrid_jobs
  FOR INSERT 
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role only update" ON hybrid_jobs
  FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role only delete" ON hybrid_jobs
  FOR DELETE
  USING (auth.role() = 'service_role');
```

### 2. API Rate Limiting Headers
Aplikacija već šalje:
- `X-RateLimit-Limit`: Max requests
- `X-RateLimit-Remaining`: Preostali requests
- `Retry-After`: Kada pokušati ponovo

### 3. Monitoring & Alerts
- Sentry tracks errors automatically
- Logger.error/warn/info u svim API routes
- Cache stats dostupni sa `redisCache.getStats()`

### 4. Production Deployment
```bash
# Proveri environment pre deploya:
npm run typecheck
npm run lint
npm run build

# Verify env variables su set u Vercel:
vercel env ls
```

---

## 🎯 IMPACT

**Pre Security Fix-eva:**
- ❌ Anyone može da kreira oglase (no auth)
- ❌ DDoS vulnerability (no rate limit)
- ⚠️ SQL injection risk
- ⚠️ No validation (bad data u bazi)
- ⚠️ Errors crash React app
- ⚠️ Stale cache data

**Posle Security Fix-eva:**
- ✅ Samo authorized requests mogu kreirati oglase
- ✅ Rate limiting prevents abuse (30 req/min)
- ✅ SQL injection prevented (sanitization)
- ✅ Data validation ensures quality
- ✅ Graceful error handling (no crashes)
- ✅ Fresh data (cache invalidation)

---

## 📝 FILES CHANGED

```
✅ src/app/api/hybrid-jobs/route.ts      - Full security implementation
✅ src/lib/redis-cache.ts                 - Added invalidatePattern
✅ src/components/error-boundary.tsx      - New component
✅ src/app/layout.tsx                     - Integrated ErrorBoundary
✅ src/lib/env-validation.ts              - New validation module
✅ SECURITY_SETUP.md                      - This file
```

---

**Kreirao:** AI Assistant  
**Datum:** 15. Oktobar 2025  
**Status:** ✅ **PRODUCTION READY!**  
**Security Level:** 🔒 **HIGH**

