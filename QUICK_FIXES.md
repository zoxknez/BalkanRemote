# ⚡ Quick Fixes - RemoteBalkan App

## 🚨 KRITIČNI FIX-EVI (Uradi Odmah!)

### Fix 1: Dodaj Auth na POST `/api/hybrid-jobs`

**Fajl:** `src/app/api/hybrid-jobs/route.ts`

```typescript
// Dodaj na vrh fajla:
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const apiKey = process.env.HYBRID_JOBS_API_KEY; // Dodaj u .env.local
  
  if (!apiKey) {
    console.warn('[hybrid-jobs] API key not configured');
    return false; // U produkciji MORA biti key!
  }
  
  if (!authHeader) return false;
  
  const [scheme, token] = authHeader.split(' ');
  return scheme === 'Bearer' && token === apiKey;
}

// Izmeni POST funkciju:
export async function POST(request: NextRequest) {
  // ADD THIS:
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }
  
  // Rest of the code...
  try {
    const body = await request.json();
    // ...
  }
}
```

**Dodaj u `.env.local`:**
```env
HYBRID_JOBS_API_KEY=your-secure-random-key-here-min-32-chars
```

**Generiši key:**
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# ili online:
# https://www.uuidgenerator.net/api/guid
```

---

### Fix 2: Dodaj Rate Limiting na GET `/api/hybrid-jobs`

**Fajl:** `src/app/api/hybrid-jobs/route.ts`

```typescript
// Dodaj na vrh fajla (ispod importa):
const rateLimitBuckets = new Map<string, { count: number; expires: number }>();
const RATE_LIMIT_MAX = 30; // 30 requests
const RATE_LIMIT_WINDOW_MS = 60_000; // per minute

function isRateLimited(ip: string | null): boolean {
  if (!ip) return false; // Allow if no IP (local dev)
  
  const now = Date.now();
  let bucket = rateLimitBuckets.get(ip);
  
  if (!bucket || bucket.expires < now) {
    bucket = { count: 0, expires: now + RATE_LIMIT_WINDOW_MS };
    rateLimitBuckets.set(ip, bucket);
  }
  
  bucket.count += 1;
  
  // Cleanup old buckets periodically
  if (rateLimitBuckets.size > 1000) {
    for (const [key, value] of rateLimitBuckets.entries()) {
      if (value.expires < now) rateLimitBuckets.delete(key);
    }
  }
  
  return bucket.count > RATE_LIMIT_MAX;
}

// Izmeni GET funkciju:
export async function GET(request: NextRequest) {
  // ADD THIS na početak:
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || null;
    
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, error: 'Rate limit exceeded. Try again in 1 minute.' },
      { 
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
          'X-RateLimit-Remaining': '0',
          'Cache-Control': 'no-store',
        }
      }
    );
  }
  
  // Rest of the code...
  try {
    const { searchParams } = new URL(request.url);
    // ...
  }
}
```

---

### Fix 3: Sanitizuj Search Input (SQL Injection Prevention)

**Fajl:** `src/app/api/hybrid-jobs/route.ts`

```typescript
// Dodaj helper funkciju:
function sanitizeSearchInput(input: string): string {
  return input
    .replace(/[%_\\]/g, '\\$&')    // Escape SQL wildcards
    .replace(/[^\w\s+-]/g, '')     // Remove special chars
    .slice(0, 100)                 // Limit length
    .trim();
}

// Izmeni search filter deo:
if (search) {
  const sanitized = sanitizeSearchInput(search);
  
  if (sanitized) { // Only search if there's valid input
    query = query.or(
      `title.ilike.%${sanitized}%,description.ilike.%${sanitized}%,company_name.ilike.%${sanitized}%`
    );
  }
}
```

**Takođe u:** `src/app/api/jobs/route.ts` (ako postoji slično)

---

## ⚠️ VAŽNI FIX-EVI (Sledeće)

### Fix 4: Dodaj Cache Invalidation

**Fajl:** `src/app/api/hybrid-jobs/route.ts`

```typescript
import { redisCache, cacheKeys } from '@/lib/redis-cache';

// U POST funkciji, nakon uspešnog insert-a:
export async function POST(request: NextRequest) {
  // ... auth check ...
  // ... validation ...
  
  const { data, error } = await supabase
    .from('hybrid_jobs')
    .insert([validated.data])
    .select()
    .single();

  if (error) {
    // ... error handling ...
  }

  // ADD THIS: Invalidate cache after inserting new job
  try {
    // Clear all hybrid-jobs cache entries
    const cachePattern = 'hybrid:jobs:*';
    redisCache.invalidatePattern?.(cachePattern);
    
    console.log('[hybrid-jobs] Cache invalidated after new job insert');
  } catch (cacheErr) {
    console.warn('[hybrid-jobs] Cache invalidation failed:', cacheErr);
    // Don't fail the request if cache clear fails
  }

  return NextResponse.json({
    success: true,
    data: data
  });
}
```

**Ako `invalidatePattern` ne postoji u redis-cache.ts, dodaj:**

```typescript
// src/lib/redis-cache.ts
export const redisCache = {
  // ... existing methods ...
  
  invalidatePattern(pattern: string): void {
    if (!cache) return;
    
    // Get all keys matching pattern
    const keys = Array.from(cache.keys()).filter(key => {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return regex.test(key);
    });
    
    // Delete matching keys
    keys.forEach(key => cache.delete(key));
    
    console.log(`[redis-cache] Invalidated ${keys.length} keys matching ${pattern}`);
  },
};
```

---

### Fix 5: Dodaj Error Boundary

**Novi fajl:** `src/components/error-boundary.tsx`

```typescript
'use client';

import { Component, ReactNode } from 'react';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    logger.error('[ErrorBoundary] Caught error', { error, errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="mx-auto max-w-2xl p-6 my-8">
          <div className="rounded-lg border border-red-300 bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              Ups! Nešto je pošlo po zlu
            </h2>
            <p className="text-sm text-red-700 mb-4">
              Došlo je do greške pri učitavanju ove stranice.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-red-800">
                  Tehnički detalji
                </summary>
                <pre className="mt-2 text-xs bg-red-100 p-3 rounded overflow-auto">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Osvježi stranicu
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Koristi u:** `src/app/layout.tsx`

```typescript
import { ErrorBoundary } from '@/components/error-boundary';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sr">
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

---

### Fix 6: Dodaj Zod Validation na POST Route

**Fajl:** `src/app/api/hybrid-jobs/route.ts`

```typescript
import { z } from 'zod';

// Dodaj schema na vrh:
const hybridJobInsertSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(10000).optional(),
  company_name: z.string().min(2).max(100),
  company_website: z.string().url().optional().or(z.literal('')),
  location: z.string().max(100).optional(),
  country_code: z.string().length(2).optional(),
  region: z.enum(['BALKAN', 'EU', 'GLOBAL']).default('BALKAN'),
  work_type: z.enum(['hybrid', 'onsite', 'flexible', 'remote-optional']),
  salary_min: z.number().int().min(0).max(1000000).optional(),
  salary_max: z.number().int().min(0).max(1000000).optional(),
  salary_currency: z.string().length(3).default('EUR'),
  experience_level: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']).optional(),
  employment_type: z.enum(['full-time', 'part-time', 'contract', 'freelance', 'internship']).optional(),
  category: z.string().max(50).optional(),
  skills: z.array(z.string().max(50)).max(20).optional(),
  technologies: z.array(z.string().max(50)).max(20).optional(),
  application_url: z.string().url().optional().or(z.literal('')),
  application_email: z.string().email().optional().or(z.literal('')),
  external_id: z.string().min(1).max(200),
  source_name: z.string().min(1).max(100),
  source_website: z.string().url().optional().or(z.literal('')),
  posted_date: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
  quality_score: z.number().int().min(0).max(100).default(50),
});

// Izmeni POST:
export async function POST(request: NextRequest) {
  // ... auth check ...
  
  try {
    const body = await request.json();
    
    // REPLACE manual validation with Zod:
    const validated = hybridJobInsertSchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validated.error.flatten().fieldErrors
        },
        { status: 422 }
      );
    }
    
    // Use validated.data instead of body
    const { data, error } = await supabase
      .from('hybrid_jobs')
      .insert([validated.data])
      .select()
      .single();
      
    // ... rest ...
  }
}
```

---

## 💡 BONUS: Database Indexes (SQL)

**Pokreni u Supabase SQL Editor:**

```sql
-- Proveri postojeće indexe
SELECT tablename, indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'hybrid_jobs'
ORDER BY indexname;

-- Dodaj indexe za performance (CONCURRENTLY da ne blokira tabelu)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hybrid_jobs_work_type 
  ON hybrid_jobs(work_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hybrid_jobs_country_code 
  ON hybrid_jobs(country_code) 
  WHERE country_code IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hybrid_jobs_posted_date 
  ON hybrid_jobs(posted_date DESC NULLS LAST);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hybrid_jobs_quality_score 
  ON hybrid_jobs(quality_score) 
  WHERE quality_score >= 50;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hybrid_jobs_category 
  ON hybrid_jobs(category) 
  WHERE category IS NOT NULL;

-- Full-text search index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hybrid_jobs_search 
  ON hybrid_jobs 
  USING gin(to_tsvector('english', 
    coalesce(title, '') || ' ' || 
    coalesce(description, '') || ' ' || 
    coalesce(company_name, '')
  ));

-- Composite index za često korišćene filtere
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hybrid_jobs_filters 
  ON hybrid_jobs(work_type, country_code, posted_date DESC)
  WHERE quality_score >= 50;
```

---

## ✅ CHECKLIST

Po završetku fix-eva:

- [ ] Fix 1: Auth na POST `/api/hybrid-jobs` ✓
- [ ] Fix 2: Rate limiting na GET `/api/hybrid-jobs` ✓
- [ ] Fix 3: Sanitizacija search input-a ✓
- [ ] Fix 4: Cache invalidation ✓
- [ ] Fix 5: Error boundary komponenta ✓
- [ ] Fix 6: Zod validation schema ✓
- [ ] Bonus: Database indexes ✓

**Testiraj:**

```bash
# 1. Test auth (bez tokena - trebalo bi da vrati 401)
curl -X POST http://localhost:3000/api/hybrid-jobs \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}'

# 2. Test auth (sa tokenom - trebalo bi da radi)
curl -X POST http://localhost:3000/api/hybrid-jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{"title":"Test","company_name":"Test Co","work_type":"hybrid","source_name":"test","external_id":"test-1"}'

# 3. Test rate limiting (pošalji 35 zahteva brzo - trebalo bi da vrati 429)
for i in {1..35}; do
  curl http://localhost:3000/api/hybrid-jobs?limit=10
done

# 4. Test validation (invalid data - trebalo bi da vrati 422)
curl -X POST http://localhost:3000/api/hybrid-jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{"title":"ab"}' # Too short
```

---

**Kreirao:** AI Assistant  
**Datum:** 15. Oktobar 2025  
**Vreme implementacije:** ~30 minuta  
**Impact:** 🚀 High - Rešava kritične security i performance probleme

