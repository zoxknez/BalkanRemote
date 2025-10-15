# 🔍 Analiza RemoteBalkan Aplikacije - Propusti i Preporuke

## 🚨 KRITIČNI PROPUSTI (Prioritet 1 - Odmah)

### 1. **Security: POST `/api/hybrid-jobs/route.ts` NEMA AUTENTIFIKACIJU**
```typescript
// ❌ PROBLEM: Svako može da kreira oglase!
export async function POST(request: NextRequest) {
  // NEMA auth check!
  const body = await request.json();
  
  const { data, error } = await supabase
    .from('hybrid_jobs')
    .insert([...])
```

**Rešenje:**
```typescript
export async function POST(request: NextRequest) {
  // ADD AUTH:
  const authHeader = request.headers.get('authorization');
  const apiKey = process.env.HYBRID_JOBS_API_KEY;
  
  if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // ili koristi Supabase auth:
  const supabase = createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Continue...
}
```

---

### 2. **Security: `/api/hybrid-jobs` NEMA RATE LIMITING**
```typescript
// ❌ PROBLEM: Nema rate limiting, samo cache
export async function GET(request: NextRequest) {
  // Nema rate limit check!
  const { searchParams } = new URL(request.url);
```

**Rešenje:**
```typescript
// Dodaj rate limiting kao u portal-jobs:
const buckets = new Map();
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;

function rateLimit(ip: string | null): boolean {
  if (!ip) return false;
  const now = Date.now();
  let bucket = buckets.get(ip);
  if (!bucket || bucket.expires < now) {
    bucket = { count: 0, expires: now + RATE_LIMIT_WINDOW_MS };
    buckets.set(ip, bucket);
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX;
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (rateLimit(ip)) {
    return NextResponse.json(
      { success: false, error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  // Continue...
}
```

---

### 3. **SQL Injection Risk u Search Queries**
```typescript
// ⚠️ POTENCIJALNI PROBLEM:
if (search) {
  query = query.or(
    `title.ilike.%${search}%,description.ilike.%${search}%,company_name.ilike.%${search}%`
  );
}
```

**Rešenje:**
```typescript
// Sanitizuj input:
if (search) {
  const sanitized = search
    .replace(/[%_\\]/g, '\\$&') // Escape SQL wildcards
    .replace(/[^\w\s+-]/g, '')  // Remove special chars
    .slice(0, 100);              // Limit length
    
  query = query.or(
    `title.ilike.%${sanitized}%,description.ilike.%${sanitized}%,company_name.ilike.%${sanitized}%`
  );
}
```

---

## ⚠️ VAŽNI PROPUSTI (Prioritet 2 - Uskoro)

### 4. **Redis Cache Bez Invalidation Strategije**
```typescript
// src/app/api/hybrid-jobs/route.ts
// ❌ PROBLEM: Cache se ne invaliduje kada se dodaju novi oglasi
const cached = redisCache.get(cacheKey);
if (cached) {
  return NextResponse.json(cached, {...});
}
```

**Rešenje:**
```typescript
// Opcija 1: Dodaj TTL tag
redisCache.set(cacheKey, response, CACHE_TTL.MEDIUM, ['hybrid-jobs']);

// Opcija 2: Invalidate on POST
export async function POST(request: NextRequest) {
  // ... insert job ...
  
  // Invalidate cache
  redisCache.invalidatePattern('hybrid-jobs:*');
  
  return NextResponse.json({ success: true, data });
}

// Opcija 3: Koristi Supabase Realtime
supabase
  .channel('hybrid-jobs-changes')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'hybrid_jobs' },
    () => redisCache.invalidatePattern('hybrid-jobs:*')
  )
  .subscribe();
```

---

### 5. **Missing Error Boundaries**
```typescript
// ❌ Nema error boundary u root layout
// src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>  {/* Nema error boundary! */}
    </html>
  );
}
```

**Rešenje:**
```typescript
// Kreiraj error boundary komponentu:
// src/components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-red-500 rounded">
          <h2>Nešto je pošlo po zlu</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Koristi u layout:
export default function RootLayout({ children }) {
  return (
    <html>
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

### 6. **Missing Validation Schema na POST Endpoints**
```typescript
// src/app/api/hybrid-jobs/route.ts
// ⚠️ Nedovoljna validacija
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Samo provera required fields, nema type validation!
  const requiredFields = ['title', 'company_name', 'work_type', 'source_name'];
  for (const field of requiredFields) {
    if (!body[field]) {
      return NextResponse.json(...);
    }
  }
```

**Rešenje:**
```typescript
import { z } from 'zod';

const hybridJobSchema = z.object({
  title: z.string().min(3).max(200),
  company_name: z.string().min(2).max(100),
  description: z.string().max(10000).optional(),
  work_type: z.enum(['hybrid', 'onsite', 'flexible', 'remote-optional']),
  country_code: z.string().length(2).optional(),
  salary_min: z.number().int().min(0).max(1000000).optional(),
  salary_max: z.number().int().min(0).max(1000000).optional(),
  experience_level: z.enum(['entry', 'mid', 'senior', 'lead']).optional(),
  skills: z.array(z.string()).max(20).optional(),
  // ...
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const validated = hybridJobSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Validation failed',
        details: validated.error.flatten()
      },
      { status: 422 }
    );
  }
  
  // Use validated.data
  const { data, error } = await supabase
    .from('hybrid_jobs')
    .insert([validated.data])
    ...
}
```

---

## 💡 PREPORUKE ZA POBOLJŠANJE (Prioritet 3 - Nice to Have)

### 7. **Performance: Dodaj Database Indexes**
```sql
-- Proveri da li postoje indexi:
SELECT tablename, indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('hybrid_jobs', 'job_portal_listings', 'jobs');

-- Dodaj ako ne postoje:
CREATE INDEX CONCURRENTLY idx_hybrid_jobs_work_type ON hybrid_jobs(work_type);
CREATE INDEX CONCURRENTLY idx_hybrid_jobs_country_code ON hybrid_jobs(country_code);
CREATE INDEX CONCURRENTLY idx_hybrid_jobs_posted_date ON hybrid_jobs(posted_date DESC);
CREATE INDEX CONCURRENTLY idx_hybrid_jobs_quality_score ON hybrid_jobs(quality_score);
CREATE INDEX CONCURRENTLY idx_hybrid_jobs_search ON hybrid_jobs USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));
```

---

### 8. **UX: Loading Skeletons nisu svuda**
```typescript
// ✅ DOBRO: Portal jobs ima skeleton
// src/components/job-card-skeleton.tsx - exists!

// ⚠️ Hybrid jobs takođe treba skeleton
// src/app/firme/page.tsx
{loading && <div>Loading...</div>}  // Generic text

// BOLJE:
{loading && (
  <div className="space-y-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <JobCardSkeleton key={i} />
    ))}
  </div>
)}
```

---

### 9. **Monitoring: Dodaj Performance Tracking**
```typescript
// src/app/api/hybrid-jobs/route.ts
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const start = Date.now();
  
  try {
    // ... query logic ...
    
    const duration = Date.now() - start;
    logger.info('[hybrid-jobs] GET success', {
      duration,
      filters: { country, workTypes, category, search },
      resultsCount: data?.length || 0,
      cached: !!cached,
    });
    
    return NextResponse.json(response);
  } catch (error) {
    const duration = Date.now() - start;
    logger.error('[hybrid-jobs] GET failed', {
      duration,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
```

---

### 10. **SEO: Missing Structured Data na Job Pages**
```typescript
// Dodaj JSON-LD za job postings:
// src/app/oglasi/[id]/page.tsx
export default function JobPage({ params }: { params: { id: string } }) {
  const job = await fetchJob(params.id);
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    hiringOrganization: {
      "@type": "Organization",
      name: job.company_name,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: job.country_code,
      },
    },
    datePosted: job.posted_date,
    employmentType: job.employment_type?.toUpperCase(),
    baseSalary: job.salary_min && job.salary_max ? {
      "@type": "MonetaryAmount",
      currency: job.salary_currency,
      value: {
        "@type": "QuantitativeValue",
        minValue: job.salary_min,
        maxValue: job.salary_max,
        unitText: "MONTH",
      },
    } : undefined,
  };
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Job content */}
    </>
  );
}
```

---

### 11. **Accessibility: Missing ARIA Labels**
```typescript
// src/components/portal-job-card.tsx
// ⚠️ Bookmark button nema descriptive label
<button
  onClick={toggle}
  disabled={loading || !supabase}
  aria-label={bookmarked ? "Ukloni iz sačuvanih" : "Sačuvaj oglas"}  // ✅ DODAJ
  className={...}
>
  <Star />
</button>

// Search input needs aria-label
<input
  type="search"
  placeholder="Pretraži..."
  aria-label="Pretraži poslove"  // ✅ DODAJ
/>
```

---

### 12. **Performance: API Response Size**
```typescript
// ⚠️ Vraćaš sve kolone, treba selektovati samo potrebne
const { data, error } = await supabase
  .from('hybrid_jobs')
  .select('*', { count: 'exact' })  // Returns ALL columns!

// BOLJE:
const { data, error } = await supabase
  .from('hybrid_jobs')
  .select(`
    id,
    title,
    company_name,
    location,
    work_type,
    salary_min,
    salary_max,
    salary_currency,
    posted_date,
    quality_score,
    application_url
  `, { count: 'exact' })
```

---

## 📊 SUMMARY

### Kritični Propusti (FIX ODMAH):
1. ❌ POST `/api/hybrid-jobs` bez autentifikacije
2. ❌ GET `/api/hybrid-jobs` bez rate limiting
3. ⚠️ SQL injection risk u search queries

### Važni Propusti (FIX USKORO):
4. Redis cache bez invalidation
5. Missing error boundaries
6. Nedovoljna validacija na POST routes

### Preporuke (NICE TO HAVE):
7. Database indexes za performance
8. Loading skeletons svuda
9. Performance monitoring
10. SEO structured data
11. Accessibility improvements
12. Optimize API response size

---

## ✅ ŠTA RADI DOBRO:

- ✅ Rate limiting na `/api/portal-jobs`
- ✅ Zod validation na portal jobs
- ✅ Error handling sa graceful fallbacks
- ✅ Redis caching implementiran
- ✅ Security headers u `next.config.ts`
- ✅ CSP policy dobro konfigurisana
- ✅ Sentry integration za error tracking
- ✅ Loading states u komponentama
- ✅ Authentication sistem radi

---

## 🚀 AKCIONI PLAN:

**Week 1 (Kritično):**
1. Dodaj auth na POST `/api/hybrid-jobs`
2. Dodaj rate limiting na GET `/api/hybrid-jobs`
3. Sanitizuj search inputs

**Week 2 (Važno):**
4. Implementiraj cache invalidation
5. Dodaj error boundaries
6. Dodaj Zod validaciju svuda

**Week 3 (Poboljšanja):**
7. Kreiraj database indexes
8. Dodaj performance monitoring
9. Dodaj structured data za SEO

---

**Kreirao:** AI Assistant  
**Datum:** 15. Oktobar 2025  
**Status:** Ready for Review  
**Kritičnih:** 3 | **Važnih:** 3 | **Nice-to-Have:** 6

