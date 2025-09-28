import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Optional protection for /oglasi/stats using FEED_STATS_TOKEN.
// If FEED_STATS_TOKEN is set, require either:
// - Authorization: Bearer <token>, or
// - Query param ?t=<token>
export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl
  if (pathname === '/oglasi/stats') {
    const token = process.env.FEED_STATS_TOKEN
    if (!token) {
      return NextResponse.next()
    }
    const auth = req.headers.get('authorization') || ''
    const [scheme, value] = auth.split(' ')
    const qp = req.nextUrl.searchParams.get('t')
    const ok = (scheme === 'Bearer' && value === token) || (qp && qp === token)
    if (!ok) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/oglasi/stats'],
}
