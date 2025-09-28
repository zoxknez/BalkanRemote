import { ImageResponse } from '@vercel/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const title = searchParams.get('title') || 'Remote Balkan'
    const subtitle = searchParams.get('subtitle') || 'Career hub za remote profesionalce sa Balkana'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #6d28d9 100%)',
            color: 'white',
            fontFamily: 'Inter, system-ui, Arial',
            padding: '60px',
          }}
        >
          <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -1 }}>{title}</div>
          <div style={{ fontSize: 28, opacity: 0.9, marginTop: 12 }}>{subtitle}</div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        // Cache for a day on browser and a week on CDN; allow stale-while-revalidate for a day
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
        },
      }
    )
  } catch {
    return new Response('Failed to generate the image', { status: 500 })
  }
}
