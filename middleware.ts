import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Optional protection for /oglasi/stats using FEED_STATS_TOKEN.
// If FEED_STATS_TOKEN is set, require either:
// - Authorization: Bearer <token>, or
// - Query param ?t=<token>
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow health checks without auth
  if (pathname === '/api/health') {
    return NextResponse.next()
  }

  // IP allowlist: bypass protection and limits for trusted IPs
  const clientIp = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
                   (req.headers.get('x-real-ip') || '').trim() || 'unknown'
  const allowlistRaw = process.env.APP_IP_ALLOWLIST || ''
  const allowlist = allowlistRaw.split(',').map(s => s.trim()).filter(Boolean)
  const isIpAllowed = allowlist.length > 0 && allowlist.includes(clientIp)

  // Per-IP simple rate limiting for API routes (best-effort, in-memory per instance)
  // Config via env: RATE_LIMIT_MAX (default 60/min), RATE_LIMIT_WINDOW_SEC (default 60s)
  // Special lower cap for /api/scraper/* via RATE_LIMIT_SCRAPER_MAX (default 10/min)
  if (!isIpAllowed && pathname.startsWith('/api')) {
    const max = (() => {
      if (pathname.startsWith('/api/scraper')) {
        const v = parseInt(process.env.RATE_LIMIT_SCRAPER_MAX || '', 10)
        return Number.isFinite(v) && v > 0 ? v : 10
      }
      const v = parseInt(process.env.RATE_LIMIT_MAX || '', 10)
      return Number.isFinite(v) && v > 0 ? v : 60
    })()
    const windowSec = (() => {
      const v = parseInt(process.env.RATE_LIMIT_WINDOW_SEC || '', 10)
      return Number.isFinite(v) && v > 0 ? v : 60
    })()

  type RL = { c: number; reset: number }
  // augment globalThis with a typed cache property
  const g = globalThis as unknown as { __RB_RATE_LIMIT?: Map<string, RL> }
  const store: Map<string, RL> = g.__RB_RATE_LIMIT ?? new Map<string, RL>()
  g.__RB_RATE_LIMIT = store

    const now = Date.now()
    const key = `${clientIp}:${pathname}`
    const rec = store.get(key)
    if (!rec || now > rec.reset) {
      store.set(key, { c: 1, reset: now + windowSec * 1000 })
    } else {
      rec.c += 1
      store.set(key, rec)
      if (rec.c > max) {
        const retryAfter = Math.max(1, Math.ceil((rec.reset - now) / 1000))
        const resp = new NextResponse('Too Many Requests', { status: 429 })
        resp.headers.set('Retry-After', String(retryAfter))
        resp.headers.set('RateLimit-Limit', String(max))
        resp.headers.set('RateLimit-Remaining', '0')
        resp.headers.set('RateLimit-Reset', String(Math.ceil(rec.reset / 1000)))
        return resp
      }
    }
  }

  // App-wide optional Basic Auth protection
  const basicAuthEnabled = (process.env.APP_BASIC_AUTH || '').toLowerCase() === 'true' || process.env.APP_BASIC_AUTH === '1'
  const basicUser = process.env.APP_BASIC_AUTH_USER
  const basicPass = process.env.APP_BASIC_AUTH_PASS

  // Helper: validate Basic credentials
  const ensureBasicAuth = (): NextResponse | null => {
    if (!basicAuthEnabled || !basicUser || !basicPass) return null
    const header = req.headers.get('authorization') || ''
    const [scheme, b64] = header.split(' ')
    if (scheme !== 'Basic' || !b64) {
      return new NextResponse('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Protected", charset="UTF-8"' }
      })
    }
    try {
      // Edge runtime provides atob
      const decoded = atob(b64)
      const [u, p] = decoded.split(':')
      if (u === basicUser && p === basicPass) return null
    } catch {}
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Protected", charset="UTF-8"' }
    })
  }

  // Keep existing token-based protection for /oglasi/stats; allow either Bearer token or Basic Auth (if enabled)
  if (pathname === '/oglasi/stats') {
    const token = process.env.FEED_STATS_TOKEN
    if (token) {
      const auth = req.headers.get('authorization') || ''
      const [scheme, value] = auth.split(' ')
      const qp = req.nextUrl.searchParams.get('t')
      const ok = (scheme === 'Bearer' && value === token) || (qp && qp === token)
      if (!ok) {
        const basic = ensureBasicAuth()
        if (basic) return basic
      }
    } else {
      const basic = ensureBasicAuth()
      if (basic) return basic
    }
    return NextResponse.next()
  }

  // For all other matched routes, enforce Basic Auth if enabled
  const basic = ensureBasicAuth()
  if (basic) return basic
  return NextResponse.next()
}

// Match all routes except Next.js internals and common public assets; also include /oglasi/stats
export const config = {
  matcher: [
    '/oglasi/stats',
    '/api/:path*',
    // Negative lookahead to skip assets and a few public files/APIs
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest).*)',
  ],
}
